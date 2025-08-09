// server/api/transactions.ts
import { PrismaClient } from '@prisma/client';
import { defineEventHandler, getCookie, createError } from 'h3';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token');
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Нет токена' });
  }

  const config = useRuntimeConfig();
  let payload: { id: string };

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    if (typeof decoded !== 'object' || !decoded || !('id' in decoded)) {
      throw new Error('Неверный токен');
    }
    payload = decoded as { id: string };
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Неверный токен' });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true }
  });

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Пользователь не найден' });
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      topUpRequest: {
        select: { status: true }
      },
      withdrawal: {
        select: { status: true }
      }
    }
  });

  return transactions.map(tx => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    details: tx.details,
    createdAt: tx.createdAt,
    status:
      tx.type === 'TOPUP'
        ? tx.topUpRequest?.status || null
        : tx.type === 'WITHDRAWAL'
          ? tx.withdrawal?.status || null
          : null
  }));
});