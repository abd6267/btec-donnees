-- CreateTable
CREATE TABLE "Paiement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "libelle" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "candidatId" TEXT,
    "entrepriseId" TEXT,
    "dateEcheance" DATETIME,
    "datePaiement" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Paiement_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "Candidat" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Paiement_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Paiement_type_idx" ON "Paiement"("type");

-- CreateIndex
CREATE INDEX "Paiement_statut_idx" ON "Paiement"("statut");

-- CreateIndex
CREATE INDEX "Paiement_candidatId_idx" ON "Paiement"("candidatId");

-- CreateIndex
CREATE INDEX "Paiement_entrepriseId_idx" ON "Paiement"("entrepriseId");
