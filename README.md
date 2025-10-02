# Fast Auth API

API de autenticación rápida construida con Express, TypeScript, Prisma y Supabase.

## 🚀 Características

- **Autenticación JWT** con Supabase Auth
- **Base de datos PostgreSQL** con Prisma ORM
- **Arquitectura limpia** con separación de capas
- **Logging avanzado** con Winston y PostgreSQL
- **Validación de datos** con Zod
- **Documentación API** con Swagger
- **Testing** con Jest
- **Linting y formateo** con ESLint y Prettier
- **Soporte multi-entorno** con archivos .env específicos

## 📁 Estructura del Proyecto

```
fast-auth/
├── .env.example                   # Environment variables template
├── .env.dev                       # Development environment
├── .env.prod                      # Production environment
├── src/
│   ├── app.ts                     # Application entry point
│   ├── config/                    # Configuration files
│   ├── domain/                    # Business logic layer
│   │   ├── entities/              # Domain entities
│   │   ├── repositories/          # Repository interfaces
│   │   ├── use-cases/             # Business use cases
│   │   └── dtos/                  # Data transfer objects
│   ├── infrastructure/            # Infrastructure layer
│   │   ├── datasources/           # Data access implementations
│   │   ├── config/                # Infrastructure configuration
│   │   └── validators/            # Input validation
│   └── presentation/              # Presentation layer
│       ├── controller/            # HTTP controllers
│       ├── middlewares/           # Express middlewares
│       └── routes.ts              # Route definitions
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
└── docs/                          # Documentation
```

## 🛠️ Configuración

### 1. Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd fast-auth

# Instalar dependencias
pnpm install
```

### 2. Configuración de entorno

```bash
# Copiar el archivo de ejemplo para desarrollo
cp .env.example .env.dev

# Editar las variables de entorno
nano .env.dev
```

### 3. Configuración de Supabase

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Iniciar Supabase localmente:

```bash
npx supabase start
```

3. Actualizar tu archivo `.env.dev` con las credenciales locales de Supabase:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### 4. Base de datos

```bash
# Ejecutar migraciones para desarrollo
pnpm db:migrate:dev

# O sincronizar el esquema sin migraciones
pnpm db:push:dev

# Abrir Prisma Studio para desarrollo
pnpm db:studio:dev
```

## 🚀 Scripts Disponibles

### Desarrollo
```bash
pnpm dev                    # Iniciar servidor de desarrollo
```

### Base de datos (Desarrollo)
```bash
pnpm db:migrate:dev         # Ejecutar migraciones con .env.dev
pnpm db:push:dev           # Sincronizar esquema con .env.dev
pnpm db:studio:dev         # Abrir Prisma Studio con .env.dev
```

### Base de datos (Producción)
```bash
pnpm db:migrate:prod       # Ejecutar migraciones con .env.prod
pnpm db:push:prod         # Sincronizar esquema con .env.prod
pnpm db:studio:prod       # Abrir Prisma Studio con .env.prod
```

### Testing
```bash
pnpm test                  # Ejecutar tests
pnpm test:watch           # Ejecutar tests en modo watch
pnpm test:coverage        # Ejecutar tests con coverage
```

### Linting y formateo
```bash
pnpm lint                 # Ejecutar linter
pnpm lint:fix            # Corregir errores de linting
pnpm format              # Formatear código
pnpm format:check        # Verificar formato
pnpm code:check          # Verificar linting y formato
pnpm code:fix            # Corregir linting y formato
```

### Build y producción
```bash
pnpm build               # Compilar TypeScript
pnpm start               # Iniciar servidor de producción
```

## 🌍 Manejo de Entornos

Este proyecto soporta múltiples entornos usando archivos `.env` específicos:

- **`.env.dev`** - Entorno de desarrollo
- **`.env.prod`** - Entorno de producción
- **`.env.test`** - Entorno de testing (opcional)

### Configuración de variables de entorno

Asegúrate de configurar las siguientes variables de entorno en tu archivo `.env.dev`:

```env
# Server Configuration
NODE_ENV=dev
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# JWT Configuration
JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long

# Supabase Configuration
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📚 Documentación

- [Guía de Arquitectura](./docs/development/architecture-guide.md)
- [Guía de Desarrollo de Endpoints](./docs/development/endpoint-development-guide.md)
- [Documentación de la API](./docs/api/) - Swagger/OpenAPI

## 🧪 Testing

El proyecto incluye tests unitarios y de integración:

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar tests en modo watch
pnpm test:watch

# Generar reporte de coverage
pnpm test:coverage
```

## 🏗️ Arquitectura

El proyecto sigue los principios de **Arquitectura Limpia**:

- **Domain Layer**: Lógica de negocio pura
- **Infrastructure Layer**: Implementaciones de acceso a datos
- **Presentation Layer**: Controladores HTTP y middlewares

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.