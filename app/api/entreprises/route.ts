import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.nom || !body.directeur || !body.adresse || !body.telephone || !body.email || !body.activite) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  }

  const entreprise = await prisma.entreprise.create({
    data: {
      logoPath: body.logoPath || null,
      nom: body.nom,
      directeur: body.directeur,
      adresse: body.adresse,
      telephone: body.telephone,
      email: body.email,
      activite: body.activite,
      nombreEmployes: body.nombreEmployes ? parseInt(body.nombreEmployes, 10) : 0,
      datePartenariat: body.datePartenariat ? new Date(body.datePartenariat) : new Date(),
      contratPath: body.contratPath || null,
    },
  });

  return NextResponse.json(entreprise, { status: 201 });
}