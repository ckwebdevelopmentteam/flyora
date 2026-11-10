BEGIN;
CREATE TYPE "DestinationType" AS ENUM ('DOMESTIC', 'INTERNATIONAL');
ALTER TABLE "Package" ADD COLUMN "destinationType" "DestinationType";
-- Backfill only explicit country names used by existing packages. Other legacy
-- destinations stay unclassified until an editor makes an explicit selection.
UPDATE "Package" SET "destinationType" = 'DOMESTIC'
WHERE "destination" ~* '(^|[,[:space:]])india([,[:space:]]|$)';
UPDATE "Package" SET "destinationType" = 'INTERNATIONAL'
WHERE "destination" ~* '(^|[,[:space:]])(uae|united arab emirates|indonesia)([,[:space:]]|$)';
CREATE INDEX "Package_destinationType_isPublished_createdAt_idx"
ON "Package"("destinationType", "isPublished", "createdAt");
COMMIT;
