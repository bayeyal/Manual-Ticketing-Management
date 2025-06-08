import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Link,
  Chip,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { Task } from '../../types';

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        No tasks found
      </Typography>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'default';
      case 'IN_PROGRESS':
        return 'primary';
      case 'DONE':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <List>
      {tasks.map((task) => (
        <ListItem key={task.id}>
          <ListItemText
            primary={
              <Link
                component={RouterLink}
                to={`/tasks/${task.id}`}
                color="inherit"
                underline="hover"
              >
                {task.title}
              </Link>
            }
            secondary={
              <>
                {task.description}
                <br />
                <Chip
                  label={task.status}
                  size="small"
                  color={getStatusColor(task.status)}
                  sx={{ mt: 1 }}
                />
              </>
            }
          />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              component={RouterLink}
              to={`/tasks/${task.id}/edit`}
            >
              <EditIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default TaskList; 