import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/categories.routes';
import productRoutes from './routes/products.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/orders.routes';
import inventoryRoutes from './routes/inventory.routes';
import customerRoutes from './routes/customers.routes';
import dashboardRoutes from './routes/dashboard.routes';
import staffRoutes from './routes/staff.routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'FreshSupply Shared B2B Backend',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/staff', staffRoutes);

  // Central Error Handler
  app.use(errorHandler);

  return app;
}
