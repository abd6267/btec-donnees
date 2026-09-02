import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// GET /api/employes?statut=EN_ATTENTE|EMBAUCHE|DEBAUCHE
// Renvoie les employés (candidats validés) filtrés par statutEmploi,
// avec le candidat et l'entreprise associés.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statut = searchParams.get('statut');

  const statutsValides = ['EN_ATTENTE', 'EMBAUCHE', 'DEBAUCHE'];
  if (statut && !statutsValides.includes(statut)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }

  const employes = await prisma.employe.findMany({
    where: statut ? { statutEmploi: statut as any } : undefined,
    include: {
      candidat: true,
      entreprise: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(employes);
}