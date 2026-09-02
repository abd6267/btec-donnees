import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// GET /api/paiements/list
// Filtres optionnels: ?type=RECETTE|DEPENSE, ?modePaiement=CAISSE|BANQUE,
// ?dateDebut=YYYY-MM-DD, ?dateFin=YYYY-MM-DD
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const modePaiement = searchParams.get('modePaiement');
  const dateDebut = searchParams.get('dateDebut');
  const dateFin = searchParams.get('dateFin');

  const where: Record<string, any> = {};
  if (type) where.type = type;
  if (modePaiement) where.modePaiement = modePaiement;
  if (dateDebut || dateFin) {
    where.datePaiement = {};
    if (dateDebut) where.datePaiement.gte = new Date(dateDebut);
    if (dateFin) where.datePaiement.lte = new Date(dateFin);
  }

  const paiements = await prisma.paiement.findMany({
    where,
    include: {
      candidat: true,
      entreprise: true,
      inscription: { include: { formation: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(paiements);
}
