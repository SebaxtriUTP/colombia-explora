#!/bin/bash

# 🔍 Script de Troubleshooting para Kubernetes - Colombia Explora
# Este script te ayuda a diagnosticar problemas comunes

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

NAMESPACE="explora"

echo ""
echo "============================================"
echo -e "${BLUE}🔍 Kubernetes Troubleshooting - Colombia Explora${NC}"
echo "============================================"
echo ""

# Función para imprimir secciones
section() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo ""
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar que kubectl esté instalado
if ! command -v kubectl &> /dev/null; then
    error "kubectl no está instalado"
    exit 1
fi

# Verificar conexión al cluster
if ! kubectl cluster-info &> /dev/null; then
    error "No se puede conectar al cluster de Kubernetes"
    exit 1
fi

section "1. Estado General del Cluster"

info "Información del cluster:"
kubectl cluster-info | head -3

echo ""
info "Nodos del cluster:"
kubectl get nodes -o wide

echo ""
info "Uso de recursos de los nodos:"
kubectl top nodes 2>/dev/null || warn "metrics-server no está instalado (necesario para autoscaling)"

section "2. Estado del Namespace '$NAMESPACE'"

if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    error "El namespace '$NAMESPACE' no existe"
    echo "  Ejecuta: kubectl apply -f k8s/namespace.yaml"
else
    info "Namespace existe ✓"
fi

echo ""
info "Todos los recursos en el namespace:"
kubectl get all -n $NAMESPACE

section "3. Estado de los Pods"

info "Pods en el namespace:"
kubectl get pods -n $NAMESPACE -o wide

echo ""
info "Pods NO READY:"
NOT_READY=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase!=Running,status.phase!=Succeeded 2>/dev/null | tail -n +2)
if [ -z "$NOT_READY" ]; then
    echo "  ✓ Todos los pods están en estado Running"
else
    warn "Pods problemáticos:"
    echo "$NOT_READY"
fi

echo ""
info "Pods con reinicios:"
RESTARTED=$(kubectl get pods -n $NAMESPACE -o jsonpath='{range .items[?(@.status.containerStatuses[*].restartCount>0)]}{.metadata.name}{"\t"}{.status.containerStatuses[*].restartCount}{"\n"}{end}')
if [ -z "$RESTARTED" ]; then
    echo "  ✓ Ningún pod ha reiniciado"
else
    warn "Pods con reinicios:"
    echo "$RESTARTED" | awk '{printf "  %s (reinicios: %s)\n", $1, $2}'
fi

section "4. Logs de Pods con Problemas"

for pod in $(kubectl get pods -n $NAMESPACE -o jsonpath='{.items[?(@.status.phase!="Running")].metadata.name}'); do
    warn "Logs del pod $pod:"
    echo "────────────────────────────────────────"
    kubectl logs $pod -n $NAMESPACE --tail=20 2>&1 || error "No se pudieron obtener logs"
    echo ""
    
    info "Eventos del pod $pod:"
    kubectl describe pod $pod -n $NAMESPACE | grep -A 20 "Events:" || true
    echo ""
done

section "5. Estado de los Deployments"

info "Deployments:"
kubectl get deployments -n $NAMESPACE

echo ""
for deploy in $(kubectl get deployments -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}'); do
    DESIRED=$(kubectl get deployment $deploy -n $NAMESPACE -o jsonpath='{.spec.replicas}')
    READY=$(kubectl get deployment $deploy -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
    
    if [ "$DESIRED" != "$READY" ]; then
        warn "Deployment $deploy: DESIRED=$DESIRED, READY=${READY:-0}"
        echo "  Ver detalles: kubectl describe deployment $deploy -n $NAMESPACE"
    else
        echo "  ✓ $deploy: $READY/$DESIRED replicas ready"
    fi
done

section "6. Estado de los Services"

info "Services:"
kubectl get svc -n $NAMESPACE

echo ""
info "Endpoints (pods detrás de cada servicio):"
kubectl get endpoints -n $NAMESPACE

echo ""
for svc in $(kubectl get svc -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}'); do
    ENDPOINTS=$(kubectl get endpoints $svc -n $NAMESPACE -o jsonpath='{.subsets[*].addresses[*].ip}' | wc -w)
    if [ "$ENDPOINTS" -eq 0 ]; then
        error "Service $svc: No tiene pods (0 endpoints)"
        echo "  Verifica que los pods con el label del servicio estén Running"
    else
        echo "  ✓ $svc: $ENDPOINTS endpoint(s)"
    fi
done

section "7. Estado del Almacenamiento"

info "PersistentVolumes:"
kubectl get pv

echo ""
info "PersistentVolumeClaims:"
kubectl get pvc -n $NAMESPACE

echo ""
for pvc in $(kubectl get pvc -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}'); do
    STATUS=$(kubectl get pvc $pvc -n $NAMESPACE -o jsonpath='{.status.phase}')
    if [ "$STATUS" != "Bound" ]; then
        error "PVC $pvc: Estado $STATUS (debería ser Bound)"
        kubectl describe pvc $pvc -n $NAMESPACE | grep -A 5 "Events:"
    else
        echo "  ✓ $pvc: Bound"
    fi
done

section "8. ConfigMaps y Secrets"

info "ConfigMaps:"
kubectl get configmap -n $NAMESPACE

echo ""
info "Secrets:"
kubectl get secrets -n $NAMESPACE

echo ""
if kubectl get configmap app-config -n $NAMESPACE &> /dev/null; then
    echo "  ✓ ConfigMap 'app-config' existe"
else
    error "ConfigMap 'app-config' NO existe"
    echo "  Ejecuta: kubectl apply -f k8s/configmap.yaml"
fi

if kubectl get secret app-secrets -n $NAMESPACE &> /dev/null; then
    echo "  ✓ Secret 'app-secrets' existe"
else
    error "Secret 'app-secrets' NO existe"
    echo "  Ejecuta: kubectl apply -f k8s/secrets.yaml"
fi

section "9. Autoscaling (HPA)"

if kubectl get hpa -n $NAMESPACE &> /dev/null 2>&1; then
    info "HorizontalPodAutoscalers:"
    kubectl get hpa -n $NAMESPACE
    
    echo ""
    for hpa in $(kubectl get hpa -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}'); do
        TARGET=$(kubectl get hpa $hpa -n $NAMESPACE -o jsonpath='{.status.currentCPUUtilizationPercentage}')
        if [ -z "$TARGET" ] || [ "$TARGET" = "null" ]; then
            warn "HPA $hpa: No puede obtener métricas de CPU"
            echo "  Verifica que metrics-server esté instalado:"
            echo "  kubectl top pods -n $NAMESPACE"
        else
            echo "  ✓ $hpa: CPU actual ${TARGET}%"
        fi
    done
else
    info "No hay HorizontalPodAutoscalers configurados"
fi

section "10. Eventos Recientes"

info "Últimos eventos en el namespace (últimos 10 minutos):"
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -20

section "11. Conectividad Interna"

info "Probando conectividad entre servicios..."

# Crear pod temporal para pruebas
kubectl run test-connectivity --image=busybox --rm -it --restart=Never -n $NAMESPACE -- sh -c "
echo '✓ Pod de prueba creado'
echo ''
echo 'Probando DNS interno:'
nslookup postgres-service 2>&1 | grep -v 'can'"'"'t find' && echo '  ✓ postgres-service: DNS OK' || echo '  ✗ postgres-service: DNS FAIL'
nslookup auth-service 2>&1 | grep -v 'can'"'"'t find' && echo '  ✓ auth-service: DNS OK' || echo '  ✗ auth-service: DNS FAIL'
nslookup api-service 2>&1 | grep -v 'can'"'"'t find' && echo '  ✓ api-service: DNS OK' || echo '  ✗ api-service: DNS FAIL'
echo ''
echo 'Probando conectividad HTTP (timeout 2s):'
wget -q --timeout=2 --tries=1 -O- http://api-service:8000/health 2>&1 && echo '  ✓ API health endpoint: OK' || echo '  ✗ API health endpoint: FAIL'
wget -q --timeout=2 --tries=1 -O- http://auth-service:8001/health 2>&1 && echo '  ✓ Auth health endpoint: OK' || echo '  ✗ Auth health endpoint: FAIL'
" 2>/dev/null || warn "No se pudo crear pod de prueba"

section "12. Uso de Recursos"

info "Uso de CPU y Memoria por pod:"
kubectl top pods -n $NAMESPACE 2>/dev/null || warn "metrics-server no disponible"

section "13. Recomendaciones"

echo ""
echo -e "${YELLOW}📋 Checklist de Troubleshooting:${NC}"
echo ""
echo "  [ ] ¿Todos los pods están en estado Running?"
echo "      Ver: kubectl get pods -n $NAMESPACE"
echo ""
echo "  [ ] ¿Los logs de los pods muestran errores?"
echo "      Ver: kubectl logs -f <pod-name> -n $NAMESPACE"
echo ""
echo "  [ ] ¿Los services tienen endpoints?"
echo "      Ver: kubectl get endpoints -n $NAMESPACE"
echo ""
echo "  [ ] ¿Las imágenes Docker están disponibles?"
echo "      Ver: kubectl describe pod <pod-name> -n $NAMESPACE | grep Image"
echo ""
echo "  [ ] ¿Las variables de entorno están correctas?"
echo "      Ver: kubectl exec <pod-name> -n $NAMESPACE -- env"
echo ""
echo "  [ ] ¿PostgreSQL está accesible?"
echo "      Ver: kubectl exec -it <postgres-pod> -n $NAMESPACE -- psql -U explora_user -d explora_db -c '\l'"
echo ""
echo "  [ ] ¿metrics-server está instalado? (necesario para HPA)"
echo "      Ver: kubectl top nodes"
echo ""

section "14. Comandos Útiles para Debugging"

echo "# Ver logs en tiempo real"
echo "kubectl logs -f <pod-name> -n $NAMESPACE"
echo ""
echo "# Ver logs de todos los pods de un deployment"
echo "kubectl logs -l app=api -n $NAMESPACE --tail=50"
echo ""
echo "# Ejecutar comandos dentro de un pod"
echo "kubectl exec -it <pod-name> -n $NAMESPACE -- /bin/bash"
echo ""
echo "# Ver detalles completos de un recurso"
echo "kubectl describe pod <pod-name> -n $NAMESPACE"
echo ""
echo "# Reiniciar un deployment"
echo "kubectl rollout restart deployment api -n $NAMESPACE"
echo ""
echo "# Ver historial de despliegues"
echo "kubectl rollout history deployment api -n $NAMESPACE"
echo ""
echo "# Rollback a versión anterior"
echo "kubectl rollout undo deployment api -n $NAMESPACE"
echo ""
echo "# Port-forward para acceso local"
echo "kubectl port-forward svc/api-service 8000:8000 -n $NAMESPACE"
echo ""
echo "# Ver eventos en tiempo real"
echo "kubectl get events -n $NAMESPACE --watch"
echo ""

section "Resumen"

TOTAL_PODS=$(kubectl get pods -n $NAMESPACE --no-headers 2>/dev/null | wc -l)
RUNNING_PODS=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l)

if [ "$TOTAL_PODS" -eq "$RUNNING_PODS" ] && [ "$TOTAL_PODS" -gt 0 ]; then
    echo -e "${GREEN}✅ Estado: SALUDABLE${NC}"
    echo "  $RUNNING_PODS/$TOTAL_PODS pods en estado Running"
elif [ "$TOTAL_PODS" -eq 0 ]; then
    echo -e "${RED}❌ Estado: SIN DESPLIEGUE${NC}"
    echo "  No hay pods desplegados en el namespace $NAMESPACE"
    echo "  Ejecuta: ./scripts/k8s-deploy.sh"
else
    echo -e "${YELLOW}⚠️  Estado: CON PROBLEMAS${NC}"
    echo "  $RUNNING_PODS/$TOTAL_PODS pods en estado Running"
    echo "  Revisa los logs y eventos arriba"
fi

echo ""
echo "============================================"
echo -e "${BLUE}Troubleshooting completado${NC}"
echo "============================================"
echo ""
