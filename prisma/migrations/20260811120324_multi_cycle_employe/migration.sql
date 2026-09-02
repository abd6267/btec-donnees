-- DropIndex
DROP INDEX "Employe_candidatId_key";

-- CreateIndex
CREATE INDEX "Employe_candidatId_idx" ON "Employe"("candidatId");
