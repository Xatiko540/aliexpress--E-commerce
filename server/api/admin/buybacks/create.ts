import { PrismaClient } from '@prisma/client';
import { H3Event, readRawBody, readBody, createError } from 'h3';

const prisma = new PrismaClient();

interface CreateBuybackBody {
  userId: string;
  productId: number;
  price: number;
  percent?: number;
  comment?: string;
}

export default defineEventHandler(async (event: H3Event) => {
  console.log('Route /api/buybacks/create hit');
  console.log('Raw request body:', await readRawBody(event));
  const body: CreateBuybackBody = await readBody(event);
  console.log('Parsed request body:', body);

  const { userId, productId, price, percent, comment } = body;

  if (!userId || !productId || !price || price <= 0) {
    throw createError({ statusCode: 400, message: 'Invalid data: userId, productId, and positive price are required' });
  }

  try {
    // Получаем managerId пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { managerId: true }
    });

    const managerId = user?.managerId || null;

    const buyback = await prisma.buybackOffer.create({
      data: {
        userId,
        productId,
        price,
        status: 'PENDING',
        percent: percent || 25,
        reward: price * ((percent || 25) / 100),
        managerId, // Сохраняем менеджера для аналитики
      },
      include: {
        user: { select: { email: true } },
        product: { select: { title: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'BUYBACK_CREATED',
        meta: JSON.stringify({ buybackId: buyback.id, productId, comment, managerId }),
      },
    });

    console.log('Buyback created:', buyback);
    return buyback;
  } catch (error) {
    console.error('Error creating buyback:', error);
    throw createError({ statusCode: 500, message: 'Error creating buyback' });
  } finally {
    await prisma.$disconnect();
  }
});