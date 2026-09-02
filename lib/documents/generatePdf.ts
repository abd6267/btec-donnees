import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const GREEN = rgb(0.086, 0.639, 0.290); // #16a34a

export type LigneTexte = { texte: string; taille?: number; gras?: boolean; espaceApres?: number };

// Génère un PDF simple avec en-tête BTEC + corps de texte, retourne le buffer.
export async function genererDocumentPdf(titre: string, lignes: LigneTexte[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 780;
  const marginX = 50;

  // En-tête
  page.drawText('BTEC', { x: marginX, y, size: 22, font: fontBold, color: GREEN });
  y -= 16;
  page.drawText('Cabinet de Recrutement & de Formation', { x: marginX, y, size: 9, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
  y -= 30;
  page.drawLine({ start: { x: marginX, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
  y -= 30;

  // Titre du document
  page.drawText(titre, { x: marginX, y, size: 16, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  y -= 35;

  // Corps
  for (const ligne of lignes) {
    const taille = ligne.taille ?? 11;
    const font = ligne.gras ? fontBold : fontRegular;
    const maxWidth = 495;
    const mots = ligne.texte.split(' ');
    let ligneActuelle = '';

    for (const mot of mots) {
      const testLigne = ligneActuelle ? `${ligneActuelle} ${mot}` : mot;
      const largeur = font.widthOfTextAtSize(testLigne, taille);
      if (largeur > maxWidth && ligneActuelle) {
        page.drawText(ligneActuelle, { x: marginX, y, size: taille, font, color: rgb(0.15, 0.15, 0.15) });
        y -= taille + 6;
        ligneActuelle = mot;
      } else {
        ligneActuelle = testLigne;
      }
    }
    if (ligneActuelle) {
      page.drawText(ligneActuelle, { x: marginX, y, size: taille, font, color: rgb(0.15, 0.15, 0.15) });
      y -= taille + 6;
    }
    y -= ligne.espaceApres ?? 8;
  }

  // Pied de page
  page.drawText(`Document généré le ${new Date().toLocaleDateString('fr-FR')} — BTEC Bénin`, {
    x: marginX, y: 40, size: 8, font: fontRegular, color: rgb(0.6, 0.6, 0.6),
  });

  return pdfDoc.save();
}

// Sauvegarde le PDF sur disque dans /public/documents et retourne le chemin public.
export async function sauvegarderPdf(buffer: Uint8Array, nomFichier: string): Promise<string> {
  const dossier = path.join(process.cwd(), 'public', 'documents');
  if (!fs.existsSync(dossier)) {
    fs.mkdirSync(dossier, { recursive: true });
  }
  const cheminComplet = path.join(dossier, nomFichier);
  fs.writeFileSync(cheminComplet, buffer);
  return `/documents/${nomFichier}`;
}