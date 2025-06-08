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
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { Project } from '../../types';

interface ProjectListProps {
  projects: Project[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  if (projects.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        No projects found
      </Typography>
    );
  }

  return (
    <List>
      {projects.map((project) => (
        <ListItem key={project.id}>
          <ListItemText
            primary={
              <Link
                component={RouterLink}
                to={`/projects/${project.id}`}
                color="inherit"
                underline="hover"
              >
                {project.name}
              </Link>
            }
            secondary={project.description}
          />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              component={RouterLink}
              to={`/projects/${project.id}/edit`}
            >
              <EditIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default ProjectList; 