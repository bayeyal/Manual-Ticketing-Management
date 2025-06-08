import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { LoginDto, RegisterDto } from '../../types/user';
import { api } from '../../services/api';

interface AuthState {
  token: string | null;
  user: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: null,
  loading: false,
  error: null,
};

export const fetchUser = createAsyncThunk('auth/fetchUser', async (_, { getState }) => {
  const state = getState() as { auth: AuthState };
  const token = state.auth.token;
  
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    throw error;
  }
});

export const login = createAsyncThunk('auth/login', async (credentials: LoginDto) => {
  try {
    const response = await api.post<{ user: any; token: string }>('/auth/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { token, user };
  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    if (error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('Network error');
  }
});

export const register = createAsyncThunk('auth/register', async (userData: RegisterDto) => {
  try {
    const response = await api.post<{ user: any; token: string }>('/auth/register', userData);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    return { token, user };
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw new Error('Network error');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user';
        state.token = null;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
      });
  },
});

export default authSlice.reducer; 