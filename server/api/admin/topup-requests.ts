import { defineEventHandler, getQuery, getCookie, createError } from 'h3'
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

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, role: true }
  })

  if (!user) throw createError({ statusCode: 401, statusMessage: 'Пользователь не найден' })
  // if (user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Только для администраторов' })

  const query = getQuery(event)
  const status = (query.status || '') as string
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const skip = (page - 1) * limit

  const allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED'] as const
  const whereClause =
    status && allowedStatuses.includes(status as any)
      ? { status: status as any }
      : {}

  const [total, requests] = await Promise.all([
    prisma.topUpRequest.count({ where: whereClause }),
    prisma.topUpRequest.findMany({
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
    data: requests
  }
})