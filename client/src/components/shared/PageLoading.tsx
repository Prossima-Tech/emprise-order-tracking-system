// src/components/shared/PageLoading.tsx
import { Spin } from 'antd';
import styles from './PageLoading.module.css';

export const PageLoading = () => {
  return (
    <div className={styles.container} role="alert" aria-busy="true">
      <Spin size="large" />
      <span className={styles.text}>Loading...</span>
    </div>
  );
};
