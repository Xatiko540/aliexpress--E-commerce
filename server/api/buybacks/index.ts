import { PrismaClient } from '@prisma/client';
import { H3Event, getQuery, createError } from 'h3';

const prisma = new PrismaClient();

interface BuybackQuery {
  search?: string;
  page?: string;
  limit?: string;
}

interface Buyback {
  id: number;
  user: { email: string };
  product: { title: string };
  price: number;
  percent: number;
  reward: number;
  createdAt: Date;
}

interface BuybackResponse {
  buybacks: Buyback[];
  total: number;
  page: number;
  limit: number;
}

export default defineEventHandler(async (event: H3Event): Promise<BuybackResponse> => {
  console.log('Fetching buybacks with query:', getQuery(event)); // Отладка
  const query: BuybackQuery = getQuery(event);
  const { search, page = '1', limit = '10' } = query;

  const where: any = {};
  if (search) {
    where.OR = [
      { product: { title: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { id: isNaN(parseInt(search)) ? undefined : parseInt(search) },
    ].filter(Boolean);
  }

  try {
    const [buybacks, total] = await prisma.$transaction([
      prisma.buybackOffer.findMany({
        where,
        include: {
          user: { select: { email: true } },
          product: { select: { title: true } },
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.buybackOffer.count({ where }),
    ]);

    return { buybacks, total, page: parseInt(page), limit: parseInt(limit) };
  } catch (error) {
    console.error('Error fetching buybacks:', error);
    throw createError({
      statusCode: 500,
      message: 'Error fetching buybacks',
      data: { details: error instanceof Error ? error.message : 'Unknown error' },
    });
  } finally {
    await prisma.$disconnect();
  }
});