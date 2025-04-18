import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="min-h-screen flex flex-col">
      <Header collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};