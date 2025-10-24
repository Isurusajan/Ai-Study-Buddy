# 🚀 Quick AWS Deployment Setup

## Step 1: Create GitHub Secrets

Go to: GitHub → Your Repo → Settings → Secrets and Variables → Actions

Add these secrets:

```
AWS_EC2_PRIVATE_KEY          → (Your EC2 key pair private key)
EC2_INSTANCE_IP              → (Your EC2 instance public IP, e.g., 54.123.45.67)
EC2_USER                     → ec2-user (or ubuntu if using Ubuntu AMI)
REACT_APP_API_URL            → https://your-domain.com
DOMAIN_NAME                  → your-domain.com
MONGODB_URI                  → (MongoDB Atlas connection string)
CLOUDINARY_NAME              → (Your Cloudinary account name)
CLOUDINARY_API_KEY           → (Cloudinary API key)
CLOUDINARY_API_SECRET        → (Cloudinary API secret)
JWT_SECRET                   → (Generate: $(openssl rand -base64 32))
```

## Step 2: Create EC2 Instance

### Using AWS Console:

1. Go to EC2 Dashboard
2. Launch Instance
3. Choose AMI: **Amazon Linux 2** or **Ubuntu 22.04**
4. Instance type: **t3.micro** (free tier eligible)
5. Create key pair: Download `.pem` file safely
6. Security group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (API)
7. Launch!

### Or using AWS CLI:

```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --key-name my-key-pair \
  --security-groups allow-ssh-http-https
```

## Step 3: Setup EC2 Instance

SSH into your instance:

```bash
chmod 600 your-key.pem
ssh -i your-key.pem ec2-user@your-instance-ip
```

Run these commands:

```bash
# Update system
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo yum install -y git

# Create app directory
mkdir -p ~/ai-study-buddy
cd ~/ai-study-buddy

# Clone repository
git clone https://github.com/Isurusajan/Ai-Study-Buddy.git .

# Create .env file with secrets (use EC2_USER + run commands, or paste manually)
cat > server/.env << 'EOF'
MONGODB_URI=your_mongodb_uri_here
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
JWT_SECRET=your_jwt_secret
NODE_ENV=production
EOF

cat > client/.env << 'EOF'
REACT_APP_API_URL=https://your-domain.com
EOF

# Install dependencies
cd server && npm install --production
cd ../client && npm install

# Build frontend
npm run build

# Start with PM2
pm2 start "npm run dev" --name "backend" --cwd ~/ai-study-buddy/server
pm2 start "npm start" --name "frontend" --cwd ~/ai-study-buddy/client
pm2 save
pm2 startup
sudo env PATH=$PATH:/usr/local/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

# Setup reverse proxy with Nginx (optional but recommended)
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure Nginx (see next section)
```

## Step 4: Configure Nginx (Optional but Recommended)

Create `/etc/nginx/conf.d/ai-study-buddy.conf`:

```nginx
upstream backend {
    server localhost:5000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificate (use AWS Certificate Manager)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Step 5: Setup SSL Certificate

### Using AWS Certificate Manager:

1. Go to AWS Certificate Manager
2. Request certificate for your domain
3. Validate ownership via DNS
4. Get certificate ARN

Or use **Let's Encrypt** (free):

```bash
sudo yum install -y certbot python-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com
```

## Step 6: Configure Domain

1. Go to Route 53 (or your DNS provider)
2. Create A record pointing to your EC2 instance IP
3. Wait for DNS propagation (5-15 minutes)

## Step 7: First Deployment

1. Commit and push to main branch
2. GitHub Actions automatically triggers
3. Workflow builds, tests, and deploys
4. Check deployment status in Actions tab

## Step 8: Monitor Deployment

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-instance-ip

# Check running processes
pm2 status

# View logs
pm2 logs backend
pm2 logs frontend

# Monitor real-time
pm2 monit
```

## 🔍 Troubleshooting

### Deployment fails at SSH step

- Check EC2_INSTANCE_IP secret is correct
- Verify security group allows SSH (port 22)
- Check private key is valid (full content in secret)

### App doesn't start after deployment

```bash
pm2 logs backend
pm2 logs frontend
```

### Environment variables not loading

```bash
# Check .env files
cat server/.env
cat client/.env

# Restart services
pm2 restart all
```

### Port conflicts

```bash
# Check what's using ports
lsof -i :5000
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

## 🎉 Success!

Your app should now be running on `https://your-domain.com`!

Every time you push to `main` branch, GitHub Actions automatically:

1. ✅ Builds frontend
2. ✅ Tests backend
3. ✅ Deploys to EC2
4. ✅ Restarts services
5. ✅ Notifies status

---

## 📚 Next Steps

- [ ] Setup CloudWatch monitoring
- [ ] Configure automated backups
- [ ] Setup error logging (Sentry/LogRocket)
- [ ] Configure email alerts
- [ ] Load testing before production
- [ ] Database replication setup

Questions? Check DEPLOYMENT_GUIDE.md for more details!
