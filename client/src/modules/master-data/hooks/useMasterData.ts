// src/modules/master-data/hooks/useMasterData.ts
import { useState, useCallback } from 'react';
import { message } from 'antd';
// import { masterDataApi } from '../services/masterDataApi';

export function useMasterData<T>(
  fetchFunction: (params: any) => Promise<any>,
  entityName: string
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async (
    page = current,
    limit = pageSize,
    search?: string
  ) => {
    setLoading(true);
    try {
      const response = await fetchFunction({ page, limit, search });
      setData(response.items);
      setTotal(response.total);
    } catch (error) {
      message.error(`Failed to fetch ${entityName}`);
    } finally {
      setLoading(false);
    }
  }, [current, pageSize, entityName, fetchFunction]);

  const handleSearch = (value: string) => {
    setCurrent(1);
    fetchData(1, pageSize, value);
  };

  const handleTableChange = (pagination: any) => {
    setCurrent(pagination.current);
    setPageSize(pagination.pageSize);
    fetchData(pagination.current, pagination.pageSize);
  };

  return {
    data,
    loading,
    total,
    current,
    pageSize,
    fetchData,
    handleSearch,
    handleTableChange,
  };
}