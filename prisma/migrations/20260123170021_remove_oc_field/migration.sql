/*
  Warnings:

  - You are about to drop the column `oc` on the `movement_entries` table. All the data in the column will be lost.
  - You are about to drop the column `oc` on the `movement_exits` table. All the data in the column will be lost.
  - You are about to drop the column `oc` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "movement_entries" DROP COLUMN "oc";

-- AlterTable
ALTER TABLE "movement_exits" DROP COLUMN "oc";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "oc";
