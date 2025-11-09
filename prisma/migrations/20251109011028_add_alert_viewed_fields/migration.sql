-- AlterTable
ALTER TABLE "products" ADD COLUMN     "alertaVista" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "alertaVistaFecha" TIMESTAMP(3);
