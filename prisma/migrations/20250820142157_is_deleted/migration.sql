-- AlterTable
ALTER TABLE "public"."Department" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Location" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
