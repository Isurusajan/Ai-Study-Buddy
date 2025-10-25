# 🚀 STEP-BY-STEP: Fix Nginx for File Uploads

## Step 1: Get Your EC2 Information

You'll need:
1. Your EC2 **Public IP Address** (from AWS Console)
2. Your SSH **Key File** (.pem file)
3. Your **username** (usually `ec2-user` for Amazon Linux or `ubuntu` for Ubuntu)

**Where to find these:**
- Go to AWS Console → EC2 → Instances
- Select your instance
- Copy the "Public IPv4 address"
- Check the "OS details" to see if it's Amazon Linux or Ubuntu

---

## Step 2: Open Terminal/PowerShell

### On Windows:
- Open PowerShell (right-click → Run as Administrator)
- Or use Command Prompt

### Mac/Linux:
- Open Terminal

---

## Step 3: Navigate to Your Key File

Find where you saved your .pem file. Typically in your Downloads folder.

**PowerShell Commands:**

```powershell
# List files to find your .pem key
ls $env:USERPROFILE\Downloads\*.pem

# You should see something like:
# ai-study-buddy-key.pem
# my-ec2-key.pem
```

---

## Step 4: Set Permissions on Key File (Windows)

**This is important! Your key file needs restricted permissions.**

```powershell
# Replace with your actual key file name
$key = "$env:USERPROFILE\Downloads\your-key-name.pem"

# Set permissions (icacls is Windows permission tool)
icacls $key /inheritance:r /grant:r "$env:USERNAME`:F"
```

---

## Step 5: SSH into Your EC2 Instance

**Replace these values:**
- `your-ec2-public-ip` → Your actual EC2 Public IP (e.g., 54.123.45.67)
- `your-key-name.pem` → Your actual key file name
- `ec2-user` → or `ubuntu` if you have Ubuntu

**PowerShell:**

```powershell
# Amazon Linux
ssh -i "$env:USERPROFILE\Downloads\your-key-name.pem" ec2-user@your-ec2-public-ip

# Or if Ubuntu:
ssh -i "$env:USERPROFILE\Downloads\your-key-name.pem" ubuntu@your-ec2-public-ip
```

**You should see:**
```
The authenticity of host 'your-ec2-public-ip (your-ec2-public-ip)' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

Type: **`yes`** and press Enter

---

## Step 6: You're Now on EC2! 🎉

You should see a prompt like:
```
[ec2-user@ip-xxx-xxx-xxx-xxx ~]$
```

or

```
ubuntu@ip-xxx-xxx-xxx-xxx:~$
```

---

## Step 7: Check if Nginx is Running

**Run this command:**

```bash
sudo systemctl status nginx
```

**You should see:**
- `Active: active (running)` ✅

If it says `inactive`, run:
```bash
sudo systemctl start nginx
```

---

## Step 8: Find Nginx Configuration File

**Run this command:**

```bash
ls -la /etc/nginx/conf.d/
```

**You'll see files like:**
- `default.conf`
- `ai-study-buddy.conf`
- Other .conf files

**Find the config that has your domain or backend proxy.**

---

## Step 9: Edit Nginx Configuration

**Run this command:**

```bash
# Edit the main config (try this first)
sudo nano /etc/nginx/conf.d/default.conf
```

**Or if that doesn't exist:**

```bash
sudo nano /etc/nginx/nginx.conf
```

---

## Step 10: Inside the Nano Editor

You should see the Nginx configuration file content.

### Option A: If You See `http { }` Block

Find the line that says `http {` and add this right after it:

```nginx
client_max_body_size 50M;
```

### Option B: If You See `server { }` Block

Look for the `server {` section and find where it says `location / {`

**Before the location block, add:**

```nginx
client_max_body_size 50M;
```

### Example of what it should look like:

```nginx
server {
    listen 80;
    server_name _;
    
    # ADD THIS LINE:
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:5000;
        # ... rest of config
    }
}
```

---

## Step 11: Navigate in Nano Editor

**Keyboard shortcuts:**

```
Ctrl + F    → Find text
Ctrl + W    → Search
Ctrl + Y    → Page down
Ctrl + V    → Page up
Ctrl + G    → Go to line
```

**Find where to add the line and use arrow keys to position cursor**

---

## Step 12: Add the Critical Lines

**Copy this entire location block and paste it into the server block:**

```nginx
location ~ ^(.*)$ {
    if ($request_method = OPTIONS) {
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
    
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

---

## Step 13: Save and Exit Nano

**Press these keys in order:**

```
Ctrl + X     → Exit
Y            → Yes, save changes
Enter        → Confirm filename
```

**You should be back at the command prompt**

---

## Step 14: Test Nginx Configuration

**Run this command:**

```bash
sudo nginx -t
```

**You should see:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

✅ **If you see this, you're good!**

❌ **If you see an error**, go back and fix the syntax:
```bash
sudo nano /etc/nginx/conf.d/default.conf
```

---

## Step 15: Reload Nginx (No Downtime!)

**Run this command:**

```bash
sudo systemctl reload nginx
```

**Verify it reloaded:**

```bash
sudo systemctl status nginx
```

**Should show:** `Active: active (running)` ✅

---

## Step 16: Verify Node.js Backend is Running

**Check if Node.js is listening on port 5000:**

```bash
sudo lsof -i :5000
```

**You should see:**
```
node    12345  ec2-user    ...    TCP localhost:5000 (LISTEN)
```

**If nothing shows, start the backend:**

```bash
cd ~/ai-study-buddy/server
npm start
```

**Or with PM2:**

```bash
pm2 start npm --name backend -- start
pm2 logs backend
```

---

## Step 17: Test the Upload! 🧪

### On Your Computer:

1. Open browser → `https://aistudybuddy.duckdns.org`
2. Log in to your account
3. Go to **Dashboard**
4. Click **"Upload Study Material"**
5. Select a **PDF file** (small one first, like 1-2 MB)
6. Enter a title
7. Click **"Upload & Create Deck"**

### Expected Result:

✅ File uploads successfully!
✅ No CORS error
✅ No 413 error
✅ Deck is created

### If Still Getting Error:

Go back to EC2 terminal and check logs:

```bash
# View Nginx errors
sudo tail -f /var/log/nginx/error.log

# View Node.js backend
pm2 logs backend
```

---

## Step 18: Disconnect from EC2

**Type this command:**

```bash
exit
```

**You're back on your computer! 🎉**

---

## Quick Reference: All Commands

```bash
# SSH into EC2 (do this first)
ssh -i "$env:USERPROFILE\Downloads\your-key.pem" ec2-user@your-ec2-ip

# Check Nginx status
sudo systemctl status nginx

# Edit config
sudo nano /etc/nginx/conf.d/default.conf

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check if Node.js is running
sudo lsof -i :5000

# View Nginx errors
sudo tail -f /var/log/nginx/error.log

# Exit EC2
exit
```

---

## Troubleshooting Checklist ✅

- [ ] SSH connection successful
- [ ] Nginx status shows "active (running)"
- [ ] Added `client_max_body_size 50M;` to config
- [ ] `sudo nginx -t` shows "ok"
- [ ] `sudo systemctl reload nginx` successful
- [ ] Node.js showing on port 5000
- [ ] Can access https://aistudybuddy.duckdns.org
- [ ] File upload works without errors

---

## Still Stuck?

If you get stuck on any step, let me know:
1. **What step you're on**
2. **What error you see**
3. **Screenshot of terminal (if possible)**

I'll help you fix it! 💪

---

**Date:** October 25, 2025
**Status:** Ready to follow
