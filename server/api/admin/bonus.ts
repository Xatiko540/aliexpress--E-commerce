import { defineEventHandler, createError, readBody, getCookie } from 'h3'
import { PrismaClient } from '@prisma/client'
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

  const actor = await prisma.user.findUnique({ where: { id: payload.id } })
  if (!actor) {
    throw createError({ statusCode: 404, statusMessage: 'Пользователь не найден' })
  }

  const { email, amount, comment } = await readBody(event)
  if (!email || !amount || amount <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Неверные данные' })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Целевой пользователь не найден' })
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { balance: user.balance + amount }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        type: 'bonus',
        details: `Бонус от ${actor.email}: ${comment || 'без комментария'}`
      }
    }),
    prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'BONUS',
        meta: JSON.stringify({
          by: actor.email,
          amount,
          comment
        })
      }
    })
  ])

  return {
    success: true,
    message: `Начислено ${amount}₽ пользователю ${user.email}`
  }
})