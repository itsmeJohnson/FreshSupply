import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { InventoryPage } from './pages/InventoryPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CustomersPage } from './pages/CustomersPage';
import { StaffPage } from './pages/StaffPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { VendorRegistrationPage } from './pages/VendorRegistrationPage';
import { PricingPage } from './pages/PricingPage';
import { CustomerPricingPage } from './pages/CustomerPricingPage';
import { CustomerStorefrontPage } from './pages/CustomerStorefrontPage';
import { VendorPortalPage } from './pages/VendorPortalPage';
import { CreditFinancePage } from './pages/CreditFinancePage';
import { FulfillmentPage } from './pages/FulfillmentPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ContractsPage } from './pages/ContractsPage';
import { PricingAutomationPage } from './pages/PricingAutomationPage';
import { ProcurementPlanningPage } from './pages/ProcurementPlanningPage';
import { LogisticsFleetPage } from './pages/LogisticsFleetPage';
import { SalesCrmPage } from './pages/SalesCrmPage';
import { CollectionsAgingPage } from './pages/CollectionsAgingPage';
import { ExecutiveBiPage } from './pages/ExecutiveBiPage';

const AdminApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F7F9F8',
          color: '#047857',
          fontWeight: 800,
          fontSize: '1.1rem',
          letterSpacing: '-0.02em',
        }}
      >
        Initializing FreshSupply Supply Chain Console...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (currentPage === 'customer-storefront') {
    return <CustomerStorefrontPage onSwitchToAdmin={() => setCurrentPage('dashboard')} />;
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
      {currentPage === 'orders' && <OrdersPage />}
      {currentPage === 'products' && <ProductsPage />}
      {currentPage === 'categories' && <CategoriesPage />}
      {currentPage === 'inventory' && <InventoryPage />}
      {currentPage === 'pricing' && <PricingPage />}
      {currentPage === 'customer-pricing' && <CustomerPricingPage />}
      {currentPage === 'contracts' && <ContractsPage />}
      {currentPage === 'pricing-automation' && <PricingAutomationPage />}
      {currentPage === 'credit-finance' && <CreditFinancePage />}
      {currentPage === 'fulfillment' && <FulfillmentPage />}
      {currentPage === 'logistics' && <FulfillmentPage />}
      {currentPage === 'logistics-fleet' && <LogisticsFleetPage />}
      {currentPage === 'procurement-planning' && <ProcurementPlanningPage />}
      {currentPage === 'claims' && <ClaimsPage />}
      {currentPage === 'partners' && <VendorRegistrationPage />}
      {currentPage === 'vendor-portal' && <VendorPortalPage />}
      {currentPage === 'sales-crm' && <SalesCrmPage />}
      {currentPage === 'collections-aging' && <CollectionsAgingPage />}
      {currentPage === 'customers' && <CustomersPage />}
      {currentPage === 'staff' && <StaffPage />}
      {currentPage === 'executive-bi' && <ExecutiveBiPage />}
      {currentPage === 'reports' && <ReportsPage />}
      {currentPage === 'settings' && <SettingsPage />}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  );
}
