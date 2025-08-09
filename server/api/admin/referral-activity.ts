import { PrismaClient } from '@prisma/client'

export default defineEventHandler(async () => {
  const prisma = new PrismaClient()

  const links = await prisma.referralLink.findMany({
    include: {
      manager: {
        select: {
          id: true,
          email: true,
          fullName: true,
        }
      }
    }
  })

  const activity = await prisma.user.findMany({
    where: {
      refCode: {
        not: null
      }
    },
    select: {
      email: true,
      fullName: true,
      refCode: true,
      createdAt: true,
      manager: {
        select: {
          id: true,
          email: true,
          fullName: true,
        }
      }
    }
  })

  return {
    links,
    activity
  }
})