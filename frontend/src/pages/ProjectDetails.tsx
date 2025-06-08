import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProjectById } from '../store/slices/projectsSlice';
import { fetchTasks, createTask, updateTask, deleteTask, sendTaskMessage } from '../store/slices/tasksSlice';
import { fetchUsers } from '../store/slices/usersSlice';
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
import { ProjectStatus, AuditType, AuditLevel } from '../types/project';
import TaskAccordion from '../components/TaskAccordion';
import TaskForm from '../components/TaskForm';
import { Task } from '../types/task';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProject: project, loading: projectLoading, error: projectError } = useAppSelector((state) => state.projects);
  const { tasks, loading: tasksLoading, error: tasksError } = useAppSelector((state) => state.tasks);
  const { users, loading: usersLoading, error: usersError } = useAppSelector((state) => state.users);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(parseInt(id)));
      dispatch(fetchTasks(parseInt(id)));
      dispatch(fetchUsers());
    }
  }, [dispatch, id]);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.NEW:
        return 'default';
      case ProjectStatus.IN_PROGRESS:
        return 'primary';
      case ProjectStatus.COMPLETED:
        return 'success';
      case ProjectStatus.ON_HOLD:
        return 'warning';
      default:
        return 'default';
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
      if (selectedTask) {
        await dispatch(updateTask({ id: selectedTask.id, task: data }));
      } else {
        if (!project?.id) {
          console.error('Project ID is missing');
          return;
        }
        console.log('Creating task with project ID:', project.id);
        const taskData = {
          ...data,
          projectId: project.id
        };
        console.log('Task data with project ID:', taskData);
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

  if (projectLoading || tasksLoading || usersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (projectError || tasksError || usersError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {projectError || tasksError || usersError}
        </Alert>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 2 }}>
          Project not found
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
            onClick={() => navigate('/projects')}
            sx={{ mr: 2 }}
          >
            Back to Projects
          </Button>
          <Typography variant="h4" component="h1">
            Project Details
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="div">{project.name}</Typography>
                <Chip
                  label={project.status}
                  color={getStatusColor(project.status as ProjectStatus)}
                  size="small"
                />
              </Box>
              <Typography variant="body1" color="text.secondary" component="div" paragraph>
                {project.description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">Project URL</Typography>
                  <Typography variant="body1" component="div">
                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                      {project.url}
                    </a>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">Audit Type</Typography>
                  <Typography variant="body1" component="div">{project.auditType}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">Audit Level</Typography>
                  <Typography variant="body1" component="div">{project.auditLevel}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">Project Admin</Typography>
                  <Typography variant="body1" component="div">
                    {project.projectAdmin ? `${project.projectAdmin.firstName} ${project.projectAdmin.lastName}` : 'Not assigned'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">Start Date</Typography>
                  <Typography variant="body1" component="div">
                    {new Date(project.startDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">End Date</Typography>
                  <Typography variant="body1" component="div">
                    {new Date(project.endDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">Due Date</Typography>
                  <Typography variant="body1" component="div">
                    {new Date(project.dueDate).toLocaleDateString()}
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
            onSubmit={handleTaskSubmit}
            onCancel={() => setIsTaskDialogOpen(false)}
          />
        </Box>
      </Dialog>
    </Container>
  );
};

export default ProjectDetails; 