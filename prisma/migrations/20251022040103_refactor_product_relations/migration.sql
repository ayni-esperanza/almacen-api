-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('JEFE', 'ASISTENTE', 'GERENTE', 'AYUDANTE');

-- CreateEnum
CREATE TYPE "public"."EstadoEquipo" AS ENUM ('Bueno', 'Regular', 'Malo', 'En_Reparacion', 'Danado');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'AYUDANTE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAuthenticated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "costoUnitario" DOUBLE PRECISION NOT NULL,
    "providerId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "entradas" INTEGER NOT NULL DEFAULT 0,
    "salidas" INTEGER NOT NULL DEFAULT 0,
    "stockActual" INTEGER NOT NULL DEFAULT 0,
    "costoTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."providers" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."locations" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."units" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."movement_entries" (
    "id" SERIAL NOT NULL,
    "fecha" TEXT NOT NULL,
    "codigoProducto" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "responsable" TEXT,
    "area" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movement_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."movement_exits" (
    "id" SERIAL NOT NULL,
    "fecha" TEXT NOT NULL,
    "codigoProducto" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "responsable" TEXT,
    "area" TEXT,
    "proyecto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movement_exits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."equipment_reports" (
    "id" SERIAL NOT NULL,
    "equipo" TEXT NOT NULL,
    "serieCodigo" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "estadoEquipo" "public"."EstadoEquipo" NOT NULL,
    "responsable" TEXT NOT NULL,
    "fechaSalida" TEXT NOT NULL,
    "horaSalida" TEXT NOT NULL,
    "areaProyecto" TEXT NOT NULL,
    "firma" TEXT NOT NULL,
    "fechaRetorno" TEXT,
    "horaRetorno" TEXT,
    "estadoRetorno" "public"."EstadoEquipo",
    "firmaRetorno" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."areas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "products_codigo_key" ON "public"."products"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "providers_nombre_key" ON "public"."providers"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "locations_nombre_key" ON "public"."locations"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "categories_nombre_key" ON "public"."categories"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "units_nombre_key" ON "public"."units"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "areas_nombre_key" ON "public"."areas"("nombre");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movement_entries" ADD CONSTRAINT "movement_entries_codigoProducto_fkey" FOREIGN KEY ("codigoProducto") REFERENCES "public"."products"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movement_exits" ADD CONSTRAINT "movement_exits_codigoProducto_fkey" FOREIGN KEY ("codigoProducto") REFERENCES "public"."products"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
