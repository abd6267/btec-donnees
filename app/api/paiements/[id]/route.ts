import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// PATCH /api/paiements/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const existant = await prisma.paiement.findUnique({ where: { id } });
  if (!existant) {
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
  }

  const paiement = await prisma.paiement.update({
    where: { id },
    data: {
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.statut !== undefined ? { statut: body.statut } : {}),
      ...(body.libelle !== undefined ? { libelle: body.libelle } : {}),
      ...(body.montant !== undefined ? { montant: parseFloat(body.montant) } : {}),
      ...(body.categorie !== undefined ? { categorie: body.categorie || null } : {}),
      ...(body.modePaiement !== undefined ? { modePaiement: body.modePaiement } : {}),
      ...(body.dateEcheance !== undefined ? { dateEcheance: body.dateEcheance ? new Date(body.dateEcheance) : null } : {}),
      ...(body.datePaiement !== undefined ? { datePaiement: body.datePaiement ? new Date(body.datePaiement) : null } : {}),
    },
  });

  return NextResponse.json(paiement);
}

// DELETE /api/paiements/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existant = await prisma.paiement.findUnique({ where: { id } });
  if (!existant) {
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
  }

  await prisma.paiement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}