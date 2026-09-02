import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

export async function GET() {
  const maintenant = new Date();
  const dansSeptJours = new Date(maintenant.getTime() + 7 * 24 * 60 * 60 * 1000);
  const debutJour = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
  const finJour = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate(), 23, 59, 59);

  const [
    paiementsEnRetard,
    entretiensAujourdhui,
    formationsQuiCommencentBientot,
    dossiersIncomplets,
  ] = await Promise.all([
    prisma.paiement.findMany({
      where: {
        statut: { in: ['EN_ATTENTE', 'EN_RETARD'] },
        dateEcheance: { lt: maintenant },
      },
      include: { candidat: true, entreprise: true },
    }),
    prisma.entretien.findMany({
      where: {
        statut: 'PREVU',
        dateEntretien: { gte: debutJour, lte: finJour },
      },
      include: { candidat: true },
    }),
    prisma.inscription.findMany({
      where: {
        statut: 'EN_FORMATION',
        dateDebut: { gte: maintenant, lte: dansSeptJours },
      },
      include: { candidat: true, formation: true },
    }),
    prisma.candidat.findMany({
      where: { statut: 'DOSSIER_INCOMPLET' },
    }),
  ]);

  const notifications = [
    ...paiementsEnRetard.map((p) => ({
      type: 'PAIEMENT_RETARD',
      message: `Paiement en retard : ${p.libelle} (${p.montant.toLocaleString('fr-FR')} FCFA)${p.candidat ? ' â€” ' + p.candidat.nom + ' ' + p.candidat.prenom : ''}${p.entreprise ? ' â€” ' + p.entreprise.nom : ''}`,
      date: p.dateEcheance,
      niveau: 'urgent',
    })),
    ...entretiensAujourdhui.map((e) => ({
      type: 'ENTRETIEN_AUJOURDHUI',
      message: `Entretien aujourd'hui : ${e.candidat.nom} ${e.candidat.prenom} Ã  ${new Date(e.dateEntretien).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
      date: e.dateEntretien,
      niveau: 'info',
    })),
    ...formationsQuiCommencentBientot.map((i) => ({
      type: 'FORMATION_DEMARRE',
      message: `Formation "${i.formation.nom}" dÃ©marre bientÃ´t pour ${i.candidat.nom} ${i.candidat.prenom}`,
      date: i.dateDebut,
      niveau: 'info',
    })),
    ...dossiersIncomplets.map((c) => ({
      type: 'DOSSIER_INCOMPLET',
      message: `Dossier incomplet : ${c.nom} ${c.prenom}`,
      date: c.updatedAt,
      niveau: 'attention',
    })),
  ];

  notifications.sort((a, b) => new Date(a.date as any).getTime() - new Date(b.date as any).getTime());

  return NextResponse.json(notifications);
}
