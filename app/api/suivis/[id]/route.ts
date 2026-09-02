import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// PATCH /api/suivis/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const existant = await prisma.suiviPeriodeEssai.findUnique({ where: { id } });
  if (!existant) {
    return NextResponse.json({ error: 'Suivi introuvable' }, { status: 404 });
  }

  const suivi = await prisma.suiviPeriodeEssai.update({
    where: { id },
    data: {
      ...(body.presence !== undefined ? { presence: body.presence } : {}),
      ...(body.ponctualite !== undefined ? { ponctualite: body.ponctualite } : {}),
      ...(body.discipline !== undefined ? { discipline: body.discipline } : {}),
      ...(body.evaluation !== undefined ? { evaluation: body.evaluation } : {}),
      ...(body.satisfaction !== undefined ? { satisfaction: body.satisfaction } : {}),
      ...(body.commentaire !== undefined ? { commentaire: body.commentaire } : {}),
    },
  });

  return NextResponse.json(suivi);
}