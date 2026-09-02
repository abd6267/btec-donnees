/*
  Warnings:

  - You are about to drop the `EntrepriseCliente` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Candidat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contactLienParente` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `contactNom` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `contactTelephone` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `dossierComplet` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `entretienDate` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `entretienNotes` on the `Candidat` table. All the data in the column will be lost.
  - You are about to drop the column `entretienResultat` on the `Candidat` table. All the data in the column will be lost.
  - The primary key for the `Formateur` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `photoUrl` on the `Formateur` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdBy` on the `User` table. All the data in the column will be lost.
  - Made the column `commune` on table `Candidat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateNaissance` on table `Candidat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `departement` on table `Candidat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dernierDiplome` on table `Candidat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `entiteDiplome` on table `Candidat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lieuNaissance` on table `Candidat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nationalite` on table `Candidat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `posteEnvisage` on table `Candidat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quartier` on table `Candidat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sexe` on table `Candidat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `situationMatrimoniale` on table `Candidat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `telephone` on table `Candidat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ville` on table `Candidat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `adresseResidence` on table `Formateur` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dateNaissance` on table `Formateur` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Formateur` required. This step will fail if there are existing NULL values in that column.
  - Made the column `entiteDiplome` on table `Formateur` required. This step will fail if there are existing NULL values in that column.
  - Made the column `filiere` on table `Formateur` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lieuNaissance` on table `Formateur` required. This step will fail if there are existing NULL values in that column.
  - Made the column `niveauEtude` on table `Formateur` required. This step will fail if there are existing NULL values in that column.
  - Made the column `telephone` on table `Formateur` required. This step will fail if there are existing NULL values in that column.
  - Made the column `typeContrat` on table `Formateur` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "EntrepriseCliente_matricule_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EntrepriseCliente";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "scope" TEXT
);

-- CreateTable
CREATE TABLE "PendingChange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "proposedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PendingChange_proposedById_fkey" FOREIGN KEY ("proposedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PendingChange_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatriculeCounter" (
    "prefix" TEXT NOT NULL PRIMARY KEY,
    "lastNum" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Entreprise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matricule" TEXT NOT NULL,
    "raisonSociale" TEXT NOT NULL,
    "adresseSiege" TEXT NOT NULL,
    "secteurActivite" TEXT NOT NULL,
    "numeroRCCM" TEXT NOT NULL,
    "numeroIFU" TEXT NOT NULL,
    "typeContrat" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dureeContrat" TEXT NOT NULL,
    "directeurNom" TEXT,
    "directeurContact" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ContactCandidat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidatId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "lienParente" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    CONSTRAINT "ContactCandidat_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "Candidat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entretien" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidatId" TEXT NOT NULL,
    "dateEntretien" DATETIME NOT NULL,
    "notes" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'PREVU',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Entretien_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "Candidat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Candidat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matricule" TEXT NOT NULL,
    "dateDepot" DATETIME NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" DATETIME NOT NULL,
    "lieuNaissance" TEXT NOT NULL,
    "sexe" TEXT NOT NULL,
    "situationMatrimoniale" TEXT NOT NULL,
    "nationalite" TEXT NOT NULL,
    "departement" TEXT NOT NULL,
    "commune" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "quartier" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "dernierDiplome" TEXT NOT NULL,
    "entiteDiplome" TEXT NOT NULL,
    "posteEnvisage" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Candidat" ("commune", "createdAt", "dateDepot", "dateNaissance", "departement", "dernierDiplome", "entiteDiplome", "id", "lieuNaissance", "matricule", "nationalite", "nom", "posteEnvisage", "prenom", "quartier", "sexe", "situationMatrimoniale", "telephone", "updatedAt", "ville") SELECT "commune", "createdAt", "dateDepot", "dateNaissance", "departement", "dernierDiplome", "entiteDiplome", "id", "lieuNaissance", "matricule", "nationalite", "nom", "posteEnvisage", "prenom", "quartier", "sexe", "situationMatrimoniale", "telephone", "updatedAt", "ville" FROM "Candidat";
DROP TABLE "Candidat";
ALTER TABLE "new_Candidat" RENAME TO "Candidat";
CREATE UNIQUE INDEX "Candidat_matricule_key" ON "Candidat"("matricule");
CREATE INDEX "Candidat_matricule_idx" ON "Candidat"("matricule");
CREATE INDEX "Candidat_nom_prenom_idx" ON "Candidat"("nom", "prenom");
CREATE INDEX "Candidat_dateDepot_idx" ON "Candidat"("dateDepot");
CREATE TABLE "new_Formateur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matricule" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" DATETIME NOT NULL,
    "lieuNaissance" TEXT NOT NULL,
    "adresseResidence" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "niveauEtude" TEXT NOT NULL,
    "filiere" TEXT NOT NULL,
    "entiteDiplome" TEXT NOT NULL,
    "moyenDeplacement" BOOLEAN NOT NULL,
    "typeContrat" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Formateur" ("adresseResidence", "createdAt", "dateNaissance", "email", "entiteDiplome", "filiere", "id", "lieuNaissance", "matricule", "moyenDeplacement", "niveauEtude", "nom", "prenom", "telephone", "typeContrat", "updatedAt") SELECT "adresseResidence", "createdAt", "dateNaissance", "email", "entiteDiplome", "filiere", "id", "lieuNaissance", "matricule", "moyenDeplacement", "niveauEtude", "nom", "prenom", "telephone", "typeContrat", "updatedAt" FROM "Formateur";
DROP TABLE "Formateur";
ALTER TABLE "new_Formateur" RENAME TO "Formateur";
CREATE UNIQUE INDEX "Formateur_matricule_key" ON "Formateur"("matricule");
CREATE UNIQUE INDEX "Formateur_email_key" ON "Formateur"("email");
CREATE INDEX "Formateur_matricule_idx" ON "Formateur"("matricule");
CREATE INDEX "Formateur_nom_prenom_idx" ON "Formateur"("nom", "prenom");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT,
    "prenom" TEXT,
    "email" TEXT,
    "role" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("actif", "createdAt", "email", "id", "nom", "password", "prenom", "role", "username") SELECT "actif", "createdAt", "email", "id", "nom", "password", "prenom", "role", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_role_resource_action_key" ON "Permission"("role", "resource", "action");

-- CreateIndex
CREATE INDEX "PendingChange_resourceType_resourceId_idx" ON "PendingChange"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "PendingChange_status_idx" ON "PendingChange"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_matricule_key" ON "Entreprise"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_email_key" ON "Entreprise"("email");

-- CreateIndex
CREATE INDEX "Entreprise_matricule_idx" ON "Entreprise"("matricule");

-- CreateIndex
CREATE INDEX "Entreprise_raisonSociale_idx" ON "Entreprise"("raisonSociale");

-- CreateIndex
CREATE INDEX "ContactCandidat_candidatId_idx" ON "ContactCandidat"("candidatId");

-- CreateIndex
CREATE INDEX "Entretien_candidatId_idx" ON "Entretien"("candidatId");

-- CreateIndex
CREATE INDEX "Entretien_statut_idx" ON "Entretien"("statut");
