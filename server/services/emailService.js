const nodemailer = require('nodemailer');

/**
 * Email Service
 * Handles sending emails (registration confirmation, password reset, etc.)
 */

// Create transporter (using port 587 to avoid firewall issues)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  });
};

/**
 * Send registration confirmation email
 * @param {String} userEmail - User's email address
 * @param {String} userName - User's name
 */
exports.sendRegistrationEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"AI Study Buddy" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Welcome to AI Study Buddy! 🎓',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .features {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .feature-item {
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .feature-item:last-child {
              border-bottom: none;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 14px;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎓 Welcome to AI Study Buddy!</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName},</h2>
            <p>Thank you for registering with AI Study Buddy! We're excited to have you on board.</p>

            <p>Your account has been successfully created, and you're now ready to supercharge your learning with AI-powered study tools.</p>

            <div class="features">
              <h3>Here's what you can do:</h3>
              <div class="feature-item">📄 <strong>Upload PDFs & Documents</strong> - Extract and analyze your study materials</div>
              <div class="feature-item">📝 <strong>AI Summaries</strong> - Get brief, medium, or detailed summaries instantly</div>
              <div class="feature-item">❓ <strong>Multiple Choice Quizzes</strong> - Test your knowledge with auto-generated MCQs</div>
              <div class="feature-item">✍️ <strong>Practice Questions</strong> - Short and long answer questions for exam prep</div>
              <div class="feature-item">💬 <strong>Ask Questions</strong> - Get AI-powered answers based on your documents</div>
              <div class="feature-item">🎯 <strong>Smart Q&A</strong> - Ask anything about your study materials</div>
            </div>

            <center>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" class="button">
                Start Studying Now →
              </a>
            </center>

            <p>If you have any questions or need help getting started, feel free to reply to this email.</p>

            <p>Happy studying! 📚</p>

            <p>Best regards,<br>The AI Study Buddy Team</p>
          </div>

          <div class="footer">
            <p>This email was sent to ${userEmail} because you registered for AI Study Buddy.</p>
            <p>&copy; ${new Date().getFullYear()} AI Study Buddy. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Registration email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Failed to send registration email:', error);
    // Don't throw error - we don't want registration to fail if email fails
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email (for future use)
 * @param {String} userEmail - User's email address
 * @param {String} resetToken - Password reset token
 */
exports.sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"AI Study Buddy" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your AI Study Buddy account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = exports;
