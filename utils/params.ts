import { createError } from 'h3'

export function getIdParam(event: any): number {
  const id = parseInt(event.context.params?.id)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'Неверный ID' })
  return id
}