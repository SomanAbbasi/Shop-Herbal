import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
// import mongoSanitize from 'express-mongo-sanitize';
// import hpp from 'hpp';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import './config/cloudinary.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import userRoutes from './routes/user.routes.js';
import reviewRoutes from './routes/review.routes.js';
import adminRoutes from './routes/admin.routes.js';
import rateLimit from 'express-rate-limit';


import { env } from './config/env.js';

const app = express();

// Trust proxy for Vercel/proxies
app.set('trust proxy', 1);

// Global rate limit — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { status: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later' } },
  standardHeaders: true,
  legacyHeaders: false,
}); 
app.use(globalLimiter);
app.use(helmet());
const allowedOrigins = [env.clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(Boolean);

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || env.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(morgan('dev'));
// app.use(mongoSanitize());
// app.use(hpp());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products/:id/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);  



app.get('/api/v1/health', (req, res) => res.json({ status: true, message: 'API is running' }));



app.use(errorHandler);

export default app;