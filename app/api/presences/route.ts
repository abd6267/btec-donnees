import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// POST /api/presences
// Enregistre une prÃ©sence (ou absence) pour une sÃ©ance donnÃ©e.
export async function POST(request: Request) {
  const body = await request.json();

  if (!body.inscriptionId || !body.date) {
    return NextResponse.json({ error: 'inscriptionId et date requis' }, { status: 400 });
  }

  const presence = await prisma.presence.create({
    data: {
      inscriptionId: body.inscriptionId,
      date: new Date(body.date),
      present: body.present !== undefined ? body.present : true,
    },
  });

  return NextResponse.json(presence, { status: 201 });
}
