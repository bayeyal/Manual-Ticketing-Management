import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProjects, deleteProject, createProject } from '../store/slices/projectsSlice';
import { CreateProjectDto } from '../types/project';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
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

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projects, loading, error } = useAppSelector((state) => state.projects);
  const { user } = useAppSelector((state) => state.auth);
  const [open, setOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<number | null>(null);
  const { control, handleSubmit, reset } = useForm<ProjectFormData>();

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const handleDeleteClick = (projectId: number) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      await dispatch(deleteProject(projectToDelete));
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const projectData: CreateProjectDto = {
        ...data,
        projectAdminId: user?.id || 0,
        auditorIds: [],
        assignedUserIds: []
      };
      await dispatch(createProject(projectData));
      handleClose();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleProjectClick = (projectId: number) => {
    navigate(`/projects/${projectId}`);
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Projects
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpen}
          >
            New Project
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Audit Type</TableCell>
                <TableCell>Audit Level</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow
                  key={project.id}
                  hover
                  onClick={() => handleProjectClick(project.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{project.name}</TableCell>
                  <TableCell>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {project.url}
                    </a>
                  </TableCell>
                  <TableCell>{project.auditType}</TableCell>
                  <TableCell>{project.auditLevel}</TableCell>
                  <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(project.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}/edit`);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(project.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Create Project Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
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
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">
                      Create Project
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Projects; 