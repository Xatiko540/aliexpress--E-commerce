// server/api/prisma/get-products-paginated.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 20;

  const products = await prisma.products.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { id: "desc" },
    include: {
      images: { select: { url: true } }
    }
  });

  return products.map(p => ({
    id: p.id,
    title: p.title,
    price: p.price,
    images: p.images.length
      ? p.images
      : [{ url: p.url || "/cart-empty.png" }]
  }));
});