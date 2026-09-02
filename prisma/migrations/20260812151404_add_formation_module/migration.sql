-- CreateTable
CREATE TABLE "Formation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "programme" TEXT NOT NULL,
    "prix" REAL NOT NULL,
    "dureeJours" INTEGER NOT NULL,
    "nombrePlaces" INTEGER NOT NULL,
    "formateurId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Formation_formateurId_fkey" FOREIGN KEY ("formateurId") REFERENCES "Formateur" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidatId" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "formateurId" TEXT,
    "dateDebut" DATETIME,
    "dateFin" DATETIME,
    "statut" TEXT NOT NULL DEFAULT 'EN_FORMATION',
    "resultat" TEXT,
    "mention" TEXT,
    "attestationPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inscription_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "Candidat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Inscription_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inscription_formateurId_fkey" FOREIGN KEY ("formateurId") REFERENCES "Formateur" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Presence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inscriptionId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Presence_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Paiement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "libelle" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "candidatId" TEXT,
    "entrepriseId" TEXT,
    "inscriptionId" TEXT,
    "dateEcheance" DATETIME,
    "datePaiement" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Paiement_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "Candidat" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Paiement_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Paiement_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Paiement" ("candidatId", "createdAt", "dateEcheance", "datePaiement", "entrepriseId", "id", "libelle", "montant", "statut", "type", "updatedAt") SELECT "candidatId", "createdAt", "dateEcheance", "datePaiement", "entrepriseId", "id", "libelle", "montant", "statut", "type", "updatedAt" FROM "Paiement";
DROP TABLE "Paiement";
ALTER TABLE "new_Paiement" RENAME TO "Paiement";
CREATE INDEX "Paiement_type_idx" ON "Paiement"("type");
CREATE INDEX "Paiement_statut_idx" ON "Paiement"("statut");
CREATE INDEX "Paiement_candidatId_idx" ON "Paiement"("candidatId");
CREATE INDEX "Paiement_entrepriseId_idx" ON "Paiement"("entrepriseId");
CREATE INDEX "Paiement_inscriptionId_idx" ON "Paiement"("inscriptionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Formation_nom_idx" ON "Formation"("nom");

-- CreateIndex
CREATE INDEX "Inscription_candidatId_idx" ON "Inscription"("candidatId");

-- CreateIndex
CREATE INDEX "Inscription_formationId_idx" ON "Inscription"("formationId");

-- CreateIndex
CREATE INDEX "Inscription_statut_idx" ON "Inscription"("statut");

-- CreateIndex
CREATE INDEX "Presence_inscriptionId_idx" ON "Presence"("inscriptionId");

-- CreateIndex
CREATE INDEX "Presence_date_idx" ON "Presence"("date");
