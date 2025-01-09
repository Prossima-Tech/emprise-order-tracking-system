import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  BankOutlined,
  DatabaseOutlined,
  PercentageOutlined,
  FormOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  FundOutlined,
} from '@ant-design/icons';
import Logo from '../../shared/Logo';

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar = ({ collapsed }: SidebarProps) => {
  const location = useLocation();

  // Function to get selected keys based on current path
  const getSelectedKeys = () => {
    const path = location.pathname;
    // Match budgetary offers paths
    if (path.startsWith('/budgetary-offers')) {
      if (path === '/budgetary-offers') return ['bo-dashboard'];
      if (path === '/budgetary-offers/create') return ['bo-create'];
      if (path.includes('/budgetary-offers/edit/')) return ['bo-list'];
      if (path.includes('/budgetary-offers/view/')) return ['bo-list'];
      return ['bo-list'];
    }
    // Match other paths
    if (path.startsWith('/master-data/items')) return ['master-data-items'];
    if (path.startsWith('/master-data/vendors')) return ['master-data-vendors'];
    return [path.split('/')[1] || 'dashboard'];
  };

  // Function to get open submenu keys
  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/master-data')) return ['master-data'];
    if (path.startsWith('/budgetary-offers')) return ['budgetary-offers'];
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
      icon: <FormOutlined />,
      label: 'Budgetary Offers',
      children: [
        {
          key: 'bo-dashboard',
          icon: <FundOutlined />,
          label: <Link to="/budgetary-offers">BO Dashboard</Link>,
        },
        {
          key: 'bo-list',
          icon: <UnorderedListOutlined />,
          label: <Link to="/budgetary-offers/list">List All</Link>,
        },
        {
          key: 'bo-create',
          icon: <PlusOutlined />,
          label: <Link to="/budgetary-offers/create">Create New</Link>,
        },
      ],
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
      className="min-h-screen bg-white border-r border-gray-200"
      width={280}
      collapsedWidth={80}
    >
      <div className="p-4 flex items-center justify-center border-b border-gray-200">
        <Logo collapsed={collapsed} />
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        className="border-r-0 h-[calc(100vh-64px)] overflow-y-auto"
      />
    </Layout.Sider>
  );
};

export default Sidebar;