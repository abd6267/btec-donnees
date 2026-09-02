-- CreateTable
CREATE TABLE "Formateur" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matricule" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" DATETIME,
    "lieuNaissance" TEXT,
    "adresseResidence" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "niveauEtude" TEXT,
    "filiere" TEXT,
    "entiteDiplome" TEXT,
    "moyenDeplacement" BOOLEAN NOT NULL DEFAULT false,
    "typeContrat" TEXT,
    "photoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EntrepriseCliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matricule" TEXT NOT NULL,
    "raisonSociale" TEXT NOT NULL,
    "adresseSiege" TEXT,
    "secteurActivite" TEXT,
    "numeroRCCM" TEXT,
    "numeroIFU" TEXT,
    "typeContrat" TEXT,
    "dureeContrat" TEXT,
    "email" TEXT,
    "directeurNom" TEXT,
    "directeurPrenom" TEXT,
    "directeurTelephone" TEXT,
    "directeurEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Candidat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "matricule" TEXT NOT NULL,
    "dateDepot" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" DATETIME,
    "lieuNaissance" TEXT,
    "sexe" TEXT,
    "situationMatrimoniale" TEXT,
    "nationalite" TEXT,
    "departement" TEXT,
    "commune" TEXT,
    "ville" TEXT,
    "quartier" TEXT,
    "telephone" TEXT,
    "dernierDiplome" TEXT,
    "posteEnvisage" TEXT,
    "entiteDiplome" TEXT,
    "contactNom" TEXT,
    "contactLienParente" TEXT,
    "contactTelephone" TEXT,
    "dossierComplet" BOOLEAN NOT NULL DEFAULT false,
    "entretienDate" DATETIME,
    "entretienResultat" TEXT,
    "entretienNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SECRETAIRE',
    "nom" TEXT,
    "prenom" TEXT,
    "email" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER
);
INSERT INTO "new_User" ("id", "password", "role", "username") SELECT "id", "password", "role", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Formateur_matricule_key" ON "Formateur"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "EntrepriseCliente_matricule_key" ON "EntrepriseCliente"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Candidat_matricule_key" ON "Candidat"("matricule");
