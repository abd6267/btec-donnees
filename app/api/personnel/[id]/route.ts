import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// PATCH /api/personnel/[id]
// Body: { nom?, prenom?, email?, role?, fonction?, actif?, password? }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const existant = await prisma.user.findUnique({ where: { id } });
  if (!existant) {
    return NextResponse.json({ error: 'Compte introuvable' }, { status: 404 });
  }

  const data: Record<string, any> = {
    ...(body.nom !== undefined ? { nom: body.nom } : {}),
    ...(body.prenom !== undefined ? { prenom: body.prenom } : {}),
    ...(body.email !== undefined ? { email: body.email || null } : {}),
    ...(body.role !== undefined ? { role: body.role } : {}),
    ...(body.fonction !== undefined ? { fonction: body.fonction } : {}),
    ...(body.actif !== undefined ? { actif: body.actif } : {}),
  };

  // Le mot de passe n'est réinitialisé que s'il est explicitement fourni et non vide.
  if (body.password) {
    data.password = await bcrypt.hash(body.password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      fonction: true,
      actif: true,
      derniereConnexion: true,
    },
  });

  return NextResponse.json(user);
}

// DELETE /api/personnel/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existant = await prisma.user.findUnique({ where: { id } });
  if (!existant) {
    return NextResponse.json({ error: 'Compte introuvable' }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}