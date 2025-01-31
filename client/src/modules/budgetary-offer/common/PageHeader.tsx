import React from 'react';
import { Space, Typography } from 'antd';
const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, actions }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <Title level={2} className="mb-0">{title}</Title>
      {actions && (
        <Space>
          {actions.map((action, index) => (
            <React.Fragment key={index}>{action}</React.Fragment>
          ))}
        </Space>
      )}
    </div>
  );
};

export default PageHeader;