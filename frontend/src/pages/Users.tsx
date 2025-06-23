import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { useNavigate } from 'react-router-dom';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  Link,
  Grid,
  OutlinedInput,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { User, UserRole, RegisterDto } from '../types/user';
import { fetchUsers, createUser, updateUser, deleteUser } from '../store/slices/usersSlice';
import { fetchProjects } from '../store/slices/projectsSlice';

type UserFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
  assignedProjectIds: number[];
};

const Users: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.users);
  const { projects } = useAppSelector((state) => state.projects);
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const { control, handleSubmit, reset } = useForm<UserFormData>();

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchProjects());
  }, [dispatch]);

  // Filter users based on current user's role and project assignments
  const filteredUsers = React.useMemo(() => {
    if (!currentUser || !users) return [];

    // Super admin sees all users
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return users;
    }

    // Project admin sees users assigned to their projects
    if (currentUser.role === UserRole.PROJECT_ADMIN) {
      const adminProjects = projects.filter(project => project.projectAdmin?.id === currentUser.id);
      const projectUserIds = new Set(
        adminProjects.flatMap(project => 
          project.assignedUsers?.map(user => user.id) || []
        )
      );
      return users.filter(user => projectUserIds.has(user.id));
    }

    // Regular users only see themselves
    return users.filter(user => user.id === currentUser.id);
  }, [users, projects, currentUser]);

  const handleOpen = () => {
    reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: UserRole.USER,
      assignedProjectIds: [],
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const handleEdit = (user: User) => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      await dispatch(deleteUser(userToDelete));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (!data.password) {
        console.error('Password is required for new users');
        return;
      }
      const createData: RegisterDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        assignedProjectIds: data.assignedProjectIds,
      };
      await dispatch(createUser(createData));
      handleClose();
    } catch (error) {
      console.error('Error saving user:', error);
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
            Users
          </Typography>
        </Box>

        {currentUser?.role === UserRole.SUPER_ADMIN && (
          <Box display="flex" justifyContent="flex-end" mb={3}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpen}
            >
              Add User
            </Button>
          </Box>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Projects</TableCell>
                {currentUser?.role === UserRole.SUPER_ADMIN && (
                  <TableCell>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {projects
                      .filter(project => 
                        project.projectAdmin?.id === user.id || 
                        project.assignedUsers?.some(u => u.id === user.id)
                      )
                      .map(project => (
                        <Chip
                          key={project.id}
                          label={project.name}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                  </TableCell>
                  {currentUser?.role === UserRole.SUPER_ADMIN && (
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(user.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Create User Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>Create User</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
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
                    rules={{ required: 'Password is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Password"
                        type="password"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
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
                          Select projects to assign to this user (optional)
                        </FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this user? This action cannot be undone.
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

export default Users; 