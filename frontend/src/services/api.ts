import axios, { AxiosError } from 'axios';
import { CreateProjectDto, Project } from '../types/project';
import { CreateTaskDto, Task } from '../types/task';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Projects API
export const projectsApi = {
  getAll: async () => {
    try {
      const response = await api.get<Project[]>('/projects');
      return response;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        console.error('Validation errors:', error.response.data);
      }
      console.error('Error fetching projects:', error);
      throw error;
    }
  },
  getById: async (id: number) => {
    try {
      const response = await api.get<Project>(`/projects/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },
  create: async (project: CreateProjectDto) => {
    try {
      // Convert string dates to ISO format for backend validation
      const projectData = {
        ...project,
        startDate: new Date(project.startDate).toISOString(),
        endDate: new Date(project.endDate).toISOString(),
        dueDate: new Date(project.dueDate).toISOString(),
      };
      console.log('Creating project with data:', projectData);
      const response = await api.post<Project>('/projects', projectData);
      return response;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        console.error('Validation errors:', error.response.data);
      }
      console.error('Error creating project:', error);
      throw error;
    }
  },
  update: async (id: number, project: Project) => {
    try {
      // Convert string dates to ISO format for backend validation
      const projectData = {
        ...project,
        startDate: new Date(project.startDate).toISOString(),
        endDate: new Date(project.endDate).toISOString(),
        dueDate: new Date(project.dueDate).toISOString(),
      };
      console.log('Updating project with data:', projectData);
      const response = await api.put<Project>(`/projects/${id}`, projectData);
      return response;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        console.error('Validation errors:', error.response.data);
      }
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  },
  assignUser: async (projectId: number, userId: number) => {
    try {
      const response = await api.post(`/projects/${projectId}/users/${userId}`);
      return response;
    } catch (error) {
      console.error(`Error assigning user ${userId} to project ${projectId}:`, error);
      throw error;
    }
  },
  removeUser: async (projectId: number, userId: number) => {
    try {
      const response = await api.delete(`/projects/${projectId}/users/${userId}`);
      return response;
    } catch (error) {
      console.error(`Error removing user ${userId} from project ${projectId}:`, error);
      throw error;
    }
  },
};

// Tasks API
export const tasksApi = {
  getAll: async () => {
    try {
      const response = await api.get<Task[]>('/tasks');
      return response;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        console.error('Validation errors:', error.response.data);
      }
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },
  getById: async (id: number) => {
    try {
      const response = await api.get<Task>(`/tasks/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  },
  getByProject: async (projectId: number) => {
    try {
      console.log('Fetching tasks for project:', projectId);
      const response = await api.get<Task[]>(`/tasks?projectId=${projectId}`);
      console.log('Tasks API response:', response.data);
      return response;
    } catch (error) {
      console.error(`Error fetching tasks for project ${projectId}:`, error);
      if (error instanceof AxiosError) {
        console.error('Request failed with status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw error;
    }
  },
  create: async (task: CreateTaskDto) => {
    try {
      // Convert string dates to ISO format for backend validation
      const taskData = {
        ...task,
        dueDate: new Date(task.dueDate).toISOString(),
        projectId: Number(task.projectId), // Ensure projectId is a number
        assignedToId: task.assignedToId ? Number(task.assignedToId) : null, // Convert to number or null
        pageUrl: task.pageUrl.startsWith('http') ? task.pageUrl : `https://${task.pageUrl}`, // Add protocol if missing
        conformanceLevel: task.conformanceLevel.toUpperCase(), // Ensure conformance level is uppercase
      };
      console.log('Creating task with data:', JSON.stringify(taskData, null, 2));
      const response = await api.post<Task>('/tasks', taskData);
      return response;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Task creation failed:');
        console.error('Request payload:', JSON.stringify(error.config?.data, null, 2));
        console.error('Response status:', error.response?.status);
        console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Response headers:', JSON.stringify(error.response?.headers, null, 2));
      }
      console.error('Error creating task:', error);
      throw error;
    }
  },
  update: async (id: number, task: Task) => {
    try {
      // Convert string dates to ISO format for backend validation
      const taskData = {
        ...task,
        dueDate: new Date(task.dueDate).toISOString(),
      };
      console.log('Updating task with data:', taskData);
      const response = await api.put<Task>(`/tasks/${id}`, taskData);
      return response;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        console.error('Validation errors:', error.response.data);
      }
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  },
  delete: async (id: number) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  },
};

export { api }; 