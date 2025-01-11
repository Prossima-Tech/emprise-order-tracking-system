import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  LOA, 
  LOARecordInput, 
  LOAAmendment, 
  LOAAmendmentInput 
} from '../../types/loa';
import { loaApi } from '../../modules/loa-management/services';

interface LOAState {
  loas: LOA[];
  currentLOA: LOA | null;
  amendments: LOAAmendment[];
  loading: boolean;
  error: string | null;
}

const initialState: LOAState = {
  loas: [],
  currentLOA: null,
  amendments: [],
  loading: false,
  error: null,
};

export const recordLOA = createAsyncThunk(
  'loa/record',
  async (data: LOARecordInput) => {
    const response = await loaApi.recordLOA(data);
    return response.data;
  }
);

export const getLOADetails = createAsyncThunk(
  'loa/getDetails',
  async (id: string) => {
    const response = await loaApi.getLOADetails(id);
    return response.data;
  }
);

export const recordAmendment = createAsyncThunk(
  'loa/recordAmendment',
  async ({ loaId, data }: { loaId: string; data: LOAAmendmentInput }) => {
    const response = await loaApi.recordAmendment(loaId, data);
    return response.data;
  }
);

const loaSlice = createSlice({
  name: 'loa',
  initialState,
  reducers: {
    clearCurrentLOA: (state) => {
      state.currentLOA = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(recordLOA.fulfilled, (state, action) => {
        state.loas.unshift(action.payload);
      })
      .addCase(getLOADetails.fulfilled, (state, action) => {
        state.currentLOA = action.payload;
      })
      .addCase(recordAmendment.fulfilled, (state, action) => {
        if (state.currentLOA && state.currentLOA.id === action.payload.loaId) {
          state.amendments.unshift(action.payload);
        }
      });
  },
});

export const { clearCurrentLOA } = loaSlice.actions;
export default loaSlice.reducer;