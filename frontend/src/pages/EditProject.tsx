import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProjectById, updateProject } from '../store/slices/projectsSlice';
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
} from '@mui/material';
import { useForm, Controller, FieldValues, ControllerRenderProps, FieldErrors, ControllerFieldState } from 'react-hook-form';
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
}

type FieldProps<T extends keyof ProjectFormData> = {
  field: ControllerRenderProps<ProjectFormData, T>;
  fieldState: ControllerFieldState;
}

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProject: project, loading, error } = useAppSelector((state) => state.projects);
  const { control, handleSubmit, reset } = useForm<ProjectFormData>();

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(parseInt(id)));
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
      });
    }
  }, [project, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    if (id) {
      await dispatch(updateProject({ id: parseInt(id), project: data }));
      navigate(`/projects/${id}`);
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
                  render={({ field, fieldState: { error } }: FieldProps<"name">) => (
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
                  render={({ field }: FieldProps<"description">) => (
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
                  render={({ field, fieldState: { error } }: FieldProps<"url">) => (
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

              <Grid item xs={12} md={6}>
                <Controller
                  name="auditType"
                  control={control}
                  rules={{ required: 'Audit type is required' }}
                  render={({ field, fieldState: { error } }: FieldProps<"auditType">) => (
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
                  render={({ field, fieldState: { error } }: FieldProps<"auditLevel">) => (
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
                  render={({ field, fieldState: { error } }: FieldProps<"startDate">) => (
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
                  render={({ field, fieldState: { error } }: FieldProps<"endDate">) => (
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
                  render={({ field, fieldState: { error } }: FieldProps<"dueDate">) => (
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