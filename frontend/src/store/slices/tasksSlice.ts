import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Task, CreateTaskDto } from '../../types/task';
import { api, tasksApi } from '../../services/api';
import { AxiosError } from 'axios';
import { fetchProjectById, fetchProjects } from './projectsSlice';
import { AppDispatch } from '../index';

interface TasksState {
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  selectedTask: null,
  loading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (projectId: number) => {
    console.log('Fetching tasks for project:', projectId);
    try {
      console.log('Making API request to:', `/tasks/project/${projectId}`);
      const response = await tasksApi.getByProject(projectId);
      console.log('Tasks API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error instanceof AxiosError) {
        console.error('Request failed with status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw error;
    }
  }
);

export const fetchAllTasks = createAsyncThunk(
  'tasks/fetchAllTasks',
  async () => {
    console.log('Fetching all tasks');
    try {
      const response = await tasksApi.getAll();
      console.log('All tasks API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      if (error instanceof AxiosError) {
        console.error('Request failed with status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw error;
    }
  }
);

export const fetchTasksByPage = createAsyncThunk(
  'tasks/fetchTasksByPage',
  async (pageId: number) => {
    console.log('Fetching tasks for page:', pageId);
    try {
      const response = await api.get(`/tasks/page/${pageId}`);
      console.log('Tasks by page API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks by page:', error);
      if (error instanceof AxiosError) {
        console.error('Request failed with status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw error;
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id: number) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (task: Partial<Task>) => {
    console.log('=== createTask async thunk started ===');
    console.log('Creating task with data:', JSON.stringify(task, null, 2));
    try {
      console.log('=== Creating task with data ===');
      console.log('Request data:', JSON.stringify(task, null, 2));
      const response = await api.post('/tasks', task);
      console.log('=== Task created successfully ===');
      console.log('Response:', response.data);
      console.log('=== createTask async thunk completed successfully ===');
      return response.data;
    } catch (error) {
      console.error('=== createTask async thunk failed ===');
      console.error('Error creating task:', error);
      if (error instanceof AxiosError) {
        console.error('Request failed with status:', error.response?.status);
        console.error('Request data that was sent:', JSON.stringify(task, null, 2));
        console.error('Response data:', error.response?.data);
        console.error('Validation errors:', error.response?.data?.message);
        
        // Handle different types of error messages
        let errorMessage = 'Unknown error';
        if (error.response?.data?.message) {
          if (Array.isArray(error.response.data.message)) {
            errorMessage = error.response.data.message.join(', ');
          } else {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(`Failed to create task: ${errorMessage}`);
      }
      throw error;
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, task }: { id: number; task: Partial<Task> }, { dispatch }) => {
    console.log('=== updateTask async thunk started ===');
    console.log('Updating task with ID:', id, 'and data:', JSON.stringify(task, null, 2));
    try {
      const response = await api.patch(`/tasks/${id}`, task);
      console.log('=== Task updated successfully ===');
      console.log('Response:', response.data);
      console.log('=== updateTask async thunk completed successfully ===');
      
      // Always refresh project data to get updated progress
      console.log('=== Refreshing project data ===');
      try {
        if (response.data.project?.id) {
          console.log('Project ID from response:', response.data.project.id);
          await dispatch(fetchProjectById(response.data.project.id));
          console.log('=== Project data refreshed via fetchProjectById ===');
        } else {
          console.log('No project ID in response, refreshing projects list');
          await dispatch(fetchProjects());
          console.log('=== Projects list refreshed ===');
        }
      } catch (refreshError) {
        console.error('Error refreshing project data:', refreshError);
        // Don't fail the task update if project refresh fails
      }
      
      return response.data;
    } catch (error) {
      console.error('=== updateTask async thunk failed ===');
      console.error('Error updating task:', error);
      if (error instanceof AxiosError) {
        console.error('Request failed with status:', error.response?.status);
        console.error('Request data that was sent:', JSON.stringify(task, null, 2));
        console.error('Response data:', error.response?.data);
        console.error('Validation errors:', error.response?.data?.message);
        
        // Handle different types of error messages
        let errorMessage = 'Unknown error';
        if (error.response?.data?.message) {
          if (Array.isArray(error.response.data.message)) {
            errorMessage = error.response.data.message.join(', ');
          } else {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(`Failed to update task: ${errorMessage}`);
      }
      throw error;
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: number) => {
    await api.delete(`/tasks/${taskId}`);
    return taskId;
  }
);

export const sendTaskMessage = createAsyncThunk(
  'tasks/sendMessage',
  async ({ taskId, content, mentionedUserId }: { taskId: number; content: string; mentionedUserId?: number }) => {
    const response = await api.post(`/tasks/${taskId}/messages`, { content, mentionedUserId });
    return { taskId, message: response.data };
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      // Fetch all tasks
      .addCase(fetchAllTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch all tasks';
      })
      // Fetch tasks by page
      .addCase(fetchTasksByPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByPage.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasksByPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks by page';
      })
      // Fetch task by ID
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch task';
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create task';
      })
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.selectedTask?.id === action.payload.id) {
          state.selectedTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update task';
      })
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
        if (state.selectedTask?.id === action.payload) {
          state.selectedTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete task';
      })
      // Send task message
      .addCase(sendTaskMessage.fulfilled, (state, action) => {
        const task = state.tasks.find((t) => t.id === action.payload.taskId);
        if (task) {
          if (!task.messages) {
            task.messages = [];
          }
          task.messages.push(action.payload.message);
        }
      });
  },
});

export const { clearSelectedTask } = tasksSlice.actions;
export default tasksSlice.reducer; 