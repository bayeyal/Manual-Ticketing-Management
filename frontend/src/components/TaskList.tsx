import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Grid,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Task, TaskStatus, TaskSeverity, TaskPriority } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onAdd: () => void;
}

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.NEW:
      return 'default';
    case TaskStatus.IN_PROGRESS:
      return 'primary';
    case TaskStatus.COMPLETED:
      return 'success';
    case TaskStatus.BLOCKED:
      return 'error';
    default:
      return 'default';
  }
};

const getSeverityColor = (severity: TaskSeverity) => {
  switch (severity) {
    case TaskSeverity.CRITICAL:
      return 'error';
    case TaskSeverity.HIGH:
      return 'warning';
    case TaskSeverity.MODERATE:
      return 'info';
    case TaskSeverity.LOW:
      return 'success';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.URGENT:
      return 'error';
    case TaskPriority.HIGH:
      return 'warning';
    case TaskPriority.MEDIUM:
      return 'info';
    case TaskPriority.LOW:
      return 'success';
    default:
      return 'default';
  }
};

const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete, onAdd }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Tasks</Typography>
        <Button variant="contained" color="primary" onClick={onAdd}>
          Add Task
        </Button>
      </Box>
      {tasks.length > 0 ? (
        <List>
          {tasks.map((task) => (
            <ListItem key={task.id} divider>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="subtitle1">{task.title}</Typography>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                    <Chip
                      label={task.severity}
                      color={getSeverityColor(task.severity)}
                      size="small"
                    />
                    <Chip
                      label={task.priority}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                    </Box>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          WCAG: {task.wcagCriteria} (Level {task.conformanceLevel})
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Page: {task.page?.url || 'No page assigned'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Assigned to: {task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => onEdit(task)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => onDelete(task.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1">No tasks found</Typography>
      )}
    </Paper>
  );
};

export default TaskList; 