import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('Nabil6267', 10);

  const user = await prisma.user.update({
    where: { username: 'DGBTEC' },
    data: { password: hashedPassword },
  });

  console.log('Mot de passe mis à jour pour :', user.username);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());