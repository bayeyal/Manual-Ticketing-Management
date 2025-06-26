import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchTasks, createTask } from '../store/slices/tasksSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import { fetchProjectById, fetchProjects } from '../store/slices/projectsSlice';
import { fetchPages } from '../store/slices/pagesSlice';
import { setSelectedProject } from '../store/slices/selectedProjectSlice';
import { CreateTaskDto, Task } from '../types/task';
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
  const [taskFormOpen, setTaskFormOpen] = useState(false);

  // Determine which project to use
  const activeProject = project || selectedProject;
  const activeProjectId = projectId ? parseInt(projectId) : activeProject?.id;

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

  const handleOpenTaskForm = () => {
    setTaskFormOpen(true);
  };

  const handleCloseTaskForm = () => {
    setTaskFormOpen(false);
  };

  const handleCancelTaskForm = () => {
    setTaskFormOpen(false);
  };

  const handleEditTask = (task: any) => {
    // TODO: Implement edit functionality
    console.log('Edit task:', task);
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

  if (!activeProject && projects.length > 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Select a Project
          </Typography>
          <FormControl fullWidth sx={{ maxWidth: 400 }}>
            <InputLabel>Choose a project to view tasks</InputLabel>
            <Select
              value=""
              label="Choose a project to view tasks"
              onChange={handleProjectChange}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Container>
    );
  }

  if (!activeProject) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 2 }}>
          No project selected. Please select a project first.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Tasks - {activeProject?.name}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenTaskForm}
          >
            Add Task
          </Button>
        </Box>

        <TaskList 
          tasks={tasks} 
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onAdd={handleOpenTaskForm}
        />

        <TaskForm
          open={taskFormOpen}
          onClose={handleCloseTaskForm}
          onSubmit={handleCreateTask}
          onCancel={handleCancelTaskForm}
          project={activeProject}
          users={users}
          pages={pages}
          selectedPageId={pages && pages.length > 0 ? pages[0].id : undefined}
        />
      </Box>
    </Container>
  );
};

export default Tasks; 