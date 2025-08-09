import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const query = getQuery(event)

  const email = body.email?.trim().toLowerCase()
  const password = body.password
  const username = body.username || null

  // Приоритет — body.refCode, если нет — берем из URL
  const refCode = body.refCode || query.ref || null
  const managerId = null // Убираем поиск referralLink, сохраняем только refCode как строку

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw createError({ statusCode: 400, statusMessage: 'User already exists' })
  }

  const hashed = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashed,
      refCode,
      managerId,
    }
  })

  const config = useRuntimeConfig()

  const token = jwt.sign(
    { id: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: '7d' }
  )

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: 'registered_by_referral',
      meta: JSON.stringify({ refCode, managerId }),
    },
  })

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    sameSite: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  })

  await transporter.sendMail({
    from: `"AliExpress " <${config.smtpUser}>`,
    to: email,
    subject: 'Welcome!',
    text: `🎉 Thank you for registering, ${email}!`,
  })

  return {
    success: true,
    message: 'User registered',
    token,
    user: {
      id: user.id,
      email: user.email
    }
  }
})