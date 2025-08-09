import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { z } from "zod";
import { readBody, getRouterParam, createError } from "h3";

const prisma = new PrismaClient();

const updateUserSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/).optional(),
  email: z.string().email().max(255).optional(),
  password: z.string().min(6).max(32).optional(),
  role: z.enum(["ADMIN", "USER", "admin", "user"])
    .transform((val) => val.toUpperCase() as "ADMIN" | "USER")
    .optional(),
  balance: z.preprocess(
  (val) => (typeof val === "string" ? Number(val) : val),
  z.number().min(0)
).optional(),
  level: z.enum(["VIP1", "VIP2"]).optional(),
  isBalanceFrozen: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, "id");

    if (!id || typeof id !== "string") {
      throw createError({ statusCode: 400, message: "User ID is required" });
    }

    const rawBody = await readBody(event);
    const body = {
      ...rawBody,
      balance: rawBody.balance !== undefined ? Number(rawBody.balance) : undefined,
    };
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        message: parsed.error.errors.map((e) => e.message).join(", "),
      });
    }

    const data = parsed.data;

    if (Object.keys(data).length === 0) {
      throw createError({ statusCode: 400, message: "No update fields provided" });
    }

    // Проверка на уникальность email или username (если они переданы)
    if (data.email || data.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            ...(data.email ? [{ email: data.email.toLowerCase() }] : []),
            ...(data.username ? [{ username: data.username.toLowerCase() }] : []),
          ],
          NOT: { id },
        },
      });

      if (existingUser) {
        throw createError({ statusCode: 400, message: "Email или username уже используется" });
      }
    }

    // Подготовка данных для обновления
    const updateData: any = {};
    if (data.username) updateData.username = data.username.toLowerCase();
    if (data.email) updateData.email = data.email.toLowerCase();
    if (data.role) updateData.role = data.role;
    if (data.password) updateData.password = await hash(data.password, 10);
    if (data.balance !== undefined) updateData.balance = data.balance;
    if (data.level) updateData.level = data.level;
    if (data.isBalanceFrozen !== undefined) updateData.isBalanceFrozen = data.isBalanceFrozen;

    // Обновление пользователя
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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

    // Возвращаем ОБЪЕКТ (а не массив!)
    return updatedUser;
  } catch (error: any) {
    console.error("Update user error:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to update user",
    });
  }
});