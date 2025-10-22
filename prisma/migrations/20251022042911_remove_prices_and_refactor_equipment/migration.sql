/*
  Warnings:

  - You are about to drop the column `areaProyecto` on the `equipment_reports` table. All the data in the column will be lost.
  - You are about to drop the column `firma` on the `equipment_reports` table. All the data in the column will be lost.
  - You are about to drop the column `firmaRetorno` on the `equipment_reports` table. All the data in the column will be lost.
  - You are about to drop the column `horaRetorno` on the `equipment_reports` table. All the data in the column will be lost.
  - You are about to drop the column `horaSalida` on the `equipment_reports` table. All the data in the column will be lost.
  - You are about to drop the column `responsable` on the `equipment_reports` table. All the data in the column will be lost.
  - The `fechaRetorno` column on the `equipment_reports` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `precioUnitario` on the `movement_entries` table. All the data in the column will be lost.
  - You are about to drop the column `precioUnitario` on the `movement_exits` table. All the data in the column will be lost.
  - Added the required column `areaId` to the `equipment_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `equipment_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsableId` to the `equipment_reports` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `fechaSalida` on the `equipment_reports` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."equipment_reports" DROP COLUMN "areaProyecto",
DROP COLUMN "firma",
DROP COLUMN "firmaRetorno",
DROP COLUMN "horaRetorno",
DROP COLUMN "horaSalida",
DROP COLUMN "responsable",
ADD COLUMN     "areaId" INTEGER NOT NULL,
ADD COLUMN     "projectId" INTEGER NOT NULL,
ADD COLUMN     "responsableId" INTEGER NOT NULL,
DROP COLUMN "fechaSalida",
ADD COLUMN     "fechaSalida" TIMESTAMP(3) NOT NULL,
DROP COLUMN "fechaRetorno",
ADD COLUMN     "fechaRetorno" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."movement_entries" DROP COLUMN "precioUnitario";

-- AlterTable
ALTER TABLE "public"."movement_exits" DROP COLUMN "precioUnitario";

-- AddForeignKey
ALTER TABLE "public"."equipment_reports" ADD CONSTRAINT "equipment_reports_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "public"."responsibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment_reports" ADD CONSTRAINT "equipment_reports_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment_reports" ADD CONSTRAINT "equipment_reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
