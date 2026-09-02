import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// GET /api/formateurs/[id]/historique
// Rassemble : formations réalisées, nombre d'apprenants, revenus générés.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: formateurId } = await params;

  const formateur = await prisma.formateur.findUnique({ where: { id: formateurId } });
  if (!formateur) {
    return NextResponse.json({ error: 'Formateur introuvable' }, { status: 404 });
  }

  const formations = await prisma.formation.findMany({
    where: { formateurId },
    include: { inscriptions: true },
  });

  const nombreApprenants = formations.reduce((sum, f) => sum + f.inscriptions.length, 0);

  // Revenus générés = somme des paiements PAYE liés aux inscriptions de ce formateur
  // (via les formations qu'il a données) + les inscriptions où il est formateur direct.
  const inscriptionsFormateur = await prisma.inscription.findMany({
    where: { formateurId },
    include: { paiements: true, formation: true, candidat: true },
  });

  const revenusGeneres = inscriptionsFormateur.reduce((sum, insc) => {
    const total = insc.paiements
      .filter((p) => p.statut === 'PAYE' && p.type === 'RECETTE')
      .reduce((s, p) => s + p.montant, 0);
    return sum + total;
  }, 0);

  return NextResponse.json({
    formateur,
    formations,
    nombreApprenants,
    revenusGeneres,
    inscriptions: inscriptionsFormateur,
  });
}