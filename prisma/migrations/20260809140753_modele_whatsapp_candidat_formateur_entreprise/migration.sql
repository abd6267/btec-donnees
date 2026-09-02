/*
  Warnings:

  - You are about to drop the `ContactCandidat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `commune` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `dateDepot` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `departement` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `dernierDiplome` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `entiteDiplome` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `lieuNaissance` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `matricule` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `nationalite` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `posteEnvisage` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `quartier` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `situationMatrimoniale` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `ville` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `adresseSiege` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `directeurContact` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `directeurNom` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `dureeContrat` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `matricule` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `numeroIFU` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `numeroRCCM` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `raisonSociale` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `secteurActivite` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `typeContrat` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `adresseResidence` on the `Formateur` table. All the data in the column will be lost.
  - You are about to drop the column `dateNaissance` on the `Formateur` table. All the data in the column will be lost.
  - You are about to drop the column `entiteDiplome` on the `Formateur` table. All the data in the column will be lost.
  - You are about to drop the column `filiere` on the `Formateur` table. All the data in the column will be lost.
  - You are about to drop the column `lieuNaissance` on the `Formateur` table. All the data in the column will be lost.
  - You are about to drop the column `matricule` on the `Formateur` table. All the data in the column will be lost.
  - You are about to drop the column `moyenDeplacement` on the `Formateur` table. All the data in the column will be lost.
  - You are about to drop the column `niveauEtude` on the `Formateur` table. All the data in the column will be lost.
  - You are about to drop the column `nom` on the `Formateur` table. All the data in the column will be lost.
  - You are about to drop the column `prenom` on the `Formateur` table. All the data in the column will be lost.
  - You are about to drop the column `typeContrat` on the `Formateur` table. All the data in the column will be lost.
  - Added the required column `adresse` to the `Candidat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diplome` to the `Candidat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `niveauEtude` to the `Candidat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroDossier` to the `Candidat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posteRecherche` to the `Candidat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activite` to the `Entreprise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adresse` to the `Entreprise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `datePartenariat` to the `Entreprise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `directeur` to the `Entreprise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom` to the `Entreprise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombreEmployes` to the `Entreprise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telephone` to the `Entreprise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domaine` to the `Formateur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `honoraires` to the `Formateur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modulesEnseignes` to the `Formateur` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ContactCandidat_candidatId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ContactCandidat";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Candidat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroDossier" TEXT NOT NULL,
    "photoPath" TEXT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "sexe" TEXT NOT NULL,
    "dateNaissance" DATETIME NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "adresse" TEXT NOT NULL,
    "niveauEtude" TEXT NOT NULL,
    "diplome" TEXT NOT NULL,
    "posteRecherche" TEXT NOT NULL,
    "cvPath" TEXT,
    "lettrePath" TEXT,
    "piecesPath" TEXT,
    "dateInscription" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" TEXT NOT NULL DEFAULT 'NOUVEAU',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Candidat" ("createdAt", "dateNaissance", "id", "nom", "prenom", "sexe", "telephone", "updatedAt") SELECT "createdAt", "dateNaissance", "id", "nom", "prenom", "sexe", "telephone", "updatedAt" FROM "Candidat";
DROP TABLE "Candidat";
ALTER TABLE "new_Candidat" RENAME TO "Candidat";
CREATE UNIQUE INDEX "Candidat_numeroDossier_key" ON "Candidat"("numeroDossier");
CREATE INDEX "Candidat_numeroDossier_idx" ON "Candidat"("numeroDossier");
CREATE INDEX "Candidat_nom_prenom_idx" ON "Candidat"("nom", "prenom");
CREATE INDEX "Candidat_statut_idx" ON "Candidat"("statut");
CREATE TABLE "new_Entreprise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "logoPath" TEXT,
    "nom" TEXT NOT NULL,
    "directeur" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "activite" TEXT NOT NULL,
    "nombreEmployes" INTEGER NOT NULL,
    "datePartenariat" DATETIME NOT NULL,
    "contratPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Entreprise" ("createdAt", "email", "id", "updatedAt") SELECT "createdAt", "email", "id", "updatedAt" FROM "Entreprise";
DROP TABLE "Entreprise";
ALTER TABLE "new_Entreprise" RENAME TO "Entreprise";
CREATE UNIQUE INDEX "Entreprise_email_key" ON "Entreprise"("email");
CREATE INDEX "Entreprise_nom_idx" ON "Entreprise"("nom");
CREATE TABLE "new_Formateur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "photoPath" TEXT,
    "domaine" TEXT NOT NULL,
    "modulesEnseignes" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contratPath" TEXT,
    "honoraires" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Formateur" ("createdAt", "email", "id", "telephone", "updatedAt") SELECT "createdAt", "email", "id", "telephone", "updatedAt" FROM "Formateur";
DROP TABLE "Formateur";
ALTER TABLE "new_Formateur" RENAME TO "Formateur";
CREATE UNIQUE INDEX "Formateur_email_key" ON "Formateur"("email");
CREATE INDEX "Formateur_domaine_idx" ON "Formateur"("domaine");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
