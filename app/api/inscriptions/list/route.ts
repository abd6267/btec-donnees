import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// GET /api/inscriptions/list
// Optionnel : ?candidatId=xxx pour filtrer l'historique d'un seul candidat.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const candidatId = searchParams.get('candidatId');

  const inscriptions = await prisma.inscription.findMany({
    where: candidatId ? { candidatId } : undefined,
    include: {
      candidat: true,
      formation: true,
      formateur: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(inscriptions);
}
