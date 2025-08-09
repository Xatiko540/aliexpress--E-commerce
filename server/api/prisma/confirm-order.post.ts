// server/api/prisma/confirm-order.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const { orderId, userId, reward } = await readBody(event)

    if (!orderId || !userId || !reward || reward <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'orderId, userId и reward (положительное) обязательны' })
    }

    await prisma.$transaction(async (tx) => {
      // Обновляем статус заказа
      await tx.orders.update({
        where: { id: orderId },
        data: { confirmed: true }
      })
      // Начисляем reward пользователю
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: reward }
        }
      })
      // Запись транзакции — опционально
      await tx.transaction.create({
        data: {
          userId,
          type: 'ORDER_CONFIRM',
          amount: reward,
          details: `Начислено за заказ #${orderId}`
        }
      })
    })

    return { success: true }

  } catch (err: unknown) {
  console.error('Ошибка в confirm‑order:', err)

  const message = err instanceof Error ? err.message : 'Неизвестная ошибка'

  throw createError({
    statusCode: 500,
    statusMessage: message
  })
}
})