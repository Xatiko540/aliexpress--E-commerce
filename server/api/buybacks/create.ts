import { PrismaClient, Prisma } from '@prisma/client';
import { H3Event, readBody, createError } from 'h3';

const prisma = new PrismaClient();

interface CreateBuybackBody {
  userId: string;
  productId: number;
  price: number;
  percent?: number;
}

export default defineEventHandler(async (event: H3Event) => {
  const body: CreateBuybackBody = await readBody(event);
  const { userId, productId, price, percent } = body;

  if (!userId || !productId || !price) {
    throw createError({ statusCode: 400, message: 'Invalid data' });
  }

  try {
  const data: Prisma.BuybackOfferUncheckedCreateInput = {
  userId,
  productId,
  price,
  percent: percent || 25,
  reward: 0, // или какое-то значение по умолчанию
};

    const buyback = await prisma.buybackOffer.create({
      data,
      include: {
        user: { select: { email: true } },
        product: { select: { title: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'BUYBACK_CREATED',
        meta: JSON.stringify({ buybackId: buyback.id, productId }),
      },
    });

    return buyback;
  } catch (error) {
    console.error('Error creating buyback:', error);
    throw createError({ statusCode: 500, message: 'Error creating buyback' });
  } finally {
    await prisma.$disconnect();
  }
});