import { defineEventHandler, getCookie, getQuery, createError } from 'h3'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Нет токена' })

  const config = useRuntimeConfig()
  const decoded = jwt.verify(token, config.jwtSecret)

  if (typeof decoded !== 'object' || !decoded || !('id' in decoded)) {
    throw createError({ statusCode: 401, statusMessage: 'Неверный токен' })
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, role: true, email: true }
  })

  if (!user) throw createError({ statusCode: 401, statusMessage: 'Пользователь не найден' })
  // if (user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Только для администраторов' })

  const query = getQuery(event)
  const statusParam = query.status as string
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const skip = (page - 1) * limit

  const allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED'] as const
  const whereClause = allowedStatuses.includes(statusParam as any)
    ? { status: statusParam as any }
    : {}

  const [total, withdrawals] = await Promise.all([
    prisma.withdrawal.count({ where: whereClause }),
    prisma.withdrawal.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: true }
    })
  ])

  return {
    success: true,
    page,
    total,
    pages: Math.ceil(total / limit),
    data: withdrawals
  }
})