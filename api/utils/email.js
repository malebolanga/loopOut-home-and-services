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
/**
 * Send an email using SMTP (e.g. Gmail, SendGrid, etc.)
 */
export const sendEmail = async (to, subject, text, html) => {
  try {
    if (process.env.NODE_ENV === 'test') {
      return { success: true, simulated: true };
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email delivery is unavailable because SMTP credentials are not configured.');
      return { success: false, error: 'Email delivery is not configured.' };
    }

    const transportConfig = process.env.EMAIL_HOST && process.env.EMAIL_HOST !== 'smtp.gmail.com'
      ? {
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT) || 587,
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          tls: { rejectUnauthorized: true }
        }
      : {
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          tls: { rejectUnauthorized: true }
        };

    const transporter = nodemailer.createTransport(transportConfig);

    const info = await transporter.sendMail({
      from: `"LoopOut Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    });

    console.log('✅ Email sent successfully to %s: %s', to, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email to %s:', to, error.message);
    return { success: false, error: error.message };
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
