import { LigneTexte } from './generatePdf';

export function templateContratRecrutement(candidat: any, entreprise: any, poste: string): LigneTexte[] {
  return [
    { texte: `CONTRAT DE RECRUTEMENT`, taille: 13, gras: true, espaceApres: 15 },
    { texte: `Entre le Cabinet BTEC, représenté par sa Direction Générale,`, espaceApres: 4 },
    { texte: `et l'entreprise ${entreprise?.nom ?? '____________'}, représentée par ${entreprise?.directeur ?? '____________'},`, espaceApres: 4 },
    { texte: `il est convenu le recrutement de :`, espaceApres: 15 },
    { texte: `Candidat : ${candidat.nom} ${candidat.prenom}`, gras: true, espaceApres: 4 },
    { texte: `Poste : ${poste}`, espaceApres: 4 },
    { texte: `N° de dossier : ${candidat.numeroDossier}`, espaceApres: 20 },
    { texte: `Le présent contrat prend effet à la date de signature ci-dessous et engage les deux parties selon les conditions convenues entre le Cabinet BTEC et l'entreprise partenaire.`, espaceApres: 30 },
    { texte: `Fait à Cotonou, le ${new Date().toLocaleDateString('fr-FR')}`, espaceApres: 40 },
    { texte: `Signature Cabinet BTEC : ______________________     Signature Entreprise : ______________________` },
  ];
}

export function templateContratFormation(candidat: any, formation: any): LigneTexte[] {
  return [
    { texte: `CONTRAT DE FORMATION`, taille: 13, gras: true, espaceApres: 15 },
    { texte: `Le Cabinet BTEC s'engage à dispenser la formation suivante au candidat désigné ci-dessous :`, espaceApres: 15 },
    { texte: `Candidat : ${candidat.nom} ${candidat.prenom}`, gras: true, espaceApres: 4 },
    { texte: `N° de dossier : ${candidat.numeroDossier}`, espaceApres: 4 },
    { texte: `Formation : ${formation.nom}`, espaceApres: 4 },
    { texte: `Durée : ${formation.dureeJours} jours`, espaceApres: 4 },
    { texte: `Prix : ${formation.prix.toLocaleString('fr-FR')} FCFA`, espaceApres: 20 },
    { texte: `Programme : ${formation.programme}`, espaceApres: 30 },
    { texte: `Fait à Cotonou, le ${new Date().toLocaleDateString('fr-FR')}`, espaceApres: 40 },
    { texte: `Signature Cabinet BTEC : ______________________     Signature Candidat : ______________________` },
  ];
}

export function templateContratPartenariat(entreprise: any): LigneTexte[] {
  return [
    { texte: `CONTRAT DE PARTENARIAT`, taille: 13, gras: true, espaceApres: 15 },
    { texte: `Entre le Cabinet BTEC et l'entreprise ${entreprise.nom}, il est convenu un partenariat de recrutement et de mise à disposition de personnel formé.`, espaceApres: 15 },
    { texte: `Entreprise : ${entreprise.nom}`, gras: true, espaceApres: 4 },
    { texte: `Directeur : ${entreprise.directeur}`, espaceApres: 4 },
    { texte: `Adresse : ${entreprise.adresse}`, espaceApres: 4 },
    { texte: `Secteur d'activité : ${entreprise.activite}`, espaceApres: 20 },
    { texte: `Fait à Cotonou, le ${new Date().toLocaleDateString('fr-FR')}`, espaceApres: 40 },
    { texte: `Signature Cabinet BTEC : ______________________     Signature Entreprise : ______________________` },
  ];
}

export function templateRecuPaiement(paiement: any): LigneTexte[] {
  return [
    { texte: `REÇU DE PAIEMENT`, taille: 13, gras: true, espaceApres: 15 },
    { texte: `Reçu N° : ${paiement.id.slice(0, 8).toUpperCase()}`, espaceApres: 4 },
    { texte: `Date : ${paiement.datePaiement ? new Date(paiement.datePaiement).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}`, espaceApres: 15 },
    { texte: `Libellé : ${paiement.libelle}`, espaceApres: 4 },
    { texte: `Montant reçu : ${paiement.montant.toLocaleString('fr-FR')} FCFA`, gras: true, taille: 13, espaceApres: 4 },
    { texte: `Mode de paiement : ${paiement.modePaiement === 'CAISSE' ? 'Caisse' : 'Banque'}`, espaceApres: 30 },
    { texte: `Le Cabinet BTEC certifie avoir reçu la somme indiquée ci-dessus.`, espaceApres: 40 },
    { texte: `Signature et cachet : ______________________` },
  ];
}

export function templateFacture(paiement: any, destinataire: string): LigneTexte[] {
  return [
    { texte: `FACTURE`, taille: 13, gras: true, espaceApres: 15 },
    { texte: `Facture N° : ${paiement.id.slice(0, 8).toUpperCase()}`, espaceApres: 4 },
    { texte: `Date : ${new Date().toLocaleDateString('fr-FR')}`, espaceApres: 15 },
    { texte: `Destinataire : ${destinataire}`, espaceApres: 15 },
    { texte: `Désignation : ${paiement.libelle}`, espaceApres: 4 },
    { texte: `Montant : ${paiement.montant.toLocaleString('fr-FR')} FCFA`, gras: true, taille: 13, espaceApres: 30 },
    { texte: `Merci de bien vouloir régler cette facture selon les modalités convenues avec le Cabinet BTEC.`, espaceApres: 40 },
    { texte: `Signature et cachet : ______________________` },
  ];
}

export function templateAttestationFormation(candidat: any, inscription: any): LigneTexte[] {
  return [
    { texte: `ATTESTATION DE FORMATION`, taille: 13, gras: true, espaceApres: 20 },
    { texte: `Le Cabinet BTEC atteste que :`, espaceApres: 15 },
    { texte: `${candidat.nom} ${candidat.prenom}`, gras: true, taille: 13, espaceApres: 15 },
    { texte: `a suivi et complété avec succès la formation "${inscription.formation.nom}"`, espaceApres: 4 },
    { texte: `du ${inscription.dateDebut ? new Date(inscription.dateDebut).toLocaleDateString('fr-FR') : '____'} au ${inscription.dateFin ? new Date(inscription.dateFin).toLocaleDateString('fr-FR') : '____'}`, espaceApres: 4 },
    { texte: `Résultat : ${inscription.resultat === 'REUSSI' ? 'Réussi' : inscription.resultat === 'ECHOUE' ? 'Échoué' : 'En cours'}${inscription.mention ? ' — Mention : ' + inscription.mention : ''}`, espaceApres: 30 },
    { texte: `En foi de quoi la présente attestation lui est délivrée pour servir et valoir ce que de droit.`, espaceApres: 40 },
    { texte: `Fait à Cotonou, le ${new Date().toLocaleDateString('fr-FR')}`, espaceApres: 30 },
    { texte: `Signature et cachet : ______________________` },
  ];
}

export function templateConvocation(candidat: any, dateEntretien: Date): LigneTexte[] {
  return [
    { texte: `CONVOCATION À UN ENTRETIEN`, taille: 13, gras: true, espaceApres: 20 },
    { texte: `Cher(e) ${candidat.nom} ${candidat.prenom},`, espaceApres: 15 },
    { texte: `Nous avons le plaisir de vous convoquer à un entretien d'embauche qui se tiendra le :`, espaceApres: 4 },
    { texte: `${dateEntretien.toLocaleDateString('fr-FR')} à ${dateEntretien.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, gras: true, taille: 13, espaceApres: 20 },
    { texte: `dans nos locaux à Cotonou. Merci de vous munir d'une pièce d'identité et de votre dossier de candidature complet.`, espaceApres: 40 },
    { texte: `Cordialement,`, espaceApres: 4 },
    { texte: `La Direction du Cabinet BTEC` },
  ];
}

export function templateLettreEmbauche(candidat: any, entreprise: any, poste: string, dateEmbauche: Date): LigneTexte[] {
  return [
    { texte: `LETTRE D'EMBAUCHE`, taille: 13, gras: true, espaceApres: 20 },
    { texte: `Cher(e) ${candidat.nom} ${candidat.prenom},`, espaceApres: 15 },
    { texte: `Nous avons le plaisir de vous informer que votre candidature a été retenue pour le poste de :`, espaceApres: 4 },
    { texte: `${poste}`, gras: true, taille: 13, espaceApres: 4 },
    { texte: `au sein de l'entreprise ${entreprise?.nom ?? '____________'}, à compter du ${dateEmbauche.toLocaleDateString('fr-FR')}.`, espaceApres: 30 },
    { texte: `Nous vous félicitons pour cette nouvelle étape professionnelle et vous souhaitons plein succès dans vos fonctions.`, espaceApres: 40 },
    { texte: `Cordialement,`, espaceApres: 4 },
    { texte: `La Direction du Cabinet BTEC` },
  ];
}

export function templateCertificatTravail(candidat: any, employe: any, entreprise: any): LigneTexte[] {
  return [
    { texte: `CERTIFICAT DE TRAVAIL`, taille: 13, gras: true, espaceApres: 20 },
    { texte: `Le Cabinet BTEC certifie que :`, espaceApres: 15 },
    { texte: `${candidat.nom} ${candidat.prenom}`, gras: true, taille: 13, espaceApres: 15 },
    { texte: `a occupé le poste de ${employe.poste ?? '____________'} au sein de l'entreprise ${entreprise?.nom ?? '____________'}`, espaceApres: 4 },
    { texte: `du ${employe.dateEmbauche ? new Date(employe.dateEmbauche).toLocaleDateString('fr-FR') : '____'} au ${employe.dateDepart ? new Date(employe.dateDepart).toLocaleDateString('fr-FR') : 'ce jour'}.`, espaceApres: 30 },
    { texte: `Ce certificat est délivré pour servir et valoir ce que de droit.`, espaceApres: 40 },
    { texte: `Fait à Cotonou, le ${new Date().toLocaleDateString('fr-FR')}`, espaceApres: 30 },
    { texte: `Signature et cachet : ______________________` },
  ];
}