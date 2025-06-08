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
import { Project, ProjectStatus } from '../../../types/project';

interface ProjectListProps {
  projects: Project[];
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: number) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onEdit, onDelete }) => {
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
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>URL</TableCell>
            <TableCell>Audit Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>{project.name}</TableCell>
              <TableCell>{project.description}</TableCell>
              <TableCell>{project.url}</TableCell>
              <TableCell>{project.auditType}</TableCell>
              <TableCell>
                <Chip
                  label={project.status}
                  color={getStatusColor(project.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>{new Date(project.dueDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <Box>
                  {onEdit && (
                    <IconButton
                      size="small"
                      onClick={() => onEdit(project)}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton
                      size="small"
                      onClick={() => onDelete(project.id)}
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

export default ProjectList; 