import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// GET /api/suivis/list?employeId=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeId = searchParams.get('employeId');

  const suivis = await prisma.suiviPeriodeEssai.findMany({
    where: employeId ? { employeId } : undefined,
    include: {
      employe: { include: { candidat: true, entreprise: true } },
    },
    orderBy: [{ employeId: 'asc' }, { mois: 'asc' }],
  });

  return NextResponse.json(suivis);
}
