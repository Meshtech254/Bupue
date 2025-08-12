const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // Configuration for different email providers
  const emailConfig = {
    gmail: {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD // Use App Password for Gmail
      }
    },
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    }
  };

  const provider = process.env.EMAIL_PROVIDER || 'smtp';
  return nodemailer.createTransporter(emailConfig[provider]);
};

// Send verification email
const sendVerificationEmail = async (email, verificationToken, username) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: `"Bupue Platform" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #333;">Welcome to Bupue, ${username}!</h2>
          <p>Thank you for signing up. To complete your registration, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            This verification link will expire in 24 hours. If you didn't create an account with Bupue, please ignore this email.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Bupue Platform - Your Learning and Marketplace Hub
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, username) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Bupue Platform" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${username},</p>
          <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #dc3545;">${resetUrl}</p>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            This password reset link will expire in 1 hour. If you didn't request a password reset, please contact support.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Bupue Platform - Your Learning and Marketplace Hub
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (email, order, username) => {
  try {
    const transporter = createTransporter();
    
    const itemsList = order.items.map(item => 
      `<li>${item.quantity} x ${item.item.title} - $${item.price.toFixed(2)}</li>`
    ).join('');
    
    const mailOptions = {
      from: `"Bupue Platform" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Order Confirmation - #${order._id}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #333;">Order Confirmation</h2>
          <p>Hello ${username},</p>
          <p>Thank you for your order! Here are the details:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order #${order._id}</h3>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          
          <h4>Items Ordered:</h4>
          <ul>${itemsList}</ul>
          
          <h4>Shipping Address:</h4>
          <p>
            ${order.shipping.name}<br>
            ${order.shipping.address}<br>
            ${order.shipping.city}, ${order.shipping.postalCode}<br>
            ${order.shipping.country}
          </p>
          
          <p style="margin-top: 30px;">
            You can track your order status in your account dashboard.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Bupue Platform - Your Learning and Marketplace Hub
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail
};

