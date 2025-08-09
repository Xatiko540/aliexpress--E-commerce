import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      throw createError({
        statusCode: 400,
        message: "User ID is required",
      });
    }

    // Удаляем все связанные данные пользователя
    await prisma.post.deleteMany({ where: { authorId: id } });
    await prisma.transaction.deleteMany({ where: { userId: id } });
    await prisma.topUpRequest.deleteMany({ where: { userId: id } });
    await prisma.withdrawal.deleteMany({ where: { userId: id } });
    await prisma.orders.deleteMany({ where: { userId: id } });
    await prisma.products.deleteMany({ where: { sellerId: id } });
    await prisma.addresses.deleteMany({ where: { userId: id } });
    await prisma.bankCard.deleteMany({ where: { userId: id } });
    await prisma.chatMessage.deleteMany({ where: { userId: id } });
    await prisma.activityLog.deleteMany({ where: { userId: id } });
    await prisma.referralLink.deleteMany({ where: { managerId: id } });
    await prisma.buybackOffer.deleteMany({ where: { userId: id } });
    await prisma.buybackOffer.deleteMany({ where: { managerId: id } });

    // Теперь удаляем пользователя
    const user = await prisma.user.delete({
      where: { id },
    });

    return user;
  } catch (error: any) {
    console.error("Delete user error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to delete user",
    });
  }
});