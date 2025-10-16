# 🔧 Guía de Desarrollo Local

Esta guía te muestra cómo desarrollar y debugear el proyecto de manera profesional.

## 📋 Tabla de Contenidos

- [Entornos de Trabajo](#entornos-de-trabajo)
- [Setup Inicial](#setup-inicial)
- [Desarrollo con PyCharm](#desarrollo-con-pycharm)
- [Desarrollo con VSCode](#desarrollo-con-vscode)
- [Flujo de Trabajo Recomendado](#flujo-de-trabajo-recomendado)
- [Debugging](#debugging)
- [Testing](#testing)

---

## 🎯 Entornos de Trabajo

### 1. **DESARROLLO LOCAL** (día a día)
**¿Cuándo usar?** 
- Desarrollo de nuevas features
- Debug con breakpoints
- Hot reload rápido
- Testing manual

**Stack:**
```
✅ Python nativo (venv)
✅ PostgreSQL en Docker (solo la BD)
✅ IDE con debugger (PyCharm/VSCode)
❌ NO Docker para servicios
❌ NO Kubernetes
```

**Comandos:**
```bash
./scripts/dev-setup.sh              # Setup inicial (solo una vez)
docker-compose -f docker-compose.dev.yml up -d postgres  # BD
cd auth && source venv/bin/activate && uvicorn app.main:app --reload --port 8001
cd api && source venv/bin/activate && uvicorn app.main:app --reload --port 8000
cd frontend && npm start
```

---

### 2. **TESTING** (pruebas de integración)
**¿Cuándo usar?**
- Probar integración completa
- Simular entorno de producción
- Testing antes de merge
- CI/CD

**Stack:**
```
✅ Docker Compose
✅ Todos los servicios en contenedores
✅ Variables de entorno de producción
```

**Comandos:**
```bash
docker-compose up --build
./scripts/health_check.sh
```

---

### 3. **PRODUCCIÓN** (deploy)
**¿Cuándo usar?**
- Deploy a servidores
- Alta disponibilidad
- Auto-scaling
- Múltiples replicas

**Stack:**
```
✅ Kubernetes
✅ Minikube (local) o GKE/EKS (cloud)
✅ Ingress + LoadBalancer
✅ HorizontalPodAutoscaler
```

**Comandos:**
```bash
./scripts/k8s-deploy.sh
kubectl get all -n explora
```

---

## 🚀 Setup Inicial

### 1. Ejecutar el Script de Setup

```bash
./scripts/dev-setup.sh
```

Este script:
- ✅ Crea virtualenvs en `auth/venv` y `api/venv`
- ✅ Instala dependencias de Python
- ✅ Inicia PostgreSQL en Docker
- ✅ Configura `.env` para desarrollo local
- ✅ Instala dependencias de Node (frontend)

### 2. Verificar PostgreSQL

```bash
# Verificar que PostgreSQL está corriendo
docker ps | grep postgres

# Conectarse a la BD (opcional)
docker exec -it explora_postgres_dev psql -U explora -d explora_dev
```

---

## 🐍 Desarrollo con PyCharm

### Configuración del Intérprete (Una sola vez)

#### Para Auth Service:

1. **Abrir PyCharm** → Open → `explora/auth`
2. **Settings** → Project → Python Interpreter
3. **Add Interpreter** → Existing environment
4. **Select:** `explora/auth/venv/bin/python`
5. **Apply**

#### Para API Service:

1. **Abrir PyCharm** → Open → `explora/api`
2. **Settings** → Project → Python Interpreter
3. **Add Interpreter** → Existing environment
4. **Select:** `explora/api/venv/bin/python`
5. **Apply**

---

### Configuración de Ejecución (Run Configuration)

#### Auth Service Debug Config:

1. **Run** → Edit Configurations → **+** → Python
2. **Name:** `Auth Service (Debug)`
3. **Script path:** (vacío)
4. **Module name:** `uvicorn`
5. **Parameters:** `app.main:app --reload --port 8001`
6. **Working directory:** `explora/auth`
7. **Environment variables:**
   ```
   DATABASE_URL=postgresql+asyncpg://explora:explora123@localhost:5432/explora_dev
   JWT_SECRET=dev_secret_key
   ```
8. **Python interpreter:** `explora/auth/venv/bin/python`
9. **Apply**

#### API Service Debug Config:

1. **Run** → Edit Configurations → **+** → Python
2. **Name:** `API Service (Debug)`
3. **Script path:** (vacío)
4. **Module name:** `uvicorn`
5. **Parameters:** `app.main:app --reload --port 8000`
6. **Working directory:** `explora/api`
7. **Environment variables:**
   ```
   DATABASE_URL=postgresql+asyncpg://explora:explora123@localhost:5432/explora_dev
   AUTH_SERVICE_URL=http://localhost:8001
   JWT_SECRET=dev_secret_key
   ```
8. **Python interpreter:** `explora/api/venv/bin/python`
9. **Apply**

---

### 🐛 Debugging en PyCharm

1. **Pon breakpoints** en el código (clic en el margen izquierdo)
2. **Ejecuta en modo debug** (icono de bug 🐞)
3. **Haz requests** desde el frontend o con curl
4. **El debugger se detendrá** en tus breakpoints
5. **Inspecciona variables** en la ventana de debug
6. **Step over/into/out** para navegar el código

#### Ejemplo de Breakpoint:

```python
# En auth/app/main.py línea 70
@app.post("/register")
async def register(req: RegisterRequest, session: AsyncSession = Depends(get_session)):
    # PON UN BREAKPOINT AQUÍ ⬇️
    q = select(User).where(User.username == req.username)
    r = await session.exec(q)
    # Inspecciona 'req', 'session', 'r' cuando se detenga
```

---

### 🔄 Hot Reload Automático

Con `--reload` activado:
- ✅ Guardas un archivo Python → **Se reinicia automáticamente**
- ✅ No necesitas detener y reiniciar el servidor
- ✅ Cambios visibles en ~2 segundos

---

## 💻 Desarrollo con VSCode

### Configuración del Workspace

Crea `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Auth Service (Debug)",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["app.main:app", "--reload", "--port", "8001"],
      "cwd": "${workspaceFolder}/auth",
      "env": {
        "DATABASE_URL": "postgresql+asyncpg://explora:explora123@localhost:5432/explora_dev",
        "JWT_SECRET": "dev_secret_key"
      },
      "console": "integratedTerminal"
    },
    {
      "name": "API Service (Debug)",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["app.main:app", "--reload", "--port", "8000"],
      "cwd": "${workspaceFolder}/api",
      "env": {
        "DATABASE_URL": "postgresql+asyncpg://explora:explora123@localhost:5432/explora_dev",
        "AUTH_SERVICE_URL": "http://localhost:8001",
        "JWT_SECRET": "dev_secret_key"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

### Debugging en VSCode

1. Selecciona la configuración en el panel de debug
2. Presiona **F5** o clic en el botón de play verde
3. Pon breakpoints haciendo clic en el margen izquierdo
4. Los breakpoints se detendrán cuando se ejecute el código

---

## 🔄 Flujo de Trabajo Recomendado

### Día a Día (Desarrollo de Features)

```bash
# Día 1: Setup inicial
./scripts/dev-setup.sh

# Todos los días:
# Terminal 1: Base de datos
docker-compose -f docker-compose.dev.yml up -d postgres

# Terminal 2: Auth Service (o PyCharm debug)
cd auth
source venv/bin/activate
uvicorn app.main:app --reload --port 8001

# Terminal 3: API Service (o PyCharm debug)
cd api
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 4: Frontend
cd frontend
npm start

# Navega a http://localhost:4200
```

### Antes de Hacer Commit

```bash
# 1. Detener desarrollo local
# Ctrl+C en todas las terminales

# 2. Probar con Docker Compose (entorno completo)
docker-compose up --build

# 3. Verificar salud de servicios
./scripts/health_check.sh

# 4. Ejecutar tests (si los tienes)
pytest

# 5. Si todo funciona → Commit & Push
git add .
git commit -m "feat: nueva funcionalidad"
git push
```

### Antes de Deploy a Producción

```bash
# 1. Probar en Minikube
./scripts/k8s-deploy.sh

# 2. Verificar pods
kubectl get all -n explora

# 3. Probar la aplicación
minikube service frontend-service -n explora

# 4. Si todo funciona → Deploy a producción
kubectl apply -f k8s/ --context=production
```

---

## 🐛 Debugging Avanzado

### 1. Debugging de Base de Datos

```bash
# Conectarse a PostgreSQL
docker exec -it explora_postgres_dev psql -U explora -d explora_dev

# Ver tablas
\dt

# Ver usuarios
SELECT * FROM user;

# Ver destinos
SELECT * FROM destination;

# Ver reservas
SELECT * FROM reservation;
```

### 2. Debugging de Network Calls

En PyCharm, pon breakpoints en:

```python
# Auth: app/main.py línea 85
@app.post("/token")
async def token(req: TokenRequest, session: AsyncSession = Depends(get_session)):
    # BREAKPOINT AQUÍ
    q = select(User).where(User.username == req.username)
```

```python
# API: app/main.py línea 87
@app.get("/destinations")
async def list_destinations(session: AsyncSession = Depends(get_session)):
    # BREAKPOINT AQUÍ
    result = await session.exec(select(Destination))
```

Luego ejecuta desde el navegador o curl:

```bash
# Test login
curl -X POST http://localhost:8001/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test destinations
curl http://localhost:8000/destinations
```

El debugger se detendrá y podrás inspeccionar todo.

---

## 🧪 Testing

### Tests Unitarios (Ejemplo)

Crea `auth/tests/test_auth.py`:

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_register():
    response = client.post("/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "id" in response.json()
```

Ejecuta:

```bash
cd auth
source venv/bin/activate
pip install pytest httpx
pytest tests/
```

---

## 📊 Resumen de Comandos

| Acción | Comando |
|--------|---------|
| **Setup inicial** | `./scripts/dev-setup.sh` |
| **Iniciar PostgreSQL** | `docker-compose -f docker-compose.dev.yml up -d postgres` |
| **Detener PostgreSQL** | `docker-compose -f docker-compose.dev.yml down` |
| **Ver logs de PostgreSQL** | `docker-compose -f docker-compose.dev.yml logs -f postgres` |
| **Iniciar Auth (dev)** | `cd auth && source venv/bin/activate && uvicorn app.main:app --reload --port 8001` |
| **Iniciar API (dev)** | `cd api && source venv/bin/activate && uvicorn app.main:app --reload --port 8000` |
| **Iniciar Frontend** | `cd frontend && npm start` |
| **Testing completo** | `docker-compose up --build` |
| **Deploy Kubernetes** | `./scripts/k8s-deploy.sh` |

---

## 🎯 Ventajas de Este Setup

| Característica | Desarrollo Local | Docker Compose | Kubernetes |
|---------------|------------------|----------------|------------|
| **Debugger completo** | ✅ Sí | ❌ No | ❌ No |
| **Hot reload** | ✅ Rápido (~2s) | ⚠️ Lento (rebuild) | ❌ No |
| **Breakpoints** | ✅ Sí | ❌ No | ❌ No |
| **Inspeccionar variables** | ✅ Sí | ❌ No | ❌ No |
| **Simula producción** | ❌ No | ✅ Sí | ✅✅ Sí |
| **Auto-scaling** | ❌ No | ❌ No | ✅ Sí |
| **Alta disponibilidad** | ❌ No | ❌ No | ✅ Sí |

---

## 🆘 Troubleshooting

### Puerto 5432 ya está en uso

```bash
# Ver qué proceso usa el puerto
sudo lsof -i :5432

# Opción 1: Detener PostgreSQL local
sudo systemctl stop postgresql

# Opción 2: Usar otro puerto en docker-compose.dev.yml
# Cambiar "5432:5432" a "5433:5432"
# Y en .env.local: DATABASE_URL=...@localhost:5433/explora_dev
```

### Virtualenv no encuentra módulos

```bash
cd auth  # o api
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend no se conecta a API

Verifica que `frontend/src/assets/env.js` tenga:
```javascript
window.__env.API_URL = 'http://localhost:8000';
window.__env.AUTH_URL = 'http://localhost:8001';
```

---

## 📚 Recursos Adicionales

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PyCharm Debugging Guide](https://www.jetbrains.com/help/pycharm/debugging-code.html)
- [VSCode Python Debugging](https://code.visualstudio.com/docs/python/debugging)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

**¿Preguntas?** Revisa el README principal o consulta la documentación en `ARCHITECTURE.md`
