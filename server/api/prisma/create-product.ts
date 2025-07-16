// server/api/prisma/create-order.ts
import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth_token')

  if (!token) throw createError({ statusCode: 401, statusMessage: 'Нет токена' })

  let payload: { id: string }
  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    if (typeof decoded !== 'object' || !decoded || !('id' in decoded)) {
      throw createError({ statusCode: 403, statusMessage: 'Неверный токен' })
    }
    payload = decoded as { id: string }
  } catch {
    throw createError({ statusCode: 403, statusMessage: 'Невалидный токен' })
  }

  const body = await readBody(event)
  const { title, description, price, url, category } = body

  if (!title || !price || !url || !category) {
    throw createError({ statusCode: 400, statusMessage: 'Заполните все поля: title, price, url, category' })
  }

  const priceInt = parseInt(price)
  if (isNaN(priceInt) || priceInt <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Цена должна быть положительным числом' })
  }

  const product = await prisma.products.create({
    data: {
      title,
      description: description || '',
      url,
      price: priceInt * 100,
      category,
      sellerId: payload.id
    }
  })

  return { id: product.id }
})