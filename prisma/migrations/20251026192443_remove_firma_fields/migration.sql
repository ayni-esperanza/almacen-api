/*
  Warnings:

  - You are about to drop the column `firma` on the `equipment_reports` table. All the data in the column will be lost.
  - You are about to drop the column `firmaRetorno` on the `equipment_reports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."equipment_reports" DROP COLUMN "firma",
DROP COLUMN "firmaRetorno",
ADD COLUMN     "responsableRetorno" TEXT;
