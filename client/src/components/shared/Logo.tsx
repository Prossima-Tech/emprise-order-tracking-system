import React from 'react';
import { Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title } = Typography;

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ collapsed = false, className = '' }) => {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <div className="flex items-center gap-2">
        {/* Logo Icon */}
        <div className="flex-shrink-0">
          <svg
            width={32}
            height={32}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-blue-600"
          >
            <path
              d="M8 3.5L16 7.5L24 3.5L16 0L8 3.5Z"
              fill="currentColor"
            />
            <path
              d="M8 11.5L16 15.5L24 11.5V3.5L16 7.5L8 3.5V11.5Z"
              fill="currentColor"
              fillOpacity="0.8"
            />
            <path
              d="M8 19.5L16 23.5L24 19.5V11.5L16 15.5L8 11.5V19.5Z"
              fill="currentColor"
              fillOpacity="0.6"
            />
            <path
              d="M8 27.5L16 31.5L24 27.5V19.5L16 23.5L8 19.5V27.5Z"
              fill="currentColor"
              fillOpacity="0.4"
            />
          </svg>
        </div>

        {/* Logo Text - Only show when not collapsed */}
        {!collapsed && (
          <Title level={4} className="!mb-0 !text-blue-600">
            EMPRISE
          </Title>
        )}
      </div>
    </Link>
  );
};

// CSS Module for Logo
const styles = `
.logo-spin {
  animation: logo-spin infinite 20s linear;
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Logo;