import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PosPage } from '../pages/PosPage';
import { TablesPage } from '../pages/TablesPage';
import { OrdersPage } from '../pages/OrdersPage';
import { KitchenPage } from '../pages/KitchenPage';
import { ProductsPage } from '../pages/ProductsPage';
import { SuppliersPurchasesPage } from '../pages/SuppliersPurchasesPage';
import { InventoryPage } from '../pages/InventoryPage';
import { AccountingPage } from '../pages/AccountingPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { ActivityPage } from '../pages/ActivityPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/pos', element: <PosPage /> },
      { path: '/tables', element: <TablesPage /> },
      { path: '/orders', element: <OrdersPage /> },
      { path: '/kitchen', element: <KitchenPage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/suppliers', element: <SuppliersPurchasesPage /> },
      { path: '/inventory', element: <InventoryPage /> },
      { path: '/accounting', element: <AccountingPage /> },
      { path: '/reports', element: <ReportsPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/activity', element: <ActivityPage /> }
    ]
  }
]);
