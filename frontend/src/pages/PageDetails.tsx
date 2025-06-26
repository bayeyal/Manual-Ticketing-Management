import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPageById, updatePage } from '../store/slices/pagesSlice';
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
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
import TaskAccordion from '../components/TaskAccordion/index';
import TaskForm from '../components/TaskForm';
import { Task, TaskStatus } from '../types/task';
import { Page, UpdatePageDto } from '../types/page';
import { useForm, Controller } from 'react-hook-form';

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { control: editControl, handleSubmit: handleEditSubmit, reset: resetEditForm } = useForm<UpdatePageDto>({
    defaultValues: {
      title: '',
      url: '',
      description: '',
    }
  });

  useEffect(() => {
    if (pageId && projectId) {
      console.log('PageDetails: Fetching data for pageId:', pageId, 'projectId:', projectId);
      dispatch(fetchPageById(parseInt(pageId)));
      dispatch(fetchTasksByPage(parseInt(pageId)));
      dispatch(fetchUsers());
      dispatch(fetchProjectById(parseInt(projectId)));
    }
  }, [dispatch, pageId, projectId]);

  const handleEditPage = () => {
    if (page) {
      resetEditForm({
        title: page.title,
        url: page.url,
        description: page.description || '',
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleEditPageSubmit = async (data: UpdatePageDto) => {
    if (page) {
      await dispatch(updatePage({ id: page.id, pageData: data }));
      setIsEditDialogOpen(false);
    }
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
      // Clean the task data before sending to backend
      const { assignedTo, auditor, ...cleanTaskData } = data;
      
      // Add the IDs separately
      const finalTaskData = {
        ...cleanTaskData,
        assignedToId: assignedTo?.id,
        auditorId: auditor?.id,
      };

      if (selectedTask) {
        await dispatch(updateTask({ id: selectedTask.id, task: finalTaskData }));
      } else {
        if (!page?.id || !project?.id) {
          console.error('Page ID or Project ID is missing');
          return;
        }
        const taskData = {
          ...finalTaskData,
          projectId: project.id,
          pageId: page.id,
        };
        console.log('PageDetails: Creating task with data:', JSON.stringify(taskData, null, 2));
        console.log('PageDetails: pageId being sent:', page.id);
        console.log('PageDetails: projectId being sent:', project.id);
        await dispatch(createTask(taskData));
        // Refetch tasks for this page to ensure UI is updated
        if (pageId) {
          await dispatch(fetchTasksByPage(parseInt(pageId)));
        }
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

  console.log('PageDetails: Current tasks:', tasks);
  console.log('PageDetails: Tasks loading:', tasksLoading);
  console.log('PageDetails: Tasks error:', tasksError);

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
                <Typography variant="h5" component="div">{page.title}</Typography>
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  onClick={handleEditPage}
                >
                  Edit Page
                </Button>
              </Box>
              <Typography variant="body1" color="text.secondary" component="div" paragraph>
                <a href={page.url} target="_blank" rel="noopener noreferrer">
                  {page.url}
                </a>
              </Typography>
              {page.description && (
                <Typography variant="body1" component="div" paragraph>
                  {page.description}
                </Typography>
              )}
              
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
            selectedPageId={page?.id}
            onSubmit={handleTaskSubmit}
            onCancel={() => setIsTaskDialogOpen(false)}
          />
        </Box>
      </Dialog>

      {/* Edit Page Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Page</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditSubmit(handleEditPageSubmit)} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={editControl}
                  rules={{ required: 'Title is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Page Title"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="url"
                  control={editControl}
                  rules={{ 
                    required: 'URL is required',
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Please enter a valid URL starting with http:// or https://'
                    }
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Page URL"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={editControl}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit(handleEditPageSubmit)} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PageDetails; 