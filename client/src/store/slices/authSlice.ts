// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../modules/auth/services';
import { User } from '@emprise/shared/src/types/user';
import { LoginInput } from '@emprise/shared/src/types/auth';
import { config } from '../../config';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  checkingAuth: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(config.AUTH_TOKEN_KEY),
  loading: false,
  error: null,
  isAuthenticated: false,
  checkingAuth: true,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginInput) => {
    const response = await authService.login(credentials);
    // Store token
    localStorage.setItem(config.AUTH_TOKEN_KEY, response.data.token);
    return response.data;
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem(config.AUTH_TOKEN_KEY);
      if (!token) {
        return rejectWithValue('No token found');
      }
      const response = await authService.me();
      return response.data;
    } catch (error: any) {
      localStorage.removeItem(config.AUTH_TOKEN_KEY);
      return rejectWithValue(error.message || 'Authentication failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem(config.AUTH_TOKEN_KEY);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(checkAuthStatus.pending, (state) => {
        state.checkingAuth = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.checkingAuth = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.checkingAuth = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;