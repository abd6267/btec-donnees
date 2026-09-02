import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const formations = [
  // Informatique / Numérique
  { nom: "Initiation à l'informatique (Bureautique)", programme: "Word, Excel, PowerPoint, Internet, messagerie professionnelle", prix: 50000, dureeJours: 15, nombrePlaces: 20 },
  { nom: "Maintenance et réparation informatique", programme: "Diagnostic panne, assemblage PC, dépannage matériel et logiciel", prix: 100000, dureeJours: 30, nombrePlaces: 15 },
  { nom: "Développement Web (HTML, CSS, JavaScript)", programme: "Création de sites web statiques et dynamiques, responsive design", prix: 150000, dureeJours: 45, nombrePlaces: 15 },
  { nom: "Développement d'applications (Python)", programme: "Bases de la programmation, structures de données, mini-projets", prix: 150000, dureeJours: 45, nombrePlaces: 15 },
  { nom: "Infographie et Design graphique", programme: "Photoshop, Illustrator, Canva, création de supports visuels", prix: 100000, dureeJours: 30, nombrePlaces: 15 },
  { nom: "Réseaux et Administration systèmes", programme: "Configuration réseau, serveurs, sécurité informatique de base", prix: 150000, dureeJours: 30, nombrePlaces: 12 },
  { nom: "Data Analyse avec Excel avancé", programme: "Tableaux croisés dynamiques, formules avancées, visualisation de données", prix: 80000, dureeJours: 20, nombrePlaces: 20 },
  { nom: "Community Management et Réseaux sociaux", programme: "Stratégie digitale, création de contenu, gestion de pages pro", prix: 75000, dureeJours: 15, nombrePlaces: 20 },
  { nom: "Installation VSAT et Télécommunications", programme: "Pointage antenne, configuration terminal, maintenance liaison satellite", prix: 120000, dureeJours: 20, nombrePlaces: 10 },

  // Comptabilité / Gestion / Finance
  { nom: "Comptabilité générale (Norme SYSCOHADA)", programme: "Plan comptable, journal, grand livre, bilan, compte de résultat", prix: 100000, dureeJours: 30, nombrePlaces: 20 },
  { nom: "Comptabilité informatisée (Sage / Ciel)", programme: "Saisie comptable sur logiciel, états financiers automatisés", prix: 100000, dureeJours: 25, nombrePlaces: 15 },
  { nom: "Gestion financière et budgétaire", programme: "Élaboration de budget, trésorerie, tableaux de bord financiers", prix: 90000, dureeJours: 20, nombrePlaces: 15 },
  { nom: "Fiscalité des entreprises au Bénin", programme: "IS, TVA, patente, obligations déclaratives", prix: 80000, dureeJours: 15, nombrePlaces: 15 },
  { nom: "Gestion de la paie", programme: "Bulletins de salaire, cotisations sociales, déclarations CNSS", prix: 75000, dureeJours: 15, nombrePlaces: 15 },
  { nom: "Audit et Contrôle de gestion", programme: "Techniques d'audit interne, indicateurs de performance", prix: 120000, dureeJours: 20, nombrePlaces: 12 },
  { nom: "Microfinance et Gestion de crédit", programme: "Analyse de dossier de crédit, recouvrement, épargne", prix: 90000, dureeJours: 20, nombrePlaces: 15 },

  // Entrepreneuriat / Management
  { nom: "Entrepreneuriat et Création d'entreprise", programme: "Business plan, étude de marché, formalités de création", prix: 75000, dureeJours: 15, nombrePlaces: 20 },
  { nom: "Gestion des ressources humaines", programme: "Recrutement, contrats de travail, droit du travail béninois", prix: 90000, dureeJours: 20, nombrePlaces: 15 },
  { nom: "Management et Leadership", programme: "Techniques de management d'équipe, prise de décision, motivation", prix: 90000, dureeJours: 15, nombrePlaces: 20 },
  { nom: "Marketing et Techniques de vente", programme: "Stratégie commerciale, négociation, fidélisation client", prix: 80000, dureeJours: 15, nombrePlaces: 20 },
  { nom: "Gestion de projet (méthodes classiques et agiles)", programme: "Planification, suivi-évaluation, outils de gestion de projet", prix: 100000, dureeJours: 20, nombrePlaces: 15 },
  { nom: "Rédaction administrative et Secrétariat", programme: "Courrier professionnel, classement, gestion d'agenda", prix: 60000, dureeJours: 15, nombrePlaces: 20 },
  { nom: "Passation des marchés publics", programme: "Procédures de marchés publics, dossiers d'appel d'offres", prix: 100000, dureeJours: 15, nombrePlaces: 12 },

  // Langues
  { nom: "Anglais professionnel (débutant à intermédiaire)", programme: "Communication orale et écrite en contexte professionnel", prix: 60000, dureeJours: 30, nombrePlaces: 20 },
  { nom: "Anglais des affaires (niveau avancé)", programme: "Négociation, correspondance commerciale, présentations en anglais", prix: 75000, dureeJours: 30, nombrePlaces: 15 },
  { nom: "Français professionnel et Communication écrite", programme: "Rédaction de rapports, correspondance administrative", prix: 50000, dureeJours: 20, nombrePlaces: 20 },

  // Métiers techniques
  { nom: "Électricité bâtiment", programme: "Installation électrique domestique, normes de sécurité", prix: 100000, dureeJours: 30, nombrePlaces: 12 },
  { nom: "Froid et Climatisation", programme: "Installation et maintenance de systèmes frigorifiques", prix: 100000, dureeJours: 30, nombrePlaces: 12 },
  { nom: "Couture et Stylisme", programme: "Patronage, coupe, confection, techniques de finition", prix: 80000, dureeJours: 30, nombrePlaces: 15 },
  { nom: "Coiffure et Esthétique", programme: "Techniques de coiffure, soins capillaires, soins esthétiques de base", prix: 70000, dureeJours: 25, nombrePlaces: 15 },
  { nom: "Photographie et Vidéographie professionnelle", programme: "Prise de vue, montage, retouche photo/vidéo", prix: 90000, dureeJours: 20, nombrePlaces: 12 },
];

async function main() {
  console.log(`Insertion de ${formations.length} formations...`);
  for (const f of formations) {
    await prisma.formation.create({ data: f });
  }
  console.log("Terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });