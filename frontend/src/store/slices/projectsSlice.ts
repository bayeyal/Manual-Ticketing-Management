import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Project, CreateProjectDto } from '../../types/project';
import { projectsApi } from '../../api/projectsApi';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async () => {
    const response = await projectsApi.getAll();
    return response;
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (id: number) => {
    const response = await projectsApi.getById(id);
    return response;
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (project: CreateProjectDto) => {
    const response = await projectsApi.create(project);
    return response;
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, project }: { id: number; project: Partial<Project> }) => {
    const response = await projectsApi.update(id, project);
    return response;
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id: number) => {
    await projectsApi.delete(id);
    return id;
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch project';
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(project => project.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(project => project.id !== action.payload);
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null;
        }
      });
  },
});

export const { clearCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer; 