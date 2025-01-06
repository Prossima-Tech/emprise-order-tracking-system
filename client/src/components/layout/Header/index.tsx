// src/components/layout/MainLayout/Header.tsx
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
import styles from './Header.module.css';

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
    <Layout.Header className={styles.header}>
      <div className={styles.leftSection}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          className={styles.trigger}
        />
        
        <div className={styles.search}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search..."
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.rightSection}>
        <Space size="large">
          <Badge count={5} className={styles.badge}>
            <Button
              type="text"
              icon={<BellOutlined />}
              className={styles.iconButton}
            />
          </Badge>

          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Space className={styles.userInfo} align="center">
              <Avatar src={user?.name} className={styles.avatar}>
                {user?.name?.[0]}
              </Avatar>
              <span className={styles.userName}>{user?.name}</span>
            </Space>
          </Dropdown>
        </Space>
      </div>
    </Layout.Header>
  );
};