import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { genererDocumentPdf, sauvegarderPdf } from '../../../../lib/documents/generatePdf';
import {
  templateContratRecrutement,
  templateContratFormation,
  templateContratPartenariat,
  templateRecuPaiement,
  templateFacture,
  templateAttestationFormation,
  templateConvocation,
  templateLettreEmbauche,
  templateCertificatTravail,
} from '../../../../lib/documents/templates';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

const TITRES: Record<string, string> = {
  CONTRAT_RECRUTEMENT: 'Contrat de recrutement',
  CONTRAT_FORMATION: 'Contrat de formation',
  CONTRAT_PARTENARIAT: 'Contrat de partenariat',
  RECU_PAIEMENT: 'ReÃ§u de paiement',
  FACTURE: 'Facture',
  ATTESTATION_FORMATION: 'Attestation de formation',
  CONVOCATION: 'Convocation',
  LETTRE_EMBAUCHE: "Lettre d'embauche",
  CERTIFICAT_TRAVAIL: 'Certificat de travail',
};

// POST /api/documents/generer
// Body: { type: DocumentType, candidatId?, entrepriseId?, inscriptionId?, paiementId?, ...extras }
export async function POST(request: Request) {
  const body = await request.json();
  const { type } = body;

  if (!type || !TITRES[type]) {
    return NextResponse.json({ error: 'Type de document invalide' }, { status: 400 });
  }

  let lignes;
  let candidat = null;
  let entreprise = null;
  let inscription = null;
  let paiement = null;

  try {
    switch (type) {
      case 'CONTRAT_RECRUTEMENT': {
        candidat = await prisma.candidat.findUnique({ where: { id: body.candidatId } });
        entreprise = body.entrepriseId ? await prisma.entreprise.findUnique({ where: { id: body.entrepriseId } }) : null;
        if (!candidat) return NextResponse.json({ error: 'Candidat introuvable' }, { status: 404 });
        lignes = templateContratRecrutement(candidat, entreprise, body.poste || candidat.posteRecherche);
        break;
      }
      case 'CONTRAT_FORMATION': {
        inscription = await prisma.inscription.findUnique({ where: { id: body.inscriptionId }, include: { candidat: true, formation: true } });
        if (!inscription) return NextResponse.json({ error: 'Inscription introuvable' }, { status: 404 });
        candidat = inscription.candidat;
        lignes = templateContratFormation(inscription.candidat, inscription.formation);
        break;
      }
      case 'CONTRAT_PARTENARIAT': {
        entreprise = await prisma.entreprise.findUnique({ where: { id: body.entrepriseId } });
        if (!entreprise) return NextResponse.json({ error: 'Entreprise introuvable' }, { status: 404 });
        lignes = templateContratPartenariat(entreprise);
        break;
      }
      case 'RECU_PAIEMENT': {
        paiement = await prisma.paiement.findUnique({ where: { id: body.paiementId } });
        if (!paiement) return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
        lignes = templateRecuPaiement(paiement);
        break;
      }
      case 'FACTURE': {
        paiement = await prisma.paiement.findUnique({
          where: { id: body.paiementId },
          include: { candidat: true, entreprise: true },
        });
        if (!paiement) return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
        const destinataire = paiement.entreprise?.nom || (paiement.candidat ? `${paiement.candidat.nom} ${paiement.candidat.prenom}` : body.destinataire || '____________');
        lignes = templateFacture(paiement, destinataire);
        break;
      }
      case 'ATTESTATION_FORMATION': {
        inscription = await prisma.inscription.findUnique({ where: { id: body.inscriptionId }, include: { candidat: true, formation: true } });
        if (!inscription) return NextResponse.json({ error: 'Inscription introuvable' }, { status: 404 });
        candidat = inscription.candidat;
        lignes = templateAttestationFormation(inscription.candidat, inscription);
        break;
      }
      case 'CONVOCATION': {
        candidat = await prisma.candidat.findUnique({ where: { id: body.candidatId } });
        if (!candidat) return NextResponse.json({ error: 'Candidat introuvable' }, { status: 404 });
        if (!body.dateEntretien) return NextResponse.json({ error: 'dateEntretien requis' }, { status: 400 });
        lignes = templateConvocation(candidat, new Date(body.dateEntretien));
        break;
      }
      case 'LETTRE_EMBAUCHE': {
        candidat = await prisma.candidat.findUnique({ where: { id: body.candidatId } });
        entreprise = body.entrepriseId ? await prisma.entreprise.findUnique({ where: { id: body.entrepriseId } }) : null;
        if (!candidat) return NextResponse.json({ error: 'Candidat introuvable' }, { status: 404 });
        lignes = templateLettreEmbauche(candidat, entreprise, body.poste || candidat.posteRecherche, body.dateEmbauche ? new Date(body.dateEmbauche) : new Date());
        break;
      }
      case 'CERTIFICAT_TRAVAIL': {
        const employe = await prisma.employe.findUnique({ where: { id: body.employeId }, include: { candidat: true, entreprise: true } });
        if (!employe) return NextResponse.json({ error: 'EmployÃ© introuvable' }, { status: 404 });
        candidat = employe.candidat;
        entreprise = employe.entreprise;
        lignes = templateCertificatTravail(employe.candidat, employe, employe.entreprise);
        break;
      }
      default:
        return NextResponse.json({ error: 'Type non gÃ©rÃ©' }, { status: 400 });
    }

    const pdfBytes = await genererDocumentPdf(TITRES[type], lignes);
    const nomFichier = `${type}_${Date.now()}.pdf`;
    const filePath = await sauvegarderPdf(pdfBytes, nomFichier);

    const document = await prisma.document.create({
      data: {
        type,
        filePath,
        candidatId: candidat?.id || null,
        entrepriseId: entreprise?.id || null,
        inscriptionId: inscription?.id || null,
        paiementId: paiement?.id || null,
        genereePar: body.genereePar || null,
      },
    });

    return NextResponse.json({ success: true, document, filePath });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur lors de la gÃ©nÃ©ration' }, { status: 500 });
  }
}
