# Backend Restart Instructions

## For Local Development
```bash
cd server
npx pm2 restart all
```

## For EC2 Production Server

### Option 1: Via AWS Console
1. Go to [AWS EC2 Dashboard](https://console.aws.amazon.com/ec2/)
2. Find instance with IP `98.80.12.149`
3. Select it → Instance State → Reboot

### Option 2: Via AWS CLI (if configured)
```bash
aws ec2 reboot-instances --instance-ids i-xxxxx --region us-east-1
```

### Option 3: Manual SSH
```bash
ssh -i ~/.ssh/mian-taste-key ec2-user@98.80.12.149
cd Ai-Study-Buddy/server
npx pm2 restart all
```

## What This Does
- Reloads all PM2 processes (backend API server)
- Picks up any new routes/code changes from latest git pull
- Clears in-memory cache

## After Restarting
Wait 5-10 seconds, then test:
```bash
curl https://aistudybuddy.duckdns.org/api/recommendations
```

Should return `{"success":false,"message":"Not authorized, no token"}` instead of 404.
