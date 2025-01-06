import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import styles from './BreadcrumbNav.module.css';

export const BreadcrumbNav = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const title = pathSnippets[index].charAt(0).toUpperCase() + 
                 pathSnippets[index].slice(1).replace('-', ' ');
    
    return {
      key: url,
      title: <Link to={url}>{title}</Link>,
    };
  });

  const breadcrumbItems = [
    {
      title: <Link to="/"><HomeOutlined /></Link>,
      key: 'home',
    },
    ...extraBreadcrumbItems,
  ];

  return (
    <div className={styles.breadcrumb}>
      <Breadcrumb items={breadcrumbItems} />
    </div>
  );
};
