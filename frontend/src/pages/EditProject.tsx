import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProjectById, updateProject } from '../store/slices/projectsSlice';
import { fetchUsers } from '../store/slices/usersSlice';
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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { AuditType, AuditLevel } from '../types/project';

type ProjectFormData = {
  name: string;
  description: string;
  url: string;
  auditType: AuditType;
  auditLevel: AuditLevel;
  startDate: string;
  endDate: string;
  dueDate: string;
  projectAdminId: number;
  assignedUserIds: number[];
}

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProject: project, loading, error } = useAppSelector((state) => state.projects);
  const { users } = useAppSelector((state) => state.users);
  const { control, handleSubmit, reset } = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      url: '',
      auditType: AuditType.WCAG_2_1,
      auditLevel: AuditLevel.AA,
      startDate: '',
      endDate: '',
      dueDate: '',
      projectAdminId: 0,
      assignedUserIds: []
    }
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(parseInt(id)));
      dispatch(fetchUsers());
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || '',
        url: project.url,
        auditType: project.auditType,
        auditLevel: project.auditLevel,
        startDate: new Date(project.startDate).toISOString().split('T')[0],
        endDate: new Date(project.endDate).toISOString().split('T')[0],
        dueDate: new Date(project.dueDate).toISOString().split('T')[0],
        projectAdminId: project.projectAdmin?.id || 0,
        assignedUserIds: project.assignedUsers ? project.assignedUsers.map(user => user.id) : []
      });
    }
  }, [project, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    if (id) {
      const projectData = {
        ...data,
        assignedUserIds: Array.isArray(data.assignedUserIds) ? data.assignedUserIds : []
      };
      await dispatch(updateProject({ id: parseInt(id), project: projectData }));
      navigate(`/projects/${id}`);
    }
  };

  // Filter users who can be project admins (Super Admin or Project Admin role)
  const eligibleProjectAdmins = users.filter(user => 
    user.role === UserRole.SUPER_ADMIN || user.role === UserRole.PROJECT_ADMIN
  );

  // Filter users who can be assigned to projects (User role)
  const assignableUsers = users.filter(user => user.role === UserRole.USER);

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
        <Alert severity="info" sx={{ mt: 2 }}>
          Project not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Project
        </Typography>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Name is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Project Name"
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
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={4}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="url"
                  control={control}
                  rules={{ required: 'URL is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Project URL"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="projectAdminId"
                  control={control}
                  rules={{ required: 'Project admin is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>Project Admin</InputLabel>
                      <Select
                        {...field}
                        label="Project Admin"
                      >
                        {eligibleProjectAdmins.map((admin) => (
                          <MenuItem key={admin.id} value={admin.id}>
                            {admin.firstName} {admin.lastName} ({admin.role})
                          </MenuItem>
                        ))}
                      </Select>
                      {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="assignedUserIds"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Assigned Users</InputLabel>
                      <Select
                        {...field}
                        multiple
                        value={field.value || []}
                        input={<OutlinedInput label="Assigned Users" />}
                        renderValue={(selected: number[]) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value: number) => {
                              const user = users.find(u => u.id === value);
                              return (
                                <Chip
                                  key={value}
                                  label={user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
                                  size="small"
                                  onDelete={() => {
                                    const newValue = field.value.filter((id: number) => id !== value);
                                    field.onChange(newValue);
                                  }}
                                />
                              );
                            })}
                          </Box>
                        )}
                      >
                        {users.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        Select users to assign to this project. Click the X on a chip to remove a user.
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="auditType"
                  control={control}
                  rules={{ required: 'Audit type is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      select
                      label="Audit Type"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    >
                      <MenuItem value={AuditType.WCAG_2_0}>WCAG 2.0</MenuItem>
                      <MenuItem value={AuditType.WCAG_2_1}>WCAG 2.1</MenuItem>
                      <MenuItem value={AuditType.WCAG_2_2}>WCAG 2.2</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="auditLevel"
                  control={control}
                  rules={{ required: 'Audit level is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      select
                      label="Audit Level"
                      fullWidth
                      error={!!error}
                      helperText={error?.message}
                    >
                      <MenuItem value={AuditLevel.A}>Level A</MenuItem>
                      <MenuItem value={AuditLevel.AA}>Level AA</MenuItem>
                      <MenuItem value={AuditLevel.AAA}>Level AAA</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: 'Start date is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Start Date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="endDate"
                  control={control}
                  rules={{ required: 'End date is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="End Date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Controller
                  name="dueDate"
                  control={control}
                  rules={{ required: 'Due date is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Due Date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/projects/${id}`)}
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

export default EditProject; 