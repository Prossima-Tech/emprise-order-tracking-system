import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { EMDTracking, EMDSubmissionInput, EMDStatistics } from '../../types/emd';
import { emdApi } from '../../modules/emd-tracking/services';

interface EMDState {
  emds: EMDTracking[];
  statistics: EMDStatistics | null;
  loading: boolean;
  error: string | null;
}

const initialState: EMDState = {
  emds: [],
  statistics: null,
  loading: false,
  error: null,
};

export const submitEMD = createAsyncThunk(
  'emd/submit',
  async (data: EMDSubmissionInput) => {
    const response = await emdApi.submitEMD(data);
    return response.data;
  }
);

export const fetchEMDsByOffer = createAsyncThunk(
  'emd/fetchByOffer',
  async (offerId: string) => {
    const response = await emdApi.getEMDByOffer(offerId);
    return response.data;
  }
);

export const fetchEMDStatistics = createAsyncThunk(
  'emd/fetchStatistics',
  async () => {
    const response = await emdApi.getStatistics();
    return response.data;
  }
);

const emdSlice = createSlice({
  name: 'emd',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitEMD.fulfilled, (state, action) => {
        state.emds.unshift(action.payload);
      })
      .addCase(fetchEMDsByOffer.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEMDsByOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.emds = action.payload;
      })
      .addCase(fetchEMDStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      });
  },
});

export default emdSlice.reducer;