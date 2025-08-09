// server/api/topup-request.ts
import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Нет токена' })

  const config = useRuntimeConfig()
  let payload: { id: string }

  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    if (typeof decoded !== 'object' || !decoded || !('id' in decoded)) {
      throw new Error('Неверный токен')
    }
    payload = decoded as { id: string }
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Неверный токен' })
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } })
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Пользователь не найден' })

  const body = await readBody(event)
  const amount = parseInt(body.amount)
  const stripeId = body.stripeId?.toString().trim()

  if (isNaN(amount) || amount < 100) {
    throw createError({ statusCode: 400, statusMessage: 'Сумма недопустима (min: 100)' })
  }

  if (!stripeId) {
    throw createError({ statusCode: 400, statusMessage: 'Отсутствует Stripe ID' })
  }

  // Создаём заявку на пополнение
  const request = await prisma.topUpRequest.create({
    data: {
      userId: user.id,
      amount,
      stripeId,
      status: 'PENDING'
    }
  })

  // Создаём транзакцию и привязываем к заявке
  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: 'TOPUP',
      amount,
      details: `Пополнение через Stripe #${stripeId}`,
      topUpRequestId: request.id
    }
  })

  return {
    success: true,
    message: 'Заявка на пополнение отправлена',
    requestId: request.id
  }
})