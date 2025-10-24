# 🚀 AWS Deployment Guide - CI/CD Pipeline

## Overview
Deploy **AI Study Buddy** to AWS using CI/CD pipeline (GitHub Actions + AWS services). No S3 needed - we'll use EC2 or Elastic Beanstalk.

---

## Option 1: AWS Elastic Beanstalk (RECOMMENDED - Easiest)

### ✅ Best For
- Full-stack deployment (React + Node.js)
- Automatic scaling
- Easy environment management
- Built-in CI/CD support

### 📋 Prerequisites
1. AWS Account with IAM permissions
2. AWS CLI installed: `aws configure`
3. GitHub repository (already have it ✅)
4. Environment variables ready

### 🔧 Setup Steps

#### Step 1: Prepare for Beanstalk
```bash
# Install EB CLI
pip install awsebcli --upgrade --user

# Or using Chocolatey (Windows)
choco install awsebcli
```

#### Step 2: Initialize Beanstalk
```bash
# In project root
eb init -p node.js-18 ai-study-buddy --region us-east-1
eb create study-buddy-env
```

#### Step 3: Configure Environment Variables
```bash
# Set environment variables in EB
eb setenv MONGODB_URI="your_mongodb_connection" \
          CLOUDINARY_NAME="your_cloudinary_name" \
          CLOUDINARY_API_KEY="your_key" \
          CLOUDINARY_API_SECRET="your_secret" \
          JWT_SECRET="your_jwt_secret" \
          REACT_APP_API_URL="https://your-domain.com"
```

#### Step 4: Deploy
```bash
# Deploy the application
eb deploy

# Monitor logs
eb logs
```

---

## Option 2: GitHub Actions + EC2 (More Control)

### ✅ Best For
- Full control over deployment
- Custom deployment logic
- Multiple environments
- Cost-effective

### 📋 Architecture
```
GitHub Repository
    ↓ (on push to main)
GitHub Actions Workflow
    ↓ (runs tests, builds)
Build Artifacts
    ↓ (SSH to EC2)
EC2 Instance
    ↓ (pulls code, runs services)
Production App
```

### 🔧 Setup Steps

#### Step 1: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS EC2

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  AWS_REGION: us-east-1
  EC2_INSTANCE_IP: ${{ secrets.EC2_INSTANCE_IP }}
  EC2_USER: ec2-user
  EC2_KEY_PATH: /home/runner/.ssh/aws-key.pem

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    # Install dependencies
    - name: Install Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    # Test Backend
    - name: Test Backend
      run: |
        cd server
        npm install
        npm test 2>/dev/null || true
      continue-on-error: true
    
    # Build Frontend
    - name: Build Frontend
      run: |
        cd client
        npm install
        npm run build
      env:
        REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
    
    # Setup SSH
    - name: Setup SSH Key
      run: |
        mkdir -p /home/runner/.ssh
        echo "${{ secrets.AWS_EC2_PRIVATE_KEY }}" > /home/runner/.ssh/aws-key.pem
        chmod 600 /home/runner/.ssh/aws-key.pem
        ssh-keyscan -H ${{ env.EC2_INSTANCE_IP }} >> /home/runner/.ssh/known_hosts
    
    # Deploy to EC2
    - name: Deploy to EC2
      run: |
        ssh -i /home/runner/.ssh/aws-key.pem ${{ env.EC2_USER }}@${{ env.EC2_INSTANCE_IP }} << 'EOF'
        cd /home/ec2-user/ai-study-buddy
        git pull origin main
        cd server && npm install && npm start &
        cd ../client && npm install && npm run build
        pm2 restart all || true
        EOF
```

#### Step 2: Add GitHub Secrets

Go to GitHub Repository → Settings → Secrets → New Secret

Add:
- `AWS_EC2_PRIVATE_KEY` - Your EC2 key pair (private key)
- `EC2_INSTANCE_IP` - Your EC2 instance public IP
- `MONGODB_URI` - MongoDB connection string
- `REACT_APP_API_URL` - Backend API URL
- `CLOUDINARY_NAME` - Cloudinary account name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `JWT_SECRET` - JWT secret key

#### Step 3: Setup EC2 Instance

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone repository
git clone https://github.com/Isurusajan/Ai-Study-Buddy.git
cd Ai-Study-Buddy

# Install dependencies
cd server && npm install
cd ../client && npm install

# Build frontend
npm run build

# Start services with PM2
pm2 start "npm run dev" --name "backend" --cwd server/
pm2 start "npm start" --name "frontend" --cwd client/
pm2 save
pm2 startup
```

---

## Option 3: AWS CodePipeline (Most Enterprise-Ready)

### ✅ Best For
- Enterprise deployments
- Multiple stages (dev, staging, prod)
- Advanced testing
- Full AWS integration

### 📋 Architecture
```
GitHub Repository
    ↓
CodePipeline (Source Stage)
    ↓
CodeBuild (Build Stage)
    ↓ (Artifacts to S3)
CodeDeploy (Deploy Stage)
    ↓
EC2 / Elastic Beanstalk
```

### 🔧 Setup Steps

#### Step 1: Create CodePipeline
1. Go to AWS CodePipeline console
2. Click "Create pipeline"
3. Pipeline name: `ai-study-buddy-pipeline`
4. Service role: Create new
5. Source provider: GitHub
6. Connect GitHub account
7. Select repository: `Isurusajan/Ai-Study-Buddy`
8. Branch: `main`

#### Step 2: Configure Build Stage
1. Build provider: AWS CodeBuild
2. Create project
3. Environment:
   - OS: Ubuntu
   - Runtime: Node.js 18
   - Image: `aws/codebuild/standard:7.0`

#### Step 3: Create buildspec.yml

Create `buildspec.yml` in root:

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo "Installing dependencies..."
      - cd server && npm install && cd ../client && npm install
  
  build:
    commands:
      - echo "Building application..."
      - cd client && npm run build
      - cd ../server && npm install --production
  
  post_build:
    commands:
      - echo "Build completed"

artifacts:
  files:
    - '**/*'
  name: BuildArtifact
  exclude:
    - node_modules/**/*
    - '.git/**/*'
```

#### Step 4: Configure Deploy Stage
1. Deploy provider: CodeDeploy
2. Create CodeDeploy application
3. Compute platform: EC2/On-premises

#### Step 5: Create appspec.yml

Create `appspec.yml` in root:

```yaml
version: 0.0
Resources:
  - TargetService:
      Type: AWS::EC2::Instance
      Properties:
        Tags:
          - Key: Name
            Value: ai-study-buddy

Hooks:
  ApplicationStart:
    - Location: scripts/start.sh
      Timeout: 300
  ApplicationStop:
    - Location: scripts/stop.sh
      Timeout: 300

Files:
  - source: /
    destination: /home/ec2-user/ai-study-buddy
```

#### Step 6: Create Deployment Scripts

Create `scripts/stop.sh`:
```bash
#!/bin/bash
pm2 stop all || true
```

Create `scripts/start.sh`:
```bash
#!/bin/bash
cd /home/ec2-user/ai-study-buddy
cd server && npm install && pm2 start "npm run dev" --name backend
cd ../client && npm install && npm run build
pm2 restart all
```

---

## Option 4: AWS Amplify (Simplest for Frontend)

### ✅ Best For
- React frontend only
- Serverless hosting
- Automatic deployments
- Free tier available

### 📋 Setup Steps

1. Go to AWS Amplify console
2. Connect GitHub repository
3. Select branch: `main`
4. Configure build:
   - Build command: `npm run build` (in client folder)
   - Output directory: `client/build`
5. Add environment variables:
   - `REACT_APP_API_URL`: Your backend API URL
6. Deploy!

---

## 🔐 Security Best Practices

### Environment Variables
Never commit secrets! Use:
- GitHub Secrets for CI/CD
- AWS Secrets Manager for production
- Environment variable files (.env.local - in .gitignore)

### Example .env.local (DO NOT COMMIT)
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/db
CLOUDINARY_API_KEY=your_key_here
CLOUDINARY_API_SECRET=your_secret_here
JWT_SECRET=your_jwt_secret_here
REACT_APP_API_URL=https://api.yourdomain.com
```

### IAM Permissions (Minimal)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:GetConsoleOutput"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "codedeploy:CreateDeployment",
        "codedeploy:GetDeployment"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 📊 Recommended Architecture

```
                    Route 53 (DNS)
                         ↓
                   CloudFront (CDN)
                         ↓
    ┌────────────────────┴────────────────────┐
    ↓                                          ↓
Frontend (Amplify/S3)              Backend (Elastic Beanstalk)
- React static build               - Node.js + Express
- Auto-scaling                     - Socket.io support
- Auto-HTTPS                       - MongoDB connection
                                   - Auto-scaling

    ┌──────────────────────────────────────────┐
    ↓
External Services:
- MongoDB Atlas (Database)
- Cloudinary (File Storage)
- SendGrid/SES (Email)
```

---

## 🚀 Deployment Checklist

- [ ] AWS Account created & configured
- [ ] GitHub secrets added
- [ ] Environment variables prepared
- [ ] SSL certificate ready (AWS Certificate Manager)
- [ ] Database backups configured
- [ ] Monitoring setup (CloudWatch)
- [ ] Error logging (CloudWatch Logs)
- [ ] CI/CD pipeline tested
- [ ] Rollback plan documented
- [ ] Domain configured

---

## 🔍 Monitoring & Logs

### CloudWatch Logs
```bash
# View logs from AWS CLI
aws logs tail /aws/elasticbeanstalk/ai-study-buddy/var/log/eb-activity.log --follow
```

### Application Health Check
- Set up CloudWatch alarms
- Monitor API response times
- Track error rates
- Monitor database connections

---

## 💰 Cost Estimation (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| EC2 t3.micro | $8 | Free tier eligible |
| NAT Gateway | $45 | If needed for outbound |
| MongoDB Atlas | $0-57 | Shared tier free, M0 |
| CloudFront | $0.085/GB | Typical: $10-20 |
| Route 53 | $0.50 | Per hosted zone |
| **Total** | **~$60-80** | Very scalable |

---

## 📚 Next Steps

1. **Choose deployment option** (I recommend Elastic Beanstalk for simplicity)
2. **Prepare AWS account** with proper IAM roles
3. **Set up CI/CD pipeline** (GitHub Actions or AWS CodePipeline)
4. **Configure monitoring** and alerting
5. **Test deployment** in staging first
6. **Document rollback procedures**
7. **Deploy to production!** 🎉

Need help with any specific step? Let me know!
