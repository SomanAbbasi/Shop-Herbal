import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { allowedOrigins } from './config/origins.js';
import errorHandler from './middleware/error.js';
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

// 1. CORS FIRST (Ensure headers are set even if later middleware fails)
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const normalized = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

// 2. Security and Logging
app.use(helmet());
app.use(morgan('dev'));

// 3. Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { status: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later' } },
  standardHeaders: true,
  legacyHeaders: false,
}); 
app.use(globalLimiter);

// 4. Request Parsing
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products/:id/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);  

app.use(errorHandler);

export default app;