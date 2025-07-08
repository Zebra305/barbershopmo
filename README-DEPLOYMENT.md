# Self-Hosted Barbershop Deployment Guide

This guide explains how to deploy your barbershop management system on your own Ubuntu VPS without any dependencies on Replit services. The deployment is designed to work with your existing Traefik setup.

## Prerequisites

- Ubuntu VPS with root access
- Domain name (required for Traefik/SSL)
- Docker and Docker Compose installed
- Existing Traefik setup (detected in your current configuration)

## Quick Start (Traefik Integration)

1. **Clone/Upload your project files to your VPS**

2. **Make the deployment script executable:**
   ```bash
   chmod +x deploy.sh
   ```

3. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```
   This will create a `.env` file for you to configure.

4. **Edit the `.env` file with your domain:**
   ```bash
   nano .env
   ```
   Set `BARBERSHOP_DOMAIN=barbershop.yourdomain.com`

5. **Access your application:**
   - Website: `https://barbershop.yourdomain.com`
   - Admin panel: `https://barbershop.yourdomain.com/baas`
   - Default admin credentials: `admin/admin`

## Configuration

### Environment Variables

Edit `.env` file to customize:

```bash
# Barbershop Configuration
BARBERSHOP_DOMAIN=barbershop.yourdomain.com
BARBERSHOP_DB_PASSWORD=your_secure_database_password
BARBERSHOP_SESSION_SECRET=your_secure_session_secret
BARBERSHOP_ADMIN_USERNAME=admin
BARBERSHOP_ADMIN_PASSWORD=your_secure_admin_password
```

### SSL Certificate

SSL certificates are automatically managed by your existing Traefik setup using Let's Encrypt. No additional configuration needed.

### Domain Configuration

1. Set your domain in the `.env` file:
   ```bash
   BARBERSHOP_DOMAIN=barbershop.yourdomain.com
   ```

2. Point your domain's A record to your VPS IP address

3. Traefik will automatically handle routing and SSL certificates

## Manual Installation (without Docker)

If you prefer not to use Docker:

### 1. Install Dependencies

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install Nginx
sudo apt-get install nginx
```

### 2. Database Setup

```bash
# Create database user and database
sudo -u postgres psql
CREATE USER barbershop WITH PASSWORD 'barbershop_password';
CREATE DATABASE barbershop OWNER barbershop;
GRANT ALL PRIVILEGES ON DATABASE barbershop TO barbershop;
\q
```

### 3. Application Setup

```bash
# Clone your project
git clone <your-repo> /var/www/barbershop
cd /var/www/barbershop

# Install dependencies
npm install

# Build application
npm run build

# Set environment variables
export DATABASE_URL="postgresql://barbershop:barbershop_password@localhost:5432/barbershop"
export SESSION_SECRET="your-super-secret-session-key"
export ADMIN_USERNAME="admin"
export ADMIN_PASSWORD="admin"
export NODE_ENV="production"

# Run database migrations
npm run db:push
```

### 4. Process Management

Create systemd service file `/etc/systemd/system/barbershop.service`:

```ini
[Unit]
Description=Barbershop Management System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/barbershop
Environment=NODE_ENV=production
Environment=DATABASE_URL=postgresql://barbershop:barbershop_password@localhost:5432/barbershop
Environment=SESSION_SECRET=your-super-secret-session-key
Environment=ADMIN_USERNAME=admin
Environment=ADMIN_PASSWORD=admin
ExecStart=/usr/bin/node dist/server/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl enable barbershop
sudo systemctl start barbershop
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/barbershop`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/barbershop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Security Considerations

1. **Change default admin password** in production
2. **Use strong session secret** (generate with `openssl rand -hex 32`)
3. **Enable firewall** and only allow necessary ports (80, 443, 22)
4. **Keep system updated** with security patches
5. **Use SSL/TLS** for all connections
6. **Regular database backups**

## Monitoring and Maintenance

### Log Files
- Application logs: `./logs/` directory
- Nginx logs: `/var/log/nginx/`
- PostgreSQL logs: `/var/log/postgresql/`

### Database Backup
```bash
# Backup
docker exec -t barbershop-db-1 pg_dump -U barbershop barbershop > backup.sql

# Restore
docker exec -i barbershop-db-1 psql -U barbershop -d barbershop < backup.sql
```

### Health Checks
The application includes a health check endpoint at `/health` for monitoring.

## Troubleshooting

### Common Issues

1. **Database connection failed**: Check DATABASE_URL and ensure PostgreSQL is running
2. **Permission denied**: Ensure proper file permissions and user ownership
3. **SSL certificate errors**: Verify certificate paths and permissions
4. **WebSocket connection issues**: Check firewall and proxy configuration

### Debug Commands

```bash
# Check application logs
docker-compose logs app

# Check database logs
docker-compose logs db

# Check nginx logs
docker-compose logs nginx

# Restart services
docker-compose restart

# Rebuild application
docker-compose up --build
```

## Support

If you encounter any issues during deployment, check the logs and ensure all environment variables are properly set. The application should work independently without any external dependencies once properly configured.