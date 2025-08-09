// server/api/user.ts
import { getCookie } from 'h3'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) return null

  const config = useRuntimeConfig()

  let payload: { id: string }

  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    if (typeof decoded !== 'object' || !decoded || !('id' in decoded)) {
      return null
    }
    payload = decoded as { id: string }
  } catch {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      email: true,
      role: true,
      isBalanceFrozen: true,
      level: true,
      avatar: true,
      username: true,
      balance: true 
    }
  })

  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    username: user.username || '',
    avatar: user.avatar || '',
    role: user.role || 'user',
    isBalanceFrozen: user.isBalanceFrozen,
    level: user.level, 
    balance: user.balance ?? 0, 
    token
  }
})