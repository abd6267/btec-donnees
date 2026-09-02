import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// PATCH /api/entretiens/[id]
// Permet de modifier la date, les notes ou le statut d'un entretien
// (ex: PREVU -> REALISE / ANNULE, ou changer la date planifiée),
// ainsi que l'évaluation complète (responsable RH, note/20, résultat,
// compte rendu, forces, faiblesses, recommandations).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const entretienExistant = await prisma.entretien.findUnique({ where: { id } });
  if (!entretienExistant) {
    return NextResponse.json({ error: 'Entretien introuvable' }, { status: 404 });
  }

  const entretien = await prisma.entretien.update({
    where: { id },
    data: {
      ...(body.dateEntretien ? { dateEntretien: new Date(body.dateEntretien) } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.statut ? { statut: body.statut } : {}),

      // Nouveaux champs — évaluation de l'entretien
      ...(body.responsableRH !== undefined ? { responsableRH: body.responsableRH } : {}),
      ...(body.note !== undefined ? { note: body.note } : {}),
      ...(body.resultat !== undefined ? { resultat: body.resultat } : {}),
      ...(body.compteRendu !== undefined ? { compteRendu: body.compteRendu } : {}),
      ...(body.forces !== undefined ? { forces: body.forces } : {}),
      ...(body.faiblesses !== undefined ? { faiblesses: body.faiblesses } : {}),
      ...(body.recommandations !== undefined ? { recommandations: body.recommandations } : {}),
    },
  });

  // Si l'entretien est marqué REALISE, on peut faire progresser le candidat
  // vers VALIDE ou REFUSE selon ce que l'utilisateur choisit côté UI —
  // ici on ne force rien automatiquement, ça reste une action volontaire
  // faite depuis la page candidats.

  return NextResponse.json(entretien);
}