import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const [
    anciensCandidats,
    anciensEmployes,
    contratsExpires,
  ] = await Promise.all([
    prisma.candidat.findMany({
      where: { statut: 'REFUSE' },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.employe.findMany({
      where: { statutEmploi: 'DEBAUCHE' },
      include: { candidat: true, entreprise: true },
      orderBy: { dateDepart: 'desc' },
    }),
    prisma.paiement.findMany({
      where: {
        dateEcheance: { lt: new Date() },
        statut: { not: 'PAYE' },
      },
      include: { candidat: true, entreprise: true },
      orderBy: { dateEcheance: 'desc' },
    }),
  ]);

  return NextResponse.json({
    anciensCandidats,
    anciensEmployes,
    contratsExpires,
  });
}
