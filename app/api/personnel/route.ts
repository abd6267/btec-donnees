import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// POST /api/personnel
// Body: { username, password, nom, prenom, email, role, fonction }
export async function POST(request: Request) {
  const body = await request.json();

  if (!body.username || !body.password || !body.role) {
    return NextResponse.json({ error: 'username, password et role sont requis' }, { status: 400 });
  }

  const existant = await prisma.user.findUnique({ where: { username: body.username } });
  if (existant) {
    return NextResponse.json({ error: 'Ce login existe déjà' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.create({
    data: {
      username: body.username,
      password: passwordHash,
      nom: body.nom || null,
      prenom: body.prenom || null,
      email: body.email || null,
      role: body.role,
      fonction: body.fonction || null,
      actif: true,
    },
    select: {
      id: true,
      username: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      fonction: true,
      actif: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}