import { PrismaClient } from '@prisma/client'
import formidable from 'formidable'
import fs from 'fs'
import { mkdirSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

export const config = {
  api: {
    bodyParser: false,
  },
}

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product ID' })
  }

  const form = formidable({ multiples: true })
  const [fields, files] = await form.parse(event.node.req)

  const title = fields.title?.[0]
  const price = parseInt(fields.price?.[0] || '0', 10)
  const description = fields.description?.[0] || ''

  const uploadedImages: string[] = []

  let images = files.images || []
  if (!Array.isArray(images)) {
    images = [images]
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads')
  mkdirSync(uploadDir, { recursive: true })

  for (const file of images) {
    const filePath = join(uploadDir, file.originalFilename || file.newFilename)
    fs.renameSync(file.filepath, filePath)
    uploadedImages.push('/uploads/' + (file.originalFilename || file.newFilename))
  }

  await prisma.products.update({
    where: { id },
    data: {
      title,
      price,
      description,
      images: {
        deleteMany: {}, // удаляет старые изображения
        create: uploadedImages.map((url) => ({ url })),
      }
    }
  })

  return { success: true }
})