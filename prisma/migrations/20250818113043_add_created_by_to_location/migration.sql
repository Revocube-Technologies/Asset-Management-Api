/*
  Warnings:

  - Added the required column `createdBy` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Location" ADD COLUMN     "createdBy" TEXT NOT NULL;
