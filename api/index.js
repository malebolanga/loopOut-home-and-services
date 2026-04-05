import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import commentRouter from './routes/comment.route.js'; // Add this line
import serviceRouter from './routes/service.route.js'; // Add this line
import helperRouter from './routes/helper.route.js'; // ADD THIS LINE
import carwashRoutes from './routes/carwash.route.js'; // Add this import
import serviceCommentRouter from './routes/service-comment.route.js';
import eventRouter from './routes/event.route.js';
import cookieParser from 'cookie-parser';
// Add to your imports:

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

import path from 'path';
dotenv.config();

mongoose.connect(process.env.MONGO)
    .then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.log(err);
    });

const __dirname = path.resolve();

const app = express();

app.use(express.json());
app.use(cookieParser());

// Debug logger for service-related requests
app.use((req, res, next) => {
    if (req.url.includes('/api/service') || req.url.includes('/api/carwash')) {
        console.log(`[DEBUG] Incoming Request: ${req.method} ${req.url}`);
    }
    next();
});

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/comment', commentRouter); // Add this line
app.use('/api/comments', commentRouter); // Add this line
app.use('/api/helper', helperRouter); // ADD THIS LINE
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

app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Error handling middleware (MUST be last)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    // Log full error stack for 500 errors
    if (statusCode === 500) {
        console.error('SERVER ERROR STACK:', err.stack || err);
    } else {
        console.error('SERVER ERROR:', message);
    }
    
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000!');
});