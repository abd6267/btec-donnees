import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// GET /api/inscriptions
// Liste toutes les inscriptions (historique de formation par candidat),
// triÃ©es par date de crÃ©ation dÃ©croissante pour la page "Formation".
export async function GET() {
  const inscriptions = await prisma.inscription.findMany({
    include: {
      candidat: true,
      formation: true,
      formateur: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(inscriptions);
}

// POST /api/inscriptions
// Inscrit un candidat Ã  une formation (dÃ©marre son historique de suivi).
export async function POST(request: Request) {
  const body = await request.json();

  if (!body.candidatId || !body.formationId) {
    return NextResponse.json({ error: 'candidatId et formationId requis' }, { status: 400 });
  }

  const inscription = await prisma.inscription.create({
    data: {
      candidatId: body.candidatId,
      formationId: body.formationId,
      formateurId: body.formateurId || null,
      dateDebut: body.dateDebut ? new Date(body.dateDebut) : null,
      dateFin: body.dateFin ? new Date(body.dateFin) : null,
      statut: body.statut || 'EN_FORMATION',
    },
    include: {
      candidat: true,
      formation: true,
      formateur: true,
    },
  });

  return NextResponse.json(inscription, { status: 201 });
}

// PATCH /api/inscriptions
// Met Ã  jour le suivi d'une inscription : statut, rÃ©sultat, mention,
// dates, attestation. Body attendu : { id, ...champs Ã  modifier }.
export async function PATCH(request: Request) {
  const body = await request.json();

  if (!body.id) {
    return NextResponse.json({ error: 'id requis' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.statut !== undefined) data.statut = body.statut;
  if (body.resultat !== undefined) data.resultat = body.resultat;
  if (body.mention !== undefined) data.mention = body.mention;
  if (body.attestationPath !== undefined) data.attestationPath = body.attestationPath;
  if (body.dateDebut !== undefined) data.dateDebut = body.dateDebut ? new Date(body.dateDebut) : null;
  if (body.dateFin !== undefined) data.dateFin = body.dateFin ? new Date(body.dateFin) : null;
  if (body.formateurId !== undefined) data.formateurId = body.formateurId || null;

  const inscription = await prisma.inscription.update({
    where: { id: body.id },
    data,
    include: {
      candidat: true,
      formation: true,
      formateur: true,
    },
  });

  return NextResponse.json(inscription);
}
