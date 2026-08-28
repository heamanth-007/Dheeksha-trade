import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from server directory and root directory
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';

import customerRoutes from './routes/customerRoutes';
import companyRoutes from './routes/companyRoutes';
import productRoutes from './routes/productRoutes';
import particularRoutes from './routes/particularRoutes';
import accountRoutes from './routes/accountRoutes';
import authRoutes from './routes/authRoutes';
import { seedDefaultAdmin } from './controllers/authController';

const app: Application = express();
const PORT = process.env.PORT || 5001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5000';

// Connect Database & Seed default admin
connectDB().then(() => {
  seedDefaultAdmin();
});

// Middleware
const envOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...envOrigins,
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Allow wildcard in CORS_ORIGIN
      if (process.env.CORS_ORIGIN === '*' || allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      // Allow any localhost / 127.0.0.1 port or local network IPs
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin);
      
      // Allow deployed domains (Vercel, Netlify, Render preview URLs)
      const isTrustedDeployment =
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app') ||
        origin.endsWith('.onrender.com');

      if (isLocalhost || isTrustedDeployment || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Default fallback in non-production
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      return callback(new Error(`CORS origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Dheeksha Trade API Server is running smoothly',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/products', productRoutes);
app.use('/api/particulars', particularRoutes);
app.use('/api/accounts', accountRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(` 🚀 Dheeksha Trade Server running on port ${PORT}`);
  console.log(` 🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(` 🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=============================================`);
});

export default app;
