// src/theme/ThemeProvider.tsx
import React from 'react';
import { ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';

// Define the custom theme configuration
const theme: ThemeConfig = {
  token: {
    // Using Poppins as our primary font - you can replace with your preferred font
    fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    // Increase base font size for better readability
    fontSize: 14,
    fontWeightStrong: 600,
  },
  components: {
    Typography: {
      fontFamilyCode: '"Source Code Pro", Consolas, Menlo, monospace',
      // Customize heading styles
      fontSizeHeading1: 38,
      fontSizeHeading2: 30,
      fontSizeHeading3: 24,
      fontSizeHeading4: 20,
      fontSizeHeading5: 16,
    },
  },
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ConfigProvider theme={theme}>
      {children}
    </ConfigProvider>
  );
};