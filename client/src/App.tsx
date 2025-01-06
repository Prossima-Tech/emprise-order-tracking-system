// src/App.tsx
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { AccessibilityProvider } from './providers/AccessibilityProvider';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { router } from './routes';

import './styles/accessibility.css';

const App = () => {
  return (
    <ErrorBoundary>
      {/* <AccessibilityProvider> */}
          <RouterProvider router={router} />
      {/* </AccessibilityProvider> */}
    </ErrorBoundary>
  );
};

export default App; 