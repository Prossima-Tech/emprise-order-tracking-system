import styles from './Logo.module.css';

interface LogoProps {
  collapsed?: boolean;
}

export const Logo = ({ collapsed }: LogoProps) => {
  return (
    <div className={styles.logo}>
      {collapsed ? (
        <img src="/logo-small.svg" alt="Logo" height={32} />
      ) : (
        <img src="/logo.svg" alt="Logo" height={32} />
      )}
    </div>
  );
};