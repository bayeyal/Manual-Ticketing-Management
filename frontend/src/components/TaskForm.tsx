import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  CircularProgress,
} from '@mui/material';
import { TaskSeverity, TaskStatus, TaskPriority } from '../types/task';
import { User } from '../types/user';
import { Task } from '../types/task';
import { Project } from '../types/project';
import { Page } from '../types/page';

interface TaskFormProps {
  task?: Task;
  users: User[];
  project: Project;
  pages: Page[];
  selectedPageId?: number;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  onCancel: () => void;
  open?: boolean;
  onClose?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  users,
  project,
  pages,
  selectedPageId,
  onSubmit,
  onCancel,
  open = true,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset, watch } = useForm<Partial<Task>>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      wcagCriteria: task?.wcagCriteria || '',
      wcagVersion: task?.wcagVersion || '2.1',
      conformanceLevel: task?.conformanceLevel || 'AA',
      defectSummary: task?.defectSummary || '',
      recommendation: task?.recommendation || '',
      userImpact: task?.userImpact || '',
      comments: task?.comments || '',
      disabilityType: task?.disabilityType || '',
      screenshot: task?.screenshot || '',
      severity: task?.severity || TaskSeverity.MODERATE,
      status: task?.status || TaskStatus.NEW,
      priority: task?.priority || TaskPriority.MEDIUM,
      assignedTo: task?.assignedTo,
      auditor: task?.auditor,
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    }
  });

  const handleFormSubmit = async (data: Partial<Task>) => {
    setLoading(true);
    try {
      console.log('TaskForm: Submitting task data:', data);
      await onSubmit(data);
      console.log('TaskForm: Task submission successful');
      reset();
      if (onClose) onClose();
    } catch (error) {
      console.error('TaskForm: Error submitting task:', error);
      // Re-throw the error so the parent component can handle it
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing while loading
    reset();
    if (onClose) onClose();
    onCancel();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {task ? 'Edit Task' : 'Create New Task'}
        {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Title"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                rules={{ required: 'Description is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="wcagCriteria"
                control={control}
                rules={{ required: 'WCAG Criteria is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="WCAG Criteria"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="wcagVersion"
                control={control}
                rules={{ required: 'WCAG Version is required' }}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>WCAG Version</InputLabel>
                    <Select {...field} label="WCAG Version">
                      <MenuItem value="2.0">WCAG 2.0</MenuItem>
                      <MenuItem value="2.1">WCAG 2.1</MenuItem>
                      <MenuItem value="2.2">WCAG 2.2</MenuItem>
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="conformanceLevel"
                control={control}
                rules={{ required: 'Conformance Level is required' }}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>Conformance Level</InputLabel>
                    <Select {...field} label="Conformance Level">
                      <MenuItem value="A">A</MenuItem>
                      <MenuItem value="AA">AA</MenuItem>
                      <MenuItem value="AAA">AAA</MenuItem>
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="severity"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>Severity</InputLabel>
                    <Select {...field} label="Severity">
                      <MenuItem value={TaskSeverity.LOW}>Low</MenuItem>
                      <MenuItem value={TaskSeverity.MODERATE}>Moderate</MenuItem>
                      <MenuItem value={TaskSeverity.HIGH}>High</MenuItem>
                      <MenuItem value={TaskSeverity.CRITICAL}>Critical</MenuItem>
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="priority"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>Priority</InputLabel>
                    <Select {...field} label="Priority">
                      <MenuItem value={TaskPriority.LOW}>Low</MenuItem>
                      <MenuItem value={TaskPriority.MEDIUM}>Medium</MenuItem>
                      <MenuItem value={TaskPriority.HIGH}>High</MenuItem>
                      <MenuItem value={TaskPriority.URGENT}>Urgent</MenuItem>
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      <MenuItem value={TaskStatus.NEW}>New</MenuItem>
                      <MenuItem value={TaskStatus.IN_PROGRESS}>In Progress</MenuItem>
                      <MenuItem value={TaskStatus.REVIEW}>Review</MenuItem>
                      <MenuItem value={TaskStatus.COMPLETED}>Completed</MenuItem>
                      <MenuItem value={TaskStatus.BLOCKED}>Blocked</MenuItem>
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="assignedTo"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>Assigned To</InputLabel>
                    <Select 
                      {...field} 
                      label="Assigned To"
                      value={field.value?.id || ''}
                      onChange={(e) => {
                        const selectedUser = users.find(u => u.id === e.target.value);
                        field.onChange(selectedUser);
                      }}
                    >
                      <MenuItem value="">None</MenuItem>
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="auditor"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth error={!!error}>
                    <InputLabel>Auditor</InputLabel>
                    <Select 
                      {...field} 
                      label="Auditor"
                      value={field.value?.id || ''}
                      onChange={(e) => {
                        const selectedUser = users.find(u => u.id === e.target.value);
                        field.onChange(selectedUser);
                      }}
                    >
                      <MenuItem value="">None</MenuItem>
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="dueDate"
                control={control}
                rules={{ required: 'Due Date is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Due Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="defectSummary"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Defect Summary"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="recommendation"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Recommendation"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="userImpact"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="User Impact"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="comments"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Comments"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="disabilityType"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Disability Type"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="screenshot"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Screenshot URL"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit(handleFormSubmit)} 
          variant="contained"
          disabled={loading}
        >
          {loading ? (task ? 'Saving...' : 'Creating...') : (task ? 'Save Task' : 'Create Task')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm; 