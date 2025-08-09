import { PrismaClient } from "@prisma/client";
import { getRouterParam, createError } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id || typeof id !== "string") {
    throw createError({ statusCode: 400, message: "User ID is required" });
  }

  const user = await prisma.user.findUnique({
    where: { id },
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
  });

  if (!user) {
    throw createError({ statusCode: 404, message: "User not found" });
  }

  return user;
});