/*
  Warnings:

  - You are about to drop the column `observaciones` on the `purchase_orders` table. All the data in the column will be lost.
  - You are about to drop the column `proveedor` on the `purchase_orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "purchase_orders" DROP COLUMN "observaciones",
DROP COLUMN "proveedor";
