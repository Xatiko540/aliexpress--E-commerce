import { PrismaClient } from '@prisma/client';
import { H3Event, getQuery, createError } from 'h3';

const prisma = new PrismaClient();

interface BuybackQuery {
  userId?: string;
  managerId?: string; // 👈 новое поле
}

export default defineEventHandler(async (event: H3Event) => {
  const { userId, managerId }: BuybackQuery = getQuery(event);

  if (!userId && !managerId) {
    throw createError({ statusCode: 400, message: 'User ID or Manager ID is required' });
  }

  const where: any = {};

  if (userId) {
    where.userId = userId;
  }

  if (managerId) {
    where.user = { managerId }; // 👈 связываем через relation
  }

  try {
    const buybacks = await prisma.buybackOffer.findMany({
      where,
      select: {
        id: true,
        price: true,
        percent: true,
        reward: true,
        status: true,
        createdAt: true,
        user: { select: { email: true } },
        product: { select: { title: true } },
        manager: { select: { fullName: true, email: true } },
      },
    });

    return buybacks;
  } catch (error) {
    console.error('Error fetching user buybacks:', error);
    throw createError({ statusCode: 500, message: 'Error fetching user buybacks' });
  } finally {
    await prisma.$disconnect();
  }
});