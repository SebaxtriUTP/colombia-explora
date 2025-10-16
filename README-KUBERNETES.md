# 🏔️ Colombia Explora - Guía de Kubernetes

> **Para principiantes**: Esta guía está diseñada para personas sin experiencia previa en Kubernetes. Todo se explica paso a paso.

## 📚 Tabla de Contenidos

- [¿Qué es Kubernetes?](#qué-es-kubernetes)
- [Prerrequisitos](#prerrequisitos)
- [Conceptos Básicos](#conceptos-básicos)
- [Instalación Local (Minikube)](#instalación-local-minikube)
- [Despliegue Automático](#despliegue-automático)
- [Despliegue Manual](#despliegue-manual)
- [Verificación y Monitoreo](#verificación-y-monitoreo)
- [Comandos Útiles](#comandos-útiles)
- [Escalado y Autoscaling](#escalado-y-autoscaling)
- [Troubleshooting](#troubleshooting)
- [Despliegue en la Nube](#despliegue-en-la-nube)
- [Limpieza](#limpieza)

---

## 🤔 ¿Qué es Kubernetes?

**Kubernetes (K8s)** es un sistema de orquestación de contenedores. Imagina que Docker Compose es para tu laptop, y Kubernetes es para producción con múltiples servidores.

### Docker Compose vs Kubernetes

| Característica | Docker Compose | Kubernetes |
|----------------|----------------|------------|
| **Escalabilidad** | 1 servidor | Múltiples servidores (cluster) |
| **Alta disponibilidad** | ❌ No | ✅ Sí (si un pod muere, se crea otro) |
| **Auto-healing** | ❌ No | ✅ Sí (reinicia automáticamente) |
| **Escalado automático** | ❌ Manual | ✅ Automático (HPA) |
| **Load Balancing** | ⚠️ Básico | ✅ Avanzado |
| **Rolling Updates** | ❌ Downtime | ✅ Zero-downtime |
| **Uso típico** | Desarrollo local | Producción |

### ¿Cuándo usar Kubernetes?

- ✅ **Producción con alta demanda**: Miles de usuarios simultáneos
- ✅ **Necesitas alta disponibilidad**: 99.9% uptime
- ✅ **Escalado automático**: Más usuarios = más servidores automáticamente
- ✅ **Múltiples entornos**: Dev, Staging, Production
- ❌ **Solo desarrollo local**: Usa Docker Compose (más simple)
- ❌ **Proyecto pequeño**: Kubernetes puede ser overkill

---

## 📋 Prerrequisitos

### 1. **Docker** (ya lo tienes instalado)
```bash
docker --version
# Docker version 20.10+ required
```

### 2. **kubectl** (cliente de Kubernetes)
```bash
# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verificar instalación
kubectl version --client
```

### 3. **Minikube** (para desarrollo local)
```bash
# Linux
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Verificar instalación
minikube version
```

---

## 🧩 Conceptos Básicos

### Arquitectura de Kubernetes

```
┌─────────────────────────────────────────────────────────────┐
│                      KUBERNETES CLUSTER                      │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                     NAMESPACE: explora                 │  │
│  │                                                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │   Frontend   │  │     API      │  │    Auth     │ │  │
│  │  │  Deployment  │  │  Deployment  │  │ Deployment  │ │  │
│  │  │              │  │              │  │             │ │  │
│  │  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌───────┐ │ │  │
│  │  │  │ Pod 1  │  │  │  │ Pod 1  │  │  │  │ Pod 1 │ │ │  │
│  │  │  └────────┘  │  │  └────────┘  │  │  └───────┘ │ │  │
│  │  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌───────┐ │ │  │
│  │  │  │ Pod 2  │  │  │  │ Pod 2  │  │  │  │ Pod 2 │ │ │  │
│  │  │  └────────┘  │  │  └────────┘  │  │  └───────┘ │ │  │
│  │  │  ┌────────┐  │  │  ┌────────┐  │  │            │ │  │
│  │  │  │ Pod 3  │  │  │  │ Pod 3  │  │  │            │ │  │
│  │  │  └────────┘  │  │  └────────┘  │  │            │ │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │  │
│  │         │                   │                 │       │  │
│  │         ▼                   ▼                 ▼       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │   Service    │  │   Service    │  │   Service   │ │  │
│  │  │ LoadBalancer │  │  ClusterIP   │  │  ClusterIP  │ │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │  │
│  │                                                         │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │              PostgreSQL Deployment                │ │  │
│  │  │  ┌────────┐                                       │ │  │
│  │  │  │  Pod   │  ← PersistentVolume (10GB)           │ │  │
│  │  │  └────────┘                                       │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                                                         │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │          Ingress (nginx)                         │ │  │
│  │  │  colombiaexplora.com → Frontend                  │ │  │
│  │  │  colombiaexplora.com/api → API                   │ │  │
│  │  │  colombiaexplora.com/auth → Auth                 │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### Componentes Principales

#### 1. **Pod** 🐳
- **¿Qué es?** La unidad más pequeña. Contiene 1 o más contenedores Docker.
- **Analogía**: Un pod es como una casa donde vive tu aplicación.
- **Ejemplo**: Un pod del frontend contiene el contenedor nginx con Angular.

#### 2. **Deployment** 📦
- **¿Qué es?** Define cuántas réplicas (copias) de un pod quieres.
- **Analogía**: Un constructor que crea y mantiene casas idénticas.
- **Ejemplo**: `replicas: 3` → Kubernetes crea 3 pods idénticos del API.

#### 3. **Service** 🌐
- **¿Qué es?** Da una IP y DNS estables para acceder a los pods.
- **Analogía**: Como una dirección postal permanente, aunque las casas cambien.
- **Tipos**:
  - **ClusterIP**: Solo accesible dentro del cluster (backend)
  - **LoadBalancer**: Accesible desde internet (frontend)
  - **NodePort**: Expone en un puerto específico

#### 4. **ConfigMap** ⚙️
- **¿Qué es?** Variables de configuración NO sensibles.
- **Analogía**: Un archivo de configuración público.
- **Ejemplo**: `DATABASE_URL`, `LOG_LEVEL=info`

#### 5. **Secret** 🔐
- **¿Qué es?** Variables sensibles (contraseñas, tokens).
- **Analogía**: Una caja fuerte para guardar secretos.
- **Ejemplo**: `POSTGRES_PASSWORD`, `JWT_SECRET`

#### 6. **PersistentVolume (PV)** 💾
- **¿Qué es?** Almacenamiento permanente para datos.
- **Analogía**: Un disco duro externo que sobrevive aunque el contenedor muera.
- **Ejemplo**: Los datos de PostgreSQL (10GB).

#### 7. **Ingress** 🚪
- **¿Qué es?** Enrutador HTTP/HTTPS que dirige tráfico a servicios.
- **Analogía**: Un portero que decide a qué casa va cada visitante.
- **Ejemplo**: `colombiaexplora.com/api` → api-service

#### 8. **HorizontalPodAutoscaler (HPA)** 📈
- **¿Qué es?** Escala automáticamente según CPU/memoria.
- **Analogía**: Contrata más trabajadores cuando hay más trabajo.
- **Ejemplo**: Si CPU > 70%, crea más pods (hasta 10).

---

## 🚀 Instalación Local (Minikube)

### 1. Iniciar Minikube

```bash
# Iniciar cluster con recursos adecuados
minikube start --cpus=4 --memory=8192 --disk-size=20g

# Verificar estado
minikube status

# Debería mostrar:
# minikube
# type: Control Plane
# host: Running
# kubelet: Running
# apiserver: Running
```

### 2. Habilitar addons necesarios

```bash
# Habilitar Ingress (para routing)
minikube addons enable ingress

# Habilitar metrics-server (para autoscaling)
minikube addons enable metrics-server

# Verificar addons
minikube addons list
```

### 3. Configurar Docker para usar Minikube

```bash
# Esto permite que Minikube use las imágenes locales
eval $(minikube docker-env)

# Ahora cuando hagas 'docker build', las imágenes estarán en Minikube
```

---

## ⚡ Despliegue Automático

### Opción A: Script de despliegue completo

```bash
# Ejecutar el script automatizado
./scripts/k8s-deploy.sh
```

Este script:
1. ✅ Verifica que kubectl esté instalado
2. ✅ Construye las imágenes Docker
3. ✅ Carga las imágenes en Minikube
4. ✅ Crea el namespace
5. ✅ Aplica ConfigMaps y Secrets
6. ✅ Despliega PostgreSQL con volumen persistente
7. ✅ Despliega Auth y API
8. ✅ Despliega Frontend
9. ✅ Configura autoscaling (opcional)
10. ✅ Muestra URLs de acceso

---

## 🔧 Despliegue Manual

### Paso 1: Construir imágenes Docker

```bash
# Asegúrate de estar usando el Docker de Minikube
eval $(minikube docker-env)

# Construir imágenes
docker build -t explora-auth:latest ./auth
docker build -t explora-api:latest ./api
docker build -t explora-frontend:latest ./frontend

# Verificar imágenes
docker images | grep explora
```

### Paso 2: Crear namespace

```bash
kubectl apply -f k8s/namespace.yaml

# Verificar
kubectl get namespaces
```

### Paso 3: Aplicar configuración

```bash
# ConfigMap (variables públicas)
kubectl apply -f k8s/configmap.yaml

# Secrets (contraseñas)
kubectl apply -f k8s/secrets.yaml

# Verificar
kubectl get configmap -n explora
kubectl get secrets -n explora
```

### Paso 4: Crear volumen persistente

```bash
kubectl apply -f k8s/postgres-pv.yaml

# Verificar
kubectl get pv
kubectl get pvc -n explora
```

### Paso 5: Desplegar PostgreSQL

```bash
kubectl apply -f k8s/postgres-deployment.yaml

# Esperar a que esté listo
kubectl wait --for=condition=ready pod -l app=postgres -n explora --timeout=120s

# Verificar
kubectl get pods -n explora -l app=postgres
```

### Paso 6: Desplegar servicios backend

```bash
# Auth service
kubectl apply -f k8s/auth-deployment.yaml

# API service
kubectl apply -f k8s/api-deployment.yaml

# Esperar a que estén listos
kubectl wait --for=condition=ready pod -l app=auth -n explora --timeout=120s
kubectl wait --for=condition=ready pod -l app=api -n explora --timeout=120s

# Verificar
kubectl get pods -n explora
```

### Paso 7: Desplegar frontend

```bash
kubectl apply -f k8s/frontend-deployment.yaml

# Esperar
kubectl wait --for=condition=ready pod -l app=frontend -n explora --timeout=120s

# Verificar
kubectl get pods -n explora
```

### Paso 8: (Opcional) Habilitar autoscaling

```bash
kubectl apply -f k8s/autoscaler.yaml

# Verificar
kubectl get hpa -n explora
```

### Paso 9: Acceder a la aplicación

```bash
# Minikube crea un túnel para acceder al LoadBalancer
minikube service frontend-service -n explora

# O manualmente:
minikube service frontend-service -n explora --url
# Luego abre esa URL en tu navegador
```

---

## 🔍 Verificación y Monitoreo

### Ver todos los recursos

```bash
# Ver todo en el namespace explora
kubectl get all -n explora

# Salida esperada:
# NAME                            READY   STATUS    RESTARTS   AGE
# pod/api-xxx                     1/1     Running   0          5m
# pod/auth-xxx                    1/1     Running   0          5m
# pod/frontend-xxx                1/1     Running   0          5m
# pod/postgres-xxx                1/1     Running   0          5m
#
# NAME                       TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)
# service/api-service        ClusterIP      10.96.100.10     <none>        8000/TCP
# service/auth-service       ClusterIP      10.96.100.11     <none>        8001/TCP
# service/frontend-service   LoadBalancer   10.96.100.12     <pending>     80:30080/TCP
# service/postgres-service   ClusterIP      10.96.100.13     <none>        5432/TCP
```

### Ver logs de un pod

```bash
# Listar pods
kubectl get pods -n explora

# Ver logs (reemplaza <pod-name> con el nombre real)
kubectl logs -f api-6b7c8d9f4-abc12 -n explora

# Ver logs de todos los pods del API
kubectl logs -l app=api -n explora --tail=50
```

### Ver estado detallado

```bash
# Describir un pod (muestra eventos, recursos, etc.)
kubectl describe pod <pod-name> -n explora

# Ver métricas de uso
kubectl top pods -n explora
kubectl top nodes
```

### Acceder a un pod (debugging)

```bash
# Ejecutar bash dentro de un pod
kubectl exec -it <pod-name> -n explora -- /bin/bash

# Ejemplo: Ver variables de entorno
kubectl exec -it api-6b7c8d9f4-abc12 -n explora -- env | grep DATABASE
```

---

## 📊 Escalado y Autoscaling

### Escalado Manual

```bash
# Escalar el API a 5 réplicas
kubectl scale deployment api --replicas=5 -n explora

# Escalar el frontend a 1 réplica
kubectl scale deployment frontend --replicas=1 -n explora

# Ver el escalado en tiempo real
kubectl get pods -n explora -w
```

### Autoscaling Automático (HPA)

El HPA ya está configurado en `k8s/autoscaler.yaml`:

```bash
# Ver estado del autoscaler
kubectl get hpa -n explora

# Salida:
# NAME       REFERENCE          TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
# api-hpa    Deployment/api     45%/70%   2         10        3          10m
# auth-hpa   Deployment/auth    30%/70%   2         8         2          10m
```

**¿Cómo funciona?**
- Si CPU > 70%, crea más pods (hasta el máximo)
- Si CPU < 70%, elimina pods (hasta el mínimo)
- Revisa cada 15 segundos

### Simular carga (testing autoscaling)

```bash
# Instalar herramienta de stress test
kubectl run -it --rm load-generator --image=busybox -n explora -- /bin/sh

# Dentro del pod, genera peticiones
while true; do wget -q -O- http://api-service:8000/destinations; done

# En otra terminal, observa el autoscaling
kubectl get hpa -n explora -w
```

---

## 🔧 Troubleshooting

### ❌ Pod en estado CrashLoopBackOff

```bash
# Ver logs del pod
kubectl logs <pod-name> -n explora

# Ver eventos del pod
kubectl describe pod <pod-name> -n explora

# Causas comunes:
# - Variables de entorno incorrectas (revisa ConfigMap/Secret)
# - Base de datos no disponible (revisa postgres pod)
# - Puerto incorrecto en el código
```

### ❌ ImagePullBackOff

```bash
# Causa: Kubernetes no encuentra la imagen Docker

# Solución para Minikube:
eval $(minikube docker-env)
docker build -t explora-api:latest ./api

# Verifica que la imagen esté en Minikube:
minikube ssh
docker images | grep explora
exit

# En el YAML, asegúrate de usar imagePullPolicy: Never
```

### ❌ Pods no se comunican entre sí

```bash
# Probar conectividad interna
kubectl run test-pod --image=busybox -n explora --rm -it -- /bin/sh

# Dentro del pod:
nslookup postgres-service
wget -O- http://api-service:8000/health

# Si falla, revisa los Services:
kubectl get svc -n explora
```

### ❌ No puedo acceder desde el navegador

```bash
# Para Minikube, usa el servicio:
minikube service frontend-service -n explora

# O configura port-forward:
kubectl port-forward svc/frontend-service 8080:80 -n explora
# Luego abre http://localhost:8080
```

### ❌ Autoscaler no funciona

```bash
# Verificar metrics-server
kubectl top nodes
kubectl top pods -n explora

# Si falla, habilita el addon:
minikube addons enable metrics-server

# Espera 1-2 minutos y vuelve a intentar
```

---

## ☁️ Despliegue en la Nube

### Google Kubernetes Engine (GKE)

```bash
# 1. Instalar gcloud CLI
curl https://sdk.cloud.google.com | bash

# 2. Autenticarse
gcloud auth login

# 3. Crear proyecto
gcloud projects create explora-colombia --name="Colombia Explora"
gcloud config set project explora-colombia

# 4. Crear cluster
gcloud container clusters create explora-cluster \
  --num-nodes=3 \
  --machine-type=e2-medium \
  --zone=us-central1-a

# 5. Configurar kubectl
gcloud container clusters get-credentials explora-cluster --zone=us-central1-a

# 6. Subir imágenes a Google Container Registry
docker tag explora-api:latest gcr.io/explora-colombia/api:latest
docker push gcr.io/explora-colombia/api:latest

# 7. Actualizar los YAML para usar gcr.io/explora-colombia/...

# 8. Desplegar
kubectl apply -f k8s/
```

### Amazon EKS

```bash
# 1. Instalar eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# 2. Crear cluster
eksctl create cluster \
  --name explora-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3

# 3. Subir imágenes a ECR
aws ecr create-repository --repository-name explora-api
docker tag explora-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/explora-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/explora-api:latest

# 4. Desplegar
kubectl apply -f k8s/
```

### Azure AKS

```bash
# 1. Instalar Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# 2. Login
az login

# 3. Crear grupo de recursos
az group create --name explora-rg --location eastus

# 4. Crear cluster
az aks create \
  --resource-group explora-rg \
  --name explora-cluster \
  --node-count 3 \
  --node-vm-size Standard_B2s \
  --generate-ssh-keys

# 5. Configurar kubectl
az aks get-credentials --resource-group explora-rg --name explora-cluster

# 6. Subir imágenes a ACR
az acr create --resource-group explora-rg --name exploraregistry --sku Basic
docker tag explora-api:latest exploraregistry.azurecr.io/api:latest
docker push exploraregistry.azurecr.io/api:latest

# 7. Desplegar
kubectl apply -f k8s/
```

---

## 📝 Comandos Útiles (Cheat Sheet)

### Gestión de Pods

```bash
# Listar todos los pods
kubectl get pods -n explora

# Ver pods con más detalles
kubectl get pods -n explora -o wide

# Ver logs en tiempo real
kubectl logs -f <pod-name> -n explora

# Ver logs de todos los pods de un deployment
kubectl logs -l app=api -n explora --tail=100

# Ejecutar comando en un pod
kubectl exec -it <pod-name> -n explora -- /bin/bash

# Reiniciar un deployment
kubectl rollout restart deployment api -n explora
```

### Gestión de Services

```bash
# Listar servicios
kubectl get svc -n explora

# Ver detalles de un servicio
kubectl describe svc api-service -n explora

# Port-forward (acceso local)
kubectl port-forward svc/api-service 8000:8000 -n explora
```

### Gestión de Deployments

```bash
# Listar deployments
kubectl get deployments -n explora

# Escalar manualmente
kubectl scale deployment api --replicas=5 -n explora

# Ver historial de despliegues
kubectl rollout history deployment api -n explora

# Rollback a versión anterior
kubectl rollout undo deployment api -n explora
```

### Debugging

```bash
# Ver eventos del cluster
kubectl get events -n explora --sort-by='.lastTimestamp'

# Ver recursos consumidos
kubectl top pods -n explora
kubectl top nodes

# Describir un recurso (muy útil)
kubectl describe pod <pod-name> -n explora
kubectl describe deployment api -n explora
```

### Gestión de ConfigMaps y Secrets

```bash
# Ver ConfigMaps
kubectl get configmap -n explora
kubectl describe configmap app-config -n explora

# Ver Secrets
kubectl get secrets -n explora
kubectl get secret app-secrets -n explora -o yaml

# Editar ConfigMap (se actualiza automáticamente)
kubectl edit configmap app-config -n explora
```

### Limpieza

```bash
# Eliminar un deployment específico
kubectl delete deployment api -n explora

# Eliminar todos los recursos del namespace
kubectl delete all --all -n explora

# Eliminar el namespace completo (cuidado!)
kubectl delete namespace explora
```

---

## 🧹 Limpieza

### Detener Minikube

```bash
# Pausar Minikube (conserva el estado)
minikube pause

# Reanudar
minikube unpause

# Detener completamente
minikube stop

# Eliminar el cluster (borra todo)
minikube delete
```

### Eliminar recursos de Kubernetes

```bash
# Eliminar solo el namespace explora (elimina todo dentro)
kubectl delete namespace explora

# Eliminar recursos específicos
kubectl delete -f k8s/frontend-deployment.yaml
kubectl delete -f k8s/api-deployment.yaml
kubectl delete -f k8s/auth-deployment.yaml
kubectl delete -f k8s/postgres-deployment.yaml
kubectl delete -f k8s/postgres-pv.yaml
kubectl delete -f k8s/configmap.yaml
kubectl delete -f k8s/secrets.yaml
kubectl delete -f k8s/namespace.yaml
```

---

## 📚 Recursos Adicionales

### Documentación Oficial

- **Kubernetes Docs**: https://kubernetes.io/docs/
- **kubectl Cheat Sheet**: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
- **Minikube Docs**: https://minikube.sigs.k8s.io/docs/

### Tutoriales Interactivos

- **Katacoda**: https://www.katacoda.com/courses/kubernetes
- **Play with Kubernetes**: https://labs.play-with-k8s.com/

### Herramientas Útiles

- **k9s**: Terminal UI para Kubernetes - https://k9scli.io/
- **Lens**: IDE gráfico para Kubernetes - https://k8slens.dev/
- **kubectx/kubens**: Cambiar rápido entre contextos - https://github.com/ahmetb/kubectx

---

## ❓ FAQ

### ¿Por qué Minikube y no Docker Desktop Kubernetes?

Minikube es más ligero y fácil de configurar. Docker Desktop K8s también funciona, pero consume más recursos.

### ¿Cuánta RAM necesito?

- **Mínimo**: 8GB RAM en tu laptop
- **Recomendado**: 16GB RAM para trabajar cómodamente

### ¿Kubernetes en producción es diferente?

Sí, en producción usarías:
- **Imágenes** en un registry (GCR, ECR, ACR, Docker Hub)
- **LoadBalancer** real (no Minikube tunnel)
- **PersistentVolumes** con almacenamiento de red (no hostPath)
- **Ingress** con certificados SSL reales (Let's Encrypt)
- **Monitoreo** con Prometheus + Grafana
- **CI/CD** con GitHub Actions, GitLab CI, Jenkins

### ¿Cuánto cuesta Kubernetes en la nube?

- **GKE**: ~$74/mes (cluster) + ~$30/nodo (total ~$164/mes para 3 nodos)
- **EKS**: ~$72/mes (cluster) + ~$30/nodo (total ~$162/mes para 3 nodos)
- **AKS**: Gratis (cluster) + ~$30/nodo (total ~$90/mes para 3 nodos)

**Tip**: Usa free tier o créditos gratuitos ($300 en GCP, $200 en Azure)

### ¿Puedo usar esto en mi servidor personal?

Sí, con **kubeadm** puedes instalar Kubernetes en un servidor bare-metal. Pero es complejo. Para servidores pequeños, Docker Compose es más simple.

---

## 🎉 ¡Felicidades!

Has completado la configuración de Kubernetes para Colombia Explora. Ahora tienes:

- ✅ Aplicación corriendo en un cluster de Kubernetes
- ✅ Alta disponibilidad (múltiples réplicas)
- ✅ Auto-healing (reinicio automático)
- ✅ Escalado automático (HPA)
- ✅ Configuración lista para producción

**Next steps:**
1. Experimenta con el autoscaling
2. Practica con los comandos kubectl
3. Simula fallos (elimina un pod y ve cómo se recrea)
4. Explora herramientas gráficas como Lens o k9s

---

*Creado con 🏔️ para Colombia Explora*
