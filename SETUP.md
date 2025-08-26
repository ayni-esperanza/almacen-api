# 🚀 Instalación Rápida - AYNI Almacén API

## Pasos de configuración inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp env.example .env
```

Editar `.env` con tus datos:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ayni_almacen?schema=public"
JWT_SECRET="tu-clave-secreta-jwt-muy-segura"
JWT_EXPIRES_IN="24h"
PORT=3000
```

### 3. Configurar base de datos PostgreSQL

**Crear base de datos:**
```sql
CREATE DATABASE ayni_almacen;
```

**Aplicar esquema y datos iniciales:**
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Ejecutar la aplicación
```bash
npm run start:dev
```

## ✅ Verificar instalación

1. **API funcionando**: http://localhost:3000
2. **Swagger docs**: http://localhost:3000/api
3. **Login test**: 
   - Usuario: `admin`
   - Contraseña: `admin123`

## 🎯 Datos de prueba incluidos

El seed carga automáticamente:
- ✅ Usuario admin (admin/admin123)
- ✅ Áreas predefinidas (ALMACEN, DANPER, etc.)
- ✅ Productos de ejemplo (AF2025, TU2024, AC2023)

## 🔧 Comandos útiles

```bash
# Desarrollo con hot reload
npm run start:dev

# Generar cliente Prisma tras cambios de schema
npm run db:generate

# Reset completo de BD
npm run db:push

# Poblar datos nuevamente
npm run db:seed

# Ver logs
npm run start:dev | grep -E "(API|Swagger|Error)"
```

## 🆘 Problemas comunes

### Error de conexión a PostgreSQL
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo service postgresql status

# Verificar credenciales en DATABASE_URL
```

### Error "Prisma Client not generated"
```bash
npm run db:generate
```

### Puerto 3000 ocupado
```bash
# Cambiar puerto en .env
PORT=3001
```

## 🎉 ¡Listo!

Tu API AYNI Almacén está funcionando. Puedes conectar el frontend React o usar Swagger para testing.
