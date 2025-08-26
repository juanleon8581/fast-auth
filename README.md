# Fast Auth API

API de Autenticación construida con Express.js y TypeScript siguiendo principios de Clean Architecture.

## Características

- ✅ Express.js con TypeScript
- ✅ Clean Architecture
- ✅ Validación de variables de entorno con Zod
- ✅ Middlewares de seguridad (Helmet, CORS)
- ✅ Linting con ESLint
- ✅ Formateo con Prettier
- ✅ Testing con Jest
- ✅ Containerización con Docker

## Estructura del Proyecto

```
├── .env.example                    # Template de variables de entorno
├── .gitignore                      # Archivos ignorados por Git
├── package.json                    # Dependencias y scripts
├── tsconfig.json                   # Configuración de TypeScript
├── README.md                       # Documentación del proyecto
├── Dockerfile                      # Configuración para containerización
├── docker-compose.yml              # Orquestación de contenedores
└── src/
    ├── app.ts                      # Punto de entrada principal
    ├── config/                     # Configuraciones
    ├── domain/                     # Capa de dominio
    ├── infrastructure/             # Capa de infraestructura
    └── presentation/               # Capa de presentación
```

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Copia el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo
- `npm run build` - Compila el proyecto
- `npm start` - Inicia el servidor en producción
- `npm test` - Ejecuta las pruebas
- `npm run test:watch` - Ejecuta las pruebas en modo watch
- `npm run test:coverage` - Ejecuta las pruebas con cobertura
- `npm run lint` - Ejecuta el linter
- `npm run lint:fix` - Ejecuta el linter y corrige errores automáticamente
- `npm run format` - Formatea el código con Prettier

## API Endpoints

### Health Check
- `GET /health` - Verifica el estado del servidor
- `GET /api/` - Información básica de la API

## Docker

### Desarrollo
```bash
docker-compose up -d
```

### Producción
```bash
docker build -t fast-auth .
docker run -p 3000:3000 fast-auth
```

## Requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0

## Licencia

MIT