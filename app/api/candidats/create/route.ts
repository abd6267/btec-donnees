import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { writeFile } from 'fs/promises';
import path from 'path';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function sauvegarderFichier(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const nomFichier = `${Date.now()}-${file.name}`;
  const filePath = path.join(process.cwd(), 'public', 'uploads', nomFichier);
  await writeFile(filePath, buffer);
  return `/uploads/${nomFichier}`;
}

async function genererNumeroDossier() {
  const prefix = 'DOSSIER';
  const counter = await prisma.matriculeCounter.upsert({
    where: { prefix },
    update: { lastNum: { increment: 1 } },
    create: { prefix, lastNum: 1 },
  });
  const numero = String(counter.lastNum).padStart(4, '0');
  return `${prefix}-${numero}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const dateNaissance = formData.get('dateNaissance') as string;
  if (!dateNaissance) {
    return NextResponse.json({ error: 'Date de naissance obligatoire' }, { status: 400 });
  }

  const numeroDossier = await genererNumeroDossier();

  const photoPath = await sauvegarderFichier(formData.get('photo') as File | null);
  const cvPath = await sauvegarderFichier(formData.get('cv') as File | null);
  const lettrePath = await sauvegarderFichier(formData.get('lettre') as File | null);
  const piecesPath = await sauvegarderFichier(formData.get('pieces') as File | null);

  const candidat = await prisma.candidat.create({
    data: {
      numeroDossier,
      photoPath,
      nom: formData.get('nom') as string,
      prenom: formData.get('prenom') as string,
      sexe: formData.get('sexe') as string,
      dateNaissance: new Date(dateNaissance),
      telephone: formData.get('telephone') as string,
      email: (formData.get('email') as string) || null,
      adresse: formData.get('adresse') as string,
      niveauEtude: formData.get('niveauEtude') as string,
      diplome: formData.get('diplome') as string,
      posteRecherche: formData.get('posteRecherche') as string,
      cvPath,
      lettrePath,
      piecesPath,
    },
  });

  return NextResponse.json({ success: true, numeroDossier: candidat.numeroDossier });
}