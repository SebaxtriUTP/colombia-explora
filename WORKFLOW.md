# 🎯 ENTORNOS DE TRABAJO - Resumen Ejecutivo

## La Pregunta Clave: "¿Cómo desarrollo y debugeo?"

**TL;DR:** Usa **Desarrollo Local** para programar, **Docker Compose** para testing, **Kubernetes** para producción.

---

## 📊 Comparativa Visual

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          DESARROLLO LOCAL 🔧                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🖥️  Tu Máquina                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                                                                 │     │
│  │  PyCharm/VSCode con Debugger ✅                                 │     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │     │
│  │  │   Auth      │  │    API      │  │  Frontend   │             │     │
│  │  │  (Python    │  │  (Python    │  │  (npm       │             │     │
│  │  │   venv)     │  │   venv)     │  │   start)    │             │     │
│  │  │             │  │             │  │             │             │     │
│  │  │ Port 8001   │  │ Port 8000   │  │ Port 4200   │             │     │
│  │  │             │  │             │  │             │             │     │
│  │  │ BREAKPOINTS │  │ BREAKPOINTS │  │ HOT RELOAD  │             │     │
│  │  │    ✅✅✅   │  │    ✅✅✅   │  │    ✅✅✅   │             │     │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │     │
│  │         │                 │                 │                  │     │
│  │         └─────────────────┴─────────────────┘                  │     │
│  │                           │                                    │     │
│  │                  ┌────────▼────────┐                           │     │
│  │                  │   PostgreSQL    │ ← Solo en Docker          │     │
│  │                  │  (Docker solo)  │                           │     │
│  │                  └─────────────────┘                           │     │
│  │                                                                 │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ✅ Ventajas:                                                            │
│     • Debugger completo (breakpoints, inspeccionar variables)           │
│     • Hot reload instantáneo (~2 segundos)                              │
│     • No necesitas reconstruir contenedores                             │
│     • Desarrollo rápido e iterativo                                     │
│                                                                          │
│  ❌ Desventajas:                                                         │
│     • No simula el entorno de producción exactamente                    │
│     • Requiere Python y Node instalados localmente                      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                         DOCKER COMPOSE 🐳                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🐋 Contenedores                                                         │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │   Docker Network (explora_net)                                 │     │
│  │                                                                 │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │     │
│  │  │   Frontend   │  │     Auth     │  │     API      │         │     │
│  │  │ (Container)  │  │ (Container)  │  │ (Container)  │         │     │
│  │  │ Port: 4200   │  │ Port: 8001   │  │ Port: 8000   │         │     │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │     │
│  │         │                  │                 │                 │     │
│  │         └──────────────────┴─────────────────┘                 │     │
│  │                            │                                   │     │
│  │                   ┌────────▼─────────┐                         │     │
│  │                   │   PostgreSQL     │                         │     │
│  │                   │   (Container)    │                         │     │
│  │                   │   Port: 5432     │                         │     │
│  │                   └──────────────────┘                         │     │
│  │                                                                 │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ✅ Ventajas:                                                            │
│     • Simula entorno de producción                                      │
│     • Todos los servicios juntos                                        │
│     • Fácil de limpiar y reiniciar                                      │
│     • Ideal para testing de integración                                 │
│                                                                          │
│  ❌ Desventajas:                                                         │
│     • NO puedes usar debugger con breakpoints                           │
│     • Rebuild lento (~30 segundos por cambio)                           │
│     • Solo logs para debugging                                          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                           KUBERNETES ☸️                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🎯 Cluster (Minikube / GKE / EKS)                                       │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │   Namespace: explora                                           │     │
│  │                                                                 │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │     │
│  │  │ Frontend │ │ Frontend │ │ Frontend │  (3 replicas)          │     │
│  │  │   Pod    │ │   Pod    │ │   Pod    │                        │     │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘                        │     │
│  │       └────────────┴────────────┘                              │     │
│  │                    │                                           │     │
│  │           ┌────────▼────────┐                                  │     │
│  │           │  LoadBalancer   │                                  │     │
│  │           └─────────────────┘                                  │     │
│  │                                                                 │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │     │
│  │  │   API    │ │   API    │ │   API    │  (3 replicas)          │     │
│  │  │   Pod    │ │   Pod    │ │   Pod    │                        │     │
│  │  └──────────┘ └──────────┘ └──────────┘                        │     │
│  │                                                                 │     │
│  │  ┌──────────┐ ┌──────────┐                                     │     │
│  │  │   Auth   │ │   Auth   │          (2 replicas)               │     │
│  │  │   Pod    │ │   Pod    │                                     │     │
│  │  └──────────┘ └──────────┘                                     │     │
│  │                                                                 │     │
│  │  ┌──────────────────┐                                          │     │
│  │  │   PostgreSQL     │  (PersistentVolume)                      │     │
│  │  │      Pod         │                                          │     │
│  │  └──────────────────┘                                          │     │
│  │                                                                 │     │
│  │  ┌────────────────────────────────────────┐                    │     │
│  │  │  HorizontalPodAutoscaler (HPA)        │                    │     │
│  │  │  • Escala de 2-10 pods según CPU      │                    │     │
│  │  └────────────────────────────────────────┘                    │     │
│  │                                                                 │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ✅ Ventajas:                                                            │
│     • Alta disponibilidad (múltiples replicas)                          │
│     • Auto-scaling automático                                           │
│     • Rolling updates sin downtime                                      │
│     • Health checks automáticos                                         │
│     • Producción real                                                   │
│                                                                          │
│  ❌ Desventajas:                                                         │
│     • NO es para desarrollo diario                                      │
│     • Complejidad de configuración                                      │
│     • Rebuild y deploy lentos                                           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🎬 Flujo de Trabajo Recomendado

```
┌────────────────────────────────────────────────────────────────┐
│  FASE 1: DESARROLLO (Día a día)                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. Escribes código en PyCharm/VSCode                          │
│  2. Pones breakpoints                                          │
│  3. Ejecutas en modo debug                                     │
│  4. Haces requests desde el navegador                          │
│  5. El debugger se detiene → Inspeccionas variables            │
│  6. Modificas el código                                        │
│  7. Hot reload automático (~2s)                                │
│  8. Repites 4-7 hasta que funcione                             │
│                                                                │
│  🔧 Entorno: DESARROLLO LOCAL                                  │
│  📝 Comando: ./scripts/dev-setup.sh                            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│  FASE 2: TESTING (Antes de commit)                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. Detienes el desarrollo local                               │
│  2. Ejecutas: docker-compose up --build                        │
│  3. Pruebas todos los servicios juntos                         │
│  4. Verificas health checks                                    │
│  5. Si algo falla → Vuelves a FASE 1 a debugear                │
│  6. Si todo funciona → Commit & Push                           │
│                                                                │
│  🐳 Entorno: DOCKER COMPOSE                                    │
│  📝 Comando: docker-compose up --build                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────┐
│  FASE 3: DEPLOY (Producción)                                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. Pruebas en Minikube (staging)                              │
│  2. Verificas que todo funciona                                │
│  3. Aplicas a producción (GKE/EKS)                             │
│  4. Kubernetes hace rolling update                             │
│  5. Monitoreas logs y métricas                                 │
│                                                                │
│  ☸️ Entorno: KUBERNETES                                        │
│  📝 Comando: ./scripts/k8s-deploy.sh                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 💡 Respuesta a tu Pregunta

### **¿Cómo debugeo si soy desarrollador?**

**Respuesta:** Usa **DESARROLLO LOCAL** (no Docker, no Kubernetes)

### **Pasos:**

```bash
# 1. Setup inicial (solo una vez)
./scripts/dev-setup.sh

# 2. Abrir PyCharm
# - File → Open → auth/
# - Settings → Python Interpreter → auth/venv/bin/python
# - Run → Edit Configurations → Usar "Auth Service (Debug)"

# 3. Poner breakpoints en el código
# Haz clic en el margen izquierdo, aparece un punto rojo

# 4. Ejecutar en modo Debug (icono de bug 🐞)

# 5. Hacer requests desde el navegador
# El debugger se detendrá en tus breakpoints

# 6. Inspeccionar variables, step over, step into, etc.
```

### **¿Necesito usar port-forward como hicimos antes?**

**NO.** Lo que hicimos antes fue un **workaround temporal** porque:
- El frontend estaba en Kubernetes
- Intentaba comunicarse con `localhost:8000` y `localhost:8001`
- Usamos port-forward para "engañarlo"

**Solución correcta:**
- Frontend en desarrollo local → conecta directo a `localhost:8000`
- Auth y API en desarrollo local → corren en `localhost:8001` y `localhost:8000`
- **No necesitas port-forward** porque todo está en localhost

---

## 📝 Comandos Quick Reference

```bash
# ========================================
# DESARROLLO LOCAL (día a día)
# ========================================
./scripts/dev-setup.sh                          # Setup inicial
docker-compose -f docker-compose.dev.yml up -d  # Solo PostgreSQL

# Auth Service con debug
cd auth && source venv/bin/activate
uvicorn app.main:app --reload --port 8001

# API Service con debug
cd api && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm start

# ========================================
# DOCKER COMPOSE (testing)
# ========================================
docker-compose up --build    # Todos los servicios
./scripts/health_check.sh    # Verificar salud

# ========================================
# KUBERNETES (producción)
# ========================================
./scripts/k8s-deploy.sh      # Deploy completo
kubectl get all -n explora   # Ver estado
```

---

## 🎯 Resumen Final

| Pregunta | Respuesta |
|----------|-----------|
| **¿Cómo debugeo?** | Desarrollo Local con PyCharm/VSCode |
| **¿Necesito Docker para debugear?** | No, solo para PostgreSQL |
| **¿Puedo usar breakpoints?** | Sí, en Desarrollo Local |
| **¿Cuándo uso Docker Compose?** | Testing antes de commit |
| **¿Cuándo uso Kubernetes?** | Deploy a producción |
| **¿Es complicado el setup?** | No, un solo comando: `./scripts/dev-setup.sh` |

---

**📚 Documentación Completa:**
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Guía detallada de desarrollo local
- **[README.md](README.md)** - Guía general del proyecto
- **[README-KUBERNETES.md](README-KUBERNETES.md)** - Guía de Kubernetes

**¿Preguntas?** Todo está documentado en esos 3 archivos.
