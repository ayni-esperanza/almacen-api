/*
  Warnings:

  - You are about to drop the `empresas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `proyectos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "empresas";

-- DropTable
DROP TABLE "proyectos";

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_nombre_key" ON "companies"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "projects_nombre_key" ON "projects"("nombre");
