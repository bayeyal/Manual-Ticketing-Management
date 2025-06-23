import React from 'react';
import { Card, CardContent, Typography, Chip, Box, LinearProgress } from '@mui/material';
import { Project, ProjectStatus } from '../types/project';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.NEW:
        return 'default';
      case ProjectStatus.IN_PROGRESS:
        return 'primary';
      case ProjectStatus.COMPLETED:
        return 'success';
      case ProjectStatus.ON_HOLD:
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" component="div">
            {project.name}
          </Typography>
          <Chip
            label={project.status}
            color={getStatusColor(project.status)}
            size="small"
          />
        </Box>
        <Typography color="text.secondary" gutterBottom>
          {project.description}
        </Typography>
        
        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {project.progress || 0}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={project.progress || 0} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Due: {new Date(project.dueDate).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {project.tasks?.length || 0} tasks
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectCard; 