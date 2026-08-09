import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "sales@betterfoodcoltd.com")
    .toLowerCase()
    .trim();
  const password = process.env.ADMIN_PASSWORD || "";

  console.log("DATABASE_URL host:", process.env.DATABASE_URL?.slice(0, 40));
  console.log("Looking up:", email);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log("USER NOT FOUND");
    return;
  }

  console.log("Found user:", {
    id: user.id,
    email: user.email,
    role: user.role,
    hashPrefix: user.passwordHash.slice(0, 10),
  });

  const valid = await bcrypt.compare(password, user.passwordHash);
  console.log("Password matches ADMIN_PASSWORD:", valid);

  const known = await bcrypt.compare("gLub9CtTgSvE94m", user.passwordHash);
  console.log("Password matches gLub9CtTgSvE94m:", known);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
