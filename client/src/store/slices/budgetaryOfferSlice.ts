import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BudgetaryOffer, BudgetaryOfferCreateInput } from '../../types/budgetary-offer';
import { budgetaryOfferService } from '../../modules/budgetary-offer/services';

interface BudgetaryOfferState {
  offers: BudgetaryOffer[];
  currentOffer: BudgetaryOffer | null;
  statistics: any;
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
}

const initialState: BudgetaryOfferState = {
  offers: [],
  currentOffer: null,
  statistics: null,
  loading: false,
  error: null,
  totalItems: 0,
  currentPage: 1,
};

export const fetchOffers = createAsyncThunk(
  'budgetaryOffer/fetchOffers',
  async (params?: any) => {
    const response = await budgetaryOfferService.getAll(params);
    return response.data;
  }
);

export const createOffer = createAsyncThunk(
  'budgetaryOffer/createOffer',
  async (data: BudgetaryOfferCreateInput) => {
    const response = await budgetaryOfferService.create(data);
    return response.data;
  }
);

export const updateOfferStatus = createAsyncThunk(
  'budgetaryOffer/updateStatus',
  async ({ id, status }: { id: string; status: string }) => {
    const response = await budgetaryOfferService.updateStatus(id, status);
    return response.data;
  }
);

const budgetaryOfferSlice = createSlice({
  name: 'budgetaryOffer',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearCurrentOffer: (state) => {
      state.currentOffer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Offers
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = action.payload.items;
        state.totalItems = action.payload.total;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch offers';
      })
      // Create Offer
      .addCase(createOffer.fulfilled, (state, action) => {
        state.offers.unshift(action.payload);
      })
      // Update Status
      .addCase(updateOfferStatus.fulfilled, (state, action) => {
        const index = state.offers.findIndex(
          (offer) => offer.id === action.payload.id
        );
        if (index !== -1) {
          state.offers[index] = action.payload;
        }
      });
  },
});

export const { setCurrentPage, clearCurrentOffer } = budgetaryOfferSlice.actions;
export default budgetaryOfferSlice.reducer;