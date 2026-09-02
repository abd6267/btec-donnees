"use strict";
// prisma/seed-formations.ts
// Seed du catalogue de formations professionnelles (SQLite via better-sqlite3).
//
// À exécuter après `npx prisma migrate dev` :
//   npx tsc prisma/seed-formations.ts --outDir prisma/dist --module commonjs --target es2020 --esModuleInterop
//   node prisma/dist/seed-formations.js
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_better_sqlite3_1 = require("@prisma/adapter-better-sqlite3");
const adapter = new adapter_better_sqlite3_1.PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
const prisma = new client_1.PrismaClient({ adapter });
const formations = [
    // ---------- Informatique / Numérique ----------
    { nom: "Développement Web (Front-end)", programme: "HTML, CSS, JavaScript, React, mise en pratique sur projets réels", prix: 150000, dureeJours: 30, nombrePlaces: 20 },
    { nom: "Développement Web (Back-end)", programme: "Node.js, bases de données, API REST, sécurité applicative", prix: 175000, dureeJours: 30, nombrePlaces: 20 },
    { nom: "Développement Mobile", programme: "Conception et développement d'applications Android/iOS", prix: 175000, dureeJours: 30, nombrePlaces: 15 },
    { nom: "Bureautique (Word, Excel, PowerPoint)", programme: "Maîtrise des outils bureautiques essentiels en entreprise", prix: 50000, dureeJours: 10, nombrePlaces: 25 },
    { nom: "Maintenance Informatique", programme: "Dépannage matériel et logiciel, réseaux, assistance utilisateurs", prix: 100000, dureeJours: 20, nombrePlaces: 20 },
    { nom: "Infographie et Design Graphique", programme: "Photoshop, Illustrator, Canva, identité visuelle", prix: 90000, dureeJours: 15, nombrePlaces: 20 },
    { nom: "Cybersécurité Fondamentale", programme: "Bonnes pratiques de sécurité informatique en entreprise", prix: 150000, dureeJours: 15, nombrePlaces: 15 },
    { nom: "Data Analyse et Excel Avancé", programme: "Analyse de données, tableaux croisés dynamiques, Power BI", prix: 120000, dureeJours: 15, nombrePlaces: 20 },
    // ---------- Gestion / Comptabilité / Finance ----------
    { nom: "Comptabilité Générale", programme: "Principes comptables, écritures, bilan et compte de résultat", prix: 100000, dureeJours: 20, nombrePlaces: 25 },
    { nom: "Gestion Financière d'Entreprise", programme: "Analyse financière, budgétisation, trésorerie", prix: 120000, dureeJours: 20, nombrePlaces: 20 },
    { nom: "Gestion des Ressources Humaines", programme: "Recrutement, paie, droit du travail, gestion des talents", prix: 130000, dureeJours: 20, nombrePlaces: 20 },
    { nom: "Marketing Digital", programme: "Réseaux sociaux, référencement, publicité en ligne", prix: 110000, dureeJours: 15, nombrePlaces: 25 },
    { nom: "Techniques de Vente et Négociation Commerciale", programme: "Prospection, argumentaire, closing, fidélisation client", prix: 90000, dureeJours: 12, nombrePlaces: 25 },
    { nom: "Gestion de Projet", programme: "Méthodologies agiles, planification, pilotage d'équipe", prix: 130000, dureeJours: 15, nombrePlaces: 20 },
    { nom: "Entrepreneuriat et Création d'Entreprise", programme: "Business plan, financement, formalités de création", prix: 100000, dureeJours: 15, nombrePlaces: 25 },
    { nom: "Secrétariat de Direction", programme: "Organisation, correspondance professionnelle, gestion d'agenda", prix: 80000, dureeJours: 15, nombrePlaces: 20 },
    { nom: "Fiscalité d'Entreprise", programme: "Régimes fiscaux, déclarations, obligations légales", prix: 110000, dureeJours: 12, nombrePlaces: 20 },
    // ---------- BTP / Génie / Industrie ----------
    { nom: "Génie Civil et Lecture de Plans", programme: "Lecture de plans, métrés, suivi de chantier", prix: 140000, dureeJours: 25, nombrePlaces: 15 },
    { nom: "Électricité Bâtiment", programme: "Installation électrique domestique et industrielle, normes de sécurité", prix: 120000, dureeJours: 20, nombrePlaces: 15 },
    { nom: "Plomberie", programme: "Installation et réparation de systèmes sanitaires", prix: 100000, dureeJours: 15, nombrePlaces: 15 },
    { nom: "Soudure", programme: "Techniques de soudure à l'arc et au chalumeau, sécurité", prix: 110000, dureeJours: 20, nombrePlaces: 15 },
    { nom: "Menuiserie Bois et Aluminium", programme: "Fabrication et pose de mobilier et menuiserie", prix: 110000, dureeJours: 20, nombrePlaces: 15 },
    { nom: "Mécanique Automobile", programme: "Diagnostic, entretien et réparation de véhicules", prix: 130000, dureeJours: 25, nombrePlaces: 15 },
    { nom: "Froid et Climatisation", programme: "Installation et maintenance de systèmes frigorifiques", prix: 120000, dureeJours: 20, nombrePlaces: 15 },
    { nom: "Électrotechnique Industrielle", programme: "Automatismes, câblage, maintenance industrielle", prix: 150000, dureeJours: 25, nombrePlaces: 15 },
    // ---------- Santé / Social ----------
    { nom: "Auxiliaire de Santé Communautaire", programme: "Premiers secours, hygiène, accompagnement des patients", prix: 90000, dureeJours: 15, nombrePlaces: 20 },
    { nom: "Secourisme et Premiers Secours", programme: "Gestes qui sauvent, urgences courantes, prévention", prix: 40000, dureeJours: 5, nombrePlaces: 30 },
    { nom: "Nutrition et Diététique Appliquée", programme: "Équilibre alimentaire, conseils nutritionnels de base", prix: 80000, dureeJours: 12, nombrePlaces: 20 },
    // ---------- Hôtellerie / Restauration / Services ----------
    { nom: "Hôtellerie et Accueil Touristique", programme: "Techniques d'accueil, gestion de la relation client", prix: 90000, dureeJours: 15, nombrePlaces: 20 },
    { nom: "Restauration et Art Culinaire", programme: "Techniques culinaires, hygiène alimentaire, dressage", prix: 100000, dureeJours: 20, nombrePlaces: 15 },
    { nom: "Pâtisserie", programme: "Techniques de base et avancées de pâtisserie", prix: 90000, dureeJours: 15, nombrePlaces: 15 },
    { nom: "Coiffure et Esthétique", programme: "Techniques de coiffure, soins esthétiques, hygiène", prix: 100000, dureeJours: 20, nombrePlaces: 15 },
    { nom: "Couture et Stylisme", programme: "Patronage, confection, techniques de couture professionnelle", prix: 90000, dureeJours: 20, nombrePlaces: 15 },
    // ---------- Langues / Communication ----------
    { nom: "Anglais Professionnel", programme: "Communication orale et écrite en contexte professionnel", prix: 70000, dureeJours: 20, nombrePlaces: 25 },
    { nom: "Communication et Prise de Parole en Public", programme: "Techniques d'expression, gestion du stress, argumentation", prix: 70000, dureeJours: 10, nombrePlaces: 25 },
    { nom: "Rédaction Administrative et Professionnelle", programme: "Courriers, comptes rendus, rapports professionnels", prix: 60000, dureeJours: 10, nombrePlaces: 25 },
    // ---------- Agriculture / Environnement ----------
    { nom: "Agriculture Moderne et Agrobusiness", programme: "Techniques agricoles, transformation, commercialisation", prix: 100000, dureeJours: 20, nombrePlaces: 20 },
    { nom: "Élevage et Aviculture", programme: "Techniques d'élevage, alimentation, santé animale", prix: 90000, dureeJours: 15, nombrePlaces: 20 },
];
async function main() {
    console.log(`Seed de ${formations.length} formations...`);
    for (const f of formations) {
        const existante = await prisma.formation.findFirst({
            where: { nom: f.nom },
        });
        if (existante) {
            await prisma.formation.update({
                where: { id: existante.id },
                data: f,
            });
        }
        else {
            await prisma.formation.create({ data: f });
        }
    }
    console.log("Seed des formations terminé.");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
