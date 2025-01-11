// src/modules/auth/pages/ForgotPasswordPage.tsx
import { Card, Form, Input, Button, Typography, Alert } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import styles from './ForgotPasswordPage.module.css';

const { Title, Text } = Typography;

export const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (values: { email: string }) => {
    try {
      setLoading(true);
      setError(null);
      await authService.forgotPassword(values.email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.forgotPasswordCard}>
        <Title level={3} className={styles.title}>
          Reset Password
        </Title>
        <Text type="secondary" className={styles.subtitle}>
          Enter your email to receive reset instructions
        </Text>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className={styles.alert}
          />
        )}

        {success ? (
          <div className={styles.successMessage}>
            <Alert
              message="Reset Instructions Sent"
              description="Please check your email for password reset instructions."
              type="success"
              showIcon
            />
            <Button
              type="primary"
              onClick={() => navigate('/login')}
              className={styles.backButton}
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <Form
            name="forgotPassword"
            layout="vertical"
            onFinish={handleSubmit}
            className={styles.form}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                Send Reset Instructions
              </Button>
            </Form.Item>

            <div className={styles.links}>
              <Button
                type="link"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};