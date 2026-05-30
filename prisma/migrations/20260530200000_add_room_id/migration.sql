-- AlterTable
ALTER TABLE "Project" ADD COLUMN "roomId" TEXT;

-- Backfill existing rows with a unique placeholder before NOT NULL constraint
UPDATE "Project" SET "roomId" = 'room-' || "id" WHERE "roomId" IS NULL;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "roomId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Project_roomId_key" ON "Project"("roomId");

-- CreateIndex
CREATE INDEX "Project_roomId_idx" ON "Project"("roomId");
