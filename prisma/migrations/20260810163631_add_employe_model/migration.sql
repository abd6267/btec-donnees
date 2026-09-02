-- CreateTable
CREATE TABLE "Employe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidatId" TEXT NOT NULL,
    "entrepriseId" TEXT,
    "poste" TEXT,
    "statutEmploi" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "dateEmbauche" DATETIME,
    "dateDepart" DATETIME,
    "motifDepart" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Employe_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "Candidat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Employe_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Employe_candidatId_key" ON "Employe"("candidatId");

-- CreateIndex
CREATE INDEX "Employe_statutEmploi_idx" ON "Employe"("statutEmploi");

-- CreateIndex
CREATE INDEX "Employe_entrepriseId_idx" ON "Employe"("entrepriseId");
