// src/mocks/dummyData.ts

import { 
    POStatus, 
    PurchaseOrder, 
    POStatistics, 
    POItem,
    PurchaseOrderStatusHistory 
  } from '@emprise/shared/src/types/purchase-order';
  
  // Dummy Vendors
  export const dummyVendors = [
    { 
      id: 'V1', 
      name: 'Tech Solutions Ltd.', 
      email: 'contact@techsolutions.com', 
      phone: '1234567890' 
    },
    { 
      id: 'V2', 
      name: 'Global Supplies Inc.', 
      email: 'info@globalsupplies.com', 
      phone: '9876543210' 
    },
    { 
      id: 'V3', 
      name: 'Quality Hardware Co.', 
      email: 'sales@qualityhw.com', 
      phone: '5555555555' 
    },
    { 
      id: 'V4', 
      name: 'Digital Systems Corp', 
      email: 'info@digitalsystems.com', 
      phone: '4444444444' 
    },
    { 
      id: 'V5', 
      name: 'Network Solutions Pro', 
      email: 'sales@networksolutions.com', 
      phone: '6666666666' 
    }
  ];
  
  // Dummy LOAs
  export const dummyLOAs = [
    { 
      id: 'LOA1', 
      loaNo: 'LOA/2023/001', 
      value: 1000000 
    },
    { 
      id: 'LOA2', 
      loaNo: 'LOA/2023/002', 
      value: 500000 
    },
    { 
      id: 'LOA3', 
      loaNo: 'LOA/2023/003', 
      value: 750000 
    },
    { 
      id: 'LOA4', 
      loaNo: 'LOA/2023/004', 
      value: 1200000 
    },
    { 
      id: 'LOA5', 
      loaNo: 'LOA/2023/005', 
      value: 800000 
    }
  ];
  
  // Dummy Items
  export const dummyItems = [
    {
      id: 'ITEM1',
      itemCode: 'LAP-001',
      description: 'Dell Latitude 5420 Laptop',
      unit: 'Nos',
      specifications: [
        { key: 'Processor', value: 'Intel i7 11th Gen' },
        { key: 'RAM', value: '16GB' },
        { key: 'Storage', value: '512GB SSD' }
      ]
    },
    {
      id: 'ITEM2',
      itemCode: 'PRN-001',
      description: 'HP LaserJet Pro Printer',
      unit: 'Nos',
      specifications: [
        { key: 'Type', value: 'Laser' },
        { key: 'Print Speed', value: '30 ppm' },
        { key: 'Connectivity', value: 'WiFi, Ethernet' }
      ]
    },
    {
      id: 'ITEM3',
      itemCode: 'MON-001',
      description: 'Dell 27" Monitor',
      unit: 'Nos',
      specifications: [
        { key: 'Size', value: '27 inch' },
        { key: 'Resolution', value: '2560x1440' },
        { key: 'Panel Type', value: 'IPS' }
      ]
    },
    {
      id: 'ITEM4',
      itemCode: 'NET-001',
      description: 'Cisco Network Switch',
      unit: 'Nos',
      specifications: [
        { key: 'Ports', value: '24 Ports' },
        { key: 'Speed', value: 'Gigabit' },
        { key: 'Management', value: 'Managed' }
      ]
    },
    {
      id: 'ITEM5',
      itemCode: 'SRV-001',
      description: 'Dell PowerEdge Server',
      unit: 'Nos',
      specifications: [
        { key: 'Processor', value: 'Intel Xeon' },
        { key: 'RAM', value: '64GB' },
        { key: 'Storage', value: '2TB SSD' }
      ]
    }
  ];
  
  // Create dummy PO items
  const createPOItems = (poId: string): POItem[] => [
    {
      id: `POI-${poId}-1`,
      poId,
      itemId: 'ITEM1',
      quantity: 5,
      unitPrice: 85000,
      totalPrice: 425000,
      specifications: {
        'Processor': 'Intel i7 11th Gen',
        'RAM': '16GB',
        'Storage': '512GB SSD'
      },
      item: {
        itemCode: 'LAP-001',
        description: 'Dell Latitude 5420 Laptop',
        unit: 'Nos'
      }
    },
    {
      id: `POI-${poId}-2`,
      poId,
      itemId: 'ITEM2',
      quantity: 2,
      unitPrice: 35000,
      totalPrice: 70000,
      specifications: {
        'Type': 'Laser',
        'Print Speed': '30 ppm',
        'Connectivity': 'WiFi, Ethernet'
      },
      item: {
        itemCode: 'PRN-001',
        description: 'HP LaserJet Pro Printer',
        unit: 'Nos'
      }
    }
  ];
  
  // Create dummy status history
  const createStatusHistory = (poId: string, status: POStatus): PurchaseOrderStatusHistory[] => {
    const history: PurchaseOrderStatusHistory[] = [
      {
        id: `SH-${poId}-1`,
        poId,
        fromStatus: POStatus.DRAFT,
        toStatus: POStatus.ISSUED,
        remarks: 'PO issued to vendor',
        createdAt: new Date('2023-01-15'),
        createdById: 'USER1'
      }
    ];
  
    if (status === POStatus.IN_PROGRESS) {
      history.push({
        id: `SH-${poId}-2`,
        poId,
        fromStatus: POStatus.ISSUED,
        toStatus: POStatus.IN_PROGRESS,
        remarks: 'Vendor started working on the order',
        createdAt: new Date('2023-01-20'),
        createdById: 'USER1'
      });
    }
  
    if (status === POStatus.COMPLETED) {
      history.push(
        {
          id: `SH-${poId}-2`,
          poId,
          fromStatus: POStatus.ISSUED,
          toStatus: POStatus.IN_PROGRESS,
          remarks: 'Vendor started working on the order',
          createdAt: new Date('2023-01-20'),
          createdById: 'USER1'
        },
        {
          id: `SH-${poId}-3`,
          poId,
          fromStatus: POStatus.IN_PROGRESS,
          toStatus: POStatus.COMPLETED,
          remarks: 'All items delivered and accepted',
          createdAt: new Date('2023-02-01'),
          createdById: 'USER1'
        }
      );
    }
  
    return history;
  };
  
  // Dummy Purchase Orders
  export const dummyPOs: PurchaseOrder[] = [
    {
      id: 'PO1',
      poNumber: 'PO/2023/001',
      loaId: 'LOA1',
      vendorId: 'V1',
      value: 495000,
      deliveryDate: new Date('2024-02-15'),
      status: POStatus.DRAFT,
      vendor: dummyVendors[0],
      loa: dummyLOAs[0],
      items: createPOItems('PO1'),
      createdAt: new Date('2023-01-10'),
      updatedAt: new Date('2023-01-10'),
      statusHistory: []
    },
    {
      id: 'PO2',
      poNumber: 'PO/2023/002',
      loaId: 'LOA1',
      vendorId: 'V2',
      value: 595000,
      deliveryDate: new Date('2024-01-20'),
      status: POStatus.ISSUED,
      vendor: dummyVendors[1],
      loa: dummyLOAs[0],
      items: createPOItems('PO2'),
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15'),
      statusHistory: createStatusHistory('PO2', POStatus.ISSUED)
    },
    {
      id: 'PO3',
      poNumber: 'PO/2023/003',
      loaId: 'LOA2',
      vendorId: 'V3',
      value: 395000,
      deliveryDate: new Date('2024-01-25'),
      status: POStatus.IN_PROGRESS,
      vendor: dummyVendors[2],
      loa: dummyLOAs[1],
      items: createPOItems('PO3'),
      createdAt: new Date('2023-01-20'),
      updatedAt: new Date('2023-01-20'),
      statusHistory: createStatusHistory('PO3', POStatus.IN_PROGRESS)
    },
    {
      id: 'PO4',
      poNumber: 'PO/2023/004',
      loaId: 'LOA2',
      vendorId: 'V1',
      value: 445000,
      deliveryDate: new Date('2023-12-30'),
      status: POStatus.COMPLETED,
      vendor: dummyVendors[0],
      loa: dummyLOAs[1],
      items: createPOItems('PO4'),
      createdAt: new Date('2023-01-25'),
      updatedAt: new Date('2023-02-01'),
      statusHistory: createStatusHistory('PO4', POStatus.COMPLETED)
    },
    {
      id: 'PO5',
      poNumber: 'PO/2023/005',
      loaId: 'LOA3',
      vendorId: 'V2',
      value: 295000,
      deliveryDate: new Date('2024-01-10'),
      status: POStatus.CANCELLED,
      vendor: dummyVendors[1],
      loa: dummyLOAs[2],
      items: createPOItems('PO5'),
      createdAt: new Date('2023-01-30'),
      updatedAt: new Date('2023-01-31'),
      statusHistory: [
        {
          id: 'SH-PO5-1',
          poId: 'PO5',
          fromStatus: POStatus.DRAFT,
          toStatus: POStatus.CANCELLED,
          remarks: 'Cancelled due to vendor unavailability',
          createdAt: new Date('2023-01-31'),
          createdById: 'USER1'
        }
      ]
    },
    {
      id: 'PO6',
      poNumber: 'PO/2023/006',
      loaId: 'LOA4',
      vendorId: 'V4',
      value: 785000,
      deliveryDate: new Date('2024-03-15'),
      status: POStatus.DRAFT,
      vendor: dummyVendors[3],
      loa: dummyLOAs[3],
      items: createPOItems('PO6'),
      createdAt: new Date('2023-02-05'),
      updatedAt: new Date('2023-02-05'),
      statusHistory: []
    },
    {
      id: 'PO7',
      poNumber: 'PO/2023/007',
      loaId: 'LOA5',
      vendorId: 'V5',
      value: 655000,
      deliveryDate: new Date('2024-02-28'),
      status: POStatus.IN_PROGRESS,
      vendor: dummyVendors[4],
      loa: dummyLOAs[4],
      items: createPOItems('PO7'),
      createdAt: new Date('2023-02-10'),
      updatedAt: new Date('2023-02-15'),
      statusHistory: createStatusHistory('PO7', POStatus.IN_PROGRESS)
    }
  ];
  
  // Calculate statistics based on dummy POs
  export const dummyStatistics: POStatistics = {
    totalCount: dummyPOs.length,
    totalValue: dummyPOs.reduce((sum, po) => sum + po.value, 0),
    pendingDelivery: dummyPOs.filter(po => 
      po.status === POStatus.ISSUED || po.status === POStatus.IN_PROGRESS
    ).length,
    completed: dummyPOs.filter(po => po.status === POStatus.COMPLETED).length,
    byStatus: {
      [POStatus.DRAFT]: dummyPOs.filter(po => po.status === POStatus.DRAFT).length,
      [POStatus.ISSUED]: dummyPOs.filter(po => po.status === POStatus.ISSUED).length,
      [POStatus.IN_PROGRESS]: dummyPOs.filter(po => po.status === POStatus.IN_PROGRESS).length,
      [POStatus.COMPLETED]: dummyPOs.filter(po => po.status === POStatus.COMPLETED).length,
      [POStatus.CANCELLED]: dummyPOs.filter(po => po.status === POStatus.CANCELLED).length,
    },
    valueByStatus: {
      [POStatus.DRAFT]: dummyPOs
        .filter(po => po.status === POStatus.DRAFT)
        .reduce((sum, po) => sum + po.value, 0),
      [POStatus.ISSUED]: dummyPOs
        .filter(po => po.status === POStatus.ISSUED)
        .reduce((sum, po) => sum + po.value, 0),
      [POStatus.IN_PROGRESS]: dummyPOs
        .filter(po => po.status === POStatus.IN_PROGRESS)
        .reduce((sum, po) => sum + po.value, 0),
      [POStatus.COMPLETED]: dummyPOs
        .filter(po => po.status === POStatus.COMPLETED)
        .reduce((sum, po) => sum + po.value, 0),
      [POStatus.CANCELLED]: dummyPOs
        .filter(po => po.status === POStatus.CANCELLED)
        .reduce((sum, po) => sum + po.value, 0),
    }
  };
  
  // Helper functions for mock API responses
  export const createMockApiResponse = <T>(data: T) => ({
    success: true,
    data,
    message: 'Operation successful'
  });
  
  export const createMockPaginatedResponse = <T>(
    items: T[],
    page: number = 1,
    pageSize: number = 10
  ) => ({
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize)
  });
  
  export default {
    dummyVendors,
    dummyLOAs,
    dummyItems,
    dummyPOs,
    dummyStatistics,
    createMockApiResponse,
    createMockPaginatedResponse
  };