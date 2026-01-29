-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('BORRADOR', 'ENVIADA', 'RECIBIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "proveedor" TEXT,
    "estado" "PurchaseOrderStatus" NOT NULL DEFAULT 'BORRADOR',
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "costo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_products" (
    "id" SERIAL NOT NULL,
    "purchaseOrderId" INTEGER NOT NULL,
    "fecha" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "proyecto" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "costoUnitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_order_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_codigo_key" ON "purchase_orders"("codigo");

-- AddForeignKey
ALTER TABLE "purchase_order_products" ADD CONSTRAINT "purchase_order_products_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
