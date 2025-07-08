# Barbershop Integration with Existing Docker Setup

## Overview
This detailed guide shows exactly how to add the barbershop service to your existing docker-compose.yml without disrupting your current services. The barbershop will be accessible via path-based routing: `/mo` for the main website and `/baas` for the admin panel.

## Prerequisites
- Your existing Docker setup is running in `/root/`
- You have Traefik configured with `root_default` and `services-network` networks
- Your VPS IP is `69.62.114.108` (update this in the configuration if different)

## Detailed Integration Steps

### Step 1: Create Directory Structure

First, create the barbershop directory and organize all project files:

```bash
# Navigate to your root directory
cd /root

# Create the barbershop directory
mkdir barbershop

# Create subdirectories
mkdir -p barbershop/server
mkdir -p barbershop/client/src
mkdir -p barbershop/shared
mkdir -p barbershop/logs
```

### Step 2: Copy Files to Correct Locations

Copy all barbershop project files to the `/root/barbershop/` directory with this exact structure:

```
/root/
├── docker-compose.yml (your existing main file)
└── barbershop/        (create this directory)
    ├── Dockerfile                    # Docker build configuration
    ├── package.json                  # Node.js dependencies
    ├── package-lock.json             # Dependency lock file
    ├── tsconfig.json                 # TypeScript configuration
    ├── vite.config.ts                # Vite build configuration
    ├── tailwind.config.ts            # Tailwind CSS configuration
    ├── postcss.config.js             # PostCSS configuration
    ├── components.json               # UI components configuration
    ├── drizzle.config.ts             # Database ORM configuration
    ├── deploy.sh                     # Deployment script
    ├── replit.md                     # Project documentation
    ├── README-DEPLOYMENT.md          # Deployment guide
    ├── INTEGRATION-GUIDE.md          # This file
    ├── .env.example                  # Environment variables template
    ├── server/                       # Backend code
    │   ├── index.ts                  # Main server file
    │   ├── routes.ts                 # API routes
    │   ├── auth.ts                   # Authentication logic
    │   ├── storage.ts                # Database operations
    │   ├── db.ts                     # Database connection
    │   └── vite.ts                   # Vite development server
    ├── client/                       # Frontend code
    │   ├── index.html                # HTML template
    │   └── src/
    │       ├── main.tsx              # React app entry point
    │       ├── App.tsx               # Main React component
    │       ├── index.css             # Global styles
    │       ├── components/           # UI components
    │       │   ├── ui/               # Reusable UI components
    │       │   ├── navigation.tsx    # Navigation component
    │       │   ├── language-toggle.tsx # Language switcher
    │       │   ├── queue-status.tsx  # Queue management
    │       │   ├── reviews-carousel.tsx # Reviews display
    │       │   └── gallery-carousel.tsx # Gallery display
    │       ├── pages/                # Page components
    │       │   ├── landing.tsx       # Main landing page
    │       │   ├── admin.tsx         # Admin dashboard
    │       │   ├── admin-login.tsx   # Admin login page
    │       │   ├── home.tsx          # Home page
    │       │   └── not-found.tsx     # 404 page
    │       ├── hooks/                # Custom React hooks
    │       │   ├── useAuth.ts        # Authentication hook
    │       │   ├── useTranslation.tsx # Translation hook
    │       │   ├── useWebSocket.ts   # WebSocket hook
    │       │   ├── use-mobile.tsx    # Mobile detection
    │       │   └── use-toast.ts      # Toast notifications
    │       └── lib/                  # Utility functions
    │           ├── queryClient.ts    # React Query setup
    │           ├── authUtils.ts      # Auth utilities
    │           ├── translations.ts   # Language translations
    │           └── utils.ts          # General utilities
    ├── shared/                       # Shared code between client/server
    │   ├── schema.ts                 # Database schema
    │   └── business-hours.ts         # Business hours logic
    └── logs/                         # Application logs (created automatically)
```

### Step 3: File Copy Commands

Execute these commands to copy files to the correct locations:

```bash
# Copy main configuration files
cp Dockerfile /root/barbershop/
cp package.json /root/barbershop/
cp package-lock.json /root/barbershop/
cp tsconfig.json /root/barbershop/
cp vite.config.ts /root/barbershop/
cp tailwind.config.ts /root/barbershop/
cp postcss.config.js /root/barbershop/
cp components.json /root/barbershop/
cp drizzle.config.ts /root/barbershop/
cp deploy.sh /root/barbershop/
cp replit.md /root/barbershop/
cp README-DEPLOYMENT.md /root/barbershop/
cp INTEGRATION-GUIDE.md /root/barbershop/
cp .env.example /root/barbershop/

# Copy server directory
cp -r server/* /root/barbershop/server/

# Copy client directory
cp -r client/* /root/barbershop/client/

# Copy shared directory
cp -r shared/* /root/barbershop/shared/

# Make deploy script executable
chmod +x /root/barbershop/deploy.sh
```

### Step 4: Add Services to Your Main docker-compose.yml

Add these services to your existing `/root/docker-compose.yml` file. Insert them alongside your existing services:

```yaml
  # Barbershop Services - Add these to your existing docker-compose.yml
  barbershop:
    build: 
      context: ./barbershop  # Points to /root/barbershop directory
      dockerfile: Dockerfile
    container_name: barbershop_app
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://barbershop:barbershop_secure_password@barbershop_db:5432/barbershop
      - SESSION_SECRET=change_this_to_secure_session_secret_in_production
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=admin
    depends_on:
      - barbershop_db
    restart: unless-stopped
    volumes:
      - ./barbershop/logs:/app/logs  # Maps to /root/barbershop/logs
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
      # Middleware to strip /mo prefix for main site
      - "traefik.http.middlewares.barbershop-mo-stripprefix.stripprefix.prefixes=/mo"
      # Middleware to redirect /baas to /mo/baas (internal app routing)
      - "traefik.http.middlewares.barbershop-baas-redirect.redirectregex.regex=^http://([^/]+)/baas(.*)"
      - "traefik.http.middlewares.barbershop-baas-redirect.redirectregex.replacement=http://$${1}/mo/baas$${2}"
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

### Step 5: Add Volume to Your Main docker-compose.yml

Add this volume to your existing volumes section in `/root/docker-compose.yml`:

```yaml
volumes:
  # ... your existing volumes like:
  # n8n_data:
  #   external: true
  # postgres_data:
  #   external: true
  
  # Add this new volume for barbershop
  barbershop_postgres_data:
    external: true
```

### Step 6: Create Required Docker Resources

Execute these commands to create the necessary Docker resources:

```bash
# Create the external volume
docker volume create barbershop_postgres_data

# Verify the volume was created
docker volume ls | grep barbershop

# Verify networks exist (they should already exist from your setup)
docker network ls | grep root_default
docker network ls | grep services-network
```

### Step 7: Deploy the Barbershop Services

Deploy the barbershop services alongside your existing ones:

```bash
# Navigate to your root directory
cd /root

# Build and start only the barbershop services
docker-compose up -d barbershop barbershop_db

# Check if services are running
docker-compose ps | grep barbershop

# View logs if needed
docker-compose logs barbershop
docker-compose logs barbershop_db
```

### Step 8: Verify Directory Structure

After setup, verify your directory structure looks like this:

```bash
# Check the directory structure
ls -la /root/barbershop/

# Should show:
# Dockerfile
# package.json
# server/
# client/
# shared/
# logs/
# ... other files

# Check subdirectories
ls -la /root/barbershop/server/
ls -la /root/barbershop/client/
ls -la /root/barbershop/shared/
```

## Access URLs

After successful deployment, your barbershop will be accessible at:

- **Main Website**: `http://69.62.114.108/mo`
- **Admin Panel**: `http://69.62.114.108/baas`
- **Admin Login**: Username: `admin`, Password: `admin`

## How the Routing Works

1. **Traefik receives requests** to your VPS IP with `/mo` or `/baas` paths
2. **For `/mo` requests**: Strips the `/mo` prefix and forwards to barbershop app
3. **For `/baas` requests**: Redirects to `/mo/baas` so the app handles admin routing internally
4. **The barbershop app** running on port 3001 serves the appropriate content
5. **Database** runs in separate container with persistent storage

## Troubleshooting

### Check if services are running:
```bash
docker-compose ps | grep barbershop
```

### View logs:
```bash
# Application logs
docker-compose logs barbershop

# Database logs
docker-compose logs barbershop_db
```

### Check Traefik routing:
- Visit your Traefik dashboard to see if barbershop routes are registered
- Look for `barbershop-mo` and `barbershop-baas` routers

### Common Issues:

1. **Port conflict**: Make sure port 3001 is not used by other services
2. **Network issues**: Ensure `root_default` and `services-network` exist
3. **Volume issues**: Verify `barbershop_postgres_data` volume was created
4. **File permissions**: Ensure all files in `/root/barbershop/` are readable

### Restart services if needed:
```bash
# Restart barbershop services
docker-compose restart barbershop barbershop_db

# Or rebuild if you made changes
docker-compose up -d --build barbershop barbershop_db
```

## Security Notes

Before production use:
1. Change default admin password in environment variables
2. Use strong database password instead of `barbershop_secure_password`
3. Generate secure session secret (use: `openssl rand -hex 32`)
4. Consider adding SSL/TLS if needed

## Benefits of This Setup

✅ **No disruption** to your existing services  
✅ **Path-based routing** for clean URL structure  
✅ **Isolated database** with persistent storage  
✅ **Easy management** via your existing docker-compose.yml  
✅ **Scalable** - can easily add more barbershop instances if needed  
✅ **Maintainable** - all barbershop files organized in one directory

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