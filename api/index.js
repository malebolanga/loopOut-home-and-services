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
import commentRouter from './routes/comment.route.js'; // Add this line
import serviceRouter from './routes/service.route.js'; // Add this line
import sellRouter from './routes/sell.route.js'; // Added sell router
import https from 'https';
import fs from 'fs';

import carwashRoutes from './routes/carwash.route.js'; // Add this import
import helperRouter from './routes/helper.route.js';
import serviceCommentRouter from './routes/service-comment.route.js';
import eventRouter from './routes/event.route.js';
import cookieParser from 'cookie-parser';

import helperCommentRouter from './routes/helper-comment.route.js';
import eventCommentRouter from './routes/event-comment.route.js';
import tripRouter from './routes/trip.js'; // Make sure this is imported
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
import { initBookingScheduler } from './utils/bookingScheduler.js';

import path from 'path';
dotenv.config();

mongoose.connect(process.env.MONGO)
    .then(() => {
        console.log('Connected to MongoDB');
        initBookingScheduler();
    }).catch((err) => {
        console.log(err);
    });

const __dirname = path.resolve();

const app = express();

app.use(express.json());
app.use(cookieParser());

// --- Security & Performance Middleware ---

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL,
].filter(Boolean);

// In production, you might want to restrict origins, but for now allow all origins for debugging
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // Allow all origins if none match (use with caution)
        return callback(null, true);
    },
    credentials: true,
}));

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(mongoSanitize());
app.use(compression());

const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 200, 
    message: { success: false, message: 'Too many requests from this IP, please try again after 5 minutes.' },
    standardHeaders: true, 
    legacyHeaders: false, 
});

// More permissive limiter for real-time messaging routes
const messagesLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 500,
    message: { success: false, message: 'Too many message requests, please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 30, 
    message: { success: false, message: 'Too many auth attempts from this IP, please try again after an hour.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/messages', messagesLimiter); // Must be before the global limiter
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// --- End Security & Performance Middleware ---

// General API Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[API] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/comments', commentRouter); // Unified comment route
app.use('/api/comment', commentRouter);
app.use('/api/helper', helperRouter);
app.use('/api/event', eventRouter);
app.use('/api/carwash', carwashRoutes); // Add this line
app.use('/api/service-comments', serviceCommentRouter);
// Add to your routes:

app.use('/api/trips', tripRouter); // Make sure this is included
app.use('/api/helper-comments', helperCommentRouter);
app.use('/api/event-comments', eventCommentRouter);
app.use('/api/service', serviceRouter);
app.use('/api/notifications', notificationRoute);
app.use('/api/messages', messageRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/promotion', promotionRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/explore', exploreRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/looking-for', lookingForRouter);
app.use('/api/ai-help', aiHelpRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/sos', sosRouter);
app.use('/api/sell', sellRouter);

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'client', 'public', 'uploads')));

// Serve static files from the React app dist folder
const distPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(distPath));

// For any other request, send back index.html
app.get('*', (req, res) => {
    // Never serve HTML to API routes — return a proper 404 JSON instead
    if (req.url.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'API endpoint not found' });
    }
    // If it's a request for an asset that wasn't found, don't send index.html
    if (req.url.startsWith('/assets/')) {
        return res.status(404).send('Asset not found');
    }
    
    const indexFile = path.join(distPath, 'index.html');
    res.sendFile(indexFile, (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send('<h1>Server Configuration Error</h1><p>The application was built but the server cannot find the entry point. Please check the build artifacts.</p>');
        }
    });
});

// Error handling middleware (MUST be last)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    // Simplified error logging
    console.error('SERVER ERROR:', err);
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

const port = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}!`);
    });
}

export default app;