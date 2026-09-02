import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const entreprises = await prisma.entreprise.findMany({
    include: {
      employes: true,
    },
    orderBy: { datePartenariat: 'desc' },
  });

  return NextResponse.json(entreprises);
}