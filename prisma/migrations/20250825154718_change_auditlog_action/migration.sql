-- 1) Add a temporary JSON column
ALTER TABLE "public"."AuditLog" ADD COLUMN "action_json" JSONB;

-- 2) Copy existing string/enum data into JSON
UPDATE "public"."AuditLog"
SET "action_json" = to_jsonb("action");

-- 3) Drop the old column
ALTER TABLE "public"."AuditLog" DROP COLUMN "action";

-- 4) Rename the JSON column
ALTER TABLE "public"."AuditLog" RENAME COLUMN "action_json" TO "action";

-- 5) (Optional but recommended) Make it NOT NULL
ALTER TABLE "public"."AuditLog" ALTER COLUMN "action" SET NOT NULL;
