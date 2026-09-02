import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSQL({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// GET /api/paiements/rapport?periode=mensuel|annuel&annee=2026&mois=8
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periode = searchParams.get('periode') || 'mensuel';
  const annee = parseInt(searchParams.get('annee') || String(new Date().getFullYear()), 10);
  const mois = searchParams.get('mois') ? parseInt(searchParams.get('mois')!, 10) : null;

  let dateDebut: Date;
  let dateFin: Date;

  if (periode === 'annuel') {
    dateDebut = new Date(annee, 0, 1);
    dateFin = new Date(annee, 11, 31, 23, 59, 59);
  } else {
    const m = mois !== null ? mois - 1 : new Date().getMonth();
    dateDebut = new Date(annee, m, 1);
    dateFin = new Date(annee, m + 1, 0, 23, 59, 59);
  }

  const paiements = await prisma.paiement.findMany({
    where: {
      statut: 'PAYE',
      datePaiement: { gte: dateDebut, lte: dateFin },
    },
  });

  const recettes = paiements.filter((p) => p.type === 'RECETTE');
  const depenses = paiements.filter((p) => p.type === 'DEPENSE');

  const totalRecettes = recettes.reduce((sum, p) => sum + p.montant, 0);
  const totalDepenses = depenses.reduce((sum, p) => sum + p.montant, 0);

  const caisse = paiements.filter((p) => p.modePaiement === 'CAISSE');
  const banque = paiements.filter((p) => p.modePaiement === 'BANQUE');

  const parCategorie: Record<string, number> = {};
  for (const p of paiements) {
    const cat = p.categorie || 'AUTRE';
    parCategorie[cat] = (parCategorie[cat] || 0) + (p.type === 'RECETTE' ? p.montant : -p.montant);
  }

  return NextResponse.json({
    periode,
    annee,
    mois: periode === 'mensuel' ? (mois || new Date().getMonth() + 1) : null,
    totalRecettes,
    totalDepenses,
    benefice: totalRecettes - totalDepenses,
    journalCaisse: {
      recettes: caisse.filter((p) => p.type === 'RECETTE').reduce((s, p) => s + p.montant, 0),
      depenses: caisse.filter((p) => p.type === 'DEPENSE').reduce((s, p) => s + p.montant, 0),
      operations: caisse,
    },
    journalBanque: {
      recettes: banque.filter((p) => p.type === 'RECETTE').reduce((s, p) => s + p.montant, 0),
      depenses: banque.filter((p) => p.type === 'DEPENSE').reduce((s, p) => s + p.montant, 0),
      operations: banque,
    },
    parCategorie,
  });
}