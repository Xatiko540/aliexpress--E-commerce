import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default defineEventHandler(async () => {
  const managers = await prisma.user.findMany({
    where: { role: 'ADMIN' }, // или роль "manager"
    select: { id: true, fullName: true, email: true }
  });
  return { managers };
});