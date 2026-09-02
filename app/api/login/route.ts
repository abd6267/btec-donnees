import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const user = await prisma.user.findUnique({ where: { username } });

  console.log('DEBUG - username reçu:', JSON.stringify(username));
  console.log('DEBUG - user trouvé:', user ? user.username : 'AUCUN');

  if (!user) {
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.password);

  console.log('DEBUG - mot de passe valide:', isValid);

  if (!isValid) {
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
  }

  // Enregistre la dernière connexion — module Gestion des Comptes.
  await prisma.user.update({
    where: { id: user.id },
    data: { derniereConnexion: new Date() },
  });

  return NextResponse.json({ success: true, role: user.role });
}