import React from 'react';
import { Input, Select, DatePicker, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface FilterPanelProps {
  filters: any;
  onFiltersChange: (newFilters: any) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Input
        placeholder="Search by subject or authority"
        prefix={<SearchOutlined />}
        value={filters.search}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
      />
      <Select
        placeholder="Filter by status"
        allowClear
        className="w-full"
        value={filters.status}
        onChange={(value) => onFiltersChange({ ...filters, status: value })}
      >
        <Option value="DRAFT">Draft</Option>
        <Option value="PENDING_APPROVAL">Pending Approval</Option>
        <Option value="APPROVED">Approved</Option>
      </Select>
      <RangePicker
        className="w-full"
        value={filters.dateRange}
        onChange={(dates) => onFiltersChange({ ...filters, dateRange: dates })}
      />
      <Button 
        type="primary"
        onClick={() => navigate('/budgetary-offers/create')}
        className="bg-blue-500"
      >
        Create New
      </Button>
    </div>
  );
};

export default FilterPanel;