import {
    LayoutDashboard,
    FileText,
    FileCheck,
    ShoppingCart,
    Package,
    Users,
    Building,
    UserCircle,
    ClipboardCheck,
    Wallet
  } from 'lucide-react';
import { ROUTES } from './routes';

  
export const MENU_ITEMS = [
  {
    title: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    section: 'main'
  },
  {
    title: 'Budgetary Offers',
    path: ROUTES.OFFERS,
    icon: FileText,
    section: 'main'
  },
  {
    title: 'PO/LOA Management',
    path: ROUTES.LOAS,
    icon: FileCheck,
    section: 'customer'
  },
  {
    title: 'Purchase Orders',
    path: ROUTES.PURCHASE_ORDERS,
    icon: ShoppingCart,
    section: 'purchase'
  },
  {
    title: 'Tender Management',
    path: ROUTES.TENDERS,
    icon: ClipboardCheck,
    section: 'main'
  },
  {
    title: 'FDR Management',
    path: ROUTES.FDRS,
    icon: Wallet,
    section: 'main'
  },
  {
    title: 'Items',
    path: ROUTES.ITEMS,
    icon: Package,
    section: 'purchase'
  },
  {
    title: 'Vendors',
    path: ROUTES.VENDORS,
    icon: Users,
    section: 'purchase'
  },
  {
    title: 'Customers',
    path: ROUTES.CUSTOMERS,
    icon: UserCircle,
    section: 'customer'
  },
  {
    title: 'Sites',
    path: ROUTES.SITES,
    icon: Building,
    section: 'customer'
  },
] as const;

export const MENU_SECTIONS = [
  {
    id: 'main',
    title: 'Main'
  },
  {
    id: 'purchase',
    title: 'Purchase and Inventory Management'
  },
  {
    id: 'customer',
    title: 'Customer Management'
  }
] as const;
  