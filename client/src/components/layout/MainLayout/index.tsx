import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { BreadcrumbNav } from '../BreadcrumbNav';


export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    // The outer layout takes full viewport height and prevents body scrolling
    <Layout className="h-screen w-full overflow-hidden">
      {/* Sidebar is full height */}
      <Sidebar collapsed={collapsed} />
      
      {/* Inner layout for the main content area */}
      <Layout className="h-full flex flex-col">
        {/* Header stays at top */}
        <Header 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(!collapsed)} 
        />
        
        {/* Content area wrapper - enables scrolling */}
        <div className="flex-1 overflow-hidden p-6">
          {/* Scrollable container with padding for content */}
          <div className="h-full overflow-auto">
            {/* Actual content with background and rounded corners */}
            <div className="rounded-lg in-h-full">
              <BreadcrumbNav />
              <Outlet />
            </div>
          </div>
        </div>

        {/* Footer stays at bottom */}
        <Footer />
      </Layout>
    </Layout>
  );
};