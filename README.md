# AYNI Almacén API

Sistema de Inventario AYNI - API completa para gestión de productos, movimientos, equipos y reportes desarrollada con NestJS, Prisma y PostgreSQL.

## Descripción

API REST para el sistema de inventario AYNI que proporciona gestión completa de:

- **Productos/Inventario**: CRUD completo con control de stock
- **Movimientos**: Entradas y salidas con actualización automática de stock
- **Equipos**: Gestión de herramientas con control de salida/retorno
- **Reportes**: Generación de reportes personalizables
- **Autenticación**: Sistema JWT con protección de rutas

## Arquitectura Técnica

- **Framework**: NestJS 11
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: JWT + Passport
- **Validación**: class-validator + class-transformer
- **Documentación**: Swagger/OpenAPI
- **Arquitectura**: Modular por features

## Instalación

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Pasos de instalación

1. **Clonar repositorio**

```bash
git clone <repository-url>
cd ayni-almacen-api
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar base de datos**

```bash
# Copiar archivo de configuración
cp env.example .env

# Editar .env con tus credenciales de PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/ayni_almacen?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
```

4. **Configurar Prisma (solo cuando se clona por primera vez)**

```bash
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

5. **Después de git pull (desarrollo)**

```bash
npx prisma generate
npx prisma migrate dev
```

6. **Después de git pull (producción)**

```bash
npx prisma generate
npx prisma migrate deploy
npm run start:prod
```

# Abrir servidor para probar cambios en el prisma studio

```bash
npx prisma studio
```

## Ejecutar el proyecto

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod

# Con debug
npm run start:debug
```

La API estará disponible en:

- **Servidor**: <http://localhost:3000>
- **Documentación Swagger**: <http://localhost:3000/api>

## Autenticación

### Credenciales por defecto

- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Uso de JWT

```bash
# 1. Login
POST /auth/login
{
  "username": "admin",
  "password": "admin123"
}

# 2. Usar token en headers
Authorization: Bearer <jwt-token>
```

## Endpoints Principales

### Autenticación

- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/me` - Obtener perfil actual

### Inventario

- `GET /inventory/products` - Listar productos
- `POST /inventory/products` - Crear producto
- `GET /inventory/products/:id` - Obtener producto
- `PATCH /inventory/products/:id` - Actualizar producto
- `DELETE /inventory/products/:id` - Eliminar producto
- `GET /inventory/areas` - Listar áreas

### Movimientos

- `GET /movements/entries` - Listar entradas
- `POST /movements/entries` - Crear entrada
- `GET /movements/exits` - Listar salidas
- `POST /movements/exits` - Crear salida
- `PATCH /movements/exits/:id/quantity` - Actualizar cantidad

### Equipos

- `GET /equipment` - Listar equipos
- `POST /equipment` - Crear reporte de equipo
- `GET /equipment/:id` - Obtener equipo
- `PATCH /equipment/:id` - Actualizar equipo
- `DELETE /equipment/:id` - Eliminar equipo
- `PATCH /equipment/:id/return` - Registrar retorno

### Reportes

- `GET /reports/exits` - Reporte de salidas
- `GET /reports/entries` - Reporte de entradas
- `GET /reports/equipment` - Reporte de equipos
- `GET /reports/inventory` - Reporte de inventario
- `POST /reports/generate` - Generar reporte personalizado

## Modelos de Datos

### Producto

```typescript
{
  id: string;
  codigo: string;            // Código único
  descripcion: string;       // Descripción
  costoUnitario: number;     // Precio por unidad
  ubicacion: string;         // Ubicación en almacén
  entradas: number;          // Total entradas
  salidas: number;           // Total salidas
  stockActual: number;       // Stock disponible
  unidadMedida: string;      // und, kg, lt, etc.
  proveedor: string;         // Proveedor
  costoTotal: number;        // Costo total
  categoria?: string;        // Categoría opcional
}
```

### Movimiento de Entrada

```typescript
{
  id: string;
  fecha: string;             // DD/MM/YYYY
  codigoProducto: string;    // FK a Product
  descripcion: string;
  precioUnitario: number;
  cantidad: number;
  responsable?: string;
  area?: string;
}
```

### Movimiento de Salida

```typescript
{
  id: string;
  fecha: string;             // DD/MM/YYYY
  codigoProducto: string;    // FK a Product
  descripcion: string;
  precioUnitario: number;
  cantidad: number;
  responsable?: string;
  area?: string;
  proyecto?: string;
}
```

### Equipo

```typescript
{
  id: string;
  equipo: string;
  serieCodigo: string;
  cantidad: number;
  estadoEquipo: 'Bueno' | 'Regular' | 'Malo' | 'En Reparación' | 'Dañado';
  responsable: string;
  fechaSalida: string;
  horaSalida: string;
  areaProyecto: string;
  firma: string;
  fechaRetorno?: string;
  horaRetorno?: string;
  estadoRetorno?: 'Bueno' | 'Regular' | 'Malo' | 'Dañado';
  firmaRetorno?: string;
}
```

## Estructura del Proyecto

```
src/
├── auth/                   # Módulo de autenticación
├── inventory/              # Módulo de inventario
├── movements/              # Módulo de movimientos
├── equipment/              # Módulo de equipos
├── reports/                # Módulo de reportes
├── common/                 # Código compartido
│   ├── decorators/         # Decoradores personalizados
│   ├── guards/             # Guards de autenticación
│   ├── interfaces/         # Interfaces TypeScript
│   ├── services/           # Servicios compartidos
│   └── strategies/         # Estrategias de Passport
├── app.module.ts           # Módulo principal
└── main.ts                 # Punto de entrada
```

## Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## CORS y Frontend

La API está configurada para trabajar con el frontend React en:

- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (build production)

## Documentación API

Accede a la documentación Swagger en: <http://localhost:3000/api>

Incluye:

- Esquemas de datos completos
- Ejemplos de requests/responses
- Autenticación integrada
- Testing de endpoints en vivo

## Variables de Entorno

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/ayni_almacen"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV="development"
```

## Licencia

En discusion