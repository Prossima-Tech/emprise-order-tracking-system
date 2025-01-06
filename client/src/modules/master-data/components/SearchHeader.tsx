// src/modules/master-data/components/SearchHeader.tsx
import React from 'react';
import { Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Search } = Input;

interface SearchHeaderProps {
  onSearch: (value: string) => void;
  onAdd: () => void;
  addButtonText: string;
  searchPlaceholder: string;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  onSearch,
  onAdd,
  addButtonText,
  searchPlaceholder,
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <Search
        placeholder={searchPlaceholder}
        allowClear
        onSearch={onSearch}
        className="w-64"
      />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={onAdd}
      >
        {addButtonText}
      </Button>
    </div>
  );
};