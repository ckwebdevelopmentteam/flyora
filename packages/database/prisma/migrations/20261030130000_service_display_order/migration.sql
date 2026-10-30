BEGIN;
ALTER TABLE "Service" ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;
WITH ranked AS (
  SELECT "id", (ROW_NUMBER() OVER (ORDER BY "name" ASC, "id" ASC) - 1)::INTEGER AS position
  FROM "Service"
)
UPDATE "Service" AS service SET "displayOrder" = ranked.position
FROM ranked WHERE service."id" = ranked."id";
ALTER TABLE "Service" ADD CONSTRAINT "Service_displayOrder_nonnegative" CHECK ("displayOrder" >= 0);
CREATE INDEX "Service_displayOrder_id_idx" ON "Service"("displayOrder", "id");
COMMIT;
