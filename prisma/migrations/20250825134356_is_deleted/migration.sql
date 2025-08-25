/*
  Warnings:

  - The `status` column on the `Admin` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `AssetLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AssetLog" DROP CONSTRAINT "AssetLog_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AssetLog" DROP CONSTRAINT "AssetLog_assetId_fkey";

-- AlterTable
ALTER TABLE "public"."Admin" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."AdminStatus" NOT NULL DEFAULT 'Active';

-- DropTable
DROP TABLE "public"."AssetLog";

-- DropEnum
DROP TYPE "public"."AssetEventType";
