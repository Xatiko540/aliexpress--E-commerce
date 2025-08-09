import { PrismaClient } from '@prisma/client';
import { H3Event, readBody, createError, getHeader } from 'h3';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface ApproveBuybackBody {
  buybackId: number;
  percent?: number;
  reward?: number;
}

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig(); // получить jwtSecret

  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '');
  if (!token) {
    throw createError({ statusCode: 401, message: 'Unauthorized: No token provided' });
  }

  let managerId: string;
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    managerId = decoded.id;
  } catch (err) {
    throw createError({ statusCode: 401, message: 'Invalid token' });
  }

  const body: ApproveBuybackBody = await readBody(event);
  const { buybackId, percent, reward } = body;

  if (!buybackId) {
    throw createError({ statusCode: 400, message: 'Invalid data: buybackId is required' });
  }

  try {
    const buyback = await prisma.buybackOffer.update({
      where: { id: buybackId },
      data: {
        percent: percent ?? 25,
        reward: reward ?? 0,
        managerId: managerId, // 🟢 записываем менеджера
      },
      include: { user: true, product: true },
    });

    if (reward) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: buyback.userId },
          data: { balance: { increment: reward } },
        }),
        prisma.transaction.create({
          data: {
            userId: buyback.userId,
            type: 'buyback',
            amount: reward,
            details: `Reward for buyback of ${buyback.product?.title ?? 'unknown product'}`,
          },
        }),
        prisma.activityLog.create({
          data: {
            userId: buyback.userId,
            action: 'BUYBACK_APPROVED',
            meta: JSON.stringify({
              buybackId,
              product: buyback.product?.title ?? 'unknown',
              reward,
              managerId
            }),
          },
        }),
      ]);
    } else {
      await prisma.activityLog.create({
        data: {
          userId: buyback.userId,
          action: 'BUYBACK_REJECTED',
          meta: JSON.stringify({
            buybackId,
            product: buyback.product?.title ?? 'unknown',
            managerId
          }),
        },
      });
    }

    return buyback;
  } catch (error) {
    console.error('Error processing buyback:', error);
    throw createError({
      statusCode: 500,
      message: 'Error processing buyback',
      data: { details: error instanceof Error ? error.message : 'Unknown error' },
    });
  } finally {
    await prisma.$disconnect();
  }
});