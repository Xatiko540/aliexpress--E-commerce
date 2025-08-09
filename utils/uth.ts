import { getCookie } from 'h3'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function requireUser(event: any) {
  const token = getCookie(event, 'auth_token')
  if (!token) return null

  const config = useRuntimeConfig()
  try {
    const decoded: any = jwt.verify(token, config.jwtSecret)
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    return user
  } catch (e) {
    return null
  }
}