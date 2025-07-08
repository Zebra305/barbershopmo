#!/bin/bash

# Simple barbershop setup for path-based routing
set -e

echo "🚀 Setting up barbershop with path-based routing (/mo and /baas)..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p logs

# Create external volumes if they don't exist
echo -e "${YELLOW}Creating Docker volumes...${NC}"
docker volume create barbershop_postgres_data 2>/dev/null || true

# Create networks if they don't exist
echo -e "${YELLOW}Checking Docker networks...${NC}"
docker network ls | grep -q root_default || docker network create root_default
docker network ls | grep -q services-network || docker network create services-network

# Build and start services
echo -e "${YELLOW}Building and starting barbershop services...${NC}"
docker-compose up --build -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Barbershop services are running successfully!${NC}"
    echo -e "${GREEN}✅ Main website: http://69.62.114.108/mo${NC}"
    echo -e "${GREEN}✅ Admin panel: http://69.62.114.108/baas${NC}"
    echo -e "${GREEN}✅ Admin credentials: admin/admin${NC}"
else
    echo -e "${RED}❌ Some services failed to start. Check logs:${NC}"
    docker-compose logs barbershop
fi

# Show running containers
echo -e "${YELLOW}Running barbershop containers:${NC}"
docker-compose ps

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${YELLOW}Access your barbershop:${NC}"
echo "• Main website: http://69.62.114.108/mo"
echo "• Admin panel: http://69.62.114.108/baas"
echo "• Default admin login: admin/admin"