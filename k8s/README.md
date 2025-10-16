# ☸️ Kubernetes Manifests - Colombia Explora

Este directorio contiene los archivos YAML necesarios para desplegar la aplicación en Kubernetes.

## 📁 Archivos

| Archivo | Descripción | Componentes |
|---------|-------------|-------------|
| `namespace.yaml` | Namespace "explora" | - Namespace<br>- Labels: environment=production |
| `configmap.yaml` | Variables de configuración públicas | - DATABASE_URL<br>- Service URLs<br>- LOG_LEVEL |
| `secrets.yaml` | Variables sensibles (⚠️ cambiar en prod) | - POSTGRES_PASSWORD<br>- JWT_SECRET<br>- ADMIN credentials |
| `postgres-pv.yaml` | Almacenamiento persistente | - PersistentVolume (10Gi)<br>- PersistentVolumeClaim |
| `postgres-deployment.yaml` | Base de datos PostgreSQL | - Deployment (1 réplica)<br>- Service (ClusterIP:5432)<br>- Volume mount |
| `auth-deployment.yaml` | Servicio de autenticación | - Deployment (2 réplicas)<br>- Service (ClusterIP:8001)<br>- Health checks |
| `api-deployment.yaml` | API principal | - Deployment (3 réplicas)<br>- Service (ClusterIP:8000)<br>- Health checks |
| `frontend-deployment.yaml` | Frontend Angular | - Deployment (3 réplicas)<br>- Service (LoadBalancer:80)<br>- Health checks |
| `ingress.yaml` | Routing HTTP/HTTPS | - Ingress nginx<br>- TLS/SSL support<br>- Path-based routing |
| `autoscaler.yaml` | Escalado automático | - HPA para API (2-10 réplicas)<br>- HPA para Auth (2-8)<br>- HPA para Frontend (2-10)<br>- Target: 70% CPU |

## 🚀 Orden de Despliegue

**Opción A: Automático**
```bash
./scripts/k8s-deploy.sh
```

**Opción B: Manual (orden recomendado)**

1. **Namespace y configuración**
   ```bash
   kubectl apply -f namespace.yaml
   kubectl apply -f configmap.yaml
   kubectl apply -f secrets.yaml
   ```

2. **Almacenamiento**
   ```bash
   kubectl apply -f postgres-pv.yaml
   ```

3. **Base de datos**
   ```bash
   kubectl apply -f postgres-deployment.yaml
   kubectl wait --for=condition=ready pod -l app=postgres -n explora --timeout=120s
   ```

4. **Servicios backend**
   ```bash
   kubectl apply -f auth-deployment.yaml
   kubectl apply -f api-deployment.yaml
   kubectl wait --for=condition=ready pod -l app=auth -n explora --timeout=120s
   kubectl wait --for=condition=ready pod -l app=api -n explora --timeout=120s
   ```

5. **Frontend**
   ```bash
   kubectl apply -f frontend-deployment.yaml
   kubectl wait --for=condition=ready pod -l app=frontend -n explora --timeout=120s
   ```

6. **Ingress y Autoscaling (opcional)**
   ```bash
   kubectl apply -f ingress.yaml
   kubectl apply -f autoscaler.yaml
   ```

## 🔍 Verificación

```bash
# Ver todos los recursos
kubectl get all -n explora

# Ver logs
kubectl logs -l app=api -n explora --tail=50

# Ver métricas
kubectl top pods -n explora

# Ver estado del autoscaler
kubectl get hpa -n explora
```

## 🏗️ Arquitectura

```
Internet
   │
   ▼
┌──────────────────────────┐
│  Ingress (nginx)         │
│  colombiaexplora.com     │
└────┬──────────┬──────────┘
     │          │
     │  ┌───────┴──────┐
     │  │              │
     ▼  ▼              ▼
┌────────┐  ┌──────────────┐  ┌──────────────┐
│Frontend│  │   API Svc    │  │  Auth Svc    │
│Service │  │  (ClusterIP) │  │  (ClusterIP) │
│(LB:80) │  │    :8000     │  │    :8001     │
└────┬───┘  └──────┬───────┘  └──────┬───────┘
     │             │                 │
     ▼             ▼                 ▼
┌─────────┐  ┌──────────┐     ┌──────────┐
│Frontend │  │   API    │     │   Auth   │
│  Pods   │  │   Pods   │     │   Pods   │
│(3 répl.)│  │(3 répl.) │     │(2 répl.) │
└─────────┘  └────┬─────┘     └────┬─────┘
                  │                │
                  └────────┬───────┘
                           ▼
                  ┌─────────────────┐
                  │  Postgres Svc   │
                  │   (ClusterIP)   │
                  │     :5432       │
                  └────────┬────────┘
                           ▼
                  ┌─────────────────┐
                  │  Postgres Pod   │
                  │   (1 réplica)   │
                  └────────┬────────┘
                           ▼
                  ┌─────────────────┐
                  │ PersistentVol   │
                  │     (10GB)      │
                  └─────────────────┘
```

## 🎯 Recursos por Pod

| Pod | CPU Request | CPU Limit | Memory Request | Memory Limit | Replicas |
|-----|-------------|-----------|----------------|--------------|----------|
| Frontend | 50m | 100m | 64Mi | 128Mi | 3 (2-10 HPA) |
| API | 100m | 200m | 128Mi | 256Mi | 3 (2-10 HPA) |
| Auth | 100m | 200m | 128Mi | 256Mi | 2 (2-8 HPA) |
| Postgres | 250m | 500m | 256Mi | 512Mi | 1 |

**Total recursos mínimos del cluster**: ~1.5 CPU, ~2GB RAM

## 🔐 Seguridad

### ⚠️ Antes de producción

1. **Cambiar secrets**
   ```bash
   # Generar JWT_SECRET
   openssl rand -hex 32
   
   # Generar POSTGRES_PASSWORD
   openssl rand -base64 32
   ```

2. **Actualizar secrets.yaml**
   ```yaml
   stringData:
     POSTGRES_PASSWORD: "tu-password-seguro"
     JWT_SECRET: "tu-jwt-secret-seguro"
   ```

3. **Aplicar cambios**
   ```bash
   kubectl apply -f secrets.yaml
   kubectl rollout restart deployment -n explora
   ```

### 🔒 Mejores prácticas adicionales

- [ ] Usar **sealed-secrets** o **external-secrets**
- [ ] Implementar **NetworkPolicies** para aislar pods
- [ ] Configurar **RBAC** (Role-Based Access Control)
- [ ] Habilitar **Pod Security Policies**
- [ ] Usar **cert-manager** para SSL automático
- [ ] Implementar **service mesh** (Istio/Linkerd) para tráfico encriptado

## 📊 Monitoreo (Opcional)

### Instalar Prometheus + Grafana

```bash
# Agregar repo de Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Instalar stack de monitoreo
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

# Acceder a Grafana
kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring
# Usuario: admin, Password: prom-operator
```

### Dashboards útiles

- **Cluster Overview**: ID 315
- **Kubernetes Pods**: ID 6417
- **Node Exporter**: ID 1860

## 🌐 Ingress con SSL

### Instalar cert-manager

```bash
# Instalar cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Crear ClusterIssuer para Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: tu-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

## 🔄 CI/CD

### GitHub Actions

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Kubernetes

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build images
      run: |
        docker build -t ${{ secrets.REGISTRY }}/explora-api:${{ github.sha }} ./api
        docker build -t ${{ secrets.REGISTRY }}/explora-auth:${{ github.sha }} ./auth
        docker build -t ${{ secrets.REGISTRY }}/explora-frontend:${{ github.sha }} ./frontend
    
    - name: Push images
      run: |
        echo ${{ secrets.REGISTRY_PASSWORD }} | docker login -u ${{ secrets.REGISTRY_USER }} --password-stdin
        docker push ${{ secrets.REGISTRY }}/explora-api:${{ github.sha }}
        docker push ${{ secrets.REGISTRY }}/explora-auth:${{ github.sha }}
        docker push ${{ secrets.REGISTRY }}/explora-frontend:${{ github.sha }}
    
    - name: Deploy to K8s
      uses: azure/k8s-deploy@v4
      with:
        manifests: |
          k8s/namespace.yaml
          k8s/configmap.yaml
          k8s/secrets.yaml
          k8s/postgres-pv.yaml
          k8s/postgres-deployment.yaml
          k8s/auth-deployment.yaml
          k8s/api-deployment.yaml
          k8s/frontend-deployment.yaml
        images: |
          ${{ secrets.REGISTRY }}/explora-api:${{ github.sha }}
          ${{ secrets.REGISTRY }}/explora-auth:${{ github.sha }}
          ${{ secrets.REGISTRY }}/explora-frontend:${{ github.sha }}
        namespace: explora
```

## 🧹 Limpieza

```bash
# Eliminar todo el namespace (borra todos los recursos)
kubectl delete namespace explora

# O eliminar recursos individuales
kubectl delete -f k8s/
```

## 📚 Recursos Adicionales

- [Guía completa de Kubernetes](../README-KUBERNETES.md)
- [Documentación oficial de Kubernetes](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kubernetes Patterns](https://www.redhat.com/en/resources/oreilly-kubernetes-patterns-cloud-native-apps)

---

*Creado con 🏔️ para Colombia Explora*
