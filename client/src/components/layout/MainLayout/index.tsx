import { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { Footer } from '../Footer';
import { BreadcrumbNav } from '../BreadcrumbNav';
import styles from './MainLayout.module.css';

const { Content } = Layout;

export const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className={styles.layout}>
      <Sidebar collapsed={collapsed} />
      
      <Layout className={`${styles.mainContent} ${collapsed ? styles.expanded : ''}`}>
        <Header 
          collapsed={collapsed} 
          onToggle={() => setCollapsed(prev => !prev)} 
        />
        
        <Content className={styles.content}>
          <BreadcrumbNav />
          <div className={styles.pageContainer}>
            <Outlet />
          </div>
        </Content>
        
        <Footer />
      </Layout>
    </Layout>
  );
};