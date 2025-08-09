import { PrismaClient } from '@prisma/client'
import { createError } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.params?.id

    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    const orders = await prisma.orders.findMany({
      where: { userId }, // фильтрация по пользователю
      orderBy: { id: 'desc' },
      include: {
        orderItem: {
          include: {
            product: {
              include: {
                images: true // включает массив изображений
              }
            }
          }
        }
      }
    })

    return orders.map(order => ({
      ...order,
      total: order.orderItem.reduce((sum, item) => sum + item.product.price, 0)
    }))
  } catch (error) {
    console.error('❌ Ошибка получения заказов пользователя:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при получении заказов'
    })
  }
})