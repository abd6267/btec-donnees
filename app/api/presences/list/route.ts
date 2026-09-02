import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// GET /api/presences/list?inscriptionId=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inscriptionId = searchParams.get('inscriptionId');

  const presences = await prisma.presence.findMany({
    where: inscriptionId ? { inscriptionId } : undefined,
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(presences);
}