// server/api/admin/sales-report.ts
import { PrismaClient } from '@prisma/client';
import { defineEventHandler, getQuery, getCookie, createError } from 'h3';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Авторизация
  const token = getCookie(event, 'auth_token');
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Нет токена' });

  const config = useRuntimeConfig();
  let payload: any;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Неверный токен' });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Пользователь не найден' });
  if (user.role !== 'ADMIN') throw createError({ statusCode: 403, statusMessage: 'Доступ запрещён' });

  // Даты
  const query = getQuery(event);
  const startDate = query.startDate ? new Date(query.startDate as string) : null;
  const endDate = query.endDate ? new Date(query.endDate as string) : null;

  if (!startDate || !endDate) {
    throw createError({ statusCode: 400, statusMessage: 'Нужны обе даты' });
  }

  // Получаем позиции заказов
  const orderItems = await prisma.orderItem.findMany({
    where: {
      created_at: { gte: startDate, lte: endDate }
    },
    include: {
      order: {
        include: {
          user: { select: { email: true } }
        }
      },
      product: { select: { title: true, price: true } }
    },
    orderBy: { created_at: 'desc' }
  });

  // Формируем ответ
  return {
    data: orderItems.map(item => ({
      id: item.id,
      user: item.order?.user?.email || '—',
      product: item.product?.title || '—',
      amount: item.product?.price ?? 0,
      date: item.created_at
    }))
  };
});