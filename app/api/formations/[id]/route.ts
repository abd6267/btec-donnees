import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// PATCH /api/formations/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const existante = await prisma.formation.findUnique({ where: { id } });
  if (!existante) {
    return NextResponse.json({ error: 'Formation introuvable' }, { status: 404 });
  }

  const formation = await prisma.formation.update({
    where: { id },
    data: {
      ...(body.nom !== undefined ? { nom: body.nom } : {}),
      ...(body.programme !== undefined ? { programme: body.programme } : {}),
      ...(body.prix !== undefined ? { prix: parseFloat(body.prix) } : {}),
      ...(body.dureeJours !== undefined ? { dureeJours: parseInt(body.dureeJours, 10) } : {}),
      ...(body.nombrePlaces !== undefined ? { nombrePlaces: parseInt(body.nombrePlaces, 10) } : {}),
      ...(body.formateurId !== undefined ? { formateurId: body.formateurId || null } : {}),
    },
  });

  return NextResponse.json(formation);
}