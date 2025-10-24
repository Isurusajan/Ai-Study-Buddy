# 🚀 AWS Amplify Auto-Deploy Frontend (Free Tier)

## Why Amplify?

✅ **Automatic deployment on every git push**
✅ **Free SSL/HTTPS certificate**
✅ **Free tier included**
✅ **Zero server management**
✅ **Git-connected CI/CD built-in**
✅ **No manual builds needed**
✅ **Perfect for React apps**

vs S3 + CloudFront: Manual build, manual upload, no automatic deployment. **Amplify eliminates all that hassle!**

---

## Step 1: Setup Backend on EC2 (Skip if Already Done)

Your backend will run on **EC2 t3.micro** (free tier):

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs pm2 git

# Clone repo
cd ~
git clone https://github.com/Isurusajan/Ai-Study-Buddy.git
cd Ai-Study-Buddy

# Setup backend environment
cat > server/.env << 'EOF'
MONGODB_URI=your_mongodb_atlas_uri
CLOUDINARY_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
JWT_SECRET=your_jwt_secret
NODE_ENV=production
PORT=5000
EOF

# Install and start backend
cd server
npm install --production
pm2 start "npm start" --name "backend"
pm2 save
pm2 startup
sudo env PATH=$PATH:/usr/local/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user
```

**Get your EC2 public IP** (you'll need it for frontend API calls):

```bash
curl http://checkip.amazonaws.com
# Output: 54.123.45.67 (example)
```

---

## Step 2: Connect Amplify to GitHub

### 2A. Create an AWS Amplify App

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"Create app"** → **"Host web app"**
3. Select **GitHub** as the repository provider
4. Click **"Authorize AWS Amplify on GitHub"**
5. Allow Amplify to access your repositories
6. Select your repository: `Isurusajan/Ai-Study-Buddy`
7. Select branch: `main` (or your deploy branch)
8. Click **"Next"**

---

## Step 3: Configure Build Settings

Amplify will auto-detect your React app, but we need to customize it.

### 3A. Build Command Configuration

On the build configuration screen, paste this:

```yaml
version: 1

frontend:
  phases:
    preBuild:
      commands:
        - echo "Installing dependencies..."
        - cd client && npm install
    build:
      commands:
        - echo "Building React app..."
        - echo "REACT_APP_API_URL=https://your-api-domain.com" > .env
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
        - echo "Backend not needed for Amplify - runs on EC2"
```

**IMPORTANT**: Replace `https://your-api-domain.com` with your actual backend URL:

- If using EC2 with domain: `https://api.yourdomain.com`
- If using EC2 IP temporarily: `https://54.123.45.67:5000`

---

## Step 4: Set Environment Variables

1. In Amplify console, go to **"App settings"** → **"Environment variables"**
2. Add this variable:

```
REACT_APP_API_URL = https://your-backend-domain.com
```

This is what your React app will use to call the backend API.

---

## Step 5: Configure Custom Domain (Optional but Recommended)

1. In Amplify console, go to **"Domain management"**
2. Click **"Add custom domain"**
3. Enter your domain: `myapp.com`
4. Amplify provides DNS instructions
5. Point your domain to Amplify's servers

**Free SSL/HTTPS automatically included!** ✅

---

## Step 6: First Deployment

1. Click **"Save and deploy"**
2. Amplify will automatically:
   - Clone your GitHub repo
   - Install dependencies (`npm install`)
   - Build React app (`npm run build`)
   - Deploy to CDN
   - Give you a live URL

**Watch the build progress** in the Amplify console. Takes ~5-10 minutes first time.

---

## Step 7: Every Future Deployment (Automatic!)

**That's it!** From now on:

```bash
# On your local machine
git add .
git commit -m "Fix battle settings"
git push origin main
```

**Amplify automatically:**

1. ✅ Detects the push
2. ✅ Clones your repo
3. ✅ Installs dependencies
4. ✅ Builds React app
5. ✅ Deploys to CDN
6. ✅ Updates live URL

**No manual building. No manual uploading. Pure automation.** 🎉

---

## Step 8: Monitor Deployments

1. Go to Amplify console
2. Click **"Deployments"** tab
3. See all deployments with timestamps
4. Click any deployment to see build logs
5. Green checkmark = success ✅
6. Red X = build failed (click to debug)

---

## How It Works Together

```
┌─────────────────────────────────────────────┐
│         Your GitHub Repository              │
│  (You push code: git push origin main)       │
└────────────────┬────────────────────────────┘
                 │
                 │ Git webhook (automatic)
                 ▼
┌─────────────────────────────────────────────┐
│      AWS Amplify (CI/CD Pipeline)           │
│  ✅ Clone repo                              │
│  ✅ npm install (client)                    │
│  ✅ npm run build                           │
│  ✅ Deploy to CDN                           │
└────────────────┬────────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │  Global CDN    │
        │  (Fast servers)│
        │  + HTTPS       │
        └────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │   Your Domain  │
        │ (e.g.,        │
        │  myapp.com)    │
        └────────────────┘

User visits myapp.com → Served from nearest CDN server → Lightning fast!
```

When user clicks "Login" → Frontend calls backend API:

```
https://myapp.com (React frontend from Amplify CDN)
       ↓
Calls API: https://api.yourdomain.com/api/login
       ↓
Backend responds (running on EC2)
```

---

## Architecture (Amplify + EC2)

```
┌─────────────────────────────────────────────┐
│            Your Laptop / Local              │
│  (Where you write code)                     │
└────────────────┬────────────────────────────┘
                 │
                 │ git push
                 ▼
         ┌───────────────┐
         │    GitHub     │
         │  Repository   │
         └───────┬───────┘
                 │
                 │ webhook (automatic)
                 ▼
    ┌────────────────────────┐
    │   AWS Amplify          │
    │  (Frontend hosting)    │
    │  ✅ Build React        │
    │  ✅ Auto deploy        │
    │  ✅ HTTPS + CDN        │
    └────────────────────────┘
             ▲
             │ User visits myapp.com
             │ (Served from Amplify CDN)
             │
    ┌────────┴─────────┐
    │                  │
    ▼                  ▼
┌──────────┐     ┌──────────────┐
│  Chrome  │     │   Safari     │
│ on Phone │     │ on Laptop    │
└──────────┘     └──────────────┘

                     API calls
                        │
                        ▼
                  ┌────────────────┐
                  │  EC2 Instance  │
                  │   (Backend)    │
                  │ ✅ Node.js     │
                  │ ✅ Socket.io   │
                  │ ✅ MongoDB     │
                  └────────────────┘
```

---

## Free Tier Details

| Service             | Free Tier                              | Your Cost             |
| ------------------- | -------------------------------------- | --------------------- |
| **Amplify**         | 15 GB/month build + 1 GB/month hosting | ✅ $0 (within limits) |
| **EC2**             | 750 hours/month t3.micro               | ✅ $0 for 12 months   |
| **Data Transfer**   | 100 GB/month out                       | ✅ Sufficient         |
| **Custom Domain**   | Not included                           | ~$10/year (Route 53)  |
| **SSL Certificate** | Free (auto)                            | ✅ $0                 |

**Total cost**: **$0-10/year** if you use free tier domains 🎉

---

## Common Issues & Fixes

### Build fails: "Cannot find module"

- **Fix**: Check `client/package.json` has all dependencies
- Run locally: `cd client && npm install && npm run build`
- Commit the fix, push again

### Build succeeds but app shows blank page

- **Fix**: Check browser console for errors
- Likely issue: `REACT_APP_API_URL` not set in Amplify environment variables
- Update env var, redeploy

### API calls fail (404 or CORS errors)

- **Fix**: Check `REACT_APP_API_URL` in Amplify matches your backend domain
- Check EC2 backend is running: `pm2 status` on EC2
- Check security group allows HTTPS (port 443)

### "Cannot get /..."

- **Fix**: This happens when Amplify redirects wrong. Add this to build config:

```yaml
frontend:
  phases:
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: client/build
```

### Deployment takes too long

- **Fix**: Normal first time takes 5-10 minutes
- Subsequent builds: 2-5 minutes
- Check build logs in Amplify console

---

## Step-by-Step Summary

| Step            | Action                    | Time        |
| --------------- | ------------------------- | ----------- |
| 1               | Setup EC2 backend         | 10 min      |
| 2               | Connect GitHub to Amplify | 2 min       |
| 3               | Configure build settings  | 5 min       |
| 4               | Set environment variables | 1 min       |
| 5               | Click "Deploy"            | Auto        |
| 6               | **First deployment**      | 5-10 min    |
| **Total Setup** |                           | **~30 min** |

**After setup**, every deployment is automatic when you push to GitHub! ✅

---

## Production Checklist

- [ ] Backend running on EC2 (test: `curl https://your-ec2-ip/api/health`)
- [ ] MongoDB Atlas connected (test: create battle, verify saved)
- [ ] Cloudinary API keys correct
- [ ] GitHub connected to Amplify
- [ ] Build settings configured
- [ ] Environment variables set (especially `REACT_APP_API_URL`)
- [ ] First deployment successful (green checkmark in Amplify)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate auto-generated (Amplify does this)
- [ ] Test login/create battle/upload PDF on live site
- [ ] Check browser console for errors

---

## Going Live

```bash
# 1. Make sure everything works locally
npm start  # Backend on port 5000
npm start  # Frontend on port 3000 (different terminal in client/)

# 2. Test on local machine
# Login, create battle, upload PDF, etc.

# 3. Commit and push
git add .
git commit -m "Ready for production"
git push origin main

# 4. Watch Amplify auto-deploy
# Go to Amplify console → Deployments tab
# Wait for green checkmark

# 5. Visit your live domain
# https://myapp.com (or Amplify's auto-generated URL)

# 6. Test everything again on live site
# Create battle, settings change, questions shuffle, etc.

# 7. Done! 🎉
```

---

## Never Go Back to Manual Deploys!

**Old way (S3 + CloudFront):**

```bash
npm run build
aws s3 sync client/build s3://my-bucket
# Wait 5-15 minutes for CloudFront invalidation
# Pray it works
# If not, debug manually
```

**New way (Amplify):**

```bash
git push origin main
# Automatic deployment
# Done! ✅
```

---

## Next: Backend Auto-Deploy

Once you're comfortable with Amplify frontend, we can add GitHub Actions for backend auto-deploy too:

```yaml
# .github/workflows/deploy.yml
on:
  push:
    paths:
      - "server/**"
      - ".github/workflows/**"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to EC2
        run: |
          ssh -i ${{ secrets.EC2_KEY }} ec2-user@${{ secrets.EC2_IP }} \
            "cd ~/Ai-Study-Buddy && git pull && cd server && npm install && pm2 restart backend"
```

But **Amplify handles all frontend** from now on! 🚀

---

## Questions?

- **"How do I rollback?"** → In Amplify, click any previous deployment and click "Redeploy"
- **"How do I see logs?"** → Click deployment → View logs → See build output
- **"Can I test before deploying?"** → Yes, preview deployments for pull requests
- **"How do I use a custom domain?"** → Amplify → Domain management → Add custom domain

---

**You're ready!** Let's get this deployed! 🎉
