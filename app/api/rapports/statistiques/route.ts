import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const [
    candidatsInscrits,
    candidatsRecrutes,
    enFormation,
    placés,
    entretiens,
    entreprises,
    formations,
  ] = await Promise.all([
    prisma.candidat.count(),
    prisma.employe.count({ where: { statutEmploi: 'EMBAUCHE' } }),
    prisma.inscription.count({ where: { statut: 'EN_FORMATION' } }),
    prisma.employe.count({ where: { statutEmploi: 'EMBAUCHE', entrepriseId: { not: null } } }),
    prisma.entretien.groupBy({ by: ['resultat'], _count: true }),
    prisma.entreprise.findMany({
      include: { employes: { where: { statutEmploi: 'EMBAUCHE' } } },
    }),
    prisma.formation.findMany({
      include: { inscriptions: true },
    }),
  ]);

  const paiements = await prisma.paiement.findMany({ where: { statut: 'PAYE' } });
  const revenusMensuels = paiements
    .filter((p) => p.type === 'RECETTE')
    .reduce((sum, p) => sum + p.montant, 0);
  const depensesMensuelles = paiements
    .filter((p) => p.type === 'DEPENSE')
    .reduce((sum, p) => sum + p.montant, 0);

  const classementEntreprises = entreprises
    .map((e) => ({ nom: e.nom, nombreEmployes: e.employes.length }))
    .sort((a, b) => b.nombreEmployes - a.nombreEmployes);

  const classementFormations = formations
    .map((f) => ({ nom: f.nom, nombreInscrits: f.inscriptions.length }))
    .sort((a, b) => b.nombreInscrits - a.nombreInscrits);

  return NextResponse.json({
    candidatsInscrits,
    candidatsRecrutes,
    enFormation,
    placés,
    entretiens,
    revenus: revenusMensuels,
    depenses: depensesMensuelles,
    classementEntreprises,
    classementFormations,
  });
}