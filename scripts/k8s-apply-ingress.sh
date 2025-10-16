#!/bin/bash

# Script para aplicar Ingress y reconfigurar la aplicación en Kubernetes
# Resuelve el problema de los puertos de forma profesional

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "============================================"
echo -e "${BLUE}🔄 Reconfigurando Kubernetes con Ingress${NC}"
echo "============================================"
echo ""

# Verificar que el addon de ingress está habilitado
echo -e "${BLUE}1. Verificando Ingress Controller...${NC}"
if ! kubectl get pods -n ingress-nginx &>/dev/null; then
    echo -e "${YELLOW}⚠️  Ingress addon no está habilitado${NC}"
    echo "Habilitando ingress addon..."
    minikube addons enable ingress
    echo "Esperando a que el ingress controller esté listo..."
    kubectl wait --namespace ingress-nginx \
      --for=condition=ready pod \
      --selector=app.kubernetes.io/component=controller \
      --timeout=120s
fi
echo -e "${GREEN}✓${NC} Ingress controller activo"
echo ""

# Reconstruir frontend con la nueva configuración de env.js
echo -e "${BLUE}2. Reconstruyendo imagen del frontend...${NC}"
echo "  (Actualizando env.js con detección automática de entorno)"
cd "$(dirname "$0")/.."
eval $(minikube docker-env)
docker build -t explora-frontend:latest ./frontend
echo -e "${GREEN}✓${NC} Frontend reconstruido con nuevo env.js"
echo ""

# Aplicar el Ingress
echo -e "${BLUE}3. Aplicando Ingress...${NC}"
kubectl apply -f k8s/ingress.yaml
echo -e "${GREEN}✓${NC} Ingress creado"
echo ""

# Actualizar el frontend service (de LoadBalancer a ClusterIP)
echo -e "${BLUE}4. Actualizando Frontend Service...${NC}"
kubectl apply -f k8s/frontend-deployment.yaml
echo "Esperando a que los pods se actualicen..."
kubectl rollout restart deployment frontend -n explora
kubectl wait --for=condition=ready pod -l app=frontend -n explora --timeout=120s
echo -e "${GREEN}✓${NC} Frontend actualizado"
echo ""

# Esperar a que el Ingress tenga una IP
echo -e "${BLUE}5. Esperando dirección IP del Ingress...${NC}"
for i in {1..30}; do
    INGRESS_IP=$(kubectl get ingress explora-ingress -n explora -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    if [ -n "$INGRESS_IP" ]; then
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

if [ -z "$INGRESS_IP" ]; then
    echo -e "${YELLOW}⚠️  No se pudo obtener la IP automáticamente${NC}"
    echo "Obteniendo IP de Minikube..."
    INGRESS_IP=$(minikube ip)
fi

echo -e "${GREEN}✓${NC} Ingress IP: $INGRESS_IP"
echo ""

# Mostrar resumen
echo "============================================"
echo -e "${GREEN}✅ Configuración completada!${NC}"
echo "============================================"
echo ""
echo -e "${BLUE}🌐 URL de acceso:${NC}"
echo "  http://$INGRESS_IP"
echo ""
echo -e "${BLUE}📋 Cómo funciona:${NC}"
echo "  • Frontend:  http://$INGRESS_IP/"
echo "  • API:       http://$INGRESS_IP/api/*"
echo "  • Auth:      http://$INGRESS_IP/auth/*"
echo ""
echo "  El frontend detecta automáticamente que está en"
echo "  Kubernetes y usa rutas relativas (/api, /auth)"
echo ""
echo -e "${BLUE}🔍 Verificar estado:${NC}"
echo "  kubectl get ingress -n explora"
echo "  kubectl get pods -n explora"
echo ""
echo -e "${BLUE}🐛 Ver logs:${NC}"
echo "  kubectl logs -l app=frontend -n explora"
echo "  kubectl logs -l app=api -n explora"
echo ""
echo -e "${GREEN}¡Listo! Accede a http://$INGRESS_IP${NC}"
echo "============================================"
echo ""
