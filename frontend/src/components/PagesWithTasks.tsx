import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { Page } from '../types/page';
import { Task, TaskStatus } from '../types/task';
import { User } from '../types/user';
import TaskAccordion from './TaskAccordion/index';

interface PagesWithTasksProps {
  pages: Page[];
  tasks: Task[];
  users: User[];
  projectId: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onSendMessage: (taskId: number, content: string, mentionedUserId?: number) => void;
  onAddTask: (pageId: number) => void;
  onUpdateStatus?: (taskId: number, status: TaskStatus) => void;
}

const PagesWithTasks: React.FC<PagesWithTasksProps> = ({
  pages,
  tasks,
  users,
  projectId,
  onEditTask,
  onDeleteTask,
  onSendMessage,
  onAddTask,
  onUpdateStatus,
}) => {
  const navigate = useNavigate();
  const [expandedPage, setExpandedPage] = useState<number | null>(null);

  const handleExpand = (pageId: number) => {
    setExpandedPage(expandedPage === pageId ? null : pageId);
  };

  const getTasksForPage = (pageId: number) => {
    // Since tasks are no longer related to pages, return all tasks for the project
    return tasks;
  };

  const handlePageClick = (pageId: number) => {
    navigate(`/projects/${projectId}/pages/${pageId}`);
  };

  return (
    <Box>
      {pages.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No pages found for this project
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            A default page should be automatically created when a project is created.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(`/projects/${projectId}/pages`)}
          >
            Manage Pages
          </Button>
        </Box>
      ) : (
        pages.map((page) => {
          const pageTasks = getTasksForPage(page.id);
          const hasTasks = pageTasks.length > 0;

          return (
            <Accordion
              key={page.id}
              expanded={expandedPage === page.id}
              onChange={() => handleExpand(page.id)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" component="div">
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          {page.url}
                        </a>
                      </Typography>
                      <Chip
                        label={`${pageTasks.length} tasks`}
                        size="small"
                        color={hasTasks ? 'primary' : 'default'}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Created: {new Date(page.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePageClick(page.id);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddTask(page.id);
                      }}
                    >
                      Add Task
                    </Button>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {hasTasks ? (
                  <TaskAccordion
                    tasks={pageTasks}
                    users={users}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onSendMessage={onSendMessage}
                    onUpdateStatus={onUpdateStatus}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No tasks for this page yet.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => onAddTask(page.id)}
                      sx={{ mt: 2 }}
                    >
                      Add First Task
                    </Button>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })
      )}
    </Box>
  );
};

export default PagesWithTasks; 