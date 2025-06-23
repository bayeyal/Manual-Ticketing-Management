import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchTasks, createTask } from '../store/slices/tasksSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import { fetchProjectById } from '../store/slices/projectsSlice';
import { fetchPages } from '../store/slices/pagesSlice';
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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const Tasks: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);
  const { users } = useAppSelector((state) => state.users);
  const { currentProject: project } = useAppSelector((state) => state.projects);
  const { pages } = useAppSelector((state) => state.pages);
  const [taskFormOpen, setTaskFormOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasks(parseInt(projectId)));
      dispatch(fetchUsers());
      dispatch(fetchProjectById(parseInt(projectId)));
      dispatch(fetchPages(parseInt(projectId)));
    }
  }, [dispatch, projectId]);

  const handleCreateTask = async (taskData: Partial<Task>) => {
    if (projectId && project) {
      // Convert Partial<Task> to CreateTaskDto
      const createTaskDto: CreateTaskDto = {
        title: taskData.title!,
        description: taskData.description!,
        wcagCriteria: taskData.wcagCriteria!,
        wcagVersion: taskData.wcagVersion!,
        conformanceLevel: taskData.conformanceLevel!,
        defectSummary: taskData.defectSummary,
        recommendation: taskData.recommendation,
        userImpact: taskData.userImpact,
        comments: taskData.comments,
        disabilityType: taskData.disabilityType,
        screenshot: taskData.screenshot,
        severity: taskData.severity,
        status: taskData.status,
        priority: taskData.priority,
        assignedToId: taskData.assignedTo?.id,
        auditorId: taskData.auditor?.id,
        projectId: parseInt(projectId),
        pageId: taskData.page?.id || 0,
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

  if (!project) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 2 }}>
          Project not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Tasks - {project?.name}
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
          project={project}
          users={users}
          pages={pages}
        />
      </Box>
    </Container>
  );
};

export default Tasks; 