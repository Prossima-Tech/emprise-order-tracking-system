// src/modules/master-data/data/dummyData.ts
import { DashboardStats, MatchingData, TrendDataPoint } from '@emprise/shared/src/types/master';
import dayjs from 'dayjs';

export const dummyStats: DashboardStats = {
  totalItems: 1250,
  totalVendors: 450,
  activeItems: 980,
  activeVendors: 380,
  itemVendorMatches: 850,
  itemPOMatches: 720,
  vendorPOMatches: 680,
};

// Generate trend data for the last 30 days
export const generateTrendData = (): TrendDataPoint[] => {
  const data: TrendDataPoint[] = [];
  const types: Array<'item-vendor' | 'item-po' | 'vendor-po'> = ['item-vendor', 'item-po', 'vendor-po'];
  
  for (let i = 29; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
    types.forEach(type => {
      data.push({
        date,
        type,
        value: Math.floor(Math.random() * 50) + 20, // Random value between 20 and 70
      });
    });
  }
  
  return data;
};

// Generate dummy matching data
export const generateMatchingData = (type: string): MatchingData[] => {
  const data: MatchingData[] = [];
  const itemCodes = ['ITM001', 'ITM002', 'ITM003', 'ITM004', 'ITM005'];
  const descriptions = ['Steel Pipes', 'Copper Wires', 'Electric Motors', 'Control Valves', 'Pressure Gauges'];
  const vendors = ['Vendor A', 'Vendor B', 'Vendor C', 'Vendor D', 'Vendor E'];
  const poNumbers = ['PO001', 'PO002', 'PO003', 'PO004', 'PO005'];

  for (let i = 0; i < 20; i++) {
    const baseData = {
      id: `match-${i}`,
      matchDate: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format('YYYY-MM-DD'),
      matchType: type as 'item-vendor' | 'item-po' | 'vendor-po',
    };

    switch (type) {
      case 'item-vendor':
        data.push({
          ...baseData,
          itemCode: itemCodes[Math.floor(Math.random() * itemCodes.length)],
          itemDescription: descriptions[Math.floor(Math.random() * descriptions.length)],
          vendorName: vendors[Math.floor(Math.random() * vendors.length)],
        });
        break;
      case 'item-po':
        data.push({
          ...baseData,
          itemCode: itemCodes[Math.floor(Math.random() * itemCodes.length)],
          itemDescription: descriptions[Math.floor(Math.random() * descriptions.length)],
          poNumber: poNumbers[Math.floor(Math.random() * poNumbers.length)],
        });
        break;
      case 'vendor-po':
        data.push({
          ...baseData,
          vendorName: vendors[Math.floor(Math.random() * vendors.length)],
          poNumber: poNumbers[Math.floor(Math.random() * poNumbers.length)],
        });
        break;
    }
  }

  return data;
};