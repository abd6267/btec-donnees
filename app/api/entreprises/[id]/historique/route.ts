import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// GET /api/entreprises/[id]/historique
// Rassemble : recrutements effectués, personnel confié actuellement, factures, paiements.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: entrepriseId } = await params;

  const entreprise = await prisma.entreprise.findUnique({ where: { id: entrepriseId } });
  if (!entreprise) {
    return NextResponse.json({ error: 'Entreprise introuvable' }, { status: 404 });
  }

  const [tousLesEmployes, factures, paiements] = await Promise.all([
    prisma.employe.findMany({
      where: { entrepriseId },
      include: { candidat: true },
      orderBy: { dateEmbauche: 'desc' },
    }),
    prisma.document.findMany({
      where: { entrepriseId, type: 'FACTURE' },
      orderBy: { genereLe: 'desc' },
    }),
    prisma.paiement.findMany({
      where: { entrepriseId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const recrutementsEffectues = tousLesEmployes; // historique complet, tous statuts confondus
  const personnelConfie = tousLesEmployes.filter((e) => e.statutEmploi === 'EMBAUCHE'); // en poste actuellement

  return NextResponse.json({
    entreprise,
    recrutementsEffectues,
    personnelConfie,
    factures,
    paiements,
  });
}