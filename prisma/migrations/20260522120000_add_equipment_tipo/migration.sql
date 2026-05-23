-- CreateEnum
CREATE TYPE "EquipmentReportType" AS ENUM ('continua', 'fija');

-- AlterTable
ALTER TABLE "equipment_reports" ADD COLUMN "tipo" "EquipmentReportType" NOT NULL DEFAULT 'continua';
