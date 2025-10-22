/*
  Warnings:

  - You are about to drop the column `area` on the `movement_entries` table. All the data in the column will be lost.
  - You are about to drop the column `codigoProducto` on the `movement_entries` table. All the data in the column will be lost.
  - You are about to drop the column `responsable` on the `movement_entries` table. All the data in the column will be lost.
  - You are about to drop the column `area` on the `movement_exits` table. All the data in the column will be lost.
  - You are about to drop the column `codigoProducto` on the `movement_exits` table. All the data in the column will be lost.
  - You are about to drop the column `proyecto` on the `movement_exits` table. All the data in the column will be lost.
  - You are about to drop the column `responsable` on the `movement_exits` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `areas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `areaId` to the `movement_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `movement_entries` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `fecha` on the `movement_entries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `areaId` to the `movement_exits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `movement_exits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `movement_exits` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsableId` to the `movement_exits` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `fecha` on the `movement_exits` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."movement_entries" DROP CONSTRAINT "movement_entries_codigoProducto_fkey";

-- DropForeignKey
ALTER TABLE "public"."movement_exits" DROP CONSTRAINT "movement_exits_codigoProducto_fkey";

-- AlterTable
ALTER TABLE "public"."areas" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."movement_entries" DROP COLUMN "area",
DROP COLUMN "codigoProducto",
DROP COLUMN "responsable",
ADD COLUMN     "areaId" INTEGER NOT NULL,
ADD COLUMN     "productId" INTEGER NOT NULL,
DROP COLUMN "fecha",
ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."movement_exits" DROP COLUMN "area",
DROP COLUMN "codigoProducto",
DROP COLUMN "proyecto",
DROP COLUMN "responsable",
ADD COLUMN     "areaId" INTEGER NOT NULL,
ADD COLUMN     "productId" INTEGER NOT NULL,
ADD COLUMN     "projectId" INTEGER NOT NULL,
ADD COLUMN     "responsableId" INTEGER NOT NULL,
DROP COLUMN "fecha",
ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."movement_entries" ADD CONSTRAINT "movement_entries_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movement_entries" ADD CONSTRAINT "movement_entries_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movement_exits" ADD CONSTRAINT "movement_exits_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movement_exits" ADD CONSTRAINT "movement_exits_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "public"."responsibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movement_exits" ADD CONSTRAINT "movement_exits_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movement_exits" ADD CONSTRAINT "movement_exits_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
