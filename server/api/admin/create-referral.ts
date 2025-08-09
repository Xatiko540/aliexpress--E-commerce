// server/api/admin/create-referral.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('📥 Received body:', body)

    const managerId = typeof body === 'object' && body?.managerId

    if (!managerId || typeof managerId !== 'string') {
      console.error('❌ Invalid managerId:', managerId)
      throw createError({ statusCode: 400, statusMessage: 'managerId is required and must be a string' })
    }

    const manager = await prisma.user.findUnique({ where: { id: managerId } })
    if (!manager) {
      throw createError({ statusCode: 404, statusMessage: 'Manager not found' })
    }

    let code: string | null = null

    while (!code) {
      const candidate = crypto.randomBytes(3).toString('hex').toUpperCase()
      const exists = await prisma.referralLink.findUnique({ where: { code: candidate } })
      if (!exists) code = candidate
    }

    const link = await prisma.referralLink.create({
      data: { code, managerId }
    })

    return { code: link.code, managerId: link.managerId }
  } catch (error: any) {
    console.error('❌ Error creating referral link:', error)
    return {
      error: true,
      statusCode: 500,
      statusMessage: 'Failed to create referral link',
      message: error.message,
      stack: error.stack
    }
  }
})