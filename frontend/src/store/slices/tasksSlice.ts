import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Task } from '../../types/task';
import { api, tasksApi } from '../../services/api';
import { AxiosError } from 'axios';

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
    const response = await api.post('/tasks', task);
    return response.data;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, task }: { id: number; task: Partial<Task> }) => {
    const response = await api.patch(`/tasks/${id}`, task);
    return response.data;
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