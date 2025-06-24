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
  LinearProgress,
  Card,
  CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchProjects } from '../store/slices/projectsSlice';
import { fetchAllTasks } from '../store/slices/tasksSlice';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects, loading: projectsLoading, error: projectsError } = useAppSelector((state) => state.projects);
  const { tasks, loading: tasksLoading, error: tasksError } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchAllTasks());
  }, [dispatch]);

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
  const newTasks = tasks.filter(task => task.status === 'NEW').length;
  const blockedTasks = tasks.filter(task => task.status === 'BLOCKED').length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        <Box display="flex" gap={2} mb={3}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/projects')}
            sx={{ textDecoration: 'none' }}
          >
            Projects
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/users')}
            sx={{ textDecoration: 'none' }}
          >
            Users
          </Link>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper 
              sx={{ p: 3, textAlign: 'center', cursor: 'pointer' }} 
              onClick={() => navigate('/projects')}
            >
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
                New Tasks
              </Typography>
              <Typography variant="h4">{newTasks}</Typography>
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

        {/* Project Progress Overview */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Project Progress
          </Typography>
          <Grid container spacing={2}>
            {projects.map((project) => (
              <Grid item xs={12} md={6} lg={4} key={project.id}>
                <Card 
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      {project.name}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {project.progress || 0}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.progress || 0} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Due: {new Date(project.dueDate).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard; 