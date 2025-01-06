// src/components/layout/AuthLayout.tsx
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

export const AuthLayout = () => {
  return (
    <Layout className={styles.layout}>
      <div className={styles.content}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </div>
    </Layout>
  );
};

export default AuthLayout;