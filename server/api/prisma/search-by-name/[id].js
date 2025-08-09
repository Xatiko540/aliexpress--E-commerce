import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const searchTerm = event.context.params.id || "";

  const items = await prisma.products.findMany({
    take: 5,
    where: {
      title: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      title: true,
      price: true,
      url: true, 
      images: {
        select: { url: true }
      }
    }
  });

  const formatted = items.map(item => ({
    id: item.id,
    title: item.title,
    price: item.price,
    url: 
      (item.images.length > 0 ? item.images[0].url : null) // сначала из ProductImage
      || item.url                                            // потом из products.url
      || '/cart-empty.png'                                   // если ничего нет
  }));

  return formatted;
});