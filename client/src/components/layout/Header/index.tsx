import { Layout, Space, Avatar, Dropdown, Badge, Input } from 'antd';
import type { MenuProps } from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth';

export const Header = () => {
  const { user, logout } = useAuth();

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <Layout.Header className="bg-white px-6 flex items-center justify-between border-b border-gray-200 h-18 font-sans tracking-tight shadow-sm">
      {/* Search Section */}
      <div className="flex-1 max-w-xl">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Search..."
          className="rounded-full bg-gray-50 hover:bg-gray-100 border-0 focus:bg-white transition-colors"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center">
        <Space size="large" className="items-center">
          {/* Notifications */}
          <Badge 
            count={5} 
            className="cursor-pointer"
            offset={[-2, 4]}
          >
            <div className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <BellOutlined className="text-lg text-gray-600" />
            </div>
          </Badge>

          {/* User Profile */}
          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Space className="cursor-pointer items-center hover:bg-gray-50 py-1 px-2 rounded-full transition-colors">
              <Avatar 
                className="bg-blue-600 border-2 border-white shadow-sm"
                size="small"
              >
                {user?.name?.[0]}
              </Avatar>
              <span className="hidden md:inline text-gray-700 font-medium">
                {user?.name}
              </span>
            </Space>
          </Dropdown>
        </Space>
      </div>
    </Layout.Header>
  );
};