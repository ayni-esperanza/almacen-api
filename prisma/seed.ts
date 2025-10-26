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

  // Crear usuario admin por defecto
  const adminData = {
    username: 'admin',
    password: 'admin123',
    email: 'admin@ayni.com',
    firstName: 'Administrador',
    lastName: 'Sistema',
    phoneNumber: '+51 999888777',
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin+Sistema',
    role: UserRole.JEFE,
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
