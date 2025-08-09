import { PrismaClient } from '@prisma/client';
   import { H3Event } from 'h3';

   const prisma = new PrismaClient();

   interface ApproveBuybackBody {
     buybackId: number;
     status: 'APPROVED' | 'REJECTED';
     percent?: number;
     reward?: number;
   }

   export default defineEventHandler(async (event: H3Event) => {
     console.log('Approving buyback with body:', await readBody(event)); // Отладка
     const body: ApproveBuybackBody = await readBody(event);
     const { buybackId, status, percent, reward } = body;

     if (!buybackId || !['APPROVED', 'REJECTED'].includes(status)) {
       throw createError({ statusCode: 400, message: 'Invalid data' });
     }

     try {
       const buyback = await prisma.buybackOffer.update({
         where: { id: buybackId },
         data: {
           status,
           ...(status === 'APPROVED' && typeof percent === 'number' ? { percent } : {}),
           reward: status === 'APPROVED' ? reward : null,
         },
         include: { user: true, product: { select: { title: true } } },
       });

       if (status === 'APPROVED' && reward) {
         await prisma.$transaction([
           prisma.user.update({
             where: { id: buyback.userId },
             data: { balance: { increment: reward } },
           }),
           prisma.transaction.create({
             data: {
               userId: buyback.userId,
               type: 'buyback',
               amount: reward,
               details: `Reward for buyback of ${buyback.product.title}`,
             },
           }),
           prisma.activityLog.create({
             data: {
               userId: buyback.userId,
               action: 'BUYBACK_APPROVED',
               meta: JSON.stringify({ buybackId, product: buyback.product.title, reward }),
             },
           }),
         ]);
       } else if (status === 'REJECTED') {
         await prisma.activityLog.create({
           data: {
             userId: buyback.userId,
             action: 'BUYBACK_REJECTED',
             meta: JSON.stringify({ buybackId, product: buyback.product.title }),
           },
         });
       }

       return buyback;
     } catch (error) {
       console.error('Error processing buyback:', error);
       throw createError({ statusCode: 500, message: 'Error processing buyback' });
     } finally {
       await prisma.$disconnect();
     }
   });