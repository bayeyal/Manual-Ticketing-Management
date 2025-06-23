import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProjects, deleteProject, createProject } from '../store/slices/projectsSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import { CreateProjectDto } from '../types/project';
import { UserRole } from '../types/user';
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
  Link,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
  FormHelperText,
  LinearProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
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

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projects, loading, error } = useAppSelector((state) => state.projects);
  const { users } = useAppSelector((state) => state.users);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [open, setOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<number | null>(null);
  const { control, handleSubmit, reset } = useForm<ProjectFormData>();

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleOpen = () => {
    setOpen(true);
    reset({
      name: '',
      description: '',
      url: '',
      auditType: AuditType.WCAG_2_1,
      auditLevel: AuditLevel.AA,
      startDate: '',
      endDate: '',
      dueDate: '',
      projectAdminId: currentUser?.id || 0,
      assignedUserIds: []
    });
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
        auditorIds: []
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" component="h1">
            Projects
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
                <TableCell>Project Admin</TableCell>
                <TableCell>Assigned Users</TableCell>
                <TableCell>Audit Type</TableCell>
                <TableCell>Audit Level</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Progress</TableCell>
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
                  <TableCell>
                    {users.find(u => u.id === project.projectAdmin?.id)?.firstName} {users.find(u => u.id === project.projectAdmin?.id)?.lastName}
                  </TableCell>
                  <TableCell>
                    {project.assignedUsers?.map(user => (
                      <Chip
                        key={user.id}
                        label={`${user.firstName} ${user.lastName}`}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>{project.auditType}</TableCell>
                  <TableCell>{project.auditLevel}</TableCell>
                  <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(project.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress || 0}
                        sx={{ height: 10, borderRadius: 5, flexGrow: 1 }}
                      />
                      <Typography variant="body2" sx={{ minWidth: 35 }}>
                        {project.progress || 0}%
                      </Typography>
                    </Box>
                  </TableCell>
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
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Assigned Users</InputLabel>
                        <Select
                          {...field}
                          multiple
                          input={<OutlinedInput label="Assigned Users" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const user = assignableUsers.find(u => u.id === value);
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
                          {assignableUsers.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName}
                            </MenuItem>
                          ))}
                        </Select>
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