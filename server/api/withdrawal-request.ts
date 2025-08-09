// server/api/withdrawal-request.ts
import { PrismaClient } from '@prisma/client';
import { defineEventHandler, readBody, createError, getCookie } from 'h3';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token');
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Нет токена' });

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

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Пользователь не найден' });
  if (user.isBlocked) throw createError({ statusCode: 403, statusMessage: 'Вывод средств заблокирован' });

  const body = await readBody(event);
  const amount = parseInt(body.amount);
  const cardInfo = body.cardInfo;

  if (!amount || isNaN(amount) || amount <= 0 || amount > user.balance) {
    throw createError({ statusCode: 400, statusMessage: 'Сумма недопустима' });
  }
  if (!cardInfo || cardInfo.length < 4) {
    throw createError({ statusCode: 400, statusMessage: 'Неверная информация о карте' });
  }

  // Создаём заявку на вывод
  const withdrawal = await prisma.withdrawal.create({
    data: {
      userId: user.id,
      amount,
      cardInfo,
      status: 'PENDING'
    }
  });

  // Создаём транзакцию, привязанную к выводу
  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: 'WITHDRAWAL',
      amount,
      details: `Вывод на карту ${cardInfo}`,
      withdrawalId: withdrawal.id
    }
  });

  // Логируем действие
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: 'WITHDRAW_REQUEST',
      meta: JSON.stringify({ amount, cardInfo })
    }
  });

  return {
    success: true,
    message: 'Заявка на вывод создана',
    withdrawalId: withdrawal.id
  };
});