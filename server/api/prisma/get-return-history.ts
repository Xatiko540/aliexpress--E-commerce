// server/api/prisma/get-return-history.ts
import { PrismaClient } from '@prisma/client';
import { defineEventHandler, getCookie, createError } from 'h3';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Авторизация
  const token = getCookie(event, 'auth_token');
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Нет токена' });
  }

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

  // Получаем историю возвратов
  const returns = await prisma.returnRequest.findMany({
    include: {
      orderItem: {
        include: {
          order: {
            include: {
              user: { select: { email: true } }
            }
          },
          product: { select: { title: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Приводим к формату фронта
  return returns.map(r => ({
    id: r.id,
    user: r.orderItem?.order?.user || null,
    product: r.orderItem?.product || null,
    status: r.status,
    amount: r.amount,
    confirmed: r.confirmed,
    createdAt: r.createdAt
  }));
});