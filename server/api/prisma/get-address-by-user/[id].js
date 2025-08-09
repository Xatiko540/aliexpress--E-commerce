import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.params.id

    if (!userId) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
    }

    // Проверяем, есть ли уже адрес
    const existing = await prisma.addresses.findFirst({
      where: { userId }
    })

    if (existing) {
      return existing
    }

    // Если метода POST, значит пытаемся добавить
    if (event.req.method === 'POST') {
      const body = await readBody(event)
      const newAddress = await prisma.addresses.create({
        data: {
          userId: body.userId,
          name: body.name,
          address: body.address,
          zipcode: body.zipcode,
          city: body.city,
          country: body.country
        }
      })
      return newAddress
    }

    return null
  } catch (err) {
    console.error('❌ Ошибка адреса:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка адреса: ' + (err.message || err)
    })
  }
})