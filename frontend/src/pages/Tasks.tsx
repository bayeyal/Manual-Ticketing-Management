import React, { useEffect, useState, useMemo } from 'react';
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
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  FormControl,
  OutlinedInput,
  FormHelperText,
  MenuItem,
  Select,
} from '@mui/material';
import { Task, TaskStatus, TaskPriority } from '../types/task';
import { fetchTasks, createTask, updateTask, deleteTask, sendTaskMessage } from '../store/slices/tasksSlice';
import { fetchProjects } from '../store/slices/projectsSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import TaskAccordion from '../components/TaskAccordion';
import TaskForm from '../components/TaskForm';
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

type TaskFormData = {
  projectId: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  auditorIds: number[];
};

const Tasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects } = useAppSelector((state) => state.projects);
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);
  const { users } = useAppSelector((state) => state.users);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const { control, handleSubmit, reset, watch } = useForm<TaskFormData>();

  const formProjectId = watch('projectId');

  // Get assigned users for the selected project
  const assignedUsers = useMemo(() => {
    if (!formProjectId) return [];
    const project = projects.find(p => p.id === formProjectId);
    return project?.assignedUsers || [];
  }, [formProjectId, projects]);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    if (formProjectId) {
      dispatch(fetchTasks(formProjectId));
    }
  }, [dispatch, formProjectId]);

  const handleProjectChange = (projectId: number) => {
    reset({ ...watch(), projectId });
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
      } else if (formProjectId) {
        await dispatch(createTask({ ...data, projectId: formProjectId }));
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

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (selectedTask) {
        await dispatch(updateTask({ id: selectedTask.id, task: data }));
      } else {
        await dispatch(createTask(data));
      }
      setOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
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
                      color={formProjectId === project.id ? 'primary' : 'default'}
                      sx={{ mr: 1 }}
                    />
                  ))}
                </Box>
                <Button variant="contained" color="primary" onClick={handleAddTask}>
                  Add Task
                </Button>
              </Box>
              {formProjectId ? (
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

      {/* Create Task Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="auditorIds"
                  control={control}
                  render={({ field }: { field: ControllerRenderProps<TaskFormData, 'auditorIds'> }) => (
                    <FormControl fullWidth>
                      <InputLabel>Auditors</InputLabel>
                      <Select
                        {...field}
                        multiple
                        input={<OutlinedInput label="Auditors" />}
                        renderValue={(selected: number[]) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value: number) => {
                              const user = assignedUsers.find(u => u.id === value);
                              return (
                                <Chip
                                  key={value}
                                  label={`${user?.firstName} ${user?.lastName}`}
                                  size="small"
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {assignedUsers.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        Only users assigned to the project can be selected as auditors
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained">
            Create Task
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Tasks; 