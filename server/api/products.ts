import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = query.category?.toString() || 'Recommend'

  const products = await prisma.products.findMany({
    where: { category },
    orderBy: { created_at: 'desc' },
    include: {
      images: true, // добавлено — подтягиваем изображения
      seller: {
        select: {
          id: true,
          email: true,
          username: true
        }
      }
    }
  })

  return products
})