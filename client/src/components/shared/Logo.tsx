import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title } = Typography;

interface LogoProps {
  collapsed: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ collapsed = false, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsLoaded(true));
  }, []);

  const letterConfigs = [
    { translate: [-50, -50], rotate: -45 },  // E
    { translate: [50, 50], rotate: 45 },     // M
    { translate: [-30, 30], rotate: -30 },   // P
    { translate: [30, -30], rotate: 30 },    // R
    { translate: [0, -60], rotate: 0 },      // I
    { translate: [-40, 40], rotate: -15 },   // S
    { translate: [40, -40], rotate: 15 }     // E
  ];

  return (
    <Link 
      to="/" 
      className={`flex items-center ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="logo-container">
          <svg
            width={36}
            height={36}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`logo-icon ${isLoaded ? 'loaded' : ''} ${collapsed ? 'collapsed' : ''}`}
          >
            <g className="logo-paths">
              {/* Modern triangular prism shape */}
              <path
                className="logo-path logo-path-1"
                d="M16 4L26 10L16 16L6 10L16 4Z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                className="logo-path logo-path-2"
                d="M6 10V22L16 28V16M26 10V22L16 28"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Inner triangular accent */}
              <path
                className="logo-path logo-path-3"
                d="M16 8L21 12L16 14L11 12L16 8Z"
                fill="currentColor"
              />
              {/* Dynamic accent lines */}
              <path
                className="logo-path logo-path-4"
                d="M11 18L16 22L21 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </div>

        {!collapsed && (
          <div className={`logo-text-container ${isLoaded ? 'loaded' : ''}`}>
            {'EMPRISE'.split('').map((letter, index) => (
              <span
                key={index}
                className="logo-letter"
                style={{
                  '--index': index,
                  '--tx': `${letterConfigs[index].translate[0]}px`,
                  '--ty': `${letterConfigs[index].translate[1]}px`,
                  '--rotate': `${letterConfigs[index].rotate}deg`,
                } as React.CSSProperties}
              >
                {letter}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

const styles = `
.logo-container {
  position: relative;
  transform-style: preserve-3d;
  perspective: 800px;
  width: 36px;
  height: 36px;
}

.logo-icon {
  color: #2563eb;
  transform-origin: center;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logo-icon.loaded {
  opacity: 1;
}

.logo-paths {
  transform-origin: center;
}

.logo-path {
  transform-origin: center;
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Collapse Animation */
.logo-icon.collapsed {
  transform: rotate(360deg);
}

.logo-icon.collapsed .logo-path-1 {
  transform: rotate(-180deg);
}

.logo-icon.collapsed .logo-path-2 {
  transform: rotate(180deg);
  opacity: 0.8;
}

.logo-icon.collapsed .logo-path-3 {
  transform: scale(0.9);
}

.logo-icon.collapsed .logo-path-4 {
  transform: translateY(2px);
  opacity: 0.7;
}

/* Text Animation */
.logo-text-container {
  display: inline-flex;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.logo-letter {
  display: inline-block;
  font-size: 1.75rem;
  font-weight: 700;
  color: #2563eb;
  opacity: 0;
  transform: 
    translate3d(var(--tx), var(--ty), -50px)
    rotateX(var(--rotate))
    rotateY(var(--rotate));
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: assembleLetters 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: calc(0.1s * var(--index) + 0.2s);
  will-change: transform, opacity;
  text-shadow: 0 1px 0 #ccc, 0 2px 0 #bbb, 0 3px 3px rgba(0,0,0,.15);
}

@keyframes assembleLetters {
  0% {
    opacity: 0;
    transform: 
      translate3d(var(--tx), var(--ty), -50px)
      rotateX(var(--rotate))
      rotateY(var(--rotate));
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
    transform: 
      translate3d(0, 0, 0)
      rotateX(0)
      rotateY(0);
  }
}

.loaded .logo-letter {
  backface-visibility: hidden;
}

/* Smooth transition for icon */
.logo-icon,
.logo-path {
  transition-duration: 1s;
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}

@media (prefers-reduced-motion: reduce) {
  .logo-icon,
  .logo-path,
  .logo-letter {
    animation: none !important;
    transform: none !important;
    transition: none !important;
    opacity: 1 !important;
  }
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Logo;