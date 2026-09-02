import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// PATCH /api/employes/[id]
// Fait évoluer le pipeline d'un employé :
//
// - EMBAUCHE  -> requiert entrepriseId (+ poste optionnel), fixe dateEmbauche
// - DEBAUCHE  -> requiert motifDepart, fixe dateDepart
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const employeExistant = await prisma.employe.findUnique({ where: { id } });
  if (!employeExistant) {
    return NextResponse.json({ error: 'Employé introuvable' }, { status: 404 });
  }

  const nouveauStatut = body.statutEmploi as string | undefined;
  const statutsValides = ['EN_ATTENTE', 'EMBAUCHE', 'DEBAUCHE'];
  if (nouveauStatut && !statutsValides.includes(nouveauStatut)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }

  if (nouveauStatut === 'EMBAUCHE' && !body.entrepriseId) {
    return NextResponse.json(
      { error: "Une entreprise doit être sélectionnée pour marquer l'employé comme embauché" },
      { status: 400 }
    );
  }

  if (nouveauStatut === 'DEBAUCHE' && !body.motifDepart) {
    return NextResponse.json(
      { error: 'Un motif de départ est requis pour débaucher un employé' },
      { status: 400 }
    );
  }

  const data: any = {};

  if (nouveauStatut) data.statutEmploi = nouveauStatut;

  if (nouveauStatut === 'EMBAUCHE') {
    data.entrepriseId = body.entrepriseId;
    if (body.poste) data.poste = body.poste;
    data.dateEmbauche = new Date();
  }

  if (nouveauStatut === 'DEBAUCHE') {
    data.motifDepart = body.motifDepart;
    data.dateDepart = new Date();
  }

  const employe = await prisma.employe.update({
    where: { id },
    data,
    include: { candidat: true, entreprise: true },
  });

  return NextResponse.json(employe);
}