import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'], // Solo mostrar errores y advertencias
    bodyParser: false, // Deshabilitamos el body parser por defecto
  });

  // Configurar body parser con límite aumentado para imágenes Base64
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('AYNI Almacén API')
    .setDescription(
      'Sistema de Inventario AYNI - API completa para gestión de productos, movimientos, equipos y reportes',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Autenticación y gestión de usuarios')
    .addTag('Inventory', 'Gestión de inventario y productos')
    .addTag('Movements', 'Movimientos de entrada y salida')
    .addTag('Equipment', 'Gestión de equipos y herramientas')
    .addTag('Reports', 'Generación de reportes')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`AYNI Almacén API running on: http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/api`);
}
bootstrap();
