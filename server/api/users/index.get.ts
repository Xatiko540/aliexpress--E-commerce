import { PrismaClient } from "@prisma/client";
import { createError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        balance: true,
        level: true,
        isBalanceFrozen: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Fetched users:", users); // Добавь для отладки
    return users;
  } catch (error: any) {
    console.error("Get users error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch users",
    });
  }
});