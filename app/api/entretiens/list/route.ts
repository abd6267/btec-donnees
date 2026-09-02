import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const entretiens = await prisma.entretien.findMany({
    include: {
      candidat: true,
    },
    orderBy: { dateEntretien: 'desc' },
  });

  return NextResponse.json(entretiens);
}