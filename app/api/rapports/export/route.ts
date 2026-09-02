import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import * as XLSX from 'xlsx';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'xlsx';

  const candidats = await prisma.candidat.findMany();
  const paiements = await prisma.paiement.findMany();
  const inscriptions = await prisma.inscription.findMany({
    include: { candidat: true, formation: true },
  });

  if (format === 'xlsx') {
    const wb = XLSX.utils.book_new();

    const wsCandidats = XLSX.utils.json_to_sheet(
      candidats.map((c) => ({
        Nom: c.nom,
        Prénom: c.prenom,
        Poste: c.posteRecherche,
        Statut: c.statut,
        'Date inscription': c.dateInscription,
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsCandidats, 'Candidats');

    const wsFinance = XLSX.utils.json_to_sheet(
      paiements.map((p) => ({
        Libellé: p.libelle,
        Type: p.type,
        Montant: p.montant,
        Catégorie: p.categorie,
        Statut: p.statut,
        'Date paiement': p.datePaiement,
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsFinance, 'Finances');

    const wsFormations = XLSX.utils.json_to_sheet(
      inscriptions.map((i) => ({
        Candidat: `${i.candidat.nom} ${i.candidat.prenom}`,
        Formation: i.formation.nom,
        Statut: i.statut,
        Résultat: i.resultat,
        Mention: i.mention,
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsFormations, 'Formations');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="rapport-btec.xlsx"',
      },
    });
  }

  return NextResponse.json({ error: 'Format non supporté' }, { status: 400 });
}