import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

export const BreadcrumbNav = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const title = pathSnippets[index].charAt(0).toUpperCase() + 
                 pathSnippets[index].slice(1).replace('-', ' ');
    
    return {
      key: url,
      title: <Link to={url} className="text-gray-600 hover:text-blue-500">
        {title}
      </Link>,
    };
  });

  const breadcrumbItems = [
    {
      title: (
        <Link to="/" className="text-gray-600 hover:text-blue-500">
          <HomeOutlined />
        </Link>
      ),
      key: 'home',
    },
    ...extraBreadcrumbItems,
  ];

  return (
    <div className="mb-2 ml-4">
      <Breadcrumb items={breadcrumbItems} />
    </div>
  );
};