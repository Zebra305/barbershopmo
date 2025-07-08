#!/bin/bash

# Barbershop deployment script for existing Traefik setup
set -e

echo "🚀 Starting barbershop deployment with existing Traefik setup..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}This script should not be run as root${NC}"
   exit 1
fi

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

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << EOF
# Barbershop Configuration
BARBERSHOP_DOMAIN=barbershop.yourdomain.com
BARBERSHOP_DB_PASSWORD=barbershop_secure_password_$(openssl rand -hex 16)
BARBERSHOP_SESSION_SECRET=$(openssl rand -hex 32)
BARBERSHOP_ADMIN_USERNAME=admin
BARBERSHOP_ADMIN_PASSWORD=admin

# Existing variables (if any)
# Add your existing environment variables here
EOF
    echo -e "${BLUE}Please edit .env file with your domain and secure passwords${NC}"
    echo -e "${BLUE}Domain should be something like: barbershop.yourdomain.com${NC}"
    read -p "Press Enter to continue after editing .env file..."
fi

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p logs

# Create external volumes if they don't exist
echo -e "${YELLOW}Creating Docker volumes...${NC}"
docker volume create barbershop_postgres_data 2>/dev/null || true

# Check if networks exist
echo -e "${YELLOW}Checking Docker networks...${NC}"
if ! docker network ls | grep -q root_default; then
    echo -e "${YELLOW}Creating root_default network...${NC}"
    docker network create root_default
fi

if ! docker network ls | grep -q services-network; then
    echo -e "${YELLOW}Creating services-network...${NC}"
    docker network create services-network
fi

# Load environment variables
set -a
source .env
set +a

# Validate required environment variables
if [[ -z "$BARBERSHOP_DOMAIN" ]]; then
    echo -e "${RED}BARBERSHOP_DOMAIN is not set in .env file${NC}"
    exit 1
fi

# Build and start services
echo -e "${YELLOW}Building and starting barbershop services...${NC}"
docker-compose up --build -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Barbershop services are running successfully!${NC}"
    echo -e "${GREEN}✅ App is available at: https://${BARBERSHOP_DOMAIN}${NC}"
    echo -e "${GREEN}✅ Admin panel: https://${BARBERSHOP_DOMAIN}/baas${NC}"
    echo -e "${GREEN}✅ Admin credentials: ${BARBERSHOP_ADMIN_USERNAME}/${BARBERSHOP_ADMIN_PASSWORD}${NC}"
else
    echo -e "${RED}❌ Some services failed to start. Check logs:${NC}"
    docker-compose logs barbershop
fi

# Show running containers
echo -e "${YELLOW}Running barbershop containers:${NC}"
docker-compose ps

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Make sure your DNS points ${BARBERSHOP_DOMAIN} to your server"
echo "2. Traefik will automatically handle SSL certificates via Let's Encrypt"
echo "3. Change default admin password in .env file if needed"
echo "4. The barbershop app is now integrated with your existing Traefik setup"