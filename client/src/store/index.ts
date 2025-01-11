// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import budgetaryOfferReducer from './slices/budgetaryOfferSlice';
import emdReducer from './slices/emdSlice';
import loaReducer from './slices/loaSlice';
import purchaseOrderReducer from './slices/purchaseOrderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    budgetaryOffer: budgetaryOfferReducer,
    emd: emdReducer,
    loa: loaReducer,
    purchaseOrder: purchaseOrderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;