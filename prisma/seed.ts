import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      isAuthenticated: false,
    },
  });

  // Crear áreas predefinidas
  const areas = [
    'ALMACEN', 'DANPER', 'electricidad', 'EXTRUSORA', 'fibra',
    'INYECTORA', 'JARDINES', 'LADRILLERA', 'líneas de vida',
    'MECANICA', 'metalmecánica', 'OTRO', 'BROCHA'
  ];

  for (const areaName of areas) {
    await prisma.area.upsert({
      where: { nombre: areaName },
      update: {},
      create: { nombre: areaName },
    });
  }

  // Crear productos de ejemplo
  const productos = [
    {
      codigo: 'AF2025',
      descripcion: 'AFLOJA TODO',
      costoUnitario: 12.00,
      ubicacion: 'ALMACEN',
      entradas: 3,
      salidas: 2,
      stockActual: 1,
      unidadMedida: 'und',
      proveedor: 'FERRETERIA CENTRAL',
      costoTotal: 12.00
    },
    {
      codigo: 'TU2024',
      descripcion: 'TUERCA HEXAGONAL 1/2"',
      costoUnitario: 0.50,
      ubicacion: 'ALMACEN',
      entradas: 100,
      salidas: 20,
      stockActual: 80,
      unidadMedida: 'und',
      proveedor: 'FERRETERIA CENTRAL',
      costoTotal: 40.00
    },
    {
      codigo: 'AC2023',
      descripcion: 'ACEITE HIDRAULICO ISO 68',
      costoUnitario: 45.00,
      ubicacion: 'ALMACEN',
      entradas: 10,
      salidas: 3,
      stockActual: 7,
      unidadMedida: 'lt',
      proveedor: 'LUBRICANTES SAC',
      costoTotal: 315.00
    }
  ];

  for (const producto of productos) {
    await prisma.product.upsert({
      where: { codigo: producto.codigo },
      update: {},
      create: producto,
    });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
