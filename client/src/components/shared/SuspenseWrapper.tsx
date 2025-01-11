// src/components/shared/SuspenseWrapper.tsx
import { Suspense } from 'react';
import { Spin } from 'antd';

interface SuspenseWrapperProps {
  children: React.ReactNode;
}

export const SuspenseWrapper = ({ children }: SuspenseWrapperProps) => {
  return (
    <Suspense
      fallback={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <Spin size="large" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

export default SuspenseWrapper;