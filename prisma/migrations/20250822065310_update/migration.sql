/*
  Warnings:

  - Made the column `lastName` on table `Admin` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Admin" ALTER COLUMN "lastName" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Asset" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);
