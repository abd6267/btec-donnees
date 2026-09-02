import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const formes = await prisma.employe.findMany({
    where: { statutEmploi: 'EN_ATTENTE' },
    include: {
      candidat: true,
      entreprise: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(formes);
}
