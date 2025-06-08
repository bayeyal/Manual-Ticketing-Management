import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { Task, TaskStatus } from '../types/task';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
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

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" component="div">
            {task.title}
          </Typography>
          <Chip
            label={task.status}
            color={getStatusColor(task.status)}
            size="small"
          />
        </Box>
        <Typography color="text.secondary" gutterBottom>
          {task.description}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Priority: {task.priority}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard; 