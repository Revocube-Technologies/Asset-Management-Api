/*
  Warnings:

  - You are about to alter the column `repairCost` on the `RepairLog` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "public"."RepairLog" ALTER COLUMN "repairCost" SET DATA TYPE DECIMAL(65,30);
