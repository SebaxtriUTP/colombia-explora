#!/bin/bash

# 🚀 Instalación Rápida de Kubernetes en Linux
# Este script instala kubectl y Minikube

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "============================================"
echo -e "${BLUE}🏔️  Instalación de Kubernetes${NC}"
echo "============================================"
echo ""

# 1. Instalar kubectl
echo -e "${GREEN}► Instalando kubectl...${NC}"
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
rm kubectl

echo "  ✓ kubectl instalado"
kubectl version --client

echo ""

# 2. Instalar Minikube
echo -e "${GREEN}► Instalando Minikube...${NC}"
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
chmod +x minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
rm minikube-linux-amd64

echo "  ✓ Minikube instalado"
minikube version

echo ""
echo "============================================"
echo -e "${GREEN}✅ Instalación completada${NC}"
echo "============================================"
echo ""
echo "Siguiente paso:"
echo "  ./scripts/k8s-deploy.sh"
echo ""
