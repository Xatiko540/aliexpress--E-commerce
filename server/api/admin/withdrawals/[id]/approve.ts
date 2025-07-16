import { defineEventHandler, createError, getCookie } from 'h3'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Нет токена' })

  const config = useRuntimeConfig()
  const decoded = jwt.verify(token, config.jwtSecret)

  if (typeof decoded !== 'object' || !decoded || !('id' in decoded)) {
    throw createError({ statusCode: 401, statusMessage: 'Неверный токен' })
  }

  const admin = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, role: true, email: true }
  })

  if (!admin) throw createError({ statusCode: 401, statusMessage: 'Пользователь не найден' })
  // if (admin.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Только для администраторов' })

  const id = parseInt((event.context.params as any).id)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Неверный ID' })

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id },
    include: { user: true }
  })

  if (!withdrawal) throw createError({ statusCode: 404, statusMessage: 'Заявка не найдена' })
  if (withdrawal.status !== 'PENDING') throw createError({ statusCode: 400, statusMessage: 'Заявка уже обработана' })

  if (withdrawal.amount > withdrawal.user.balance) {
    throw createError({ statusCode: 400, statusMessage: 'Недостаточно средств у пользователя' })
  }

  await prisma.$transaction([
    prisma.withdrawal.update({
      where: { id },
      data: { status: 'APPROVED' }
    }),
    prisma.user.update({
      where: { id: withdrawal.userId },
      data: { balance: withdrawal.user.balance - withdrawal.amount }
    }),
    prisma.transaction.create({
      data: {
        userId: withdrawal.userId,
        amount: -withdrawal.amount,
        type: 'withdrawal',
        details: `Подтверждено админом ${admin.email}`
      }
    }),
    prisma.activityLog.create({
      data: {
        userId: withdrawal.userId,
        action: 'APPROVE_WITHDRAWAL',
        meta: JSON.stringify({
          admin: admin.email,
          amount: withdrawal.amount
        })
      }
    })
  ])

  return {
    success: true,
    message: 'Вывод одобрен и средства списаны'
  }
})