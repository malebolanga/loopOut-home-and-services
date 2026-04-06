import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Send an email using SMTP (e.g. Gmail, SendGrid, etc.)
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content (optional)
 * @returns {Promise} 
 */
export const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // Helps in some production staging environments
      }
    });

    const info = await transporter.sendMail({
      from: `"LoopOut Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

/**
 * Utility to send a specific "Booking Confirmed" email template
 */
export const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  const subject = `Booking Confirmed: ${bookingDetails.title}`;
  const html = `
    <div style="font-family: sans-serif; color: #222; max-width: 600px; margin: auto;">
      <h2 style="color: #FF5A5F;">Your booking is confirmed!</h2>
      <p>Thanks for booking with us. Here are your details:</p>
      <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
        <h3 style="margin-top: 0;">${bookingDetails.title}</h3>
        <p><strong>Booking ID:</strong> ${bookingDetails.id}</p>
        <p><strong>Amount Paid:</strong> R${bookingDetails.price}</p>
      </div>
      <p style="margin-top: 20px;">We're excited to see you!</p>
    </div>
  `;
  return await sendEmail(userEmail, subject, `Your booking for ${bookingDetails.title} is confirmed!`, html);
};
