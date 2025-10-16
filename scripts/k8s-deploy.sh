#!/bin/bash

# 🚀 Script de Despliegue de Kubernetes para Colombia Explora
# Este script despliega toda la aplicación en un cluster de Kubernetes

set -e  # Exit on error

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "============================================"
echo -e "${BLUE}🏔️  Colombia Explora - Kubernetes Deployment${NC}"
echo "============================================"
echo ""

# Función para imprimir pasos
step() {
    echo -e "${GREEN}►${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar que kubectl esté instalado
step "Verificando kubectl..."
if ! command -v kubectl &> /dev/null; then
    error "kubectl no está instalado. Por favor instala kubectl primero."
    echo "  Instalación: https://kubernetes.io/docs/tasks/tools/"
    exit 1
fi

echo "  ✓ kubectl $(kubectl version --client --short 2>/dev/null || kubectl version --client)"
echo ""

# Verificar conexión al cluster
step "Verificando conexión al cluster..."
if ! kubectl cluster-info &> /dev/null; then
    error "No se puede conectar al cluster de Kubernetes."
    echo "  Asegúrate de tener un cluster corriendo (minikube, kind, o cloud)"
    exit 1
fi

echo "  ✓ Cluster conectado"
kubectl cluster-info | head -2
echo ""

# Construir imágenes Docker localmente
step "Construyendo imágenes Docker..."
echo "  Esto puede tomar varios minutos..."

docker build -t explora-auth:latest ./auth
docker build -t explora-api:latest ./api
docker build -t explora-frontend:latest ./frontend

echo "  ✓ Imágenes construidas"
echo ""

# Si estás usando minikube, carga las imágenes
if kubectl config current-context | grep -q "minikube"; then
    step "Cargando imágenes en minikube..."
    minikube image load explora-auth:latest
    minikube image load explora-api:latest
    minikube image load explora-frontend:latest
    echo "  ✓ Imágenes cargadas en minikube"
    echo ""
fi

# Crear namespace
step "Creando namespace..."
kubectl apply -f k8s/namespace.yaml
echo ""

# Aplicar ConfigMaps y Secrets
step "Aplicando ConfigMaps y Secrets..."
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
echo ""

# Crear volumen persistente
step "Creando volumen persistente para PostgreSQL..."
kubectl apply -f k8s/postgres-pv.yaml
echo ""

# Desplegar PostgreSQL
step "Desplegando PostgreSQL..."
kubectl apply -f k8s/postgres-deployment.yaml
echo "  Esperando a que PostgreSQL esté listo..."
kubectl wait --for=condition=ready pod -l app=postgres -n explora --timeout=120s
echo "  ✓ PostgreSQL listo"
echo ""

# Desplegar servicios backend
step "Desplegando servicios backend..."
kubectl apply -f k8s/auth-deployment.yaml
kubectl apply -f k8s/api-deployment.yaml
echo "  Esperando a que los servicios estén listos..."
kubectl wait --for=condition=ready pod -l app=auth -n explora --timeout=120s
kubectl wait --for=condition=ready pod -l app=api -n explora --timeout=120s
echo "  ✓ Backend desplegado"
echo ""

# Desplegar frontend
step "Desplegando frontend..."
kubectl apply -f k8s/frontend-deployment.yaml
echo "  Esperando a que el frontend esté listo..."
kubectl wait --for=condition=ready pod -l app=frontend -n explora --timeout=120s
echo "  ✓ Frontend desplegado"
echo ""

# Aplicar autoscalers (opcional)
read -p "¿Deseas habilitar el escalado automático? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    step "Aplicando autoscalers..."
    kubectl apply -f k8s/autoscaler.yaml
    echo "  ✓ Autoscalers configurados"
    echo ""
fi

# Mostrar estado del despliegue
step "Estado del despliegue:"
echo ""
kubectl get all -n explora
echo ""

# Obtener URL de acceso
step "URLs de acceso:"
echo ""

if kubectl config current-context | grep -q "minikube"; then
    echo "  🌐 Ejecuta: minikube service frontend-service -n explora"
    echo "  Esto abrirá el navegador con la URL correcta"
else
    EXTERNAL_IP=$(kubectl get svc frontend-service -n explora -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    if [ "$EXTERNAL_IP" = "pending" ] || [ -z "$EXTERNAL_IP" ]; then
        echo "  ⏳ La IP externa está pendiente..."
        echo "  Ejecuta: kubectl get svc frontend-service -n explora --watch"
    else
        echo "  🌐 Frontend: http://$EXTERNAL_IP"
    fi
fi

echo ""
echo "============================================"
echo -e "${GREEN}✅ Despliegue completado!${NC}"
echo "============================================"
echo ""
echo "📝 Comandos útiles:"
echo "  • Ver pods:          kubectl get pods -n explora"
echo "  • Ver servicios:     kubectl get svc -n explora"
echo "  • Ver logs:          kubectl logs -f <pod-name> -n explora"
echo "  • Escalar manualmente: kubectl scale deployment api --replicas=5 -n explora"
echo "  • Eliminar todo:     kubectl delete namespace explora"
echo ""
echo -e "${BLUE}¡Feliz orquestación con Kubernetes! 🚀🏔️${NC}"
echo "============================================"
echo ""
