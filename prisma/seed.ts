import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = 'DGBTEC';
  const plainPassword = 'Nabil6267';

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      password: hashedPassword,
      role: 'directeur',
      actif: true,
    },
    create: {
      username,
      password: hashedPassword,
      role: 'directeur',
      actif: true,
      nom: 'Direction Générale',
      prenom: 'BTEC',
    },
  });

  console.log('✅ Utilisateur créé/mis à jour :', user.username, '| role:', user.role);
  console.log('👉 Mot de passe :', plainPassword);
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });