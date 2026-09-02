-- AlterTable
ALTER TABLE "Entretien" ADD COLUMN "compteRendu" TEXT;
ALTER TABLE "Entretien" ADD COLUMN "faiblesses" TEXT;
ALTER TABLE "Entretien" ADD COLUMN "forces" TEXT;
ALTER TABLE "Entretien" ADD COLUMN "note" REAL;
ALTER TABLE "Entretien" ADD COLUMN "recommandations" TEXT;
ALTER TABLE "Entretien" ADD COLUMN "responsableRH" TEXT;
ALTER TABLE "Entretien" ADD COLUMN "resultat" TEXT;

-- CreateIndex
CREATE INDEX "Entretien_resultat_idx" ON "Entretien"("resultat");
