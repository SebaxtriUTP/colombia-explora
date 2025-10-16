#!/bin/bash
# Script para inicializar datos en Kubernetes

set -e

echo "🔐 Obteniendo token de admin..."
TOKEN=$(curl -s -X POST http://192.168.49.2/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ Error: No se pudo obtener el token de admin"
    echo "Verifica que el servicio de auth esté funcionando:"
    echo "  curl http://192.168.49.2/auth/health"
    exit 1
fi

echo "✓ Token obtenido"
echo ""

echo "📍 Creando destinos turísticos..."

# Destino 1
echo "  - Valle del Cocora..."
curl -s -X POST http://192.168.49.2/api/destinations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Valle del Cocora",
    "description": "Bosque de palmas de cera más alto del mundo",
    "region": "Quindío",
    "price": 50000
  }' > /dev/null && echo "    ✓"

# Destino 2
echo "  - Salento..."
curl -s -X POST http://192.168.49.2/api/destinations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salento",
    "description": "Pueblo colorido del Eje Cafetero",
    "region": "Quindío",
    "price": 35000
  }' > /dev/null && echo "    ✓"

# Destino 3
echo "  - Parque Nacional del Café..."
curl -s -X POST http://192.168.49.2/api/destinations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Parque Nacional del Café",
    "description": "Parque temático sobre el café colombiano",
    "region": "Quindío",
    "price": 65000
  }' > /dev/null && echo "    ✓"

# Destino 4
echo "  - Termales de Santa Rosa..."
curl -s -X POST http://192.168.49.2/api/destinations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Termales de Santa Rosa",
    "description": "Aguas termales naturales en medio de la montaña",
    "region": "Risaralda",
    "price": 75000
  }' > /dev/null && echo "    ✓"

echo ""
echo "📋 Destinos creados:"
curl -s http://192.168.49.2/api/destinations | \
  python3 -c "import sys,json; [print(f\"  • {d['name']} - ${d['price']:,} - {d['region']}\") for d in json.load(sys.stdin)]"

echo ""
echo "✅ Datos inicializados correctamente!"
echo ""
echo "🌐 Accede a: http://192.168.49.2"
echo ""
