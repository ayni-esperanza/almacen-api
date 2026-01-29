/*
  Warnings:

  - You are about to drop the column `estado` on the `purchase_orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "purchase_orders" DROP COLUMN "estado";

-- DropEnum
DROP TYPE "public"."PurchaseOrderStatus";
