// server/api/admin/get-referrals.ts
import { PrismaClient } from '@prisma/client'
import { requireUser } from '@/utils/uth'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  if (!user || user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const links = await prisma.referralLink.findMany({
    include: { manager: true },
  })

  const users = await prisma.user.findMany({
    where: { managerId: { not: null } }, // показать всех, у кого есть менеджер
    select: {
      email: true,
      fullName: true,
      refCode: true,
      createdAt: true,
      manager: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  })


  return {
    links,
    activity: users,
  }
})
