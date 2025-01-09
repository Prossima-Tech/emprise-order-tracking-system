import { Layout, Button, Space, Avatar, Dropdown, Badge, Input } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Header = ({ collapsed, onToggle }: HeaderProps) => {
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
    <Layout.Header className="bg-white flex items-center justify-between border-b border-gray-200 h-[8vh] font-sans tracking-tight">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          className="hover:bg-gray-100"
        />
        
        <div className="max-w-xl w-96">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Search..."
            className="rounded-lg"
          />
        </div>
      </div>

      <div className="flex items-center">
        <Space size="large" className="items-center">
          <Badge count={5} className="cursor-pointer">
            <Button
              type="text"
              icon={<BellOutlined />}
              className="hover:bg-gray-100"
            />
          </Badge>

          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Space className="cursor-pointer items-center">
              <Avatar className="bg-blue-500">
                {user?.name?.[0]}
              </Avatar>
              <span className="hidden md:inline text-gray-700">
                {user?.name}
              </span>
            </Space>
          </Dropdown>
        </Space>
      </div>
    </Layout.Header>
  );
};