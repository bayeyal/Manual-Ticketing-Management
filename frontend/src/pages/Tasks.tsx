import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchTasks, createTask, updateTask } from '../store/slices/tasksSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import { fetchProjectById, fetchProjects } from '../store/slices/projectsSlice';
import { fetchPages } from '../store/slices/pagesSlice';
import { setSelectedProject } from '../store/slices/selectedProjectSlice';
import { CreateTaskDto, Task } from '../types/task';
import { UserRole } from '../types/user';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const Tasks: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);
  const { users } = useAppSelector((state) => state.users);
  const { currentProject: project, projects } = useAppSelector((state) => state.projects);
  const { project: selectedProject } = useAppSelector((state) => state.selectedProject);
  const { pages } = useAppSelector((state) => state.pages);
  const { user } = useAppSelector((state) => state.auth);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Determine which project to use
  const activeProject = project || selectedProject;
  const activeProjectId = projectId ? parseInt(projectId) : activeProject?.id;

  // Filter projects based on user role
  const filteredProjects = useMemo(() => {
    if (!user || !projects.length) return [];
    
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        // Super admin can see all projects
        return projects;
      
      case UserRole.PROJECT_ADMIN:
        // Project admin can see projects they admin
        return projects.filter(p => p.projectAdmin?.id === user.id);
      
      case UserRole.USER:
        // Regular users can only see projects they're assigned to
        return projects.filter(p => 
          p.assignedUsers?.some(assignedUser => assignedUser.id === user.id)
        );
      
      default:
        return [];
    }
  }, [user, projects]);

  // Filter tasks based on user role
  const filteredTasks = useMemo(() => {
    if (!user || !tasks.length) return [];
    
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        // Super admin can see all tasks
        return tasks;
      
      case UserRole.PROJECT_ADMIN:
        // Project admin can see tasks from projects they admin
        return tasks.filter(task => 
          task.project?.projectAdmin?.id === user.id
        );
      
      case UserRole.USER:
        // Regular users can only see tasks from projects they're assigned to
        return tasks.filter(task => 
          task.project?.assignedUsers?.some(assignedUser => assignedUser.id === user.id)
        );
      
      default:
        return [];
    }
  }, [user, tasks]);

  useEffect(() => {
    // Always fetch projects to ensure we have the list for the selector
    dispatch(fetchProjects());
    
    if (activeProjectId) {
      dispatch(fetchTasks(activeProjectId));
      dispatch(fetchUsers());
      dispatch(fetchProjectById(activeProjectId));
      dispatch(fetchPages(activeProjectId));
    }
  }, [dispatch, activeProjectId]);

  const handleProjectChange = (event: any) => {
    const newProjectId = event.target.value;
    if (newProjectId) {
      navigate(`/projects/${newProjectId}/tasks`);
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    if (activeProjectId && activeProject) {
      // Find a page to associate with the task
      const page = pages && pages.length > 0 ? pages[0] : undefined;
      if (!page) {
        alert('No page available to associate with the task. Please create a page first.');
        return;
      }
      // Convert Partial<Task> to CreateTaskDto
      const createTaskDto: CreateTaskDto = {
        title: taskData.title!,
        description: taskData.description!,
        wcagCriteria: taskData.wcagCriteria!,
        defectSummary: taskData.defectSummary,
        recommendation: taskData.recommendation,
        userImpact: taskData.userImpact,
        comments: taskData.comments,
        disabilityType: taskData.disabilityType,
        screenshot: taskData.screenshot,
        screenshotTitle: taskData.screenshotTitle,
        severity: taskData.severity,
        status: taskData.status,
        priority: taskData.priority,
        assignedToId: taskData.assignedTo?.id,
        auditorId: taskData.auditor?.id,
        projectId: activeProjectId,
        pageId: page.id,
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      };
      await dispatch(createTask(createTaskDto));
    }
  };

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (editingTask && activeProjectId) {
      // Convert Partial<Task> to UpdateTaskDto
      const updateTaskDto = {
        title: taskData.title,
        description: taskData.description,
        wcagCriteria: taskData.wcagCriteria,
        defectSummary: taskData.defectSummary,
        recommendation: taskData.recommendation,
        userImpact: taskData.userImpact,
        comments: taskData.comments,
        disabilityType: taskData.disabilityType,
        screenshot: taskData.screenshot,
        screenshotTitle: taskData.screenshotTitle,
        severity: taskData.severity,
        status: taskData.status,
        priority: taskData.priority,
        assignedToId: taskData.assignedTo?.id,
        auditorId: taskData.auditor?.id,
        dueDate: taskData.dueDate,
      };
      await dispatch(updateTask({ id: editingTask.id, task: updateTaskDto }));
    }
  };

  const handleOpenTaskForm = () => {
    setEditingTask(null);
    setTaskFormOpen(true);
  };

  const handleCloseTaskForm = () => {
    setTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleCancelTaskForm = () => {
    setTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    console.log('Edit task:', task);
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  const handleDeleteTask = (taskId: number) => {
    // TODO: Implement delete functionality
    console.log('Delete task:', taskId);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 2 }}>
          User information not available.
        </Alert>
      </Container>
    );
  }

  if (filteredProjects.length === 0) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 2 }}>
          No projects available for your role ({user.role}).
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Project Selection Dropdown - Always Visible */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Tasks
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Select Project</InputLabel>
              <Select
                value={activeProjectId || ''}
                label="Select Project"
                onChange={handleProjectChange}
              >
                {filteredProjects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {user && (
              <Chip 
                label={`Role: ${user.role}`} 
                color="primary" 
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Project Info and Add Task Button */}
        {activeProject && (
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5" component="h2">
                {activeProject.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeProject.description}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenTaskForm}
            >
              Add Task
            </Button>
          </Box>
        )}

        {/* Task List */}
        <TaskList 
          tasks={filteredTasks} 
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onAdd={handleOpenTaskForm}
        />

        {/* Task Form */}
        {activeProject && (
          <TaskForm
            open={taskFormOpen}
            onClose={handleCloseTaskForm}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={handleCancelTaskForm}
            task={editingTask}
            project={activeProject}
            users={users}
            pages={pages}
            selectedPageId={editingTask?.page?.id || (pages && pages.length > 0 ? pages[0].id : undefined)}
          />
        )}
      </Box>
    </Container>
  );
};

export default Tasks; 