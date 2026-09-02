import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const documents = await prisma.document.findMany({
    include: { candidat: true, entreprise: true, inscription: { include: { formation: true } }, paiement: true },
    orderBy: { genereLe: 'desc' },
  });
  return NextResponse.json(documents);
}