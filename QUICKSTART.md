# 🚀 Guía Rápida - 3 Comandos para 3 Entornos

## 📋 TL;DR

```bash
# DESARROLLO (día a día con debugger)
./scripts/dev-setup.sh

# TESTING (probar antes de commit)
docker-compose up --build

# PRODUCCIÓN (deploy a Kubernetes)
./scripts/k8s-deploy.sh && ./scripts/k8s-apply-ingress.sh
```

---

## 🔧 1. DESARROLLO (Debugging Local)

### ¿Cuándo usar?
- Programar nuevas features
- Debugear con breakpoints
- Hot reload rápido

### Pasos:

```bash
# 1. Setup inicial (solo la primera vez)
./scripts/dev-setup.sh

# 2. Iniciar PostgreSQL
docker-compose -f docker-compose.dev.yml up -d postgres

# 3. Iniciar servicios
# Terminal 1: Auth Service
cd auth && source venv/bin/activate
uvicorn app.main:app --reload --port 8001

# Terminal 2: API Service
cd api && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 3: Frontend
cd frontend
npm start
```

### Acceso:
- **Frontend:** http://localhost:4200
- **API Docs:** http://localhost:8000/docs
- **Auth Docs:** http://localhost:8001/docs

### PyCharm/VSCode:
- Abre el proyecto `auth/` o `api/`
- Usa las configuraciones de debug incluidas
- Pon breakpoints y ejecuta en modo debug 🐞

---

## 🐳 2. TESTING (Docker Compose)

### ¿Cuándo usar?
- Probar integración completa
- Antes de hacer commit
- Simular producción

### Pasos:

```bash
# 1. Construir e iniciar todos los servicios
docker-compose up --build

# 2. Verificar salud (en otra terminal)
./scripts/health_check.sh

# 3. Detener cuando termines
docker-compose down
```

### Acceso:
- **Frontend:** http://localhost:4200
- **API Docs:** http://localhost:8000/docs
- **Auth Docs:** http://localhost:8001/docs

### Comandos útiles:

```bash
# Ver logs
docker-compose logs -f

# Reiniciar un servicio
docker-compose restart frontend

# Limpiar todo y empezar de cero
docker-compose down
sudo rm -rf data/postgres
docker-compose up --build
```

---

## ☸️ 3. PRODUCCIÓN (Kubernetes)

### ¿Cuándo usar?
- Deploy real
- Alta disponibilidad
- Auto-scaling

### Pasos:

```bash
# 1. Deploy completo (construye imágenes y despliega)
./scripts/k8s-deploy.sh

# 2. Aplicar Ingress (solución robusta de networking)
./scripts/k8s-apply-ingress.sh

# 3. Inicializar datos de prueba
./scripts/k8s-init-data.sh

# 4. Obtener URL de acceso
minikube ip
# Usa: http://<IP_DE_MINIKUBE>
```

### Acceso:
- **Aplicación completa:** http://192.168.49.2 (o la IP de Minikube)

### Comandos útiles:

```bash
# Ver estado de todos los recursos
kubectl get all -n explora

# Ver logs
kubectl logs -l app=frontend -n explora
kubectl logs -l app=api -n explora
kubectl logs -l app=auth -n explora

# Reiniciar un deployment
kubectl rollout restart deployment api -n explora

# Troubleshooting completo
./scripts/k8s-troubleshoot.sh
```

---

## 📊 Comparación Rápida

| | DESARROLLO | TESTING | PRODUCCIÓN |
|---|---|---|---|
| **Comando** | `./scripts/dev-setup.sh` | `docker-compose up --build` | `./scripts/k8s-deploy.sh` |
| **Tiempo setup** | ~2 min | ~3 min | ~5 min |
| **Debugger** | ✅ Sí | ❌ No | ❌ No |
| **Hot reload** | ✅ Rápido | ❌ Lento | ❌ No |
| **Simula producción** | ❌ No | ✅ Sí | ✅✅ Sí |
| **URL** | localhost:4200 | localhost:4200 | http://192.168.49.2 |
| **Usa Docker** | Solo PostgreSQL | Todo | Todo + Kubernetes |
| **Cuándo usar** | Día a día | Antes de commit | Deploy real |

---

## 🎯 Flujo de Trabajo Típico

```bash
# Día 1: Desarrollo
./scripts/dev-setup.sh
# → Programas, debugeas, haces cambios

# Antes de commit: Testing
docker-compose up --build
# → Verificas que todo funcione integrado

# Deploy: Producción
./scripts/k8s-deploy.sh && ./scripts/k8s-apply-ingress.sh
# → Despliegas a Kubernetes
```

---

## 🆘 Problemas Comunes

### DESARROLLO: "Module not found"
```bash
cd auth  # o api
source venv/bin/activate
pip install -r requirements.txt
```

### TESTING: "Puerto en uso"
```bash
docker-compose down
sudo lsof -ti:8000 | xargs kill -9
sudo lsof -ti:8001 | xargs kill -9
docker-compose up --build
```

### PRODUCCIÓN: "Pods en CrashLoopBackOff"
```bash
# Ver logs del pod problemático
kubectl logs <nombre-del-pod> -n explora

# Solución común: Reiniciar
kubectl rollout restart deployment <nombre> -n explora
```

---

## 📚 Más Información

- **WORKFLOW.md** - Explicación detallada de los 3 entornos
- **DEVELOPMENT.md** - Guía completa de desarrollo local
- **README-KUBERNETES.md** - Todo sobre Kubernetes
- **DEBUGGING.md** - Cómo debugear problemas

---

## ✅ Credenciales por Defecto

**Todos los entornos:**
- **Usuario:** admin
- **Password:** admin123

**Base de datos (desarrollo local):**
- **Host:** localhost:5432
- **Database:** explora_dev
- **User:** explora
- **Password:** explora123

---

## 🎓 Resumen Ultra-Rápido

```bash
# ¿Quieres PROGRAMAR?
./scripts/dev-setup.sh
cd auth && source venv/bin/activate && uvicorn app.main:app --reload --port 8001

# ¿Quieres PROBAR?
docker-compose up --build

# ¿Quieres DEPLOYAR?
./scripts/k8s-deploy.sh && ./scripts/k8s-apply-ingress.sh
```

**¡Eso es todo! 🚀**
