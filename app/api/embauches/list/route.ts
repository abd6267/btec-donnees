import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const embauches = await prisma.employe.findMany({
    where: { statutEmploi: 'EMBAUCHE' },
    include: {
      candidat: true,
      entreprise: true,
    },
    orderBy: { dateEmbauche: 'desc' },
  });

  return NextResponse.json(embauches);
}