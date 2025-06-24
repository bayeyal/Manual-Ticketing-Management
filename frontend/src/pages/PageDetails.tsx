import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPageById } from '../store/slices/pagesSlice';
import { fetchTasksByPage, createTask, updateTask, deleteTask, sendTaskMessage } from '../store/slices/tasksSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import { fetchProjectById } from '../store/slices/projectsSlice';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Chip,
  Dialog,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import TaskAccordion from '../components/TaskAccordion/index';
import TaskForm from '../components/TaskForm';
import { Task, TaskStatus } from '../types/task';
import { Page } from '../types/page';

const PageDetails: React.FC = () => {
  const { projectId, pageId } = useParams<{ projectId: string; pageId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentPage: page, loading: pageLoading, error: pageError } = useAppSelector((state) => state.pages);
  const { tasks, loading: tasksLoading, error: tasksError } = useAppSelector((state) => state.tasks);
  const { users, loading: usersLoading, error: usersError } = useAppSelector((state) => state.users);
  const { currentProject: project } = useAppSelector((state) => state.projects);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  useEffect(() => {
    if (pageId && projectId) {
      dispatch(fetchPageById(parseInt(pageId)));
      dispatch(fetchTasksByPage(parseInt(pageId)));
      dispatch(fetchUsers());
      dispatch(fetchProjectById(parseInt(projectId)));
    }
  }, [dispatch, pageId, projectId]);

  const handleAddTask = () => {
    setSelectedTask(undefined);
    setIsTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await dispatch(deleteTask(taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskSubmit = async (data: Partial<Task>) => {
    try {
      // Clean the task data before sending to backend
      const cleanTaskData = {
        ...data,
        // Convert full objects to IDs
        assignedToId: data.assignedTo?.id,
        auditorId: data.auditor?.id,
      };

      if (selectedTask) {
        await dispatch(updateTask({ id: selectedTask.id, task: cleanTaskData }));
      } else {
        if (!page?.id || !project?.id) {
          console.error('Page ID or Project ID is missing');
          return;
        }
        const taskData = {
          ...cleanTaskData,
          projectId: project.id,
        };
        await dispatch(createTask(taskData));
      }
      setIsTaskDialogOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleSendMessage = async (taskId: number, content: string, mentionedUserId?: number) => {
    try {
      await dispatch(sendTaskMessage({ taskId, content, mentionedUserId }));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUpdateStatus = async (taskId: number, status: TaskStatus) => {
    try {
      // Find the current task to get its data
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) {
        console.error('Task not found:', taskId);
        return;
      }

      // Clean the task data before sending to backend
      const cleanTaskData = {
        status,
        // Only include IDs for assignedTo and auditor, not the full objects
        assignedToId: currentTask.assignedTo?.id,
        auditorId: currentTask.auditor?.id,
      };

      console.log('Updating task status:', taskId, 'with data:', cleanTaskData);
      await dispatch(updateTask({ id: taskId, task: cleanTaskData }));
      console.log('Task status updated successfully');
    } catch (error) {
      console.error('Error updating task status:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      // You could add a toast notification here to show the error to the user
      alert(`Failed to update task status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (pageLoading || tasksLoading || usersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (pageError || tasksError || usersError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {pageError || tasksError || usersError}
        </Alert>
      </Container>
    );
  }

  if (!page || !project) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 2 }}>
          Page not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/projects/${projectId}/pages`)}
            sx={{ mr: 2 }}
          >
            Back to Pages
          </Button>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            Page Details - {project.name}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="div">Page URL</Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" component="div" paragraph>
                <a href={page.url} target="_blank" rel="noopener noreferrer">
                  {page.url}
                </a>
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">Created</Typography>
                  <Typography variant="body1" component="div">
                    {new Date(page.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">Tasks Count</Typography>
                  <Typography variant="body1" component="div">
                    {tasks.length}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Tasks</Typography>
              <Button variant="contained" color="primary" onClick={handleAddTask}>
                Add Task
              </Button>
            </Box>
            <TaskAccordion
              tasks={tasks}
              users={users}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onSendMessage={handleSendMessage}
              onUpdateStatus={handleUpdateStatus}
            />
          </Grid>
        </Grid>
      </Box>

      <Dialog
        open={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" mb={3}>
            {selectedTask ? 'Edit Task' : 'Create Task'}
          </Typography>
          <TaskForm
            task={selectedTask}
            users={users}
            project={project}
            pages={page ? [page] : []}
            onSubmit={handleTaskSubmit}
            onCancel={() => setIsTaskDialogOpen(false)}
          />
        </Box>
      </Dialog>
    </Container>
  );
};

export default PageDetails; 