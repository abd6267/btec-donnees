import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// POST /api/suivis
// Body: { employeId, mois, presence, ponctualite, discipline, evaluation, satisfaction, commentaire }
export async function POST(request: Request) {
  const body = await request.json();

  if (!body.employeId || !body.mois) {
    return NextResponse.json({ error: 'employeId et mois requis' }, { status: 400 });
  }

  const suivi = await prisma.suiviPeriodeEssai.create({
    data: {
      employeId: body.employeId,
      mois: parseInt(body.mois, 10),
      presence: body.presence || null,
      ponctualite: body.ponctualite || null,
      discipline: body.discipline || null,
      evaluation: body.evaluation || null,
      satisfaction: body.satisfaction || null,
      commentaire: body.commentaire || null,
      dateSuivi: body.dateSuivi ? new Date(body.dateSuivi) : new Date(),
    },
  });

  return NextResponse.json(suivi, { status: 201 });
}
