-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "candidatId" TEXT,
    "entrepriseId" TEXT,
    "inscriptionId" TEXT,
    "paiementId" TEXT,
    "genereLe" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "genereePar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "Candidat" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_inscriptionId_fkey" FOREIGN KEY ("inscriptionId") REFERENCES "Inscription" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_paiementId_fkey" FOREIGN KEY ("paiementId") REFERENCES "Paiement" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "Document"("type");

-- CreateIndex
CREATE INDEX "Document_candidatId_idx" ON "Document"("candidatId");

-- CreateIndex
CREATE INDEX "Document_entrepriseId_idx" ON "Document"("entrepriseId");
