import React from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Task, TaskStatus, TaskPriority, TaskSeverity } from '../types/task';
import { User } from '../types/user';
import { Project } from '../types/project';

interface TaskFormProps {
  task?: Task;
  users: User[];
  project?: Project;
  onSubmit: (data: Partial<Task>) => void;
  onCancel: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  wcagCriteria: string;
  wcagVersion: string;
  conformanceLevel: string;
  defectSummary?: string;
  recommendation?: string;
  userImpact?: string;
  comments?: string;
  disabilityType?: string;
  pageUrl: string;
  severity: TaskSeverity;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToId: number | null;
  auditorId: number | null;
  dueDate: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, users, project, onSubmit, onCancel }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      wcagCriteria: task?.wcagCriteria || '',
      wcagVersion: task?.wcagVersion || '2.1',
      conformanceLevel: task?.conformanceLevel || 'A',
      defectSummary: task?.defectSummary || '',
      recommendation: task?.recommendation || '',
      userImpact: task?.userImpact || '',
      comments: task?.comments || '',
      disabilityType: task?.disabilityType || '',
      pageUrl: task?.pageUrl || '',
      severity: task?.severity || TaskSeverity.MODERATE,
      status: task?.status || TaskStatus.NEW,
      priority: task?.priority || TaskPriority.MEDIUM,
      assignedToId: task?.assignedTo?.id || null,
      auditorId: task?.auditor?.id || null,
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    },
  });

  // Filter users based on project relationships
  const projectUsers = React.useMemo(() => {
    if (!project) return users;
    
    const projectUserIds = new Set([
      project.projectAdmin?.id,
      ...(project.assignedUsers?.map((user: User) => user.id) || []),
      ...(project.projectAdmin?.id ? [project.projectAdmin.id] : [])
    ].filter(Boolean));

    return users.filter(user => projectUserIds.has(user.id));
  }, [users, project]);

  const onSubmitForm: SubmitHandler<TaskFormData> = (data) => {
    // Convert null values to undefined for the API
    const submitData = {
      ...data,
      assignedToId: data.assignedToId || undefined,
      auditorId: data.auditorId || undefined,
      severity: data.severity.toUpperCase() as TaskSeverity,
      status: data.status.toUpperCase() as TaskStatus,
      priority: data.priority.toUpperCase() as TaskPriority,
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Controller
            name="title"
            control={control}
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            rules={{ required: 'Description is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="wcagCriteria"
            control={control}
            rules={{ required: 'WCAG Criteria is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="WCAG Criteria"
                fullWidth
                error={!!errors.wcagCriteria}
                helperText={errors.wcagCriteria?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="conformanceLevel"
            control={control}
            rules={{ required: 'Conformance Level is required' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.conformanceLevel}>
                <InputLabel>Conformance Level</InputLabel>
                <Select {...field} label="Conformance Level">
                  <MenuItem value="A">Level A</MenuItem>
                  <MenuItem value="AA">Level AA</MenuItem>
                  <MenuItem value="AAA">Level AAA</MenuItem>
                </Select>
                {errors.conformanceLevel && (
                  <FormHelperText>{errors.conformanceLevel.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="severity"
            control={control}
            rules={{ required: 'Severity is required' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.severity}>
                <InputLabel>Severity</InputLabel>
                <Select {...field} label="Severity">
                  {Object.values(TaskSeverity).map((severity) => (
                    <MenuItem key={severity} value={severity}>
                      {severity}
                    </MenuItem>
                  ))}
                </Select>
                {errors.severity && (
                  <FormHelperText>{errors.severity.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="priority"
            control={control}
            rules={{ required: 'Priority is required' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.priority}>
                <InputLabel>Priority</InputLabel>
                <Select {...field} label="Priority">
                  {Object.values(TaskPriority).map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
                {errors.priority && (
                  <FormHelperText>{errors.priority.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="assignedToId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Assigned To</InputLabel>
                <Select {...field} label="Assigned To" value={field.value || ''}>
                  <MenuItem value="">None</MenuItem>
                  {projectUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="auditorId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Auditor</InputLabel>
                <Select {...field} label="Auditor" value={field.value || ''}>
                  <MenuItem value="">None</MenuItem>
                  {projectUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="pageUrl"
            control={control}
            rules={{ required: 'Page URL is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Page URL"
                fullWidth
                error={!!errors.pageUrl}
                helperText={errors.pageUrl?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="dueDate"
            control={control}
            rules={{ required: 'Due Date is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Due Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.dueDate}
                helperText={errors.dueDate?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default TaskForm; 