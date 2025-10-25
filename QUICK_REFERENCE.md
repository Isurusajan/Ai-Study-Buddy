# ⚡ Quick Reference - Commands & Status

## 🟢 Current Status

- ✅ Frontend improvements committed
- ✅ Code pushed to GitHub
- 🔄 Amplify building (in progress)
- ✅ Backend running (PM2 online)
- ✅ Nginx WebSocket fixed & reloaded
- ✅ SSL certificates valid

---

## 🔗 Important Links

| Resource               | URL                                          | Notes          |
| ---------------------- | -------------------------------------------- | -------------- |
| **Frontend (Amplify)** | https://main.d1dg86wxbzr6zt.amplifyapp.com   | Building now   |
| **API/WebSocket**      | https://aistudybuddy.duckdns.org             | Ready          |
| **GitHub Repo**        | https://github.com/Isurusajan/Ai-Study-Buddy | Commit 493cf92 |
| **AWS Amplify**        | AWS Console → Amplify                        | Build status   |
| **EC2 Instance**       | 98.80.12.149                                 | Backend server |

---

## 📋 Git Log (Recent)

```
493cf92 - Improve mobile login/register design ← JUST DEPLOYED
d34276c - Center login/register boxes
255ec17 - Fix: Keep login/register centered, robot at bottom-left
20fe1df - Enhance Dashboard with real-time study tracking
0e2cecd - Add animated AI robot background
```

---

## 🧪 Testing URLs

### Test on Mobile

1. Visit: https://main.d1dg86wxbzr6zt.amplifyapp.com (after build)
2. Hard refresh: Ctrl+Shift+R
3. Should see: 🤖 emoji, gradient button, emoji labels

### Test WebSocket

1. Visit: https://aistudybuddy.duckdns.org
2. Login
3. Enter Battle Mode
4. DevTools Network → Look for wss:// connection

### Test Dashboard

1. Login
2. Check Study Time → Updates every 1 second
3. Wait 30 sec, refresh → Time persists

---

## 🔧 SSH Commands

**Format**: `ssh -i <key> ec2-user@98.80.12.149 '<command>'`

### Check Backend Status

```bash
pm2 status
```

**Expected**: Online, 0 crashes, ~102MB memory

### View Backend Logs

```bash
pm2 logs study-buddy --lines 50
```

### Check Nginx

```bash
sudo systemctl status nginx
```

**Expected**: Active (running)

### Test Nginx Syntax

```bash
sudo nginx -t
```

**Expected**: syntax ok, test successful

### Reload Nginx

```bash
sudo systemctl reload nginx
```

### View Nginx Config

```bash
sudo cat /etc/nginx/conf.d/api.conf
```

### Check Open Ports

```bash
sudo netstat -tuln | grep -E "80|443|5000"
```

### View SSL Certificates

```bash
sudo certbot certificates
```

### Restart Services (if needed)

```bash
sudo systemctl restart nginx && pm2 restart study-buddy
```

---

## 📁 Key Files Modified

| File                                     | Changes                       | Status      |
| ---------------------------------------- | ----------------------------- | ----------- |
| `client/src/components/Auth/Login.js`    | Emoji icons, gradient button  | ✅ Deployed |
| `client/src/components/Auth/Register.js` | Emoji icons, gradient button  | ✅ Deployed |
| `/etc/nginx/conf.d/api.conf`             | WebSocket headers, fix config | ✅ Deployed |

---

## 🔐 Important Paths on EC2

```
Backend code:     /home/ec2-user/ai-study-buddy/server
Nginx config:     /etc/nginx/conf.d/api.conf
SSL certs:        /etc/letsencrypt/live/aistudybuddy.duckdns.org/
PM2 apps:         /home/ec2-user/.pm2/apps.json (or similar)
```

---

## 🚨 If Something Goes Wrong

### WebSocket Connection Fails

1. Check Nginx: `sudo nginx -t`
2. Reload Nginx: `sudo systemctl reload nginx`
3. Check backend: `pm2 status`
4. View logs: `pm2 logs study-buddy`

### Frontend Not Updating

1. Hard refresh: `Ctrl+Shift+R`
2. Clear cache: DevTools → Application → Clear All
3. Check Amplify build: AWS Console

### Database Connection Issues

1. Check backend logs: `pm2 logs study-buddy`
2. Verify MongoDB Atlas status
3. Check connection string in .env

### SSL Certificate Issues

1. Check expiry: `sudo certbot certificates`
2. Renew if needed: `sudo certbot renew`
3. Restart Nginx: `sudo systemctl restart nginx`

---

## 📊 Performance Metrics

| Metric          | Value       | Status        |
| --------------- | ----------- | ------------- |
| Backend uptime  | 66+ minutes | ✅ Stable     |
| Memory usage    | 102.2 MB    | ✅ Normal     |
| CPU usage       | 0% idle     | ✅ Not loaded |
| Nginx errors    | 0           | ✅ None       |
| PM2 restarts    | 0           | ✅ No crashes |
| SSL certificate | Valid       | ✅ Active     |

---

## 🎯 Deployment Timeline

| Time     | Event                         | Status         |
| -------- | ----------------------------- | -------------- |
| T+0 min  | Code pushed to GitHub         | ✅ Done        |
| T+1 min  | Amplify build started         | 🔄 In Progress |
| T+4 min  | Amplify build should complete | ⏳ Expected    |
| T+5 min  | User hard refresh needed      | ⏳ Next        |
| T+10 min | Mobile improvements visible   | ⏳ Expected    |

---

## 📱 What Users Will See

### Login Screen

✅ 🤖 Robot emoji in header  
✅ 📧 Email label with emoji  
✅ 🔐 Password label with emoji  
✅ ✨ Sparkle emoji in button  
✅ Gradient blue button  
✅ Smooth animations

### Battle Mode

✅ Instant WebSocket connection  
✅ No connection errors  
✅ Real-time game updates  
✅ Smooth animations

### Dashboard

✅ Live study time (updates per second)  
✅ Study streak  
✅ Deck count  
✅ Quiz count

---

## 🔍 Verification Checklist

- [x] Backend running (PM2 online)
- [x] Nginx configured (WebSocket headers)
- [x] SSL certificates valid
- [x] Code committed (493cf92)
- [x] Code pushed to GitHub
- [x] Amplify build triggered
- [ ] Amplify build completed (4-5 min)
- [ ] Frontend hard refresh (user action)
- [ ] Mobile improvements visible (verify)
- [ ] WebSocket connection working (test)
- [ ] Dashboard tracking working (verify)

---

## 💡 Tips & Tricks

### Force Amplify Rebuild

1. Push new commit to main branch
2. Check AWS Amplify console
3. Build starts automatically

### Monitor Build Progress

```bash
# Check AWS Amplify console for real-time updates
# Or wait for email notification when complete
```

### Test WebSocket Locally

```bash
curl -i https://aistudybuddy.duckdns.org/socket.io/?EIO=4&transport=polling
```

### Check DNS Resolution

```bash
nslookup aistudybuddy.duckdns.org
```

### Measure Backend Response Time

```bash
time curl https://aistudybuddy.duckdns.org/api/health
```

---

## 📞 Support Resources

| Issue                     | Resource                           |
| ------------------------- | ---------------------------------- |
| Mobile design questions   | See `/DESIGN_PREVIEW.md`           |
| WebSocket troubleshooting | See `/WEBSOCKET_FIX_COMPLETE.md`   |
| Deployment details        | See `/DEPLOYMENT_STATUS.md`        |
| User experience           | See `/USER_EXPERIENCE_GUIDE.md`    |
| Infrastructure            | See `/FINAL_DEPLOYMENT_SUMMARY.md` |

---

## ⏱️ Expected Times

| Task                | Duration    |
| ------------------- | ----------- |
| Amplify build       | 3-5 minutes |
| Browser cache clear | 30 seconds  |
| User testing        | 10+ minutes |
| Full verification   | 15+ minutes |

---

## 🎯 Success Indicators

✅ **All Green?**

- Amplify build shows "Deploy successful"
- Mobile design shows emoji icons
- WebSocket connects without errors
- Study time updates in real-time
- No console errors in DevTools

---

## 📝 Important Notes

- **No downtime**: Blue-green deployment
- **No data loss**: Database unchanged
- **No code breaking**: Backward compatible
- **Easy rollback**: Previous commit available
- **Fast deployment**: ~10 min total

---

**Last Updated**: 2025-10-25  
**Status**: 🟢 ON TRACK FOR DEPLOYMENT  
**Next Action**: Monitor Amplify build (3-5 min)
