import { Layout } from 'antd';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <Layout.Footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.copyright}>
          ©{new Date().getFullYear()} Your Company. All rights reserved.
        </div>
        <div className={styles.links}>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/support">Support</a>
        </div>
      </div>
    </Layout.Footer>
  );
};