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

  // ===== CREAR CATÁLOGOS =====

  // Crear proveedores
  const proveedores = [
    'FERRETERIA CENTRAL',
    'LUBRICANTES SAC',
    'DISTRIBUIDORA NORTE',
    'IMPORTACIONES DEL SUR',
  ];
  for (const nombre of proveedores) {
    await prisma.provider.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // Crear ubicaciones
  const ubicaciones = [
    'ALMACEN',
    'ALMACEN CENTRAL',
    'DEPOSITO A',
    'DEPOSITO B',
  ];
  for (const nombre of ubicaciones) {
    await prisma.location.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // Crear categorías
  const categorias = [
    'Herramientas',
    'Lubricantes',
    'Ferretería',
    'Eléctricos',
    'Repuestos',
    'Otros',
  ];
  for (const nombre of categorias) {
    await prisma.category.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // Crear unidades de medida
  const unidades = ['und', 'lt', 'kg', 'mt', 'caja', 'paquete', 'galón'];
  for (const nombre of unidades) {
    await prisma.unit.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
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

  // Crear proyectos
  const proyectos = [
    'Proyecto ABC',
    'Proyecto XYZ',
    'Mantenimiento General',
    'Obra Civil',
  ];
  for (const nombre of proyectos) {
    await prisma.project.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // Crear responsables
  const responsables = [
    'Juan Pérez',
    'María García',
    'Carlos López',
    'Ana Martínez',
  ];
  for (const nombre of responsables) {
    await prisma.responsible.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // ===== OBTENER IDs DE CATÁLOGOS =====
  const ferreteriaProvider = await prisma.provider.findUnique({
    where: { nombre: 'FERRETERIA CENTRAL' },
  });
  const lubricantesProvider = await prisma.provider.findUnique({
    where: { nombre: 'LUBRICANTES SAC' },
  });
  const almacenLocation = await prisma.location.findUnique({
    where: { nombre: 'ALMACEN' },
  });
  const herramientasCategory = await prisma.category.findUnique({
    where: { nombre: 'Herramientas' },
  });
  const ferrerteriaCategory = await prisma.category.findUnique({
    where: { nombre: 'Ferretería' },
  });
  const lubricantesCategory = await prisma.category.findUnique({
    where: { nombre: 'Lubricantes' },
  });
  const undUnit = await prisma.unit.findUnique({ where: { nombre: 'und' } });
  const ltUnit = await prisma.unit.findUnique({ where: { nombre: 'lt' } });

  // ===== CREAR PRODUCTOS =====
  const productos = [
    {
      codigo: 'AF2025',
      nombre: 'AFLOJA TODO',
      costoUnitario: 12.0,
      stockMinimo: 5,
      providerId: ferreteriaProvider!.id,
      locationId: almacenLocation!.id,
      categoryId: herramientasCategory!.id,
      unitId: undUnit!.id,
      entradas: 3,
      salidas: 2,
      stockActual: 1,
      marca: 'WD-40',
    },
    {
      codigo: 'TU2024',
      nombre: 'TUERCA HEXAGONAL 1/2"',
      costoUnitario: 0.5,
      stockMinimo: 50,
      providerId: ferreteriaProvider!.id,
      locationId: almacenLocation!.id,
      categoryId: ferrerteriaCategory!.id,
      unitId: undUnit!.id,
      entradas: 100,
      salidas: 20,
      stockActual: 80,
    },
    {
      codigo: 'AC2023',
      nombre: 'ACEITE HIDRAULICO ISO 68',
      costoUnitario: 45.0,
      stockMinimo: 10,
      providerId: lubricantesProvider!.id,
      locationId: almacenLocation!.id,
      categoryId: lubricantesCategory!.id,
      unitId: ltUnit!.id,
      entradas: 10,
      salidas: 3,
      stockActual: 7,
      marca: 'Shell',
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
  console.log('- Users created');
  console.log(
    '- Catalogs created (Providers, Locations, Categories, Units, Areas, Projects, Responsibles)',
  );
  console.log('- Sample products created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
