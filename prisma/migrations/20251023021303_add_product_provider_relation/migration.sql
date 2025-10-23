/*
  Warnings:

  - You are about to drop the column `proveedor` on the `products` table. All the data in the column will be lost.
  - Added the required column `providerId` to the `products` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add providerId column as nullable first
ALTER TABLE "public"."products" ADD COLUMN "providerId" INTEGER;

-- Step 2: Create default providers from existing product data
INSERT INTO "public"."providers" (name, email, address, phones, "createdAt", "updatedAt")
SELECT DISTINCT 
  proveedor as name,
  LOWER(REPLACE(proveedor, ' ', '_')) || '@provider.com' as email,
  'Dirección no especificada' as address,
  ARRAY['Sin teléfono']::TEXT[] as phones,
  NOW() as "createdAt",
  NOW() as "updatedAt"
FROM "public"."products"
WHERE proveedor IS NOT NULL
ON CONFLICT (email) DO NOTHING;

-- Step 3: Update products with provider IDs
UPDATE "public"."products" p
SET "providerId" = pr.id
FROM "public"."providers" pr
WHERE LOWER(REPLACE(p.proveedor, ' ', '_')) || '@provider.com' = pr.email;

-- Step 4: Make providerId NOT NULL
ALTER TABLE "public"."products" ALTER COLUMN "providerId" SET NOT NULL;

-- Step 5: Drop old proveedor column
ALTER TABLE "public"."products" DROP COLUMN "proveedor";

-- Step 6: Add foreign key constraint
ALTER TABLE "public"."products" ADD CONSTRAINT "products_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
