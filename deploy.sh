#!/bin/bash

# Self-hosted barbershop deployment script
set -e

echo "🚀 Starting barbershop deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Create necessary directories
echo -e "${YELLOW}Creating directories...${NC}"
mkdir -p ssl logs

# Generate SSL certificate (self-signed for development)
if [ ! -f ssl/cert.pem ]; then
    echo -e "${YELLOW}Generating self-signed SSL certificate...${NC}"
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
        -subj "/C=NL/ST=Netherlands/L=Amsterdam/O=Barbershop/CN=localhost"
fi

# Set proper permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

# Build and start services
echo -e "${YELLOW}Building and starting services...${NC}"
docker-compose up --build -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Services are running successfully!${NC}"
    echo -e "${GREEN}✅ App is available at: https://localhost${NC}"
    echo -e "${GREEN}✅ Admin panel: https://localhost/baas${NC}"
    echo -e "${GREEN}✅ Admin credentials: admin/admin${NC}"
else
    echo -e "${RED}❌ Some services failed to start. Check logs:${NC}"
    docker-compose logs
fi

# Show running containers
echo -e "${YELLOW}Running containers:${NC}"
docker-compose ps

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update your domain in nginx.conf"
echo "2. Replace self-signed certificate with real SSL certificate"
echo "3. Change default admin password in docker-compose.yml"
echo "4. Configure your firewall to allow ports 80 and 443"