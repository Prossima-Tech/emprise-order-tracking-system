// src/services/mockApi.ts
import { 
    dummyPOs, 
    dummyStatistics, 
    dummyVendors, 
    dummyLOAs, 
    dummyItems,
    createMockApiResponse,
    createMockPaginatedResponse
  } from '../../../mocks/dummydata';
  import { 
    POCreateInput, 
    PurchaseOrder, 
    POStatistics,
    POFilter,
    POStatus,
    POItem
  } from '../../../types/purchase-order';
  
  // Simulate API delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  export const mockPurchaseOrderApi = {
    createPO: async (data: POCreateInput): Promise<PurchaseOrder> => {
      await delay(1000);
      
      // Convert string date to Date object if necessary
      const deliveryDate = data.deliveryDate instanceof Date 
        ? data.deliveryDate 
        : new Date(data.deliveryDate);
  
      // Calculate total value from items if not provided
      const totalValue = data.items.reduce((sum, item) => 
        sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  
      // Create new PO with proper types
      const newPO: PurchaseOrder = {
        id: `PO${dummyPOs.length + 1}`,
        poNumber: `PO/2023/${String(dummyPOs.length + 1).padStart(3, '0')}`,
        loaId: data.loaId,
        vendorId: data.vendorId,
        value: totalValue,
        deliveryDate: deliveryDate,
        status: POStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
        vendor: dummyVendors.find(v => v.id === data.vendorId),
        loa: dummyLOAs.find(l => l.id === data.loaId),
        items: data.items.map((item): POItem => ({
          id: `POI-${dummyPOs.length + 1}-${Math.random().toString(36).substr(2, 9)}`,
          poId: `PO${dummyPOs.length + 1}`,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: Number(item.quantity) * Number(item.unitPrice),
          specifications: item.specifications,
          item: dummyItems.find(i => i.id === item.itemId)
        })),
        statusHistory: [{
          id: `SH-PO${dummyPOs.length + 1}-1`,
          poId: `PO${dummyPOs.length + 1}`,
          fromStatus: '',
          toStatus: POStatus.DRAFT,
          remarks: 'PO Created',
          createdAt: new Date(),
          createdById: 'USER1'
        }]
      };
  
      dummyPOs.push(newPO);
      return newPO;
    },
  
    updateStatus: async (id: string, status: POStatus, remarks?: string): Promise<PurchaseOrder> => {
      await delay(1000);
      const poIndex = dummyPOs.findIndex(p => p.id === id);
      if (poIndex === -1) throw new Error('PO not found');
  
      const po = { ...dummyPOs[poIndex] };
      const oldStatus = po.status;
      po.status = status;
      po.updatedAt = new Date();
  
      if (!po.statusHistory) po.statusHistory = [];
      po.statusHistory.push({
        id: `SH-${id}-${po.statusHistory.length + 1}`,
        poId: id,
        fromStatus: oldStatus,
        toStatus: status,
        remarks: remarks || '',
        createdAt: new Date(),
        createdById: 'USER1'
      });
  
      dummyPOs[poIndex] = po;
      return po;
    },
  
    getPODetails: async (id: string): Promise<PurchaseOrder> => {
      await delay(1000);
      const po = dummyPOs.find(p => p.id === id);
      if (!po) throw new Error('PO not found');
      return po;
    },
  
    listPOs: async (filters?: POFilter) => {
      await delay(1000);
      let filteredPOs = [...dummyPOs];
  
      if (filters) {
        if (filters.status) {
          filteredPOs = filteredPOs.filter(po => po.status === filters.status);
        }
        if (filters.vendorId) {
          filteredPOs = filteredPOs.filter(po => po.vendorId === filters.vendorId);
        }
        if (filters.loaId) {
          filteredPOs = filteredPOs.filter(po => po.loaId === filters.loaId);
        }
        if (filters.startDate && filters.endDate) {
          filteredPOs = filteredPOs.filter(po => {
            const date = po.deliveryDate;
            return date >= new Date(filters.startDate!) && 
                   date <= new Date(filters.endDate!);
          });
        }
      }
  
      return createMockPaginatedResponse(filteredPOs);
    },
  
    getStatistics: async (): Promise<POStatistics> => {
      await delay(1000);
      return dummyStatistics;
    },
  
    // Helper methods for master data
    getVendors: async () => {
      await delay(500);
      return dummyVendors;
    },
  
    getLOAs: async () => {
      await delay(500);
      return dummyLOAs;
    },
  
    getItems: async () => {
      await delay(500);
      return dummyItems;
    },
  
    // Method to update PO (only in DRAFT status)
    updatePO: async (id: string, data: Partial<POCreateInput>): Promise<PurchaseOrder> => {
      await delay(1000);
      const poIndex = dummyPOs.findIndex(p => p.id === id);
      if (poIndex === -1) throw new Error('PO not found');
  
      const po = { ...dummyPOs[poIndex] };
      if (po.status !== POStatus.DRAFT) {
        throw new Error('Can only update POs in DRAFT status');
      }
  
      // Update fields
      if (data.deliveryDate) {
        po.deliveryDate = new Date(data.deliveryDate);
      }
      if (data.items) {
        po.items = data.items.map((item): POItem => ({
          id: `POI-${id}-${Math.random().toString(36).substr(2, 9)}`,
          poId: id,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: Number(item.quantity) * Number(item.unitPrice),
          specifications: item.specifications,
          item: dummyItems.find(i => i.id === item.itemId)
        }));
        po.value = po.items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
      }
  
      po.updatedAt = new Date();
      dummyPOs[poIndex] = po;
      return po;
    }
  };