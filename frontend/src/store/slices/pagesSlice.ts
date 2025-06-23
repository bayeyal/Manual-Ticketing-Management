import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { pagesApi } from '../../api/pagesApi';
import { Page, CreatePageDto, UpdatePageDto } from '../../types/page';

interface PagesState {
  pages: Page[];
  currentPage: Page | null;
  loading: boolean;
  error: string | null;
}

const initialState: PagesState = {
  pages: [],
  currentPage: null,
  loading: false,
  error: null,
};

export const fetchPages = createAsyncThunk(
  'pages/fetchPages',
  async (projectId?: number) => {
    const response = await pagesApi.getAll(projectId);
    return response;
  }
);

export const fetchPageById = createAsyncThunk(
  'pages/fetchPageById',
  async (id: number) => {
    const response = await pagesApi.getById(id);
    return response;
  }
);

export const createPage = createAsyncThunk(
  'pages/createPage',
  async (pageData: CreatePageDto) => {
    const response = await pagesApi.create(pageData);
    return response;
  }
);

export const updatePage = createAsyncThunk(
  'pages/updatePage',
  async ({ id, pageData }: { id: number; pageData: UpdatePageDto }) => {
    const response = await pagesApi.update(id, pageData);
    return response;
  }
);

export const deletePage = createAsyncThunk(
  'pages/deletePage',
  async (id: number) => {
    await pagesApi.delete(id);
    return id;
  }
);

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    clearCurrentPage: (state) => {
      state.currentPage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch pages
      .addCase(fetchPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.loading = false;
        state.pages = action.payload;
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch pages';
      })
      // Fetch page by ID
      .addCase(fetchPageById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPageById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPage = action.payload;
      })
      .addCase(fetchPageById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch page';
      })
      // Create page
      .addCase(createPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPage.fulfilled, (state, action) => {
        state.loading = false;
        state.pages.push(action.payload);
      })
      .addCase(createPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create page';
      })
      // Update page
      .addCase(updatePage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.pages.findIndex(page => page.id === action.payload.id);
        if (index !== -1) {
          state.pages[index] = action.payload;
        }
        if (state.currentPage?.id === action.payload.id) {
          state.currentPage = action.payload;
        }
      })
      .addCase(updatePage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update page';
      })
      // Delete page
      .addCase(deletePage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePage.fulfilled, (state, action) => {
        state.loading = false;
        state.pages = state.pages.filter(page => page.id !== action.payload);
        if (state.currentPage?.id === action.payload) {
          state.currentPage = null;
        }
      })
      .addCase(deletePage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete page';
      });
  },
});

export const { clearCurrentPage, clearError } = pagesSlice.actions;
export default pagesSlice.reducer; 