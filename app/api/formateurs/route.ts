import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.domaine || !body.modulesEnseignes || !body.telephone || !body.email || !body.honoraires) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
  }

  const formateur = await prisma.formateur.create({
    data: {
      photoPath: body.photoPath || null,
      domaine: body.domaine,
      modulesEnseignes: body.modulesEnseignes,
      telephone: body.telephone,
      email: body.email,
      contratPath: body.contratPath || null,
      honoraires: body.honoraires,
    },
  });

  return NextResponse.json(formateur, { status: 201 });
}
