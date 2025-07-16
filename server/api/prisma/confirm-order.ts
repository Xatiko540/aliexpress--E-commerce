import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const orderId = body.id

  if (!orderId) {
    return { error: 'Order ID is required' }
  }

  const updatedOrder = await prisma.orders.update({
    where: { id: Number(orderId) },
    data: { confirmed: true }
  })

  return updatedOrder
})