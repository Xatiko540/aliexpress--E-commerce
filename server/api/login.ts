// server/api/auth.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
// @ts-ignore
import jwt from 'jsonwebtoken'

import { defineEventHandler, readBody, createError, setCookie } from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    return createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return createError({ statusCode: 400, statusMessage: 'User not found' })
  }

  const match = await bcrypt.compare(password, user.password)
  if (!match) {
    return createError({ statusCode: 401, statusMessage: 'Invalid password' })
  }

  const config = useRuntimeConfig() // ✅ БЕРЕМ JWT_SECRET правильно

  const token = jwt.sign(
    { id: user.id, email: user.email },
    config.jwtSecret, // ✅ НИКАКИХ process.env!
    { expiresIn: '7d' }
  )

setCookie(event, 'auth_token', token, {
  httpOnly: true,
  sameSite: true,
  maxAge: 60 * 60 * 24 * 7,
  path: '/' // ОБЯЗАТЕЛЕН!
})

  return {
    success: true,
    message: 'Login successful',
    token
  }
})