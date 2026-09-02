import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// POST /api/paiements
// Crée une entrée ou une sortie financière.
export async function POST(request: Request) {
  const body = await request.json();

  if (!body.type || !body.libelle || body.montant === undefined) {
    return NextResponse.json({ error: 'type, libelle et montant requis' }, { status: 400 });
  }

  const paiement = await prisma.paiement.create({
    data: {
      type: body.type,
      statut: body.statut || 'EN_ATTENTE',
      libelle: body.libelle,
      montant: parseFloat(body.montant),
      categorie: body.categorie || null,
      modePaiement: body.modePaiement || 'CAISSE',
      candidatId: body.candidatId || null,
      entrepriseId: body.entrepriseId || null,
      inscriptionId: body.inscriptionId || null,
      dateEcheance: body.dateEcheance ? new Date(body.dateEcheance) : null,
      datePaiement: body.datePaiement ? new Date(body.datePaiement) : null,
    },
    include: {
      candidat: true,
      entreprise: true,
      inscription: { include: { formation: true } },
    },
  });

  return NextResponse.json(paiement, { status: 201 });
}