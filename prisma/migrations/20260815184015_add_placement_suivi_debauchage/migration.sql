-- AlterTable
ALTER TABLE "Employe" ADD COLUMN "contratPath" TEXT;
ALTER TABLE "Employe" ADD COLUMN "dureeContrat" TEXT;
ALTER TABLE "Employe" ADD COLUMN "motifDepartType" TEXT;
ALTER TABLE "Employe" ADD COLUMN "responsablePlacement" TEXT;
ALTER TABLE "Employe" ADD COLUMN "salaire" REAL;
ALTER TABLE "Employe" ADD COLUMN "typeContrat" TEXT;

-- CreateTable
CREATE TABLE "SuiviPeriodeEssai" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeId" TEXT NOT NULL,
    "dateSuivi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mois" INTEGER NOT NULL,
    "presence" TEXT,
    "ponctualite" TEXT,
    "discipline" TEXT,
    "evaluation" TEXT,
    "satisfaction" TEXT,
    "commentaire" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SuiviPeriodeEssai_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SuiviPeriodeEssai_employeId_idx" ON "SuiviPeriodeEssai"("employeId");

-- CreateIndex
CREATE INDEX "SuiviPeriodeEssai_mois_idx" ON "SuiviPeriodeEssai"("mois");
