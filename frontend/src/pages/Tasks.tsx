import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
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
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { fetchTasks, createTask, updateTask, deleteTask, sendTaskMessage } from '../store/slices/tasksSlice';
import { fetchProjects } from '../store/slices/projectsSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import TaskAccordion from '../components/TaskAccordion';
import TaskForm from '../components/TaskForm';

const Tasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects } = useAppSelector((state) => state.projects);
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);
  const { users } = useAppSelector((state) => state.users);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProjectId) {
      dispatch(fetchTasks(selectedProjectId));
    }
  }, [dispatch, selectedProjectId]);

  const handleProjectChange = (projectId: number) => {
    setSelectedProjectId(projectId);
  };

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
      if (selectedTask) {
        await dispatch(updateTask({ id: selectedTask.id, task: data }));
      } else if (selectedProjectId) {
        await dispatch(createTask({ ...data, projectId: selectedProjectId }));
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tasks
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Project Tasks</Typography>
                <Box>
                  {projects.map((project) => (
                    <Chip
                      key={project.id}
                      label={project.name}
                      onClick={() => handleProjectChange(project.id)}
                      color={selectedProjectId === project.id ? 'primary' : 'default'}
                      sx={{ mr: 1 }}
                    />
                  ))}
                </Box>
                <Button variant="contained" color="primary" onClick={handleAddTask}>
                  Add Task
                </Button>
              </Box>
              {selectedProjectId ? (
                <TaskAccordion
                  tasks={tasks}
                  users={users}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onSendMessage={handleSendMessage}
                />
              ) : (
                <Typography variant="body1">Select a project to view its tasks</Typography>
              )}
            </Paper>
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
            onSubmit={handleTaskSubmit}
            onCancel={() => setIsTaskDialogOpen(false)}
          />
        </Box>
      </Dialog>
    </Container>
  );
};

export default Tasks; 