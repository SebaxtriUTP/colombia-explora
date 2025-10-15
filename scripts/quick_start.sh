#!/bin/bash

# 🚀 Colombia Explora - Quick Start Script
# Este script automatiza la configuración inicial del proyecto

set -e  # Exit on error

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "============================================"
echo -e "${BLUE}🏔️  Colombia Explora - Quick Start${NC}"
echo "============================================"
echo ""

# Función para imprimir pasos
step() {
    echo -e "${GREEN}►${NC} $1"
}

# Función para imprimir advertencias
warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Función para imprimir errores
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar Docker
step "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

echo "  ✓ Docker $(docker --version)"
echo "  ✓ Docker Compose $(docker-compose --version)"
echo ""

# Verificar si .env existe
step "Verificando configuración de entorno..."
if [ ! -f .env ]; then
    warn ".env no existe. Creando desde .env.example..."
    cp .env.example .env
    echo "  ✓ .env creado. Revísalo y actualiza los valores si es necesario."
else
    echo "  ✓ .env ya existe"
fi
echo ""

# Detener contenedores existentes
step "Deteniendo contenedores existentes (si los hay)..."
docker-compose down 2>/dev/null || true
echo ""

# Limpiar volúmenes antiguos (opcional)
read -p "¿Deseas resetear la base de datos? Esto borrará todos los datos. (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    step "Limpiando datos de PostgreSQL..."
    sudo rm -rf data/postgres 2>/dev/null || true
    echo "  ✓ Base de datos limpiada"
fi
echo ""

# Construir imágenes
step "Construyendo imágenes Docker (esto puede tomar varios minutos)..."
docker-compose build
echo ""

# Iniciar servicios
step "Iniciando servicios..."
docker-compose up -d
echo ""

# Esperar a que los servicios estén listos
step "Esperando a que los servicios inicien..."
sleep 8

# Verificar salud de los servicios
step "Verificando estado de los servicios..."
echo ""

# Health checks
auth_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/health 2>/dev/null || echo "000")
api_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null || echo "000")
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4200 2>/dev/null || echo "000")

if [ "$auth_status" = "200" ]; then
    echo -e "  ${GREEN}✓${NC} Auth Service     → http://localhost:8001"
else
    echo -e "  ${RED}✗${NC} Auth Service     → FAIL (HTTP $auth_status)"
fi

if [ "$api_status" = "200" ]; then
    echo -e "  ${GREEN}✓${NC} API Service      → http://localhost:8000"
else
    echo -e "  ${RED}✗${NC} API Service      → FAIL (HTTP $api_status)"
fi

if [ "$frontend_status" = "200" ]; then
    echo -e "  ${GREEN}✓${NC} Frontend         → http://localhost:4200"
else
    echo -e "  ${RED}✗${NC} Frontend         → FAIL (HTTP $frontend_status)"
fi

postgres_status=$(docker exec explora_postgres pg_isready -U explora 2>/dev/null && echo "OK" || echo "FAIL")
if [ "$postgres_status" = "OK" ]; then
    echo -e "  ${GREEN}✓${NC} PostgreSQL       → Ready"
else
    echo -e "  ${RED}✗${NC} PostgreSQL       → FAIL"
fi

echo ""

# Mostrar logs si hay errores
if [ "$auth_status" != "200" ] || [ "$api_status" != "200" ] || [ "$frontend_status" != "200" ]; then
    warn "Algunos servicios no respondieron correctamente."
    echo "  Ver logs con: docker-compose logs -f"
    echo ""
fi

# Información de acceso
echo "============================================"
echo -e "${GREEN}✅ Instalación completada!${NC}"
echo "============================================"
echo ""
echo "🌐 URLs de acceso:"
echo "  • Aplicación Web:  http://localhost:4200"
echo "  • API Docs:        http://localhost:8000/docs"
echo "  • Auth Docs:       http://localhost:8001/docs"
echo ""
echo "👤 Credenciales de Admin por defecto:"
echo "  • Usuario:    admin"
echo "  • Contraseña: admin123"
echo ""
echo "📝 Comandos útiles:"
echo "  • Ver logs:          docker-compose logs -f"
echo "  • Detener:           docker-compose down"
echo "  • Reiniciar:         docker-compose restart"
echo "  • Health check:      ./scripts/health_check.sh"
echo ""
echo "📚 Documentación:"
echo "  • README.md          - Guía completa"
echo "  • ARCHITECTURE.md    - Diagramas de arquitectura"
echo "  • CONTRIBUTING.md    - Guía de contribución"
echo ""
echo -e "${BLUE}¡Feliz desarrollo! 🚀🏔️${NC}"
echo "============================================"
echo ""
