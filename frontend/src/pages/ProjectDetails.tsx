import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProjectById } from '../store/slices/projectsSlice';
import { fetchPages } from '../store/slices/pagesSlice';
import { fetchTasks, createTask, updateTask, deleteTask, sendTaskMessage } from '../store/slices/tasksSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Chip,
  Dialog,
  LinearProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { ProjectStatus, AuditType, AuditLevel } from '../types/project';
import PagesWithTasks from '../components/PagesWithTasks';
import TaskForm from '../components/TaskForm';
import { Task, TaskStatus } from '../types/task';
import { Page } from '../types/page';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProject: project, loading: projectLoading, error: projectError } = useAppSelector((state) => state.projects);
  const { pages, loading: pagesLoading, error: pagesError } = useAppSelector((state) => state.pages);
  const { tasks, loading: tasksLoading, error: tasksError } = useAppSelector((state) => state.tasks);
  const { users, loading: usersLoading, error: usersError } = useAppSelector((state) => state.users);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(parseInt(id)));
      dispatch(fetchPages(parseInt(id)));
      dispatch(fetchTasks(parseInt(id)));
      dispatch(fetchUsers());
    }
  }, [dispatch, id]);

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

  const handleAddTask = (pageId: number) => {
    setSelectedTask(undefined);
    setSelectedPageId(pageId);
    setIsTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setSelectedPageId(task.page?.id || null);
    setIsTaskDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await dispatch(deleteTask(taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      
      // Check if we have the required data
      if (!project?.id) {
        alert('Project data is not loaded. Please wait for the project to load and try again.');
        return;
      }
      
      // Use selectedPageId if available, otherwise use the first page
      let pageIdToUse = selectedPageId;
      if (!pageIdToUse && pages.length > 0) {
        pageIdToUse = pages[0].id;
        console.log('No page selected, using first available page:', pageIdToUse);
      }
      
      if (!pageIdToUse) {
        alert('No pages available for this project. Please create a page first before testing the backend connection.');
        return;
      }
      
      const testData = {
        title: 'Test Task',
        description: 'Test Description for backend connectivity test',
        wcagCriteria: '1.1.1',
        wcagVersion: '2.1',
        conformanceLevel: 'AA',
        pageId: pageIdToUse,
        projectId: project.id,
        dueDate: new Date().toISOString(),
        severity: 'MODERATE', // TaskSeverity.MODERATE
        status: 'NEW', // TaskStatus.NEW
        priority: 'MEDIUM' // TaskPriority.MEDIUM
      };
      
      console.log('Sending test data:', JSON.stringify(testData, null, 2));
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/tasks/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(testData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Backend test successful:', result);
        alert('Backend connection test successful! The backend is working correctly.');
      } else {
        const errorData = await response.text();
        console.error('Backend test failed:', response.status, response.statusText);
        console.error('Error response:', errorData);
        alert(`Backend test failed: ${response.status} ${response.statusText}\n\nError details: ${errorData}`);
      }
    } catch (error) {
      console.error('Backend test error:', error);
      alert(`Backend test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleTaskSubmit = async (data: Partial<Task>) => {
    try {
      // Clean the task data before sending to backend
      const cleanTaskData = {
        ...data,
        // Convert full objects to IDs
        assignedToId: data.assignedTo?.id,
        auditorId: data.auditor?.id,
        pageId: data.page?.id,
        // Remove the full objects to avoid backend validation errors
        assignedTo: undefined,
        auditor: undefined,
        page: undefined,
      };

      if (selectedTask) {
        await dispatch(updateTask({ id: selectedTask.id, task: cleanTaskData }));
      } else {
        if (!selectedPageId) {
          console.error('No page selected for task creation');
          return;
        }
        if (!project?.id) {
          console.error('Project ID is missing');
          return;
        }
        const taskData = {
          ...cleanTaskData,
          projectId: project.id,
          pageId: selectedPageId
        };
        await dispatch(createTask(taskData));
      }
      setIsTaskDialogOpen(false);
      setSelectedPageId(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleSendMessage = async (taskId: number, content: string, mentionedUserId?: number) => {
    try {
      await dispatch(sendTaskMessage({ taskId, content, mentionedUserId }));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUpdateStatus = async (taskId: number, status: TaskStatus) => {
    try {
      // Find the current task to get its data
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) {
        console.error('Task not found:', taskId);
        return;
      }

      // Clean the task data before sending to backend
      const cleanTaskData = {
        status,
        // Only include IDs for assignedTo and auditor, not the full objects
        assignedToId: currentTask.assignedTo?.id,
        auditorId: currentTask.auditor?.id,
      };

      console.log('Updating task status:', taskId, 'with data:', cleanTaskData);
      await dispatch(updateTask({ id: taskId, task: cleanTaskData }));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  if (projectLoading || pagesLoading || tasksLoading || usersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (projectError || pagesError || tasksError || usersError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          {projectError || pagesError || tasksError || usersError}
        </Alert>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 2 }}>
          Project not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/projects')}
            sx={{ mr: 2 }}
          >
            Back to Projects
          </Button>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            Project Details
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate(`/projects/${id}/pages`)}
            sx={{ mr: 2 }}
          >
            Manage Pages
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(`/projects/${id}/edit`)}
          >
            Edit Project
          </Button>
          <Button
            variant="outlined"
            onClick={testBackendConnection}
            sx={{ ml: 2 }}
          >
            Test Backend
          </Button>
        </Box>
        
        {pages.length > 0 && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.contrastText">
              💡 <strong>Tip:</strong> To test the backend connection, click "Test Backend" above. 
              To create a task, click "Add Task" on any page below.
            </Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="div">{project.name}</Typography>
                <Chip
                  label={project.status}
                  color={getStatusColor(project.status as ProjectStatus)}
                  size="small"
                />
              </Box>
              <Typography variant="body1" color="text.secondary" component="div" paragraph>
                {project.description}
              </Typography>
              
              {/* Progress Section */}
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" component="div">Project Progress</Typography>
                  <Typography variant="h6" component="div" color="primary">
                    {project.progress || 0}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={project.progress || 0} 
                  sx={{ height: 12, borderRadius: 6 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {tasks.filter(task => task.status === TaskStatus.COMPLETED).length} of {tasks.length} tasks completed
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">Project URL</Typography>
                  <Typography variant="body1" component="div">
                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                      {project.url}
                    </a>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">Project Admin</Typography>
                  <Typography variant="body1" component="div">
                    {project.projectAdmin ? `${project.projectAdmin.firstName} ${project.projectAdmin.lastName}` : 'Not assigned'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" component="div">Assigned Users</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {project.assignedUsers && project.assignedUsers.length > 0 ? (
                      project.assignedUsers.map(user => (
                        <Chip
                          key={user.id}
                          label={`${user.firstName} ${user.lastName}`}
                          size="small"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No users assigned
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">Audit Type</Typography>
                  <Typography variant="body1" component="div">{project.auditType}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">Audit Level</Typography>
                  <Typography variant="body1" component="div">{project.auditLevel}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">Start Date</Typography>
                  <Typography variant="body1" component="div">
                    {new Date(project.startDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">End Date</Typography>
                  <Typography variant="body1" component="div">
                    {new Date(project.endDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" component="div">Due Date</Typography>
                  <Typography variant="body1" component="div">
                    {new Date(project.dueDate).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Pages & Tasks</Typography>
            </Box>
            <PagesWithTasks
              pages={pages}
              tasks={tasks}
              users={users}
              projectId={id || ''}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onSendMessage={handleSendMessage}
              onAddTask={handleAddTask}
              onUpdateStatus={handleUpdateStatus}
            />
          </Grid>
        </Grid>
      </Box>

      <Dialog
        open={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" mb={3}>
            {selectedTask ? 'Edit Task' : 'Create Task'}
          </Typography>
          <TaskForm
            task={selectedTask}
            users={users}
            project={project}
            pages={pages}
            selectedPageId={selectedPageId || undefined}
            onSubmit={handleTaskSubmit}
            onCancel={() => setIsTaskDialogOpen(false)}
          />
        </Box>
      </Dialog>
    </Container>
  );
};

export default ProjectDetails;