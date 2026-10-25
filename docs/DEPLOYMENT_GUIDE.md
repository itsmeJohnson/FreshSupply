# FreshSupply — Infrastructure Deployment & Operations Guide

This guide details the procedure for deploying FreshSupply on client-controlled infrastructure (Linux Ubuntu 22.04 / 24.04 LTS, AWS EC2, DigitalOcean, or on-premises servers).

---

## 1. Server System Requirements

- **Operating System**: Ubuntu 22.04 LTS / 24.04 LTS x86_64
- **Minimum Compute**: 2 vCPU, 4 GB RAM, 40 GB SSD (Production MVP)
- **Recommended Compute**: 4 vCPU, 8 GB RAM, 100 GB SSD (High concurrency)
- **Network Ports**:
  - `80` (HTTP &rarr; redirected to 443)
  - `443` (HTTPS / TLS)
  - `22` (SSH - restricted by firewall)
  - `5432` (PostgreSQL - bound exclusively to `127.0.0.1` or private VPC)

---

## 2. Infrastructure Architecture

```
Internet (Clients)
      │
      ▼
 Nginx Reverse Proxy (HTTPS / Certbot SSL)
      ├── /api/*      ───> Node.js Backend Service (Port 5001)
      ├── /uploads/*  ───> Static Storage Directory (/var/www/freshsupply/uploads)
      └── /*          ───> React Web Admin Static Build (/var/www/freshsupply/admin-dist)
                                 │
                                 ▼
                     PostgreSQL 14+ (Port 5432)
```

---

## 3. Server Provisioning Step-by-Step

### Step 1: Install System Packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx postgresql postgresql-contrib

# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 Process Manager
sudo npm install -g pm2
```

### Step 2: Configure PostgreSQL
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE freshsupply_db;
CREATE USER freshsupply_app WITH ENCRYPTED PASSWORD 'StrongProductionPasswordHere#2026';
GRANT ALL PRIVILEGES ON DATABASE freshsupply_db TO freshsupply_app;
\q
```

### Step 3: Deploy Backend Codebase
```bash
# Clone or copy source code to server
sudo mkdir -p /var/www/freshsupply
sudo chown -R $USER:$USER /var/www/freshsupply

cd /var/www/freshsupply
# Copy backend folder here
cd backend
npm install --production=false
npm run build

# Configure Production .env
cat <<EOF > .env
PORT=5001
DATABASE_URL=postgresql://freshsupply_app:StrongProductionPasswordHere#2026@127.0.0.1:5432/freshsupply_db
JWT_SECRET=c28f918e7e192c4b78910248ab12e09124cbdf81920ab4
NODE_ENV=production
UPLOAD_DIR=/var/www/freshsupply/uploads
EOF

# Run Database Migrations and Initial Seed
npm run db:migrate
npm run db:seed

# Launch with PM2 with automatic system restarts
pm2 start dist/server.js --name "freshsupply-api"
pm2 save
pm2 startup
```

### Step 4: Build & Deploy Web Admin Console
```bash
cd /var/www/freshsupply/admin-web
npm install
npm run build

# Deploy compiled artifacts to Nginx web root
sudo mkdir -p /var/www/freshsupply/admin-dist
sudo cp -r dist/* /var/www/freshsupply/admin-dist/
```

### Step 5: Nginx Reverse Proxy Configuration
Create `/etc/nginx/sites-available/freshsupply`:
```nginx
server {
    listen 80;
    server_name admin.freshsupply.yourdomain.com api.freshsupply.yourdomain.com;

    # Static Web Admin SPA
    root /var/www/freshsupply/admin-dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded Images
    location /uploads/ {
        alias /var/www/freshsupply/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

Enable site and configure SSL:
```bash
sudo ln -s /etc/nginx/sites-available/freshsupply /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install free Let's Encrypt SSL certificates
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d admin.freshsupply.yourdomain.com -d api.freshsupply.yourdomain.com
```

---

## 4. Database Automated Backups

Create a daily cron job at `/etc/cron.daily/freshsupply-backup`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/freshsupply"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
pg_dump -U freshsupply_app -h 127.0.0.1 freshsupply_db | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"
find "$BACKUP_DIR" -type f -mtime +14 -name "*.sql.gz" -delete
```
Make executable: `sudo chmod +x /etc/cron.daily/freshsupply-backup`

### Database Restore Procedure
```bash
gunzip < /var/backups/freshsupply/db_YYYYMMDD_HHMMSS.sql.gz | psql -U freshsupply_app -d freshsupply_db
```

---

## 5. Android App Production Endpoint Configuration

Before distributing the release APK or publishing to Google Play:
1. Open [app/build.gradle.kts](file:///Users/apple/Workspace/GroceryDemo/android/app/build.gradle.kts).
2. Update `buildConfigField`:
   ```kotlin
   buildConfigField("String", "BASE_URL", "\"https://api.freshsupply.yourdomain.com/api/\"")
   ```
3. Run release assemble:
   ```bash
   ./gradlew assembleRelease
   ```
4. Sign with the client's approved production keystore.
