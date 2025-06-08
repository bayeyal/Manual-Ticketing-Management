import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Task, TaskStatus, TaskSeverity, TaskPriority } from '../../types/task';

interface TaskListProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete }) => {
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

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>WCAG Criteria</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Severity</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.title}</TableCell>
              <TableCell>{task.wcagCriteria}</TableCell>
              <TableCell>
                <Chip
                  label={task.status}
                  color={getStatusColor(task.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={task.severity}
                  color={getSeverityColor(task.severity)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={task.priority}
                  color={getPriorityColor(task.priority)}
                  size="small"
                />
              </TableCell>
              <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <Box>
                  {onEdit && (
                    <IconButton
                      size="small"
                      onClick={() => onEdit(task)}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton
                      size="small"
                      onClick={() => onDelete(task.id)}
                      aria-label="delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskList; 