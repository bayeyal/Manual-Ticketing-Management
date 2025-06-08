import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  Paper,
  Divider,
  Tooltip,
  AvatarGroup,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Task, TaskStatus, TaskSeverity, TaskPriority } from '../types/task';
import { User } from '../types/user';
import TaskMessageForm from './TaskMessageForm';
import { useAppSelector } from '../store';
import { format } from 'date-fns';

interface TaskAccordionProps {
  tasks: Task[];
  users: User[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onSendMessage: (taskId: number, content: string, mentionedUserId?: number) => void;
}

const formatMessageContent = (content: string, mentionedUser?: User) => {
  if (!mentionedUser) return content;
  const mention = `@${mentionedUser.firstName} ${mentionedUser.lastName}`;
  return content.replace(mention, `<strong>${mention}</strong>`);
};

const TaskAccordion: React.FC<TaskAccordionProps> = ({
  tasks,
  users,
  onEdit,
  onDelete,
  onSendMessage,
}) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [expandedTask, setExpandedTask] = React.useState<number | null>(null);

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
      case TaskStatus.ON_HOLD:
        return 'warning';
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

  const isUserMentioned = (task: Task) => {
    if (!currentUser) return false;
    return task.messages?.some(message => 
      message.mentionedUser?.id === currentUser.id
    );
  };

  const handleExpand = (taskId: number) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  // Get unique users who have commented on a task
  const getCommentingUsers = (task: Task) => {
    if (!task.messages?.length) return [];
    const uniqueUsers = new Map<number, User>();
    task.messages.forEach(message => {
      if (!uniqueUsers.has(message.user.id)) {
        uniqueUsers.set(message.user.id, message.user);
      }
    });
    return Array.from(uniqueUsers.values());
  };

  return (
    <Box>
      {tasks.map((task) => (
        <Accordion
          key={task.id}
          expanded={expandedTask === task.id}
          onChange={() => handleExpand(task.id)}
          sx={{
            mb: 2,
            ...(isUserMentioned(task) && {
              borderLeft: '4px solid #f50057',
              backgroundColor: 'rgba(245, 0, 87, 0.04)',
            }),
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" component="div">
                    {task.title}
                  </Typography>
                  {task.messages && task.messages.length > 0 && (
                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' } }}>
                      {getCommentingUsers(task).map(user => (
                        <Tooltip
                          key={user.id}
                          title={`${user.firstName} ${user.lastName} commented`}
                        >
                          <Avatar
                            src={user.avatar}
                            sx={{ width: 24, height: 24 }}
                          >
                            {user.firstName[0]}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </AvatarGroup>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    label={task.status}
                    size="small"
                    color={getStatusColor(task.status)}
                  />
                  <Chip
                    label={task.severity}
                    size="small"
                    color={getSeverityColor(task.severity)}
                  />
                  <Chip
                    label={task.priority}
                    size="small"
                    color={getPriorityColor(task.priority)}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {task.description}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                WCAG Criteria
              </Typography>
              <Typography variant="body1" paragraph>
                {task.wcagCriteria} (Version {task.wcagVersion}, Level {task.conformanceLevel})
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Defect Summary
              </Typography>
              <Typography variant="body1" paragraph>
                {task.defectSummary}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Recommendation
              </Typography>
              <Typography variant="body1" paragraph>
                {task.recommendation}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                User Impact
              </Typography>
              <Typography variant="body1" paragraph>
                {task.userImpact}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Comments
              </Typography>
              <Typography variant="body1" paragraph>
                {task.comments}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Disability Type
              </Typography>
              <Typography variant="body1" paragraph>
                {task.disabilityType}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Page URL
              </Typography>
              <Typography variant="body1" paragraph>
                <a href={task.pageUrl} target="_blank" rel="noopener noreferrer">
                  {task.pageUrl}
                </a>
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Assigned To
                  </Typography>
                  {task.assignedTo ? (
                    <Tooltip title={`Assigned to: ${task.assignedTo.firstName} ${task.assignedTo.lastName}`}>
                      <Chip
                        avatar={<Avatar src={task.assignedTo.avatar}>{task.assignedTo.firstName[0]}</Avatar>}
                        label={`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                        size="small"
                      />
                    </Tooltip>
                  ) : (
                    <Typography variant="body2">Not assigned</Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Auditor
                  </Typography>
                  {task.auditor ? (
                    <Tooltip title={`Auditor: ${task.auditor.firstName} ${task.auditor.lastName}`}>
                      <Chip
                        avatar={<Avatar src={task.auditor.avatar}>{task.auditor.firstName[0]}</Avatar>}
                        label={`${task.auditor.firstName} ${task.auditor.lastName}`}
                        size="small"
                      />
                    </Tooltip>
                  ) : (
                    <Typography variant="body2">Not assigned</Typography>
                  )}
                </Box>
              </Box>

              <Typography variant="subtitle2" color="text.secondary">
                Due Date
              </Typography>
              <Typography variant="body1" paragraph>
                {new Date(task.dueDate).toLocaleDateString()}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Messages
            </Typography>
            <Box sx={{ mb: 2 }}>
              {task.messages?.map((message) => (
                <Paper
                  key={message.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    backgroundColor: message.mentionedUser?.id === currentUser?.id
                      ? 'rgba(245, 0, 87, 0.04)'
                      : 'background.paper',
                    borderLeft: message.mentionedUser?.id === currentUser?.id
                      ? '4px solid #f50057'
                      : 'none',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={message.user.avatar}
                        sx={{ width: 24, height: 24, mr: 1 }}
                      >
                        {message.user.firstName[0]}
                      </Avatar>
                      <Typography variant="subtitle2">
                        {message.user.firstName} {message.user.lastName}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(message.createdAt), 'MMM d, yyyy HH:mm')}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    dangerouslySetInnerHTML={{
                      __html: formatMessageContent(message.content, message.mentionedUser)
                    }}
                  />
                  {message.mentionedUser && (
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        size="small"
                        label={`@${message.mentionedUser.firstName} ${message.mentionedUser.lastName}`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>

            <TaskMessageForm
              users={users}
              onSendMessage={(content: string, mentionedUserId?: number) =>
                onSendMessage(task.id, content, mentionedUserId)
              }
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default TaskAccordion; 