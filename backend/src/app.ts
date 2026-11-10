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
import pricingRoutes from './routes/pricing.routes';
import vendorRoutes from './routes/vendors.routes';
import creditRoutes from './routes/credit.routes';
import invoiceRoutes from './routes/invoices.routes';
import crmRoutes from './routes/crm.routes';
import contractRoutes from './routes/contracts.routes';
import pricingAutomationRoutes from './routes/pricingAutomation.routes';
import procurementPlanningRoutes from './routes/procurementPlanning.routes';
import inventoryIntelligenceRoutes from './routes/inventoryIntelligence.routes';
import logisticsRoutes from './routes/logistics.routes';
import collectionsRoutes from './routes/collections.routes';
import claimsAdvancedRoutes from './routes/claimsAdvanced.routes';
import executiveBIRoutes from './routes/executiveBI.routes';
import notificationRoutes from './routes/notifications.routes';
import customerSelfServiceRoutes from './routes/customerSelfService.routes';
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
  app.use('/api/pricing', pricingRoutes);
  app.use('/api/vendors', vendorRoutes);
  app.use('/api/credit', creditRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/crm', crmRoutes);
  app.use('/api/contracts', contractRoutes);
  app.use('/api/pricing-automation', pricingAutomationRoutes);
  app.use('/api/procurement-planning', procurementPlanningRoutes);
  app.use('/api/inventory-intelligence', inventoryIntelligenceRoutes);
  app.use('/api/logistics', logisticsRoutes);
  app.use('/api/collections', collectionsRoutes);
  app.use('/api/claims-advanced', claimsAdvancedRoutes);
  app.use('/api/executive-bi', executiveBIRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/self-service', customerSelfServiceRoutes);

  // Central Error Handler
  app.use(errorHandler);

  return app;
}
