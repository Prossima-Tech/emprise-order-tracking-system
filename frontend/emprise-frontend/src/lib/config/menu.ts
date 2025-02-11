import { 
    LayoutDashboard, 
    FileText, 
    Wallet, 
    FileCheck, 
    ShoppingCart, 
    Package, 
    Users,
    Building
  } from 'lucide-react';
import { ROUTES } from './routes';

  
  export const MENU_ITEMS = [
    {
      title: 'Dashboard',
      path: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      title: 'Budgetary Offers',
      path: ROUTES.OFFERS,
      icon: FileText,
    },
    {
      title: 'EMDs',
      path: ROUTES.EMDS,
      icon: Wallet,
    },
    {
      title: 'LOAs',
      path: ROUTES.LOAS,
      icon: FileCheck,
    },
    {
      title: 'Purchase Orders',
      path: ROUTES.PURCHASE_ORDERS,
      icon: ShoppingCart,
    },
    {
      title: 'Items',
      path: ROUTES.ITEMS,
      icon: Package,
    },
    {
      title: 'Vendors',
      path: ROUTES.VENDORS,
      icon: Users,
    },
    {
      title: 'Sites',
      path: ROUTES.SITES,
      icon: Building,
    },
  ] as const;
  