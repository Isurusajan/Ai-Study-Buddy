# 📧 Email Setup Guide for AI Study Buddy

This guide will help you set up email notifications for registration confirmations.

## ✅ What's Already Done

- ✅ Nodemailer installed
- ✅ Email service created ([server/services/emailService.js](server/services/emailService.js))
- ✅ Registration email integrated in auth controller
- ✅ Beautiful HTML email template with branding

## 🚀 Quick Setup (Gmail)

### Step 1: Get Gmail App Password

1. **Go to your Google Account**: https://myaccount.google.com/
2. **Enable 2-Step Verification** (if not already enabled):
   - Go to Security → 2-Step Verification
   - Follow the setup process
3. **Create App Password**:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "AI Study Buddy" as the name
   - Click "Generate"
   - **Copy the 16-character password** (save it somewhere safe!)

### Step 2: Update .env File

Open `server/.env` and update these fields:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password-here
CLIENT_URL=http://localhost:3000
```

**Example:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=mystudybuddy@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
CLIENT_URL=http://localhost:3000
```

### Step 3: Test It!

1. Start your server:
   ```bash
   cd server
   npm start
   ```

2. Register a new user through your app

3. Check your email inbox for the welcome email!

## 📧 What Gets Sent

When a user registers, they receive a **beautiful welcome email** with:
- Personalized greeting with their name
- List of all features they can use
- "Start Studying Now" button linking to login page
- Professional branding with AI Study Buddy colors
- Mobile-responsive HTML design

## 🔧 Using Other Email Services

### Using Outlook/Hotmail

```env
EMAIL_SERVICE=hotmail
EMAIL_USER=youremail@outlook.com
EMAIL_PASSWORD=your-password
```

### Using Yahoo

```env
EMAIL_SERVICE=yahoo
EMAIL_USER=youremail@yahoo.com
EMAIL_PASSWORD=your-app-password
```

### Using Custom SMTP

```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-password
```

Then update [server/services/emailService.js](server/services/emailService.js):

```javascript
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'smtp') {
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Default Gmail/other services
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};
```

## 🎨 Customizing Email Template

The email template is in [server/services/emailService.js](server/services/emailService.js) in the `sendRegistrationEmail` function.

You can customize:
- **Colors**: Change the gradient in `.header` background
- **Logo**: Add an image tag in the header
- **Content**: Update the welcome message and feature list
- **Button**: Change the CTA button text and styling
- **Footer**: Update copyright and contact info

## 🔒 Security Notes

1. **Never commit .env file** - It's already in .gitignore
2. **Use App Passwords**, not your actual Gmail password
3. **Rotate passwords** regularly
4. **Enable 2FA** on your email account
5. **Use environment variables** in production

## 🐛 Troubleshooting

### Email not sending

**Check console logs:**
```
✅ Registration email sent: <message-id>  // Success
❌ Failed to send registration email: ... // Error
```

**Common issues:**

1. **"Invalid login"**
   - Make sure you're using an App Password, not your regular password
   - Check that 2-Step Verification is enabled

2. **"Connection timeout"**
   - Check your internet connection
   - Some networks block SMTP ports (465, 587)
   - Try using a VPN

3. **"Service not recognized"**
   - Check EMAIL_SERVICE value is correct (gmail, hotmail, yahoo, etc.)

4. **Email goes to spam**
   - Ask users to check spam folder
   - In production, use a custom domain with SPF/DKIM records

### Testing without email setup

If you don't want to set up email yet, the app will still work! Registration will succeed, but users won't receive the welcome email. You'll see this in console:

```
⚠️ Warning: Failed to send registration email: ...
```

## 📝 Future Email Features

The email service is ready for:
- ✅ Registration confirmation (DONE)
- 🔄 Password reset emails (code ready, needs endpoint)
- 📧 Study reminders
- 🎯 Progress reports
- 📊 Weekly study summaries

## 🚀 Production Deployment

For production:

1. **Use a dedicated email service** like:
   - SendGrid (free tier: 100 emails/day)
   - Mailgun (free tier: 5,000 emails/month)
   - AWS SES (very cheap, reliable)

2. **Update CLIENT_URL** in .env:
   ```env
   CLIENT_URL=https://yourdomain.com
   ```

3. **Set up SPF/DKIM** records for better deliverability

4. **Monitor email sending** with the service's dashboard

## 📚 Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords Guide](https://support.google.com/accounts/answer/185833)
- [SendGrid Setup](https://sendgrid.com/docs/)
- [Email HTML Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding-html-emails/)

---

**Need help?** Check the server console logs or reach out for support!
