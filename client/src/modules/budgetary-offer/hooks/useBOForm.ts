import { useState, useEffect } from 'react';
// import { Form } from 'antd';
// import { BOService } from '../services/BOService';

interface WorkItem {
  quantity: number;
  baseRate: number;
  taxRate: number;
}

export const useBOForm = (form: any) => {
  const [totalValue, setTotalValue] = useState(0);
  const [maxEMD, setMaxEMD] = useState(0);
  const [suggestedEMD, setSuggestedEMD] = useState(0);

  // Calculate values when work items change
  const calculateValues = (workItems: WorkItem[]) => {
    const total = workItems.reduce((sum, item) => {
      if (!item.quantity || !item.baseRate) return sum;
      return sum + (item.quantity * item.baseRate * (1 + (item.taxRate || 0) / 100));
    }, 0);

    setTotalValue(total);
    setMaxEMD(total * 0.05); // 5% of total value
    setSuggestedEMD(total * 0.02); // 2% of total value
  };

  // Watch for work items changes
  useEffect(() => {
    const unsubscribe = form.watch(['workItems'], (values: { workItems: WorkItem[]; }) => {
      if (values?.workItems) {
        calculateValues(values.workItems);
      }
    });

    return () => unsubscribe;
  }, [form]);

  // Validate EMD amount
  const validateEMDAmount = async (amount: number) => {
    if (!amount) return Promise.resolve();
    
    if (amount > maxEMD) {
      return Promise.reject(
        `EMD amount cannot exceed ₹${maxEMD.toFixed(2)} (5% of total value)`
      );
    }

    return Promise.resolve();
  };

  // Calculate item total
  const calculateItemTotal = (item: WorkItem) => {
    if (!item.quantity || !item.baseRate) return 0;
    return item.quantity * item.baseRate * (1 + (item.taxRate || 0) / 100);
  };

  return {
    totalValue,
    maxEMD,
    suggestedEMD,
    validateEMDAmount,
    calculateItemTotal
  };
};

export default useBOForm;