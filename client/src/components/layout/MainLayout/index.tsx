import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { BreadcrumbNav } from '../BreadcrumbNav';

const { Content } = Layout;

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen width-full">
      <Sidebar collapsed={collapsed}  />
      <Layout>
        <Header 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)} 
        />
        
        <Content className="m-6 p-6 bg-white rounded-lg min-h-[280px]">
          <BreadcrumbNav />
          <Outlet />
        </Content>
        <Footer />
      </Layout>
    </Layout>
  );
};