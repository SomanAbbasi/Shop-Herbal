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
import userRoutes from './routes/user.routes.js';
import reviewRoutes from './routes/review.routes.js';
import adminRoutes from './routes/admin.routes.js';
import rateLimit from 'express-rate-limit';


const app = express();

// Global rate limit — 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later' } },
  standardHeaders: true,
  legacyHeaders: false,
}); 
app.use(globalLimiter);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
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
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products/:id/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);  




app.get('/api/v1/health', (req, res) => res.json({ status: true, message: 'API is running' }));



app.use(errorHandler);

export default app;