import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '../../types/user';
import { usersApi } from '../../api/usersApi';

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async () => {
    const response = await usersApi.getAll();
    return response;
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (user: Partial<User>) => {
    const response = await usersApi.create(user);
    return response;
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, user }: { id: number; user: Partial<User> }) => {
    const response = await usersApi.update(id, user);
    return response;
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: number) => {
    await usersApi.delete(id);
    return id;
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
      });
  },
});

export default usersSlice.reducer; 