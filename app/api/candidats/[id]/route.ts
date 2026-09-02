import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// GET /api/candidats/[id]
// Renvoie le candidat avec tout son historique (entretiens + cycles employé)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const candidat = await prisma.candidat.findUnique({
    where: { id },
    include: {
      entretiens: { orderBy: { dateEntretien: 'desc' } },
      employes: {
        include: { entreprise: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!candidat) {
    return NextResponse.json({ error: 'Candidat introuvable' }, { status: 404 });
  }

  return NextResponse.json(candidat);
}

// PATCH /api/candidats/[id]
// Met à jour le statut d'un candidat ET/OU ses informations de dossier
// (nom, prénom, sexe, dateNaissance, telephone, email, adresse, niveauEtude,
// diplome, posteRecherche), et synchronise automatiquement les autres
// rubriques (Entretiens, Formés en attente) selon le nouveau statut :
//
// - EN_ETUDE  -> crée un Entretien "PREVU" (date par défaut : +7 jours),
//                sauf s'il en existe déjà un non-annulé pour ce candidat.
// - VALIDE    -> crée un Employe "EN_ATTENTE" (pipeline Formés en attente),
//                sauf s'il en existe déjà un pour ce candidat.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const candidatExistant = await prisma.candidat.findUnique({ where: { id } });
  if (!candidatExistant) {
    return NextResponse.json({ error: 'Candidat introuvable' }, { status: 404 });
  }

  const nouveauStatut = body.statut as string | undefined;

  const statutsValides = ['NOUVEAU', 'DOSSIER_INCOMPLET', 'EN_ETUDE', 'VALIDE', 'REFUSE'];
  if (nouveauStatut && !statutsValides.includes(nouveauStatut)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }

  const sexesValides = ['M', 'F'];
  if (body.sexe && !sexesValides.includes(body.sexe)) {
    return NextResponse.json({ error: 'Sexe invalide' }, { status: 400 });
  }

  const candidat = await prisma.candidat.update({
    where: { id },
    data: {
      ...(nouveauStatut ? { statut: nouveauStatut as any } : {}),

      // Champs d'édition du dossier — modification pure, aucune synchronisation associée.
      ...(body.nom !== undefined ? { nom: body.nom } : {}),
      ...(body.prenom !== undefined ? { prenom: body.prenom } : {}),
      ...(body.sexe !== undefined ? { sexe: body.sexe } : {}),
      ...(body.dateNaissance !== undefined ? { dateNaissance: new Date(body.dateNaissance) } : {}),
      ...(body.telephone !== undefined ? { telephone: body.telephone } : {}),
      ...(body.email !== undefined ? { email: body.email || null } : {}),
      ...(body.adresse !== undefined ? { adresse: body.adresse } : {}),
      ...(body.niveauEtude !== undefined ? { niveauEtude: body.niveauEtude } : {}),
      ...(body.diplome !== undefined ? { diplome: body.diplome } : {}),
      ...(body.posteRecherche !== undefined ? { posteRecherche: body.posteRecherche } : {}),
    },
  });

  // --- Synchronisation automatique selon le nouveau statut ---

  if (nouveauStatut === 'EN_ETUDE') {
    const entretienExistant = await prisma.entretien.findFirst({
      where: { candidatId: id, statut: 'PREVU' },
    });

    if (!entretienExistant) {
      const dateParDefaut = new Date();
      dateParDefaut.setDate(dateParDefaut.getDate() + 7);

      await prisma.entretien.create({
        data: {
          candidatId: id,
          dateEntretien: dateParDefaut,
          statut: 'PREVU',
        },
      });
    }
  }

  if (nouveauStatut === 'VALIDE') {
    const employeExistant = await prisma.employe.findFirst({
      where: { candidatId: id },
    });

    if (!employeExistant) {
      await prisma.employe.create({
        data: {
          candidatId: id,
          statutEmploi: 'EN_ATTENTE',
        },
      });
    }
  }

  return NextResponse.json(candidat);
}