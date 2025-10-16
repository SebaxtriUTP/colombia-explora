#!/bin/bash

# 🚀 Script de Configuración para Desarrollo Local
# Este script prepara tu entorno para desarrollo con PyCharm/VSCode

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "============================================"
echo -e "${BLUE}🔧 Setup de Desarrollo Local${NC}"
echo "============================================"
echo ""

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Python $(python3 --version)"

# Verificar Docker (solo para PostgreSQL)
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker no está instalado. Necesitarás PostgreSQL instalado localmente.${NC}"
else
    echo -e "${GREEN}✓${NC} Docker $(docker --version)"
fi

echo ""
echo -e "${BLUE}1. Configurando base de datos...${NC}"

# Iniciar PostgreSQL en Docker (solo la BD)
if command -v docker &> /dev/null; then
    echo "Iniciando PostgreSQL en Docker..."
    docker-compose -f docker-compose.dev.yml up -d postgres
    echo "Esperando a que PostgreSQL esté listo..."
    sleep 3
    echo -e "${GREEN}✓${NC} PostgreSQL corriendo en localhost:5433"
else
    echo -e "${YELLOW}⚠️  Asegúrate de que PostgreSQL esté corriendo en localhost:5433${NC}"
fi

echo ""
echo -e "${BLUE}2. Configurando variables de entorno...${NC}"

# Copiar .env.local si no existe .env
if [ ! -f .env ]; then
    cp .env.local .env
    echo -e "${GREEN}✓${NC} Archivo .env creado desde .env.local"
else
    echo -e "${YELLOW}⚠️  .env ya existe. Revisa que tenga DATABASE_URL=postgresql+asyncpg://explora:explora123@localhost:5433/explora_dev${NC}"
fi

echo ""
echo -e "${BLUE}3. Configurando virtualenv para Auth Service...${NC}"

cd auth
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓${NC} Virtualenv creado"
fi

source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt
deactivate

echo -e "${GREEN}✓${NC} Dependencias instaladas en auth/venv"
cd ..

echo ""
echo -e "${BLUE}4. Configurando virtualenv para API Service...${NC}"

cd api
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓${NC} Virtualenv creado"
fi

source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt
deactivate

echo -e "${GREEN}✓${NC} Dependencias instaladas en api/venv"
cd ..

echo ""
echo -e "${BLUE}5. Configurando Frontend...${NC}"

cd frontend
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js no está instalado. Instálalo para el frontend.${NC}"
else
    echo -e "${GREEN}✓${NC} Node $(node --version)"
    if [ ! -d "node_modules" ]; then
        echo "Instalando dependencias de Node..."
        npm install
    fi
    echo -e "${GREEN}✓${NC} Dependencias de Node instaladas"
fi
cd ..

echo ""
echo "============================================"
echo -e "${GREEN}✅ Setup completado!${NC}"
echo "============================================"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1️⃣  Iniciar Auth Service (con debug en PyCharm):"
echo "   cd auth"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload --port 8001"
echo ""
echo "2️⃣  Iniciar API Service (con debug en PyCharm):"
echo "   cd api"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload --port 8000"
echo ""
echo "3️⃣  Iniciar Frontend:"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "🎯 URLs de desarrollo:"
echo "   • Frontend:     http://localhost:4200"
echo "   • API:          http://localhost:8000/docs"
echo "   • Auth:         http://localhost:8001/docs"
echo "   • PostgreSQL:   localhost:5433 (Docker dev)"
echo "   • PgAdmin:      http://localhost:5050 (si usas --profile tools)"
echo ""
echo "🐛 Para debugear en PyCharm:"
echo "   1. Abre el proyecto 'auth' o 'api'"
echo "   2. Configura el intérprete: venv/bin/python"
echo "   3. Crea configuración de ejecución: uvicorn app.main:app --reload"
echo "   4. Pon breakpoints y ejecuta en modo debug"
echo ""
echo "📚 Ver DEVELOPMENT.md para más detalles"
echo ""
