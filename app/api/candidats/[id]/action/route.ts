import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// POST /api/candidats/[id]/action
// Body: { action: 'PLANIFIER_ENTRETIEN' | 'MARQUER_ENTRETIEN_REALISE' | 'PASSER_EN_FORMATION' | 'EMBAUCHER' | 'DEBAUCHER', ...payload }
//
// Logique du parcours :
//   - Entretien : planifiable librement, à tout moment (indépendant de la formation).
//   - Formation : planifiable librement, à tout moment (indépendant de l'entretien).
//     Un candidat peut être formé avant, après, ou ne jamais passer par la formation.
//   - Embauché : nécessite un Entretien au statut REALISE AVEC résultat ADMIS.
//     La Formation est optionnelle et n'est jamais un prérequis à l'embauche.
//   - Débauché : nécessite d'être actuellement EMBAUCHE.
//   Un candidat débauché peut reprendre un nouveau cycle (nouvel entretien, etc.)

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: candidatId } = await params;
  const body = await request.json();
  const { action } = body;

  const candidat = await prisma.candidat.findUnique({
    where: { id: candidatId },
    include: {
      entretiens: { orderBy: { dateEntretien: 'desc' } },
      employes: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!candidat) {
    return NextResponse.json({ error: 'Candidat introuvable' }, { status: 404 });
  }

  const dernierEmploye = candidat.employes[0] ?? null;
  const dernierEntretien = candidat.entretiens[0] ?? null;
  // L'embauche nécessite un entretien REALISE avec résultat ADMIS — pas juste "réalisé".
  const entretienAdmis = candidat.entretiens.some((e) => e.statut === 'REALISE' && e.resultat === 'ADMIS');
  const estActuellementEmbauche = dernierEmploye?.statutEmploi === 'EMBAUCHE';

  switch (action) {
    case 'PLANIFIER_ENTRETIEN': {
      // Librement planifiable, sauf s'il y a déjà un entretien PREVU non traité
      // ou si le candidat est actuellement embauché (cycle en cours).
      if (estActuellementEmbauche) {
        return NextResponse.json(
          { error: 'Ce candidat est actuellement embauché. Débauchez-le avant de planifier un nouvel entretien.' },
          { status: 400 }
        );
      }
      if (dernierEntretien?.statut === 'PREVU') {
        return NextResponse.json(
          { error: 'Un entretien est déjà prévu pour ce candidat.' },
          { status: 400 }
        );
      }
      if (!body.dateEntretien) {
        return NextResponse.json({ error: 'dateEntretien est requis' }, { status: 400 });
      }
      const entretien = await prisma.entretien.create({
        data: {
          candidatId,
          dateEntretien: new Date(body.dateEntretien),
          notes: body.notes ?? null,
          statut: 'PREVU',
        },
      });
      return NextResponse.json({ success: true, entretien });
    }

    case 'MARQUER_ENTRETIEN_REALISE': {
      if (!dernierEntretien || dernierEntretien.statut !== 'PREVU') {
        return NextResponse.json(
          { error: 'Aucun entretien prévu à valider pour ce candidat.' },
          { status: 400 }
        );
      }
      const entretien = await prisma.entretien.update({
        where: { id: dernierEntretien.id },
        data: { statut: 'REALISE', notes: body.notes ?? dernierEntretien.notes },
      });
      return NextResponse.json({ success: true, entretien });
    }

    case 'PASSER_EN_FORMATION': {
      // Librement déclenchable, sauf si le candidat est déjà dans un cycle Employe actif
      // (EN_ATTENTE ou EMBAUCHE). Aucune dépendance à l'entretien.
      if (dernierEmploye && dernierEmploye.statutEmploi !== 'DEBAUCHE') {
        return NextResponse.json(
          { error: 'Ce candidat est déjà dans un cycle en cours (formation ou embauche).' },
          { status: 400 }
        );
      }
      const employe = await prisma.employe.create({
        data: {
          candidatId,
          statutEmploi: 'EN_ATTENTE',
          poste: body.poste ?? candidat.posteRecherche,
        },
      });
      return NextResponse.json({ success: true, employe });
    }

    case 'EMBAUCHER': {
      // Seul prérequis réel : un entretien REALISE avec résultat ADMIS. La formation est optionnelle.
      if (!entretienAdmis) {
        return NextResponse.json(
          { error: "Ce candidat doit avoir un entretien réalisé avec la mention \"Admis\" avant d'être embauché." },
          { status: 400 }
        );
      }
      if (!body.entrepriseId) {
        return NextResponse.json({ error: 'entrepriseId est requis pour embaucher' }, { status: 400 });
      }

      let employe;
      if (dernierEmploye && dernierEmploye.statutEmploi === 'EN_ATTENTE') {
        // Cas "formé d'abord" : on fait évoluer le cycle Employe existant.
        employe = await prisma.employe.update({
          where: { id: dernierEmploye.id },
          data: {
            statutEmploi: 'EMBAUCHE',
            entrepriseId: body.entrepriseId,
            poste: body.poste ?? dernierEmploye.poste,
            dateEmbauche: body.dateEmbauche ? new Date(body.dateEmbauche) : new Date(),
            salaire: body.salaire !== undefined ? parseFloat(body.salaire) : null,
            typeContrat: body.typeContrat || null,
            contratPath: body.contratPath || null,
            dureeContrat: body.dureeContrat || null,
            responsablePlacement: body.responsablePlacement || null,
          },
        });
      } else if (!dernierEmploye || dernierEmploye.statutEmploi === 'DEBAUCHE') {
        // Cas "déjà formé ailleurs" : entretien direct -> embauche, sans étape Formé.
        employe = await prisma.employe.create({
          data: {
            candidatId,
            statutEmploi: 'EMBAUCHE',
            entrepriseId: body.entrepriseId,
            poste: body.poste ?? candidat.posteRecherche,
            dateEmbauche: body.dateEmbauche ? new Date(body.dateEmbauche) : new Date(),
            salaire: body.salaire !== undefined ? parseFloat(body.salaire) : null,
            typeContrat: body.typeContrat || null,
            contratPath: body.contratPath || null,
            dureeContrat: body.dureeContrat || null,
            responsablePlacement: body.responsablePlacement || null,
          },
        });
      } else {
        return NextResponse.json(
          { error: 'Ce candidat est déjà embauché.' },
          { status: 400 }
        );
      }

      await prisma.candidat.update({
        where: { id: candidatId },
        data: { statut: 'VALIDE' },
      });
      return NextResponse.json({ success: true, employe });
    }

    case 'DEBAUCHER': {
      if (!dernierEmploye || dernierEmploye.statutEmploi !== 'EMBAUCHE') {
        return NextResponse.json(
          { error: "Ce candidat n'est pas actuellement embauché." },
          { status: 400 }
        );
      }
      const employe = await prisma.employe.update({
        where: { id: dernierEmploye.id },
        data: {
          statutEmploi: 'DEBAUCHE',
          dateDepart: body.dateDepart ? new Date(body.dateDepart) : new Date(),
          motifDepart: body.motifDepart ?? null,
          motifDepartType: body.motifDepartType || null,
        },
      });
      return NextResponse.json({ success: true, employe });
    }

    default:
      return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  }
}