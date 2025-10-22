/*
  Warnings:

  - You are about to drop the column `descripcion` on the `products` table. All the data in the column will be lost.
  - Added the required column `nombre` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add new columns (nombre as nullable first)
ALTER TABLE "public"."products" 
ADD COLUMN "marca" TEXT,
ADD COLUMN "nombre" TEXT,
ADD COLUMN "stockMinimo" INTEGER NOT NULL DEFAULT 0;

-- Step 2: Copy data from descripcion to nombre
UPDATE "public"."products" SET "nombre" = "descripcion";

-- Step 3: Make nombre NOT NULL
ALTER TABLE "public"."products" ALTER COLUMN "nombre" SET NOT NULL;

-- Step 4: Drop descripcion column
ALTER TABLE "public"."products" DROP COLUMN "descripcion";
