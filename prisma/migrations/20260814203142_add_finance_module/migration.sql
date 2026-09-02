-- AlterTable
ALTER TABLE "Paiement" ADD COLUMN "categorie" TEXT;
ALTER TABLE "Paiement" ADD COLUMN "modePaiement" TEXT DEFAULT 'CAISSE';

-- CreateIndex
CREATE INDEX "Paiement_categorie_idx" ON "Paiement"("categorie");

-- CreateIndex
CREATE INDEX "Paiement_modePaiement_idx" ON "Paiement"("modePaiement");
