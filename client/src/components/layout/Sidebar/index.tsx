import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  BankOutlined,
  DatabaseOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import  Logo from '../../shared/Logo';
import styles from './Sidebar.module.css';

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar = ({ collapsed }: SidebarProps) => {
  const location = useLocation();

  // Function to get selected keys based on current path
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/master-data/items')) return ['master-data-items'];
    if (path.startsWith('/master-data/vendors')) return ['master-data-vendors'];
    return [path.split('/')[1] || 'dashboard'];
  };

  // Function to get open submenu keys
  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/master-data')) return ['master-data'];
    return [];
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: 'budgetary-offers',
      icon: <FileTextOutlined />,
      label: <Link to="/budgetary-offers">Budgetary Offers</Link>,
    },
    {
      key: 'purchase-orders',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/purchase-orders">Purchase Orders</Link>,
    },
    {
      key: 'loa-management',
      icon: <BankOutlined />,
      label: <Link to="/loa-management">LOA Management</Link>,
    },
    {
      key: 'emd-tracking',
      icon: <PercentageOutlined />,
      label: <Link to="/emd-tracking">EMD Tracking</Link>,
    },
    {
      key: 'master-data',
      label: 'Master Data',
      icon: <DatabaseOutlined />,
      children: [
        {
          key: 'master-data-dashboard',
          label: <Link to="/master-data">Dashboard</Link>,
        },
        {
          key: 'master-data-items',
          label: <Link to="/master-data/items">Item Master</Link>,
        },
        {
          key: 'master-data-vendors',
          label: <Link to="/master-data/vendors">Vendor Master</Link>,
        },
      ],
    },
  ];

  return (
    <Layout.Sider
      collapsed={collapsed}
      className={styles.sidebar}
      width={280}
      collapsedWidth={100}
    >
      <div className={styles.logoContainer}>
        <Logo collapsed={collapsed} />
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        className={styles.menu}
      />
    </Layout.Sider>
  );
};