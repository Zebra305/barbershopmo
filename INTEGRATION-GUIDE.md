# Barbershop Integration with Existing Docker Setup

## Overview
This guide shows how to add the barbershop service to your existing docker-compose.yml without disrupting your current services.

## Integration Steps

### 1. Add Barbershop Services to Your Main docker-compose.yml

Add these services to your existing `/root/docker-compose.yml`:

```yaml
  # Add these services to your existing docker-compose.yml
  barbershop:
    build: 
      context: ./barbershop  # Path to barbershop project directory
      dockerfile: Dockerfile
    container_name: barbershop_app
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://barbershop:barbershop_secure_password@barbershop_db:5432/barbershop
      - SESSION_SECRET=change_this_to_secure_session_secret
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=admin
    depends_on:
      - barbershop_db
    restart: unless-stopped
    volumes:
      - ./barbershop/logs:/app/logs
    networks:
      - root_default
      - services-network
    labels:
      - "traefik.enable=true"
      # Router for /mo path (main barbershop website)
      - "traefik.http.routers.barbershop-mo.rule=Host(`69.62.114.108`) && PathPrefix(`/mo`)"
      - "traefik.http.routers.barbershop-mo.entrypoints=web"
      - "traefik.http.routers.barbershop-mo.middlewares=barbershop-mo-stripprefix"
      # Router for /baas path (admin panel)
      - "traefik.http.routers.barbershop-baas.rule=Host(`69.62.114.108`) && PathPrefix(`/baas`)"
      - "traefik.http.routers.barbershop-baas.entrypoints=web"
      - "traefik.http.routers.barbershop-baas.middlewares=barbershop-baas-redirect"
      # Middleware to strip /mo prefix
      - "traefik.http.middlewares.barbershop-mo-stripprefix.stripprefix.prefixes=/mo"
      # Middleware to redirect /baas to /mo/baas (since the app expects /baas internally)
      - "traefik.http.middlewares.barbershop-baas-redirect.redirectregex.regex=^http://69.62.114.108/baas(.*)"
      - "traefik.http.middlewares.barbershop-baas-redirect.redirectregex.replacement=http://69.62.114.108/mo/baas$${1}"
      # Service definition
      - "traefik.http.services.barbershop.loadbalancer.server.port=3001"

  barbershop_db:
    image: postgres:15-alpine
    container_name: barbershop_postgres
    environment:
      - POSTGRES_DB=barbershop
      - POSTGRES_USER=barbershop
      - POSTGRES_PASSWORD=barbershop_secure_password
    volumes:
      - barbershop_postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - root_default
      - services-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U barbershop"]
      interval: 10s
      timeout: 5s
      retries: 3
```

### 2. Add Volume to Your Main docker-compose.yml

Add this volume to your existing volumes section:

```yaml
volumes:
  # ... your existing volumes ...
  barbershop_postgres_data:
    external: true
```

### 3. Create the Volume

```bash
docker volume create barbershop_postgres_data
```

### 4. Directory Structure

You should create the barbershop directory in `/root/` alongside your existing docker-compose.yml:

```
/root/
├── docker-compose.yml (your existing main file)
├── barbershop/        (create this directory with barbershop files)
│   ├── Dockerfile
│   ├── package.json
│   ├── server/
│   ├── client/
│   ├── shared/
│   ├── logs/
│   └── deploy.sh
```

**Steps:**
1. Create `/root/barbershop/` directory
2. Copy all barbershop project files into `/root/barbershop/`
3. The docker-compose.yml context path `./barbershop` will then correctly point to `/root/barbershop/`

### 5. Deploy

```bash
# From your main docker directory (/root/)
# First, create the volume
docker volume create barbershop_postgres_data

# Then deploy the barbershop services
docker-compose up -d barbershop barbershop_db
```

## Access URLs

After deployment:

- **Main Website**: `http://69.62.114.108/mo`
- **Admin Panel**: `http://69.62.114.108/baas`
- **Admin Login**: `admin/admin`

## How It Works

1. **Path-based Routing**: Traefik routes `/mo` to the barbershop main site and `/baas` to admin
2. **No SSL Required**: Uses HTTP for simplicity
3. **Existing Networks**: Uses your current `root_default` and `services-network`
4. **Port 3001**: Avoids conflict with your existing services on port 5000
5. **Strip Prefix**: `/mo` is stripped so the app works normally
6. **Admin Redirect**: `/baas` redirects to `/mo/baas` for proper routing

## Benefits

✅ No disruption to existing services  
✅ Uses your current Traefik setup  
✅ Simple IP-based access  
✅ No SSL complexity  
✅ Easy to remove if needed  

## Troubleshooting

- Check logs: `docker-compose logs barbershop`
- Verify networks: `docker network ls`
- Check Traefik dashboard for routing rules
- Ensure port 3001 is not in use