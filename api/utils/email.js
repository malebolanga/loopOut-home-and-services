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

    const emailUser = (process.env.EMAIL_USER || '').trim();
    const emailPass = (process.env.EMAIL_PASS || '').trim().replace(/\s+/g, '');

    const transportConfig = process.env.EMAIL_HOST && process.env.EMAIL_HOST !== 'smtp.gmail.com'
      ? {
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT) || 587,
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: emailUser,
            pass: emailPass,
          },
          tls: { rejectUnauthorized: true },
          connectionTimeout: 60000,
          greetingTimeout: 30000,
          socketTimeout: 60000,
        }
      : {
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass,
          },
          tls: { rejectUnauthorized: true },
          connectionTimeout: 60000,
          greetingTimeout: 30000,
          socketTimeout: 60000,
        };

    const transporter = nodemailer.createTransport(transportConfig);

    // Gmail occasionally drops an SMTP connection from a hosted service. Retry
    // only transient network failures so users do not lose a verification email.
    let info;
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        info = await transporter.sendMail({
          from: `"LoopOut Support" <${emailUser}>`,
          to,
          subject,
          text,
          html: html || text,
        });
        break;
      } catch (error) {
        lastError = error;
        const transient = ['ETIMEDOUT', 'ESOCKET', 'ECONNECTION', 'ECONNRESET', 'Connection timeout']
          .some((marker) => error.code === marker || error.message?.includes(marker));
        if (!transient || attempt === 3) throw error;

        const delayMs = attempt * 1000;
        console.warn('Email attempt %d for %s timed out; retrying in %dms.', attempt, to, delayMs);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    if (!info) throw lastError;

    console.log('✅ Email sent successfully to %s: %s', to, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    if (error.message && (error.message.includes('534-5.7.9') || error.message.includes('Application-specific password required'))) {
      console.error('❌ Gmail requires a 16-character App Password, NOT your regular Google account password.');
      console.error('👉 Generate one at: https://myaccount.google.com/apppasswords and update EMAIL_PASS in .env and Render.');
    } else {
      console.error('❌ Error sending email to %s:', to, error.message);
    }
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
