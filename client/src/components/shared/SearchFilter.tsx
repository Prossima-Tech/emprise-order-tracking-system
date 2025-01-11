// components/shared/SearchFilter.tsx
import { Input, Select, DatePicker, Space } from 'antd';

interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: { label: string; value: any }[];
}