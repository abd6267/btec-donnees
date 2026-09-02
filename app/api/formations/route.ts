import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// POST /api/formations
// CrÃ©e une nouvelle formation dans le catalogue.
export async function POST(request: Request) {
  const body = await request.json();

  if (!body.nom || !body.programme || body.prix === undefined || !body.dureeJours || !body.nombrePlaces) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  }

  const formation = await prisma.formation.create({
    data: {
      nom: body.nom,
      programme: body.programme,
      prix: parseFloat(body.prix),
      dureeJours: parseInt(body.dureeJours, 10),
      nombrePlaces: parseInt(body.nombrePlaces, 10),
      formateurId: body.formateurId || null,
    },
  });

  return NextResponse.json(formation, { status: 201 });
}
