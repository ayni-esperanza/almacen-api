import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
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
