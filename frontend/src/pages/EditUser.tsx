import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchUserById, updateUser } from '../store/slices/usersSlice';
import { fetchProjects, updateProject } from '../store/slices/projectsSlice';
import { UserRole } from '../types/user';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
  FormHelperText,
  Link,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { RegisterDto } from '../types/user';
import { ArrowBack } from '@mui/icons-material';

type UserFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
  assignedProjectIds: number[];
}

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser: user, loading, error } = useAppSelector((state) => state.users);
  const { projects } = useAppSelector((state) => state.projects);
  const { control, handleSubmit, reset } = useForm<UserFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: UserRole.USER,
      assignedProjectIds: []
    }
  });

  // Derive assigned project IDs from the projects list
  const assignedProjectIds = useMemo(() => {
    if (!user || !projects) return [];
    return projects
      .filter(project => 
        project.projectAdmin?.id === user.id || 
        project.assignedUsers?.some(u => u.id === user.id)
      )
      .map(project => project.id);
  }, [user, projects]);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(parseInt(id)));
      dispatch(fetchProjects());
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        role: user.role,
        assignedProjectIds: assignedProjectIds
      });
    }
  }, [user, reset, assignedProjectIds]);

  const onSubmit = async (data: UserFormData) => {
    if (id) {
      // First update the user's basic information
      const updateData: Partial<RegisterDto> = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role
      };
      
      // Only include password if it was changed
      if (data.password) {
        updateData.password = data.password;
      }
      
      await dispatch(updateUser({ id: parseInt(id), user: updateData }));

      // Then update project assignments
      const currentAssignedProjectIds = assignedProjectIds;
      const newAssignedProjectIds = data.assignedProjectIds || [];

      // Find projects to add the user to
      const projectsToAdd = newAssignedProjectIds.filter(
        projectId => !currentAssignedProjectIds.includes(projectId)
      );

      // Find projects to remove the user from
      const projectsToRemove = currentAssignedProjectIds.filter(
        projectId => !newAssignedProjectIds.includes(projectId)
      );

      // Update each project's assigned users
      for (const projectId of projectsToAdd) {
        const project = projects.find(p => p.id === projectId);
        if (project && user) {
          const updatedAssignedUsers = [
            ...(project.assignedUsers || []),
            user
          ];
          await dispatch(updateProject({
            id: projectId,
            project: { 
              assignedUserIds: updatedAssignedUsers.map(u => u.id)
            }
          }));
        }
      }

      for (const projectId of projectsToRemove) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
          const updatedAssignedUsers = (project.assignedUsers || [])
            .filter(u => u.id !== parseInt(id));
          await dispatch(updateProject({
            id: projectId,
            project: { 
              assignedUserIds: updatedAssignedUsers.map(u => u.id)
            }
          }));
        }
      }

      navigate(`/users/${id}`);
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

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 2 }}>
          User not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/users')}
            sx={{ mr: 2 }}
          >
            Back to Users
          </Button>
          <Typography variant="h4" component="h1">
            Edit User
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
        </Box>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: 'First name is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="First Name"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: 'Last name is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Last Name"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={control}
                  rules={{ 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Email"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Password"
                      type="password"
                      fullWidth
                      error={!!error}
                      helperText={error?.message || "Leave blank to keep current password"}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: 'Role is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        {...field}
                        label="Role"
                      >
                        <MenuItem value={UserRole.SUPER_ADMIN}>Super Admin</MenuItem>
                        <MenuItem value={UserRole.ACCOUNT_ADMIN}>Account Admin</MenuItem>
                        <MenuItem value={UserRole.PROJECT_ADMIN}>Project Admin</MenuItem>
                        <MenuItem value={UserRole.USER}>User</MenuItem>
                      </Select>
                      {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="assignedProjectIds"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Assigned Projects</InputLabel>
                      <Select
                        {...field}
                        multiple
                        value={field.value || []}
                        input={<OutlinedInput label="Assigned Projects" />}
                        renderValue={(selected: number[]) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value: number) => {
                              const project = projects.find(p => p.id === value);
                              return (
                                <Chip
                                  key={value}
                                  label={project?.name || ''}
                                  size="small"
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {projects.map((project) => (
                          <MenuItem key={project.id} value={project.id}>
                            {project.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        Select projects to assign to this user
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/users/${id}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default EditUser; 