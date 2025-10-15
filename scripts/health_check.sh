#!/bin/bash

# Script de verificación de salud de todos los servicios
# Colombia Explora - Health Check

echo "============================================"
echo "🏔️  Colombia Explora - Health Check"
echo "============================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar servicio
check_service() {
    local name=$1
    local url=$2
    
    echo -n "Verificando $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
        return 1
    fi
}

# Contador de servicios
total=0
success=0

# Verificar contenedores Docker
echo "📦 Estado de Contenedores:"
echo "-------------------------------------------"
docker-compose ps
echo ""

# Verificar Auth Service
echo "🔐 Servicios Backend:"
echo "-------------------------------------------"
((total++))
if check_service "Auth Service     " "http://localhost:8001/health"; then
    ((success++))
fi

# Verificar API Service
((total++))
if check_service "API Service      " "http://localhost:8000/health"; then
    ((success++))
fi

# Verificar Frontend
echo ""
echo "🎨 Frontend:"
echo "-------------------------------------------"
((total++))
if check_service "Angular Frontend " "http://localhost:4200"; then
    ((success++))
fi

# Verificar PostgreSQL
echo ""
echo "🗄️  Base de Datos:"
echo "-------------------------------------------"
((total++))
echo -n "Verificando PostgreSQL... "
if docker exec explora_postgres pg_isready -U explora >/dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
    ((success++))
else
    echo -e "${RED}✗ FAIL${NC}"
fi

# Resumen
echo ""
echo "============================================"
if [ $success -eq $total ]; then
    echo -e "${GREEN}✅ Todos los servicios están funcionando ($success/$total)${NC}"
    echo ""
    echo "🌐 URLs disponibles:"
    echo "   - Frontend:  http://localhost:4200"
    echo "   - API Docs:  http://localhost:8000/docs"
    echo "   - Auth Docs: http://localhost:8001/docs"
else
    echo -e "${YELLOW}⚠️  Algunos servicios tienen problemas ($success/$total)${NC}"
    echo ""
    echo "💡 Soluciones:"
    echo "   1. Verifica los logs: docker-compose logs -f"
    echo "   2. Reinicia servicios: docker-compose restart"
    echo "   3. Reconstruye: docker-compose up --build -d"
fi
echo "============================================"

exit $((total - success))
