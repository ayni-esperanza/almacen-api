import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear usuarios por defecto con diferentes roles
  const users = [
    {
      username: 'admin',
      password: 'admin123',
      email: 'admin@ayni.com',
      firstName: 'Administrador',
      lastName: 'Sistema',
      role: UserRole.JEFE,
    },
    {
      username: 'gerente',
      password: 'gerente123',
      email: 'gerente@ayni.com',
      firstName: 'Juan',
      lastName: 'Gerente',
      role: UserRole.GERENTE,
    },
    {
      username: 'asistente',
      password: 'asistente123',
      email: 'asistente@ayni.com',
      firstName: 'María',
      lastName: 'Asistente',
      role: UserRole.ASISTENTE,
    },
    {
      username: 'ayudante',
      password: 'ayudante123',
      email: 'ayudante@ayni.com',
      firstName: 'Carlos',
      lastName: 'Ayudante',
      role: UserRole.AYUDANTE,
    },
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: {
        username: userData.username,
        password: hashedPassword,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isActive: true,
        isAuthenticated: false,
      },
    });
  }

  // Crear áreas predefinidas
  const areas = [
    'ALMACEN',
    'DANPER',
    'electricidad',
    'EXTRUSORA',
    'fibra',
    'INYECTORA',
    'JARDINES',
    'LADRILLERA',
    'líneas de vida',
    'MECANICA',
    'metalmecánica',
    'OTRO',
    'BROCHA',
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
      nombre: 'AFLOJA TODO',
      costoUnitario: 12.0,
      ubicacion: 'ALMACEN',
      entradas: 3,
      salidas: 2,
      stockActual: 1,
      stockMinimo: 5,
      unidadMedida: 'und',
      proveedor: 'FERRETERIA CENTRAL',
      marca: 'WD-40',
      costoTotal: 12.0,
    },
    {
      codigo: 'TU2024',
      nombre: 'TUERCA HEXAGONAL 1/2"',
      costoUnitario: 0.5,
      ubicacion: 'ALMACEN',
      entradas: 100,
      salidas: 20,
      stockActual: 80,
      stockMinimo: 20,
      unidadMedida: 'und',
      proveedor: 'FERRETERIA CENTRAL',
      costoTotal: 40.0,
    },
    {
      codigo: 'AC2023',
      nombre: 'ACEITE HIDRAULICO ISO 68',
      costoUnitario: 45.0,
      ubicacion: 'ALMACEN',
      entradas: 10,
      salidas: 3,
      stockActual: 7,
      stockMinimo: 10,
      unidadMedida: 'lt',
      proveedor: 'LUBRICANTES SAC',
      marca: 'SHELL',
      costoTotal: 315.0,
    },
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
