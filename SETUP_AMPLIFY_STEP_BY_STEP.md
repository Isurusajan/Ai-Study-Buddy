# 🚀 Setup AWS Amplify + EC2 Backend - Complete Step-by-Step Guide

## Overview

You'll have:

- **Frontend**: Deployed on AWS Amplify (auto-deploy on every git push)
- **Backend**: Running on AWS EC2 t3.micro (free tier)
- **Database**: MongoDB Atlas (free tier)
- **Files**: Cloudinary (already setup)

**Total Cost**: $0/month for 12 months, then ~$10-20/month

---

## Phase 1: Setup Backend on EC2 (20-30 minutes)

### Step 1: Create AWS Account

1. Go to [AWS Free Tier](https://aws.amazon.com/free/)
2. Click **"Create a free account"**
3. Enter email, password, set account name
4. Add payment method (won't charge if you stay in free tier)
5. Verify phone number
6. Choose **"Free plan"** support option
7. **Wait 5-10 minutes** for account activation

---

### Step 2: Create EC2 Instance

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Search for **"EC2"** → Click **"EC2 Dashboard"**
3. Click **"Launch Instance"**

**Configure Instance:**

- **Name**: `ai-study-buddy-backend`
- **AMI (Operating System)**: Select **"Amazon Linux 2 AMI"** (free tier eligible)
- **Instance Type**: Select **"t3.micro"** (free tier eligible)
- **Key Pair**:
  - Click **"Create new key pair"**
  - Name: `ai-study-buddy-key`
  - Type: **RSA**
  - Format: **.pem**
  - Click **"Create key pair"** (downloads automatically)
  - **SAVE THIS FILE SAFELY** - you'll need it to connect!

**Network Settings:**

- Click **"Edit"**
- **VPC**: Default VPC
- **Subnet**: Default subnet
- **Auto-assign public IP**: Enable ✅
- **Firewall (Security Group)**:
  - Create security group: `ai-study-buddy-sg`
  - **Inbound Rules** (click "Add rule" for each):
    ```
    Rule 1: SSH | TCP | Port 22 | 0.0.0.0/0 (anywhere)
    Rule 2: HTTP | TCP | Port 80 | 0.0.0.0/0 (anywhere)
    Rule 3: HTTPS | TCP | Port 443 | 0.0.0.0/0 (anywhere)
    Rule 4: Custom TCP | TCP | Port 5000 | 0.0.0.0/0 (your backend)
    ```

**Storage:**

- Size: 30 GB (free tier includes 30GB)
- Leave other settings default

**Click "Launch Instance"** ✅

**Wait 2-3 minutes** for instance to start. You'll see "Instance State: Running" ✅

---

### Step 3: Get Your EC2 Public IP

1. Go to EC2 Dashboard → **"Instances"**
2. Click your instance: `ai-study-buddy-backend`
3. Copy **"Public IPv4 address"** (e.g., `54.123.45.67`)
4. **Save this IP** - you'll need it for Amplify setup

---

### Step 4: Connect to EC2 via SSH

**On Windows (PowerShell):**

```powershell
# Navigate to where you saved the key
cd "C:\Users\ACER\Downloads"  # Adjust path to where key is

# Change permissions
icacls ai-study-buddy-key.pem /inheritance:r /grant:r "$($env:USERNAME):(F)"

# Connect to EC2
ssh -i ai-study-buddy-key.pem ec2-user@54.123.45.67
# Replace 54.123.45.67 with your actual public IP

# Type "yes" when prompted "Are you sure you want to continue?"
```

**On Mac/Linux:**

```bash
cd ~/Downloads  # Or wherever you saved the key
chmod 600 ai-study-buddy-key.pem
ssh -i ai-study-buddy-key.pem ec2-user@54.123.45.67
```

**You should see:**

```
[ec2-user@ip-xxx ~]$
```

Great! You're now connected to your EC2 instance! ✅

---

### Step 5: Install Node.js on EC2

Run these commands **one at a time** on your EC2 instance:

```bash
# Update system packages
sudo yum update -y

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show v9.x.x or higher

# Install PM2 (process manager - keeps app running)
sudo npm install -g pm2

# Install Git
sudo yum install -y git

# Verify
git --version   # Should show git version
```

✅ All development tools installed!

---

### Step 6: Clone Your Repository on EC2

```bash
# Create app directory
mkdir -p ~/ai-study-buddy
cd ~/ai-study-buddy

# Clone your repo
git clone https://github.com/Isurusajan/Ai-Study-Buddy.git .

# Verify
ls -la
# Should see: client/ server/ README.md etc.
```

---

### Step 7: Create Environment Files on EC2

**Create server/.env file:**

```bash
cd ~/ai-study-buddy/server

cat > .env << 'EOF'
MONGODB_URI=your_mongodb_atlas_connection_string_here
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET=your_jwt_secret_here
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-amplify-domain.amplifyapp.com
EOF
```

**Instructions:**

1. **MONGODB_URI**:

   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - If not already done: Create account → Create free cluster
   - Go to **"Databases"** → Click your cluster
   - Click **"Connect"** → Copy connection string
   - Paste into .env
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/ai-study-buddy?retryWrites=true&w=majority`

2. **CLOUDINARY_NAME, API_KEY, API_SECRET**:

   - Go to [Cloudinary Dashboard](https://cloudinary.com/console)
   - Copy your **"Cloud Name"** → paste in CLOUDINARY_NAME
   - Go to Settings → API Keys
   - Copy **"API Key"** → paste in CLOUDINARY_API_KEY
   - Copy **"API Secret"** → paste in CLOUDINARY_API_SECRET

3. **JWT_SECRET**:

   - Generate random string (use any random text, e.g., `your-super-secret-key-12345`)
   - **Make it strong and random!**

4. **CORS_ORIGIN**:
   - Leave as-is for now: `https://your-amplify-domain.amplifyapp.com`
   - We'll update it after Amplify deployment

**Save the file:**

```bash
# View to verify
cat .env

# Make sure all values are filled!
```

---

### Step 8: Install Backend Dependencies

```bash
cd ~/ai-study-buddy/server

# Install production dependencies
npm install --production

# This may take 2-3 minutes
# You should see "added XXX packages"
```

---

### Step 9: Start Backend with PM2

```bash
# Start backend
pm2 start "npm start" --name "backend"

# Save PM2 process list
pm2 save

# Make it start on system reboot
pm2 startup
# Copy the command it shows you and run it
# Should look like: sudo env PATH=$PATH:/usr/local/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

# Then run the command it showed
sudo env PATH=$PATH:/usr/local/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

# View running processes
pm2 status
# Should show: backend | running

# View logs
pm2 logs backend
# Press Ctrl+C to exit logs
```

✅ **Backend is now running and will auto-start on EC2 reboot!**

---

### Step 10: Test Backend is Working

**On your local machine** (not on EC2), open PowerShell:

```powershell
# Replace 54.123.45.67 with your EC2 public IP
curl -X GET http://54.123.45.67:5000/api/health -Headers @{"Content-Type"="application/json"}

# Or simpler:
Invoke-WebRequest -Uri "http://54.123.45.67:5000/api/health" -Method Get
```

You should see a response (if your backend has a health endpoint).

**Or test login:**

```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://54.123.45.67:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

✅ **Backend is responding!**

---

## Phase 2: Setup AWS Amplify for Frontend (15-20 minutes)

### Step 1: Connect GitHub to Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"Get Started"** → **"Amplify Hosting"**
3. Select **"GitHub"** → Click **"Continue"**
4. Click **"Authorize AWS Amplify on GitHub"**
5. GitHub will ask for permissions → Click **"Authorize aws-amplify"**
6. Select your repository: `Isurusajan/Ai-Study-Buddy`
7. Select branch: **`main`**
8. Click **"Next"**

---

### Step 2: Configure Build Settings

**On the build settings screen**, replace the entire YAML with:

```yaml
version: 1

frontend:
  phases:
    preBuild:
      commands:
        - cd client
        - npm ci
    build:
      commands:
        - echo "Building React app..."
        - npm run build
  artifacts:
    baseDirectory: client/build
    files:
      - "**/*"
  cache:
    paths:
      - client/node_modules/**/*

backend:
  phases:
    build:
      commands:
        - echo "Backend running on EC2"
```

---

### Step 3: Add Environment Variables

1. Click **"Edit"** next to "Environment variables"
2. Add this variable:

```
REACT_APP_API_URL = http://54.123.45.67:5000
```

**Replace `54.123.45.67`** with your actual EC2 public IP!

3. Click **"Save"**

---

### Step 4: Review & Deploy

1. Review all settings
2. Click **"Save and deploy"**
3. Amplify will start building!

**Watch the build progress:**

- The console shows real-time output
- First deployment takes 5-10 minutes
- You'll see: "✅ Deployment successful"

When done, you'll get a URL like:

```
https://main.dxxxxx.amplifyapp.com
```

✅ **Your frontend is now live!**

---

### Step 5: Update EC2 CORS Settings

Now that you have your Amplify domain, update your backend:

**On EC2**, update the .env file:

```bash
cd ~/ai-study-buddy/server

# Edit the file
nano .env

# Find CORS_ORIGIN line and change it to:
CORS_ORIGIN=https://main.dxxxxx.amplifyapp.com
# (Use your actual Amplify URL from Step 4)

# Save: Press Ctrl+X, then Y, then Enter
```

**Restart backend:**

```bash
pm2 restart backend
pm2 logs backend
```

✅ **CORS is now configured!**

---

## Phase 3: Test Everything (10-15 minutes)

### Test 1: Frontend is Live

1. Open your browser
2. Go to: `https://main.dxxxxx.amplifyapp.com`
3. You should see your AI Study Buddy app!

---

### Test 2: Backend Connection

1. On the frontend, click **"Login"**
2. Try logging in with test credentials
3. **If it works**: Frontend ↔ Backend connection is working! ✅
4. **If it fails**:
   - Open browser console (F12)
   - Check for errors
   - Verify `REACT_APP_API_URL` in Amplify env variables

---

### Test 3: Create Battle

1. Login successfully
2. Create a battle
3. Check battle is created (visit MongoDB Atlas dashboard)

---

### Test 4: Upload PDF

1. Go to dashboard
2. Upload a PDF
3. Verify it appears in Cloudinary dashboard

---

## Phase 4: Setup Auto-Deployment (5 minutes)

**You're done!** Every time you push to GitHub:

```bash
# On your local machine
git add .
git commit -m "Fix battle settings"
git push origin main
```

**Amplify automatically:**

1. Detects the push
2. Builds your React app
3. Deploys to CDN
4. Your changes are live in 3-5 minutes!

---

## Troubleshooting

### Problem: Amplify build fails

**Check the logs:**

1. Go to Amplify console
2. Click **"Deployments"** tab
3. Click the failed deployment
4. Scroll through the build output to find the error
5. Common issues:
   - Missing dependencies in `client/package.json`
   - Syntax errors in React code
   - Missing environment variables

**Fix:**

1. Fix the issue locally
2. Test: `npm run build` in client folder
3. Commit and push
4. Amplify will auto-retry

---

### Problem: Frontend can't reach backend

**Debug:**

1. Check EC2 instance is running: AWS Console → EC2 → Instances
2. Check security group allows port 5000: EC2 → Security Groups → `ai-study-buddy-sg`
3. Check `REACT_APP_API_URL` in Amplify is correct
4. Check MongoDB connection string in EC2 .env
5. View backend logs: SSH into EC2 → `pm2 logs backend`

---

### Problem: MongoDB connection failed

**Check:**

1. Is MongoDB Atlas cluster running? (Dashboard → Clusters)
2. Is IP whitelisted? (MongoDB Atlas → Network Access → Add IP address)
3. Is connection string correct? (copy fresh from MongoDB Atlas)
4. Is password correct? (no special characters, or escape them)

---

### Problem: Cloudinary image/PDF not loading

**Check:**

1. Is Cloudinary API key correct?
2. Is file security settings correct? (already did this)
3. Did you re-upload the file after fixing settings?

---

## Monitoring & Maintenance

### Check EC2 is Running

**From local machine:**

```powershell
# Replace IP with your EC2 IP
curl http://54.123.45.67:5000/api/health
```

Or from AWS Console:

1. EC2 Dashboard → Instances
2. Look for "ai-study-buddy-backend"
3. Should show "Running" status ✅

---

### View Backend Logs

**SSH into EC2:**

```bash
ssh -i ai-study-buddy-key.pem ec2-user@54.123.45.67

# View real-time logs
pm2 logs backend

# View specific errors
pm2 logs backend --err

# Stop/start backend
pm2 stop backend
pm2 start backend
```

---

### Check MongoDB Usage

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click your cluster
3. View **"Metrics"** tab
4. See storage, connections, requests
5. Free tier includes 512 MB storage

---

### Check Amplify Deployments

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click your app
3. See all deployments with timestamps
4. Each push triggers new deployment automatically

---

## Next Steps (Optional Enhancements)

After everything is working:

1. **Add Custom Domain**

   - Go to Amplify → Domain Management
   - Add your custom domain (e.g., mystudybuddy.com)
   - Point DNS to Amplify

2. **Setup Monitoring**

   - AWS CloudWatch
   - Email alerts on errors

3. **Enable HTTPS on EC2**

   - Install Nginx + Let's Encrypt
   - Proxy backend through HTTPS

4. **Auto-Backup MongoDB**

   - MongoDB Atlas → Backup settings
   - Enable continuous backups

5. **GitHub Actions for Backend Auto-Deploy**
   - When you push to `server/` folder
   - Automatically update EC2 backend
   - Restart services

---

## Quick Checklist ✅

- [ ] AWS account created
- [ ] EC2 instance running
- [ ] SSH key saved safely
- [ ] Node.js installed on EC2
- [ ] Backend code cloned
- [ ] .env files created with all secrets
- [ ] Backend running (pm2 status shows "running")
- [ ] GitHub connected to Amplify
- [ ] Build settings configured
- [ ] Environment variables set in Amplify
- [ ] First deployment successful
- [ ] Frontend is live (can see it in browser)
- [ ] Backend connection works (login works)
- [ ] Every git push auto-deploys frontend ✅

---

## You're Done! 🎉

Your app is now:

- ✅ Deployed on AWS (free tier)
- ✅ Auto-deploys on every git push
- ✅ Running on Amplify (frontend)
- ✅ Running on EC2 (backend)
- ✅ Using MongoDB (database)
- ✅ Using Cloudinary (files)
- ✅ Using AWS (infrastructure)

**No more manual deployments. No more S3 uploads. Pure automation!**

Every time you code:

```bash
git push origin main
# Amplify automatically builds & deploys ✨
```

---

## Questions?

- Check the AMPLIFY_AUTO_DEPLOY.md for more details
- Check AWS free tier limits
- Check your email for AWS billing alerts (set threshold to $1)

**Enjoy your production app!** 🚀
