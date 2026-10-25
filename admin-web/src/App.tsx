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
          backgroundColor: 'var(--color-bg-main)',
          color: 'var(--color-primary)',
          fontWeight: 700,
        }}
      >
        Initializing FreshSupply Admin Console...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' && <DashboardPage onNavigate={setCurrentPage} />}
      {currentPage === 'orders' && <OrdersPage />}
      {currentPage === 'inventory' && <InventoryPage />}
      {currentPage === 'products' && <ProductsPage />}
      {currentPage === 'categories' && <CategoriesPage />}
      {currentPage === 'customers' && <CustomersPage />}
      {currentPage === 'staff' && <StaffPage />}
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
