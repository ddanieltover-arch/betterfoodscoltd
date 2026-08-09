import { PrismaClient, PublishStatus, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

type JsonCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
};

type JsonProduct = {
  id: number;
  name: string;
  slug: string;
  description: string;
  bullets: string[];
  price: number;
  currency: string;
  quoteOnly: boolean;
  stockStatus?: string;
  categories: { slug: string; name: string; description?: string }[];
  images: { src: string; alt: string }[];
  flags?: { halal?: boolean; organic?: boolean; freshNoChemicals?: boolean };
};

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "sales@betterfoodcoltd.com";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMeNow!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: AdminRole.SUPER_ADMIN },
    create: {
      email,
      passwordHash,
      name: "Better Foods Admin",
      role: AdminRole.SUPER_ADMIN,
    },
  });

  const contentDir = join(process.cwd(), "content");
  const categories = JSON.parse(
    readFileSync(join(contentDir, "categories.json"), "utf8"),
  ) as JsonCategory[];
  const products = JSON.parse(
    readFileSync(join(contentDir, "products.json"), "utf8"),
  ) as JsonProduct[];

  const categoryBySlug = new Map<string, string>();

  for (const [index, cat] of categories.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description ?? null,
        sortOrder: index,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description ?? null,
        sortOrder: index,
      },
    });
    categoryBySlug.set(cat.slug, row.id);
  }

  for (const product of products) {
    const primaryCategory = product.categories[0];
    const categoryId = primaryCategory
      ? categoryBySlug.get(primaryCategory.slug) ?? null
      : null;

    const row = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        legacyId: product.id,
        name: product.name,
        description: product.description,
        bulletsJson: JSON.stringify(product.bullets ?? []),
        shortDescription: product.bullets?.[0] ?? null,
        categoryId,
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date(),
        quoteOnly: product.quoteOnly ?? true,
        price: product.price ?? 0,
        currency: product.currency ?? "THB",
        stockStatus: product.stockStatus ?? null,
        halal: product.flags?.halal ?? false,
        organic: product.flags?.organic ?? false,
        freshNoChemicals: product.flags?.freshNoChemicals ?? false,
      },
      create: {
        legacyId: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        bulletsJson: JSON.stringify(product.bullets ?? []),
        shortDescription: product.bullets?.[0] ?? null,
        categoryId,
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date(),
        quoteOnly: product.quoteOnly ?? true,
        price: product.price ?? 0,
        currency: product.currency ?? "THB",
        stockStatus: product.stockStatus ?? null,
        halal: product.flags?.halal ?? false,
        organic: product.flags?.organic ?? false,
        freshNoChemicals: product.flags?.freshNoChemicals ?? false,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: row.id } });
    if (product.images?.length) {
      await prisma.productImage.createMany({
        data: product.images.map((image, sortOrder) => ({
          productId: row.id,
          url: image.src,
          alt: image.alt || product.name,
          sortOrder,
          isPrimary: sortOrder === 0,
        })),
      });
    }
  }

  console.log(
    `Seeded admin ${email}, ${categories.length} categories, ${products.length} products`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
