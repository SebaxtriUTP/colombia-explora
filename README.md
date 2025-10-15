# 🌄 Colombia Explora - Plataforma de Turismo de Aventura

Plataforma web moderna para reservas de destinos turísticos en el Eje Cafetero colombiano, con sistema de autenticación, gestión de destinos y reservas con cálculo automático de precios.

## 📋 Tabla de Contenidos

- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Base de Datos](#-base-de-datos)
- [Sistema de Roles](#-sistema-de-roles)
- [Desarrollo](#-desarrollo)
- [Testing](#-testing)

---

## 🏗️ Arquitectura

El proyecto utiliza una **arquitectura de microservicios** containerizada con Docker Compose:

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Network (explora_net)            │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Frontend   │  │  Auth Service │  │  API Service │    │
│  │  (Angular)   │  │   (FastAPI)   │  │   (FastAPI)  │    │
│  │  Port: 4200  │  │  Port: 8001   │  │  Port: 8000  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                  │             │
│         └─────────────────┴──────────────────┘             │
│                           │                                │
│                  ┌────────▼────────┐                       │
│                  │   PostgreSQL    │                       │
│                  │   Port: 5432    │                       │
│                  └─────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Servicios

#### 🎨 **Frontend (Angular 15 + Bootstrap 5)**
- SPA (Single Page Application) con Angular
- Diseño responsivo con Bootstrap 5.3
- Estilos personalizados con SCSS
- Servidor: Nginx (producción)
- **URL:** http://localhost:4200

#### 🔐 **Auth Service (FastAPI)**
- Microservicio de autenticación independiente
- Generación y validación de JWT (HS256)
- Sistema de roles (admin/user)
- Registro y login de usuarios
- **URL:** http://localhost:8001
- **Docs:** http://localhost:8001/docs

#### 🚀 **API Service (FastAPI)**
- Servicio principal de lógica de negocio
- Gestión de destinos turísticos
- Sistema de reservas con cálculo automático
- Protección mediante JWT
- **URL:** http://localhost:8000
- **Docs:** http://localhost:8000/docs

#### 🗄️ **PostgreSQL 15**
- Base de datos relacional
- Persistencia en volumen local (`./data/postgres`)
- Acceso interno en red Docker
- **Puerto:** 5432 (interno)

---

## 🛠️ Tecnologías

### Backend
- **FastAPI** 0.100+ - Framework web moderno y rápido
- **SQLModel** - ORM basado en Pydantic y SQLAlchemy
- **asyncpg** - Driver asíncrono para PostgreSQL
- **pyjwt** - Autenticación JWT
- **passlib[bcrypt]** - Hash de contraseñas
- **uvicorn** - Servidor ASGI

### Frontend
- **Angular** 15 - Framework frontend
- **Bootstrap** 5.3 - Framework CSS
- **SCSS** - Preprocesador CSS
- **Font Awesome** 6.4 - Iconografía
- **RxJS** - Programación reactiva
- **Nginx** - Servidor web

### Base de Datos
- **PostgreSQL** 15-alpine

### DevOps
- **Docker** - Containerización
- **Docker Compose** - Orquestación

---

## ✅ Requisitos

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **(Opcional)** Node.js 16+ y npm (para desarrollo local del frontend)

---

## 🚀 Instalación

### Opción A: Instalación Automática (Recomendado) 🎯

Usa el script de inicio rápido que automatiza todo el proceso:

```bash
# Dar permisos de ejecución a los scripts
chmod +x scripts/*.sh

# Ejecutar instalación automática
./scripts/quick_start.sh
```

Este script automáticamente:
- ✅ Verifica que Docker y Docker Compose estén instalados
- ✅ Crea el archivo `.env` desde `.env.example` si no existe
- ✅ Detiene contenedores existentes
- ✅ (Opcional) Resetea la base de datos
- ✅ Construye todas las imágenes Docker
- ✅ Inicia todos los servicios
- ✅ Verifica el estado de salud de cada servicio
- ✅ Muestra URLs de acceso y credenciales

### Opción B: Instalación Manual 🔧

### 1️⃣ Clonar el repositorio

```bash
git clone <tu-repositorio>
cd explora
```

### 2️⃣ Configurar variables de entorno (Opcional)

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar valores si es necesario (JWT_SECRET, contraseñas, etc.)
nano .env
```

### 3️⃣ Levantar todos los servicios

```bash
docker-compose up --build -d
```

Este comando:
- ✅ Descarga las imágenes base necesarias
- ✅ Construye los contenedores de auth, api y frontend
- ✅ Crea la red Docker `explora_net`
- ✅ Inicia PostgreSQL con volumen persistente
- ✅ Ejecuta migraciones automáticas (crea tablas)
- ✅ Crea usuario admin por defecto

### 4️⃣ Verificar que los servicios estén corriendo

```bash
docker-compose ps
```

Deberías ver 4 contenedores en estado `Up`:
```
NAME                 STATUS
explora_postgres     Up
explora_auth         Up
explora_api          Up
explora_frontend     Up
```

### 5️⃣ Verificar health de los servicios

**Opción 1: Script automático (Recomendado)**
```bash
./scripts/health_check.sh
```

Este script verifica:
- ✅ Estado de todos los contenedores Docker
- ✅ Endpoint `/health` del Auth Service (Puerto 8001)
- ✅ Endpoint `/health` del API Service (Puerto 8000)
- ✅ Disponibilidad del Frontend Angular (Puerto 4200)
- ✅ Conexión a PostgreSQL
- ✅ Muestra resumen con colores (verde=OK, rojo=FAIL)

**Opción 2: Verificación manual**
```bash
curl http://localhost:8001/health  # Auth service
curl http://localhost:8000/health  # API service
```

Ambos deben responder: `{"status":"ok"}`

### 6️⃣ Acceder a la aplicación

Abre tu navegador en: **http://localhost:4200**

---

## 🛠️ Scripts de Utilidad

El proyecto incluye scripts bash en la carpeta `scripts/` para facilitar tareas comunes:

### `quick_start.sh` - Instalación Automática

**Uso:**
```bash
chmod +x scripts/quick_start.sh
./scripts/quick_start.sh
```

**Qué hace:**
1. ✅ Verifica instalación de Docker y Docker Compose
2. ✅ Crea `.env` desde `.env.example` (si no existe)
3. ✅ Detiene contenedores existentes
4. ✅ Opcionalmente resetea la base de datos (pregunta al usuario)
5. ✅ Construye todas las imágenes Docker
6. ✅ Inicia todos los servicios en modo detached (`-d`)
7. ✅ Espera 8 segundos a que los servicios inicien
8. ✅ Verifica health de todos los servicios
9. ✅ Muestra resumen con URLs y credenciales de admin

**Cuándo usarlo:**
- Primera instalación del proyecto
- Después de hacer cambios importantes en Dockerfiles
- Para resetear el ambiente de desarrollo

### `health_check.sh` - Verificación de Servicios

**Uso:**
```bash
chmod +x scripts/health_check.sh
./scripts/health_check.sh
```

**Qué hace:**
1. ✅ Muestra estado de contenedores (`docker-compose ps`)
2. ✅ Verifica Auth Service en `http://localhost:8001/health`
3. ✅ Verifica API Service en `http://localhost:8000/health`
4. ✅ Verifica Frontend en `http://localhost:4200`
5. ✅ Verifica PostgreSQL con `pg_isready`
6. ✅ Muestra resumen con colores:
   - 🟢 Verde: Servicio funcionando correctamente
   - 🔴 Rojo: Servicio con problemas
   - 🟡 Amarillo: Advertencias
7. ✅ Exit code indica número de servicios con problemas

**Cuándo usarlo:**
- Después de iniciar los servicios
- Para debugging de problemas
- En scripts de CI/CD
- Para verificar que todo funciona antes de trabajar

**Ejemplo de salida:**
```
============================================
🏔️  Colombia Explora - Health Check
============================================

📦 Estado de Contenedores:
-------------------------------------------
NAME                 STATUS
explora_postgres     Up
explora_auth         Up
explora_api          Up
explora_frontend     Up

🔐 Servicios Backend:
-------------------------------------------
Verificando Auth Service... ✓ OK (HTTP 200)
Verificando API Service... ✓ OK (HTTP 200)

🎨 Frontend:
-------------------------------------------
Verificando Angular Frontend... ✓ OK (HTTP 200)

🗄️  Base de Datos:
-------------------------------------------
Verificando PostgreSQL... ✓ OK

============================================
✅ Todos los servicios están funcionando (4/4)

🌐 URLs disponibles:
   - Frontend:  http://localhost:4200
   - API Docs:  http://localhost:8000/docs
   - Auth Docs: http://localhost:8001/docs
============================================
```

**Códigos de salida:**
- `0`: Todos los servicios OK
- `> 0`: Número de servicios con problemas

---

## 📁 Estructura del Proyecto

````
```

### 4️⃣ Verificar health de los servicios

```bash
curl http://localhost:8001/health  # Auth service
curl http://localhost:8000/health  # API service
```

Ambos deben responder: `{"status":"ok"}`

### 5️⃣ Acceder a la aplicación

Abre tu navegador en: **http://localhost:4200**

---

## 📁 Estructura del Proyecto

```
explora/
├── docker-compose.yml          # Orquestación de servicios
├── README.md                   # Este archivo
├── data/                       # Volumen persistente de PostgreSQL
│   └── postgres/               # Datos de la BD (ignorado en git)
│
├── auth/                       # Microservicio de autenticación
│   ├── Dockerfile
│   ├── requirements.txt        # Dependencias Python
│   └── app/
│       ├── main.py            # API FastAPI
│       ├── models.py          # Modelo User
│       └── db.py              # Conexión a BD
│
├── api/                        # Microservicio principal
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py            # Endpoints de destinos y reservas
│       ├── models.py          # Modelos Destination, Reservation
│       └── db.py              # Conexión a BD
│
└── frontend/                   # Aplicación Angular
    ├── Dockerfile              # Multi-stage build (Node + Nginx)
    ├── package.json
    ├── angular.json
    ├── tsconfig.json
    └── src/
        ├── index.html
        ├── styles.scss         # Estilos globales
        ├── main.ts
        └── app/
            ├── app.module.ts
            ├── app.component.ts
            ├── components/     # Header, Footer
            ├── pages/          # Home, Login, Register, etc.
            └── services/       # AuthService, DestinationService, etc.
```

---

## 🔌 API Endpoints

### Auth Service (Puerto 8001)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registro de usuario | ❌ |
| POST | `/token` | Login (obtener JWT) | ❌ |
| GET | `/health` | Health check | ❌ |

#### Ejemplo de registro:
```bash
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juanito",
    "email": "juan@example.com",
    "password": "mipassword123"
  }'
```

#### Ejemplo de login:
```bash
curl -X POST http://localhost:8001/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juanito",
    "password": "mipassword123"
  }'
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### API Service (Puerto 8000)

| Método | Endpoint | Descripción | Auth | Admin |
|--------|----------|-------------|------|-------|
| GET | `/destinations` | Listar destinos | ❌ | ❌ |
| POST | `/destinations` | Crear destino | ✅ | ✅ |
| PATCH | `/destinations/{id}` | Actualizar destino | ✅ | ✅ |
| DELETE | `/destinations/{id}` | Eliminar destino | ✅ | ✅ |
| GET | `/reservations` | Listar mis reservas | ✅ | ❌ |
| POST | `/reservations` | Crear reserva | ✅ | ❌ |
| GET | `/health` | Health check | ❌ | ❌ |

#### Ejemplo: Crear destino (admin)
```bash
# 1. Login como admin
TOKEN=$(curl -sS -X POST http://localhost:8001/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])')

# 2. Crear destino
curl -X POST http://localhost:8000/destinations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Valle del Cocora",
    "description": "Palmas de cera y paisajes increíbles",
    "region": "Quindío",
    "price": 120000
  }'
```

#### Ejemplo: Crear reserva
```bash
# 1. Login como usuario
TOKEN=$(curl -sS -X POST http://localhost:8001/token \
  -H "Content-Type: application/json" \
  -d '{"username":"juanito","password":"mipassword123"}' \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])')

# 2. Crear reserva con fechas
curl -X POST http://localhost:8000/reservations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "destination_id": 1,
    "people": 3,
    "check_in": "2025-12-20",
    "check_out": "2025-12-25"
  }'
```

**Respuesta:**
```json
{
  "id": 1,
  "user_id": 2,
  "destination_id": 1,
  "people": 3,
  "check_in": "2025-12-20",
  "check_out": "2025-12-25",
  "total_price": 1800000.0,
  "created_at": "2025-10-14T15:30:00"
}
```

**Cálculo automático:** 
- Precio por día: $120,000 COP
- Personas: 3
- Días: 5 (del 20 al 25)
- **Total: 120,000 × 3 × 5 = $1,800,000 COP**

---

## 🗄️ Base de Datos

### Esquema

#### Tabla: `user`
```sql
CREATE TABLE user (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `destination`
```sql
CREATE TABLE destination (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  region VARCHAR(255),
  price FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `reservation`
```sql
CREATE TABLE reservation (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES user(id),
  destination_id INTEGER REFERENCES destination(id),
  people INTEGER NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Acceso directo a la BD

```bash
# Conectar a PostgreSQL
docker exec -it explora_postgres psql -U explora -d explora

# Ver tablas
\dt

# Consultar usuarios
SELECT id, username, email, role FROM "user";

# Consultar destinos
SELECT * FROM destination;

# Consultar reservas con información completa
SELECT 
  r.id, 
  u.username, 
  d.name as destination, 
  r.people, 
  r.check_in, 
  r.check_out, 
  r.total_price 
FROM reservation r 
JOIN "user" u ON r.user_id = u.id 
JOIN destination d ON r.destination_id = d.id;
```

---

## 👥 Sistema de Roles

### Roles Disponibles

1. **user** (por defecto)
   - Puede ver destinos
   - Puede crear reservas
   - Puede ver sus propias reservas

2. **admin**
   - Todos los permisos de `user`
   - Puede crear, editar y eliminar destinos
   - Acceso al panel de administración

### Usuario Admin por Defecto

Al iniciar el proyecto, se crea automáticamente un usuario administrador:

```
Username: admin
Password: admin123
Role: admin
```

**⚠️ IMPORTANTE:** Cambia esta contraseña en producción.

---

## 💻 Desarrollo

### Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose logs -f

# Solo un servicio específico
docker-compose logs -f frontend
docker-compose logs -f api
docker-compose logs -f auth
docker-compose logs -f postgres
```

### Reiniciar un servicio

```bash
docker-compose restart frontend
```

### Reconstruir después de cambios

```bash
# Reconstruir todo
docker-compose down
docker-compose up --build -d

# Reconstruir solo frontend
docker-compose build frontend
docker-compose restart frontend
```

### Desarrollo local del frontend (Hot Reload)

Si quieres desarrollar el frontend con hot reload:

```bash
cd frontend
npm install
npm start  # Abre en http://localhost:4201
```

Actualiza `frontend/src/assets/env.js`:
```javascript
window['__env'] = {
  API_URL: 'http://localhost:8000',
  AUTH_URL: 'http://localhost:8001'
};
```

### Resetear la base de datos

```bash
# ⚠️ Esto borrará todos los datos
docker-compose down
sudo rm -rf data/postgres
docker-compose up -d
```

---

## 🧪 Testing

### Health checks

```bash
# Script de verificación completa
./scripts/health_check.sh
```

O manualmente:

```bash
echo "=== Auth Service ==="
curl http://localhost:8001/health

echo -e "\n=== API Service ==="
curl http://localhost:8000/health

echo -e "\n=== Frontend ==="
curl -I http://localhost:4200
```

### Tests funcionales completos

```bash
# 1. Registrar usuario
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# 2. Login
TOKEN=$(curl -sS -X POST http://localhost:8001/token \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}' \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])')

# 3. Ver destinos
curl http://localhost:8000/destinations

# 4. Crear reserva
curl -X POST http://localhost:8000/reservations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"destination_id":1,"people":2,"check_in":"2025-12-20","check_out":"2025-12-22"}'

# 5. Ver mis reservas
curl http://localhost:8000/reservations \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎨 Personalización del Frontend

### Paleta de Colores

Edita `frontend/src/styles.scss`:

```scss
:root {
  --primary-green: #00b09b;    // Verde primario
  --secondary-green: #96c93d;  // Verde secundario
  --accent-yellow: #f5b700;    // Amarillo acento
  --deep-blue: #2d5f7e;        // Azul profundo
  --sky-blue: #5fa8d3;         // Azul cielo
}
```

### Imágenes del Hero

Edita `frontend/src/app/pages/home.component.ts`:

```typescript
destinationImages = [
  'URL_DE_TU_IMAGEN_1',
  'URL_DE_TU_IMAGEN_2',
  // ...
];
```

---

## 📦 Despliegue en Producción

### Variables de Entorno

Crea un archivo `.env`:

```env
# Database
POSTGRES_USER=explora_prod
POSTGRES_PASSWORD=<password_seguro>
POSTGRES_DB=explora_prod

# JWT Secret
JWT_SECRET=<secreto_aleatorio_muy_largo>

# Puertos (opcional)
FRONTEND_PORT=80
API_PORT=8000
AUTH_PORT=8001
```

### Docker Compose para Producción

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Consideraciones de Seguridad

1. ✅ Cambiar contraseña del admin por defecto
2. ✅ Usar JWT_SECRET fuerte y aleatorio
3. ✅ Habilitar HTTPS con certificado SSL
4. ✅ Configurar CORS apropiadamente
5. ✅ Usar variables de entorno para secretos
6. ✅ Limitar rate limiting en nginx
7. ✅ Backups regulares de PostgreSQL

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Add nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que Docker esté corriendo: `docker ps`
2. Revisa los logs: `docker-compose logs -f`
3. Reinicia los servicios: `docker-compose restart`
4. Reconstruye desde cero: `docker-compose down && docker-compose up --build`

---

**Desarrollado con ❤️ para aventureros colombianos** 🇨🇴🏔️

# Obtener token
curl -X POST http://localhost:8001/token -H "Content-Type: application/json" -d '{"username":"juan","password":"secret"}'

# Listar destinos
curl http://localhost:8000/destinations
```
