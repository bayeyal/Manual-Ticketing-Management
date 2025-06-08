import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchUserById } from '../store/slices/usersSlice';
import { fetchProjects } from '../store/slices/projectsSlice';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Link,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser: user, loading, error } = useAppSelector((state) => state.users);
  const { projects } = useAppSelector((state) => state.projects);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(parseInt(id)));
      dispatch(fetchProjects());
    }
  }, [dispatch, id]);

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
        <Alert severity="info" sx={{ mt: 2 }}>
          User not found
        </Alert>
      </Container>
    );
  }

  const assignedProjects = projects.filter(project => 
    project.projectAdmin?.id === user.id || 
    project.assignedUsers?.some(u => u.id === user.id)
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/users')}
            sx={{ mr: 2 }}
          >
            Back to Users
          </Button>
          <Typography variant="h4" component="h1">
            User Details
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/')}
            sx={{ textDecoration: 'none' }}
          >
            Dashboard
          </Link>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/users/${user.id}/edit`)}
          >
            Edit User
          </Button>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Name</Typography>
              <Typography>{`${user.firstName} ${user.lastName}`}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Email</Typography>
              <Typography>{user.email}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Role</Typography>
              <Typography>{user.role}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Assigned Projects</Typography>
              <Box sx={{ mt: 1 }}>
                {assignedProjects.length > 0 ? (
                  assignedProjects.map((project) => (
                    <Chip
                      key={project.id}
                      label={project.name}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))
                ) : (
                  <Typography color="text.secondary">No projects assigned</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserDetails; 