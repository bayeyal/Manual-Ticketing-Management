import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchProjects } from '../store/slices/projectsSlice';
import { fetchTasks } from '../store/slices/tasksSlice';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects, loading: projectsLoading, error: projectsError } = useAppSelector((state) => state.projects);
  const { tasks, loading: tasksLoading, error: tasksError } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach(project => {
        dispatch(fetchTasks(project.id));
      });
    }
  }, [dispatch, projects]);

  if (projectsLoading || tasksLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (projectsError || tasksError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {projectsError || tasksError}
        </Alert>
      </Container>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
  const blockedTasks = tasks.filter(task => task.status === 'BLOCKED').length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/projects')}>
              <Typography variant="h6" gutterBottom>
                Total Projects
              </Typography>
              <Typography variant="h4">{projects.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Total Tasks
              </Typography>
              <Typography variant="h4">{totalTasks}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Completed Tasks
              </Typography>
              <Typography variant="h4">{completedTasks}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                In Progress Tasks
              </Typography>
              <Typography variant="h4">{inProgressTasks}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Blocked Tasks
              </Typography>
              <Typography variant="h4">{blockedTasks}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 