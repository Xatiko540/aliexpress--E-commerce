import { PrismaClient } from '@prisma/client'
import { createError } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async () => {
  try {
    const orders = await prisma.orders.findMany({
      orderBy: { id: 'desc' },
      include: {
        user: true,
        orderItem: {
          include: {
            product: true
          }
        }
      }
    })

    // Добавим поле total на основе суммы цен товаров
    return orders.map(order => ({
      ...order,
      total: order.orderItem.reduce((sum, item) => sum + item.product.price, 0)
    }))
  } catch (error) {
    console.error('❌ Ошибка получения всех заказов:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при получении заказов'
    })
  }
})