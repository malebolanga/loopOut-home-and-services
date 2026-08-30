import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import commentRouter from './routes/comment.route.js';
import serviceRouter from './routes/service.route.js';
import sellRouter from './routes/sell.route.js';
import https from 'https';
import fs from 'fs';
import carwashRoutes from './routes/carwash.route.js';
import helperRouter from './routes/helper.route.js';
import serviceCommentRouter from './routes/service-comment.route.js';
import eventRouter from './routes/event.route.js';
import cookieParser from 'cookie-parser';
import helperCommentRouter from './routes/helper-comment.route.js';
import eventCommentRouter from './routes/event-comment.route.js';
import tripRouter from './routes/trip.js';
import notificationRoute from './routes/notification.route.js';
import messageRouter from './routes/message.route.js';
import paymentRouter from './routes/payment.route.js';
import promotionRouter from './routes/promotion.route.js';
import wishlistRouter from './routes/favorites.route.js';
import exploreRouter from './routes/explore.route.js';
import bookingRouter from './routes/bookingRoutes.js';
import lookingForRouter from './routes/lookingFor.route.js';
import aiHelpRouter from './routes/ai-help.route.js';
import verificationRouter from './routes/verification.route.js';
import sosRouter from './routes/sos.route.js';
import aiRouter from './routes/ai.route.js';
import lunchRouter from './routes/lunch.route.js';
import uploadRouter from './routes/upload.route.js';
import statsRouter from './routes/stats.route.js';
import { initBookingScheduler } from './utils/bookingScheduler.js';
import path from 'path';
dotenv.config();
dotenv.config({ path: new URL('./.env', import.meta.url) });
const criticalProductionVariables = ['MONGO', 'JWT_SECRET'];
const recommendedProductionVariables = ['CLIENT_URL', 'APP_URL', 'BACKEND_URL', 'EMAIL_USER', 'EMAIL_PASS'];
if (process.env.NODE_ENV === 'production') {
    const missingCritical = criticalProductionVariables.filter((name) => !process.env[name]);
    if (missingCritical.length) throw new Error(`Missing required production environment variables: ${missingCritical.join(', ')}`);
    const missingRecommended = recommendedProductionVariables.filter((name) => !process.env[name]);
    if (missingRecommended.length) console.warn(`[WARNING] Missing recommended production environment variables: ${missingRecommended.join(', ')}.`);
}
if (process.env.MONGO && process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO).then(() => { console.log('Connected to MongoDB'); initBookingScheduler(); }).catch((err) => console.error('MongoDB connection failed:', err.message));
} else if (process.env.NODE_ENV !== 'test') console.error('MongoDB is not configured; API data routes will be unavailable.');
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const allowedOrigins = ['http://localhost:5173','http://localhost:5174','http://localhost:3000',process.env.CLIENT_URL,process.env.RENDER_EXTERNAL_URL].filter(Boolean);
app.use(cors({ origin: (origin, callback) => { if (!origin) return callback(null, true); if (allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o)) || origin.endsWith('.onrender.com')) return callback(null, true); return callback(null, false); }, credentials: true }));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://www.gstatic.com', 'https://apis.google.com', 'https://www.googletagmanager.com', 'https://www.google-analytics.com', 'https://cdnjs.cloudflare.com', 'https://unpkg.com', 'https://cdn.jsdelivr.net'],
            scriptSrcElem: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://www.gstatic.com', 'https://apis.google.com', 'https://www.googletagmanager.com', 'https://www.google-analytics.com', 'https://cdnjs.cloudflare.com', 'https://unpkg.com', 'https://cdn.jsdelivr.net'],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://unpkg.com', 'https://cdnjs.cloudflare.com', 'https://cdn.jsdelivr.net'],
            imgSrc: ["'self'", 'data:', 'https:', 'blob:', 'https://*.tile.openstreetmap.org', 'https://unpkg.com', 'https://cdnjs.cloudflare.com'],
            connectSrc: ["'self'", 'https:', 'wss:', 'ws:', 'https://*.tile.openstreetmap.org', 'https://www.google-analytics.com', 'https://*.google-analytics.com', ...allowedOrigins],
            fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com', 'data:'],
            frameSrc: ["'self'", 'https://*.google.com', 'https://*.googleusercontent.com', 'https://*.firebaseapp.com'],
            objectSrc: ["'none'"],
        },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(mongoSanitize());
app.use(compression());
const isProduction = process.env.NODE_ENV === 'production';
const apiLimiter = rateLimit({ windowMs: 5 * 60 * 1000, limit: isProduction ? 500 : 2000, message: { success: false, message: 'Too many requests from this IP, please try again after 5 minutes.' }, standardHeaders: true, legacyHeaders: false });
const messagesLimiter = rateLimit({ windowMs: 5 * 60 * 1000, limit: 500, message: { success: false, message: 'Too many message requests, please slow down.' }, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: isProduction ? 10 : 1000, message: { success: false, message: 'Too many sign-in attempts. Please wait a few minutes and try again.' }, standardHeaders: true, legacyHeaders: false });
app.use('/api/auth/', authLimiter); app.use('/api/messages', messagesLimiter); app.use('/api/', apiLimiter);
app.use((req, res, next) => { const start = Date.now(); res.on('finish', () => console.log(`[API] ${req.method} ${req.url} - ${res.statusCode} (${Date.now() - start}ms)`)); next(); });
app.use('/api/user', userRouter); app.use('/api/auth', authRouter); app.use('/api/listing', listingRouter); app.use('/api/comments', commentRouter); app.use('/api/comment', commentRouter); app.use('/api/helper', helperRouter); app.use('/api/event', eventRouter); app.use('/api/carwash', carwashRoutes); app.use('/api/service-comments', serviceCommentRouter); app.use('/api/trips', tripRouter); app.use('/api/helper-comments', helperCommentRouter); app.use('/api/event-comments', eventCommentRouter); app.use('/api/service', serviceRouter); app.use('/api/notifications', notificationRoute); app.use('/api/messages', messageRouter); app.use('/api/payment', paymentRouter); app.use('/api/promotion', promotionRouter); app.use('/api/wishlist', wishlistRouter); app.use('/api/explore', exploreRouter); app.use('/api/bookings', bookingRouter); app.use('/api/looking-for', lookingForRouter); app.use('/api/ai-help', aiHelpRouter); app.use('/api/loopbot', aiHelpRouter); app.use('/api/verification', verificationRouter); app.use('/api/sos', sosRouter); app.use('/api/ai', aiRouter); app.use('/api/sell', sellRouter); app.use('/api/stats', statsRouter); app.use('/api/lunch', lunchRouter); app.use('/api/uploads', uploadRouter); app.use('/uploads', express.static(path.resolve(__dirname, '../client/public/uploads')));
const distPath = path.resolve(__dirname, '../client/dist'); app.use(express.static(distPath));
app.get('*', (req, res) => { if (req.url.startsWith('/api/')) return res.status(404).json({ success: false, message: 'API endpoint not found' }); if (req.url.startsWith('/assets/')) return res.status(404).send('Asset not found'); const indexFile = path.join(distPath, 'index.html'); res.sendFile(indexFile, (err) => { if (err) { console.error('Error sending index.html:', err); res.status(500).send('<h1>Server Configuration Error</h1><p>The application was built but the server cannot find the entry point. Please check the build artifacts.</p>'); } }); });
app.use((err, req, res, next) => { const statusCode = err.statusCode || (err.name === 'MulterError' ? 400 : 500); const message = err.message || 'Internal Server Error'; if (statusCode >= 500) console.error(`[SERVER ERROR] ${req.method} ${req.url} → ${statusCode}:`, err.message || err); return res.status(statusCode).json({ success: false, statusCode, message }); });
const port = process.env.PORT || 3000; if (process.env.NODE_ENV !== 'test') app.listen(port, () => console.log(`Server is running on port ${port}!`));
export default app;