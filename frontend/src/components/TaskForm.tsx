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
  IconButton,
  Typography,
} from '@mui/material';
import { CameraAlt as CameraIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { TaskSeverity, TaskStatus, TaskPriority } from '../types/task';
import { User } from '../types/user';
import { Task } from '../types/task';
import { Project } from '../types/project';
import { Page } from '../types/page';
import { ScreenshotCapture } from './ScreenshotCapture';
import { uploadService } from '../services/uploadService';
import { getWCAGCriteriaOptions, getWCAGCriteriaById } from '../data/wcagCriteria';

// Custom styles for WCAG compliant disabled fields
const disabledFieldStyles = {
  '& .MuiInputBase-root.Mui-disabled': {
    backgroundColor: '#f5f5f5',
    '& .MuiInputBase-input': {
      color: '#2c2c2c', // Dark gray for better contrast
      WebkitTextFillColor: '#2c2c2c', // For webkit browsers
    },
    '& .MuiInputLabel-root.Mui-disabled': {
      color: '#2c2c2c',
    },
    '& .MuiFormHelperText-root': {
      color: '#2c2c2c',
    },
  },
  '& .MuiSelect-select.Mui-disabled': {
    color: '#2c2c2c !important',
    WebkitTextFillColor: '#2c2c2c !important',
  },
  '& .MuiInputLabel-root.Mui-disabled': {
    color: '#2c2c2c !important',
  },
  '& .MuiFormHelperText-root.Mui-disabled': {
    color: '#2c2c2c !important',
  },
};

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
  const [screenshotDialogOpen, setScreenshotDialogOpen] = useState(false);
  const [screenshotLoading, setScreenshotLoading] = useState(false);

  // Get WCAG criteria options based on project's audit settings
  const wcagCriteriaOptions = getWCAGCriteriaOptions(project.auditType, project.auditLevel);

  const { control, handleSubmit, reset, watch, setValue } = useForm<Partial<Task>>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      wcagCriteria: task?.wcagCriteria || '',
      defectSummary: task?.defectSummary || '',
      recommendation: task?.recommendation || '',
      userImpact: task?.userImpact || '',
      comments: task?.comments || '',
      disabilityType: task?.disabilityType || '',
      screenshot: task?.screenshot || '',
      screenshotTitle: task?.screenshotTitle || '',
      severity: task?.severity || TaskSeverity.MODERATE,
      status: task?.status || TaskStatus.NEW,
      priority: task?.priority || TaskPriority.MEDIUM,
      assignedTo: task?.assignedTo,
      auditor: task?.auditor,
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    }
  });

  const watchedScreenshot = watch('screenshot');
  const watchedScreenshotTitle = watch('screenshotTitle');
  const watchedWcagCriteria = watch('wcagCriteria');

  // Auto-populate fields when WCAG criteria is selected
  useEffect(() => {
    if (watchedWcagCriteria) {
      const selectedCriteria = getWCAGCriteriaById(watchedWcagCriteria);
      if (selectedCriteria) {
        // Auto-populate fields with criteria data
        setValue('defectSummary', selectedCriteria.defectSummary);
        setValue('recommendation', selectedCriteria.recommendation);
        setValue('userImpact', selectedCriteria.userImpact);
        setValue('disabilityType', selectedCriteria.disabilityType.join(', '));
        
        // Map WCAG severity to TaskSeverity
        const severityMap: Record<string, TaskSeverity> = {
          'Critical': TaskSeverity.CRITICAL,
          'High': TaskSeverity.HIGH,
          'Medium': TaskSeverity.MODERATE,
          'Low': TaskSeverity.LOW
        };
        setValue('severity', severityMap[selectedCriteria.severity] || TaskSeverity.MODERATE);
      }
    }
  }, [watchedWcagCriteria, setValue]);

  const handleScreenshotSave = async (screenshotData: string, title: string) => {
    setScreenshotLoading(true);
    try {
      const uploadResponse = await uploadService.uploadScreenshot(screenshotData);
      setValue('screenshot', uploadResponse.url);
      setValue('screenshotTitle', title);
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      throw error;
    } finally {
      setScreenshotLoading(false);
    }
  };

  const handleRemoveScreenshot = () => {
    setValue('screenshot', '');
    setValue('screenshotTitle', '');
  };

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

  // Get the selected page URL for screenshot capture
  const selectedPage = pages.find(p => p.id === selectedPageId);
  const pageUrl = selectedPage?.url || '';

  return (
    <>
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

              <Grid item xs={12}>
                <Controller
                  name="wcagCriteria"
                  control={control}
                  rules={{ required: 'WCAG Criteria is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error}>
                      <InputLabel>WCAG Criteria</InputLabel>
                      <Select {...field} label="WCAG Criteria">
                        {wcagCriteriaOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {error && <FormHelperText>{error.message}</FormHelperText>}
                      <FormHelperText>
                        Based on project settings: {project.auditType} {project.auditLevel}
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="severity"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth error={!!error} sx={disabledFieldStyles}>
                      <InputLabel>Severity</InputLabel>
                      <Select {...field} label="Severity" disabled>
                        <MenuItem value={TaskSeverity.LOW}>Low</MenuItem>
                        <MenuItem value={TaskSeverity.MODERATE}>Moderate</MenuItem>
                        <MenuItem value={TaskSeverity.HIGH}>High</MenuItem>
                        <MenuItem value={TaskSeverity.CRITICAL}>Critical</MenuItem>
                      </Select>
                      {error && <FormHelperText>{error.message}</FormHelperText>}
                      <FormHelperText>Auto-populated based on WCAG criteria</FormHelperText>
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
                      helperText={error?.message || "Auto-populated based on WCAG criteria"}
                      disabled
                      sx={disabledFieldStyles}
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
                      helperText={error?.message || "Auto-populated based on WCAG criteria"}
                      disabled
                      sx={disabledFieldStyles}
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
                      helperText={error?.message || "Auto-populated based on WCAG criteria"}
                      disabled
                      sx={disabledFieldStyles}
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
                      helperText={error?.message || "Auto-populated based on WCAG criteria"}
                      disabled
                      sx={disabledFieldStyles}
                    />
                  )}
                />
              </Grid>

              {/* Screenshot Section */}
              <Grid item xs={12}>
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Screenshot
                  </Typography>
                  
                  {!watchedScreenshot ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Capture a screenshot of the page to document the accessibility issue
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<CameraIcon />}
                        onClick={() => setScreenshotDialogOpen(true)}
                        disabled={!pageUrl || screenshotLoading}
                        sx={{ mt: 1 }}
                      >
                        {screenshotLoading ? 'Uploading...' : 'Capture Screenshot'}
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Screenshot Title: {watchedScreenshotTitle}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={handleRemoveScreenshot}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <img
                        src={watchedScreenshot}
                        alt="Screenshot"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                        }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<CameraIcon />}
                        onClick={() => setScreenshotDialogOpen(true)}
                        disabled={screenshotLoading}
                        sx={{ mt: 1 }}
                      >
                        {screenshotLoading ? 'Uploading...' : 'Replace Screenshot'}
                      </Button>
                    </Box>
                  )}
                </Box>
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

      <ScreenshotCapture
        open={screenshotDialogOpen}
        onClose={() => setScreenshotDialogOpen(false)}
        onSave={handleScreenshotSave}
        pageUrl={pageUrl}
      />
    </>
  );
};

export default TaskForm; 