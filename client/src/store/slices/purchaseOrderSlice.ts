import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  PurchaseOrder, 
  POCreateInput, 
  POFilter 
} from '@emprise/shared/src/types/purchase-order';
import { purchaseOrderApi } from '../../modules/purchase-orders/services';

interface PurchaseOrderState {
  orders: PurchaseOrder[];
  currentOrder: PurchaseOrder | null;
  statistics: any;
  loading: boolean;
  error: string | null;
  filters: POFilter;
}

const initialState: PurchaseOrderState = {
  orders: [],
  currentOrder: null,
  statistics: null,
  loading: false,
  error: null,
  filters: {},
};

export const createPO = createAsyncThunk(
  'purchaseOrder/create',
  async (data: POCreateInput) => {
    const response = await purchaseOrderApi.createPO(data);
    return response.data;
  }
);

export const updatePOStatus = createAsyncThunk(
  'purchaseOrder/updateStatus',
  async ({ id, status }: { id: string; status: string }) => {
    const response = await purchaseOrderApi.updateStatus(id, status);
    return response.data;
  }
);

export const fetchPODetails = createAsyncThunk(
  'purchaseOrder/fetchDetails',
  async (id: string) => {
    const response = await purchaseOrderApi.getPODetails(id);
    return response.data;
  }
);

const purchaseOrderSlice = createSlice({
  name: 'purchaseOrder',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPO.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
      })
      .addCase(updatePOStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(fetchPODetails.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      });
  },
});

export const { setFilters, clearCurrentOrder } = purchaseOrderSlice.actions;
export default purchaseOrderSlice.reducer;