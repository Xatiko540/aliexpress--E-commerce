// server/api/prisma/delete-order.ts
import { PrismaClient } from '@prisma/client'
import { defineEventHandler, readBody, getCookie, createError } from 'h3'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  // Авторизация
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Нет токена' })
  }

  const config = useRuntimeConfig()
  let payload: any
  try {
    payload = jwt.verify(token, config.jwtSecret)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Неверный токен' })
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } })
  if (!user || user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Доступ запрещён' })
  }

  // Читаем тело запроса
  const body = await readBody<{ orderId: number }>(event)
  if (!body?.orderId) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан ID заказа' })
  }

  // Удаляем позиции заказа, потом сам заказ
  await prisma.orderItem.deleteMany({
    where: { orderId: body.orderId }
  })

  await prisma.orders.delete({
    where: { id: body.orderId }
  })

  return { success: true }
})