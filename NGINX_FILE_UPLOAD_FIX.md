# Fix: Nginx Configuration for Large File Uploads

## Problem
Getting 413 Payload Too Large and CORS errors when uploading files through Nginx reverse proxy.

## Solution
Update Nginx configuration on EC2 to:
1. Increase `client_max_body_size` to allow larger uploads
2. Pass CORS headers properly

## Steps

### 1. SSH into EC2
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
# or
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2. Check Nginx Configuration
```bash
# Check if Nginx is installed
nginx -v

# Check Nginx config location
ls -la /etc/nginx/
ls -la /etc/nginx/conf.d/

# View current config
sudo cat /etc/nginx/nginx.conf
# or
sudo cat /etc/nginx/conf.d/default.conf
```

### 3. Update Nginx Configuration

```bash
# Edit the main Nginx config or your site config
sudo nano /etc/nginx/nginx.conf
# or
sudo nano /etc/nginx/conf.d/default.conf
```

**Add or update the http block with:**

```nginx
http {
    client_max_body_size 50M;  # Increase from default 1M to 50M
    
    upstream backend {
        server localhost:5000;
    }
    
    server {
        listen 80;
        server_name _;
        
        # Increase buffer sizes
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
        
        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Important: Pass through CORS headers
            proxy_pass_header Access-Control-Allow-Origin;
            proxy_pass_header Access-Control-Allow-Methods;
            proxy_pass_header Access-Control-Allow-Headers;
            proxy_pass_header Access-Control-Allow-Credentials;
        }
        
        # Handle OPTIONS preflight requests
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
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### 4. Test Nginx Configuration
```bash
# Check if config is valid
sudo nginx -t

# Should show:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 5. Reload Nginx
```bash
# Reload without restarting (no downtime)
sudo systemctl reload nginx

# Or restart if reload doesn't work
sudo systemctl restart nginx

# Verify status
sudo systemctl status nginx
```

### 6. Verify Backend is Still Running
```bash
# Check if Node.js server is running
ps aux | grep node

# Check port 5000
lsof -i :5000

# If not running, start it:
cd ~/ai-study-buddy/server
npm start &

# Or with PM2:
pm2 start npm --name "backend" -- start
```

### 7. Test File Upload
Now try uploading a file again in your app. It should work!

## Common Issues

### Still getting 413 error?
- Check `client_max_body_size` is set to at least 50M
- Make sure Nginx was reloaded: `sudo systemctl reload nginx`
- Check for error logs: `sudo tail -f /var/log/nginx/error.log`

### Still getting CORS error?
- Make sure `Add_header` lines are present in the location block
- Verify CORS headers are being set in Node.js server
- Clear browser cache: Ctrl+Shift+Delete

### Backend connection refused?
- Verify Node.js is running on port 5000: `lsof -i :5000`
- Check for errors: `pm2 logs backend` or `npm start` in server folder

## EC2 Access

If you need SSH access to your EC2 instance:
1. Download your .pem key file from AWS
2. Set permissions: `chmod 400 your-key.pem`
3. Connect: `ssh -i your-key.pem ec2-user@your-ec2-public-ip`

---

**Status**: Ready to apply
**Date**: October 25, 2025
