import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const debauches = await prisma.employe.findMany({
    where: { statutEmploi: 'DEBAUCHE' },
    include: {
      candidat: true,
      entreprise: true,
    },
    orderBy: { dateDepart: 'desc' },
  });

  return NextResponse.json(debauches);
}
