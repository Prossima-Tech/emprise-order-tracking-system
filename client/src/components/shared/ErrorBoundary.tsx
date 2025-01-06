// src/components/shared/ErrorBoundary.tsx
import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from './ErrorBoundary.module.css';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorDisplay = ({ error }: { error?: Error }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.container} role="alert">
      <Result
        status="error"
        title="Something went wrong"
        subTitle={error?.message || 'An unexpected error occurred'}
        extra={[
          <Button
            key="home"
            type="primary"
            onClick={() => navigate('/')}
            aria-label="Go to home page"
          >
            Go Home
          </Button>,
          <Button
            key="reload"
            onClick={() => window.location.reload()}
            aria-label="Reload page"
          >
            Try Again
          </Button>,
        ]}
      />
    </div>
  );
};

