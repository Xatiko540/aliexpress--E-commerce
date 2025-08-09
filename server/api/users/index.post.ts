import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { z } from "zod";

const prisma = new PrismaClient();

const createUserSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email().max(255),
  password: z.string().min(6).max(32),
  role: z.enum(["ADMIN", "USER"]).transform((val) => val.toUpperCase() as "ADMIN" | "USER"),
  balance: z.number().min(0).optional().default(0),
  level: z.enum(["VIP1", "VIP2"]).optional().default("VIP1"),
  isBalanceFrozen: z.boolean().optional().default(false),
  refCode: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    if (!body) {
      throw createError({ statusCode: 400, message: "Request body is required" });
    }

    const data = createUserSchema.parse(body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email.toLowerCase() },
          { username: data.username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      throw createError({ statusCode: 400, message: "Email atau username sudah digunakan" });
    }

    const hashedPassword = await hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        username: data.username.toLowerCase(),
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role,
        balance: data.balance,
        level: data.level,
        isBalanceFrozen: data.isBalanceFrozen,
        refCode: data.refCode || null, // Генерация refCode опционально
      },
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

    return user;
  } catch (error: any) {
    console.error("Create user error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to create user",
    });
  }
});