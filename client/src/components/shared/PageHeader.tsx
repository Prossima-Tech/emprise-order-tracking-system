import { Typography, Space } from 'antd';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, extra }: PageHeaderProps) => {
  return (
    <div className={styles.pageHeader}>
      <div>
        <Typography.Title level={2} className={styles.title}>
          {title}
        </Typography.Title>
        {subtitle && (
          <Typography.Text type="secondary" className={styles.subtitle}>
            {subtitle}
          </Typography.Text>
        )}
      </div>
      {extra && <Space size="middle">{extra}</Space>}
    </div>
  );
};