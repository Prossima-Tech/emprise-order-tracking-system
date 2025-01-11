import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <Layout className="min-h-screen bg-gray-50">
          <Outlet />
    </Layout>
  );
};

export default AuthLayout;