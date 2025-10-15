# 🏗️ Arquitectura del Sistema - Colombia Explora

## Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACIÓN                             │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    Frontend (Angular 15)                        │   │
│  │                                                                 │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │   │
│  │  │  Home    │  │  Login   │  │ Reserve  │  │  Admin   │      │   │
│  │  │Component │  │Component │  │Component │  │Component │      │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │   │
│  │       │             │             │             │              │   │
│  │       └─────────────┴─────────────┴─────────────┘              │   │
│  │                         │                                       │   │
│  │                    ┌────▼─────┐                                │   │
│  │                    │ Services │                                │   │
│  │                    │  Layer   │                                │   │
│  │                    └──────────┘                                │   │
│  │                         │                                       │   │
│  │              ┌──────────┼──────────┐                           │   │
│  │              │          │          │                           │   │
│  │        ┌─────▼───┐ ┌───▼────┐ ┌──▼────────┐                  │   │
│  │        │ Auth    │ │ Dest   │ │Reservation│                  │   │
│  │        │ Service │ │Service │ │  Service  │                  │   │
│  │        └─────────┘ └────────┘ └───────────┘                  │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                          HTTP/HTTPS (REST API)
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                         CAPA DE APLICACIÓN                              │
│                                                                          │
│  ┌──────────────────────────┐        ┌──────────────────────────┐     │
│  │   Auth Microservice      │        │    API Microservice      │     │
│  │      (FastAPI)           │        │       (FastAPI)          │     │
│  │                          │        │                          │     │
│  │  ┌────────────────┐     │        │  ┌────────────────┐     │     │
│  │  │ POST /register │     │        │  │ GET /dest...   │     │     │
│  │  │ POST /token    │     │        │  │ POST /dest...  │     │     │
│  │  │ GET /health    │     │        │  │ PATCH /dest... │     │     │
│  │  └────────────────┘     │        │  │ DELETE /dest...│     │     │
│  │                          │        │  │ GET /reserv... │     │     │
│  │  ┌────────────────┐     │        │  │ POST /reserv...│     │     │
│  │  │ JWT Generation │     │        │  │ GET /health    │     │     │
│  │  │ Password Hash  │     │        │  └────────────────┘     │     │
│  │  │ Role Management│     │        │                          │     │
│  │  └────────────────┘     │        │  ┌────────────────┐     │     │
│  │                          │        │  │ JWT Validation │     │     │
│  │  Port: 8001             │        │  │ Role Check     │     │     │
│  └──────────┬───────────────┘        │  │ Price Calc     │     │     │
│             │                         │  └────────────────┘     │     │
│             │                         │                          │     │
│             │                         │  Port: 8000             │     │
│             │                         └──────────┬───────────────┘     │
│             │                                    │                     │
└─────────────┼────────────────────────────────────┼─────────────────────┘
              │                                    │
              │         SQLModel (ORM)             │
              │                                    │
┌─────────────▼────────────────────────────────────▼─────────────────────┐
│                         CAPA DE DATOS                                   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    PostgreSQL 15                                │   │
│  │                                                                 │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────┐        │   │
│  │  │   user     │  │ destination  │  │  reservation   │        │   │
│  │  │            │  │              │  │                │        │   │
│  │  │ - id       │  │ - id         │  │ - id           │        │   │
│  │  │ - username │  │ - name       │  │ - user_id (FK) │        │   │
│  │  │ - email    │  │ - description│  │ - dest_id (FK) │        │   │
│  │  │ - password │  │ - region     │  │ - people       │        │   │
│  │  │ - role     │  │ - price      │  │ - check_in     │        │   │
│  │  │ - created  │  │ - created    │  │ - check_out    │        │   │
│  │  │            │  │              │  │ - total_price  │        │   │
│  │  └────────────┘  └──────────────┘  └────────────────┘        │   │
│  │                                                                 │   │
│  │  Volume: ./data/postgres                                       │   │
│  │  Port: 5432 (internal)                                         │   │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Autenticación

```
┌─────────┐                ┌──────────┐              ┌──────────┐
│ Usuario │                │ Frontend │              │   Auth   │
│         │                │ Angular  │              │ Service  │
└────┬────┘                └────┬─────┘              └────┬─────┘
     │                          │                         │
     │  1. Ingresa credenciales │                         │
     ├─────────────────────────>│                         │
     │                          │                         │
     │                          │  2. POST /token         │
     │                          ├────────────────────────>│
     │                          │     {username, pass}    │
     │                          │                         │
     │                          │                    ┌────┴────┐
     │                          │                    │ Valida  │
     │                          │                    │Password │
     │                          │                    └────┬────┘
     │                          │                         │
     │                          │  3. JWT Token          │
     │                          │<────────────────────────┤
     │                          │  {access_token, role}   │
     │                          │                         │
     │  4. Guarda en           │                         │
     │     localStorage        │                         │
     │                     ┌───┴───┐                     │
     │                     │ Store │                     │
     │                     │ Token │                     │
     │                     └───┬───┘                     │
     │                          │                         │
     │  5. Redirect a /home    │                         │
     │<─────────────────────────┤                         │
     │                          │                         │
```

---

## Flujo de Creación de Reserva

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Usuario │     │ Frontend │     │   API    │     │PostgreSQL│
└────┬────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │               │                │                 │
     │ 1. Selecciona │                │                 │
     │    destino    │                │                 │
     ├──────────────>│                │                 │
     │               │                │                 │
     │ 2. Llena form │                │                 │
     │  (personas,   │                │                 │
     │   fechas)     │                │                 │
     ├──────────────>│                │                 │
     │               │                │                 │
     │               │ 3. POST /reserv│                 │
     │               │    + JWT Token │                 │
     │               ├───────────────>│                 │
     │               │                │                 │
     │               │           ┌────┴────┐            │
     │               │           │ Valida  │            │
     │               │           │  JWT    │            │
     │               │           └────┬────┘            │
     │               │                │                 │
     │               │                │ 4. SELECT dest  │
     │               │                ├────────────────>│
     │               │                │  (get price)    │
     │               │                │                 │
     │               │                │ 5. Destination  │
     │               │                │<────────────────┤
     │               │                │                 │
     │               │           ┌────┴────┐            │
     │               │           │ Calcula │            │
     │               │           │  Total  │            │
     │               │           │ price × │            │
     │               │           │people × │            │
     │               │           │  days   │            │
     │               │           └────┬────┘            │
     │               │                │                 │
     │               │                │ 6. INSERT reserv│
     │               │                ├────────────────>│
     │               │                │                 │
     │               │                │ 7. Reservation  │
     │               │                │<────────────────┤
     │               │                │                 │
     │               │ 8. Reservation │                 │
     │               │   + total_price│                 │
     │               │<───────────────┤                 │
     │               │                │                 │
     │ 9. Muestra    │                │                 │
     │   confirmación│                │                 │
     │<──────────────┤                │                 │
     │               │                │                 │
```

---

## Diagrama de Componentes Angular

```
┌───────────────────────────────────────────────────────┐
│                   app.module.ts                       │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │              Components                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐ │    │
│  │  │  Header  │  │  Footer  │  │   Home   │ │    │
│  │  └──────────┘  └──────────┘  └──────────┘ │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐ │    │
│  │  │  Login   │  │ Register │  │ Reserve  │ │    │
│  │  └──────────┘  └──────────┘  └──────────┘ │    │
│  │  ┌──────────┐  ┌──────────┐               │    │
│  │  │  Admin   │  │Reservat. │               │    │
│  │  └──────────┘  └──────────┘               │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │              Services                       │    │
│  │  ┌──────────────┐  ┌──────────────┐        │    │
│  │  │ AuthService  │  │DestService   │        │    │
│  │  │              │  │              │        │    │
│  │  │ - login()    │  │ - list()     │        │    │
│  │  │ - register() │  │ - create()   │        │    │
│  │  │ - logout()   │  │ - update()   │        │    │
│  │  │ - isAuth     │  │ - delete()   │        │    │
│  │  │ - isAdmin    │  │              │        │    │
│  │  └──────────────┘  └──────────────┘        │    │
│  │  ┌──────────────┐                          │    │
│  │  │ReservService │                          │    │
│  │  │              │                          │    │
│  │  │ - list()     │                          │    │
│  │  │ - create()   │                          │    │
│  │  └──────────────┘                          │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │              Guards/Interceptors            │    │
│  │  ┌──────────────┐  ┌──────────────┐        │    │
│  │  │  AuthGuard   │  │AuthIntercept.│        │    │
│  │  │              │  │              │        │    │
│  │  │ - canActivate│  │ - intercept()│        │    │
│  │  │              │  │ (add JWT)    │        │    │
│  │  └──────────────┘  └──────────────┘        │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## Diagrama de Seguridad

```
┌──────────────────────────────────────────────────────────┐
│                    Security Layers                       │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Layer 1: Password Hashing                     │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │  passlib + bcrypt                    │     │    │
│  │  │  - Hash on registration              │     │    │
│  │  │  - Verify on login                   │     │    │
│  │  │  - Salt automatically                │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────┘    │
│                        ↓                                │
│  ┌────────────────────────────────────────────────┐    │
│  │  Layer 2: JWT Authentication                   │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │  PyJWT (HS256)                       │     │    │
│  │  │  - Issued on successful login        │     │    │
│  │  │  - Contains: user_id, username, role │     │    │
│  │  │  - Expires in 30 days                │     │    │
│  │  │  - Secret key: JWT_SECRET            │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────┘    │
│                        ↓                                │
│  ┌────────────────────────────────────────────────┐    │
│  │  Layer 3: Role-Based Access Control            │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │  require_token() → All users         │     │    │
│  │  │  require_admin() → Admin only        │     │    │
│  │  │                                      │     │    │
│  │  │  Endpoints protection:               │     │    │
│  │  │  - POST /destinations → admin        │     │    │
│  │  │  - PATCH /destinations → admin       │     │    │
│  │  │  - DELETE /destinations → admin      │     │    │
│  │  │  - POST /reservations → any auth     │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────┘    │
│                        ↓                                │
│  ┌────────────────────────────────────────────────┐    │
│  │  Layer 4: HTTP Interceptor (Frontend)          │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │  AuthInterceptor                     │     │    │
│  │  │  - Adds JWT to every request         │     │    │
│  │  │  - Header: Authorization: Bearer ... │     │    │
│  │  │  - Handles 401 → redirect to login   │     │    │
│  │  └──────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Tecnologías por Capa

| Capa | Tecnologías |
|------|-------------|
| **Presentación** | Angular 15, TypeScript, RxJS, Bootstrap 5, SCSS, Font Awesome |
| **Aplicación** | FastAPI, Pydantic, SQLModel, PyJWT, Passlib, Uvicorn |
| **Datos** | PostgreSQL 15, asyncpg |
| **Infraestructura** | Docker, Docker Compose, Nginx |
| **Testing** | Jest (Frontend), Pytest (Backend) |
| **Linting** | ESLint, Prettier (Frontend), Black, Flake8 (Backend) |

---

## Patrones de Diseño Utilizados

### Backend
- **Repository Pattern**: Separación entre lógica de negocio y acceso a datos
- **Dependency Injection**: FastAPI dependencies para auth, DB, etc.
- **DTO Pattern**: Pydantic models para validación de entrada/salida

### Frontend
- **Service Layer**: Servicios Angular para comunicación con API
- **Guard Pattern**: AuthGuard para protección de rutas
- **Interceptor Pattern**: AuthInterceptor para agregar JWT automáticamente
- **Observable Pattern**: RxJS para programación reactiva

---

## Escalabilidad

### Horizontal Scaling

```
                   ┌─────────────┐
                   │Load Balancer│
                   │   (Nginx)   │
                   └──────┬──────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │Frontend │      │Frontend │      │Frontend │
   │Instance1│      │Instance2│      │Instance3│
   └─────────┘      └─────────┘      └─────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │   API   │      │   API   │      │   API   │
   │Instance1│      │Instance2│      │Instance3│
   └─────────┘      └─────────┘      └─────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                   ┌──────▼──────┐
                   │  PostgreSQL │
                   │   Cluster   │
                   └─────────────┘
```

### Mejoras Futuras
- **Cache Layer**: Redis para cache de destinos
- **Message Queue**: RabbitMQ/Kafka para procesamiento asíncrono
- **CDN**: Cloudflare para assets estáticos
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

---

**Documentación de Arquitectura - Colombia Explora** 🏔️
