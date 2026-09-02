import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// PATCH /api/inscriptions/[id]
// Met à jour dates, formateur, statut, résultat, mention, attestation.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const existante = await prisma.inscription.findUnique({ where: { id } });
  if (!existante) {
    return NextResponse.json({ error: 'Inscription introuvable' }, { status: 404 });
  }

  const inscription = await prisma.inscription.update({
    where: { id },
    data: {
      ...(body.dateDebut !== undefined ? { dateDebut: body.dateDebut ? new Date(body.dateDebut) : null } : {}),
      ...(body.dateFin !== undefined ? { dateFin: body.dateFin ? new Date(body.dateFin) : null } : {}),
      ...(body.formateurId !== undefined ? { formateurId: body.formateurId || null } : {}),
      ...(body.statut !== undefined ? { statut: body.statut } : {}),
      ...(body.resultat !== undefined ? { resultat: body.resultat } : {}),
      ...(body.mention !== undefined ? { mention: body.mention } : {}),
      ...(body.attestationPath !== undefined ? { attestationPath: body.attestationPath } : {}),
    },
    include: {
      candidat: true,
      formation: true,
      formateur: true,
    },
  });

  return NextResponse.json(inscription);
}