import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear áreas predeterminadas
  const areas = ['1', '2', '3', '4', '5', '6'];
  for (const nombre of areas) {
    await prisma.area.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  // Crear categorías predeterminadas
  const categorias = ['EPP', 'Equipos', 'Herramientas'];
  for (const nombre of categorias) {
    await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  const roleInput = process.env.ADMIN_ROLE?.trim();
  const role = roleInput && roleInput in UserRole
    ? UserRole[roleInput as keyof typeof UserRole]
    : UserRole.GERENTE;

  // Crear usuario admin por defecto (configurable por variables de entorno)
  const adminData = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin_2026@',
    email: process.env.ADMIN_EMAIL || 'admin@ayni.com',
    firstName: process.env.ADMIN_FIRST_NAME || 'Administrador',
    lastName: process.env.ADMIN_LAST_NAME || 'Sistema',
    phoneNumber: process.env.ADMIN_PHONE || '+51 999888777',
    avatarUrl:
      process.env.ADMIN_AVATAR ||
      'https://ui-avatars.com/api/?name=Admin+Sistema',
    role,
  };

  const hashedPassword = await bcrypt.hash(adminData.password, 10);

  await prisma.user.upsert({
    where: { username: adminData.username },
    update: {},
    create: {
      username: adminData.username,
      password: hashedPassword,
      email: adminData.email,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      phoneNumber: adminData.phoneNumber,
      avatarUrl: adminData.avatarUrl,
      role: adminData.role,
      isActive: true,
      isAuthenticated: false,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
