import React, { useState, useRef, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Box,
  Chip,
  TextField,
  Button,
  Avatar,
  AvatarGroup,
  Tooltip,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { Task, TaskStatus, TaskSeverity, TaskPriority, TaskMessage } from '../../types/task';
import { User } from '../../types/user';
import { format } from 'date-fns';

interface TaskAccordionProps {
  tasks: Task[];
  users: User[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onSendMessage: (taskId: number, content: string, mentionedUserId?: number) => void;
  onUpdateStatus?: (taskId: number, status: TaskStatus) => void;
}

const TaskAccordion: React.FC<TaskAccordionProps> = ({
  tasks,
  users,
  onEdit,
  onDelete,
  onSendMessage,
  onUpdateStatus,
}) => {
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState<{ [key: number]: string }>({});
  const [mentionSearch, setMentionSearch] = useState<{ [key: number]: string }>({});
  const [mentionAnchorEl, setMentionAnchorEl] = useState<{ [key: number]: HTMLElement | null }>({});
  const [selectedUserIndex, setSelectedUserIndex] = useState<{ [key: number]: number }>({});
  const [statusAnchorEl, setStatusAnchorEl] = useState<{ [key: number]: HTMLElement | null }>({});
  const inputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

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

  const handleExpand = (taskId: number) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const handleStatusClick = (taskId: number, event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setStatusAnchorEl({ ...statusAnchorEl, [taskId]: event.currentTarget });
  };

  const handleStatusClose = (taskId: number) => {
    setStatusAnchorEl({ ...statusAnchorEl, [taskId]: null });
  };

  const handleStatusUpdate = (taskId: number, status: TaskStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(taskId, status);
    }
    handleStatusClose(taskId);
  };

  const handleMessageChange = (taskId: number, content: string) => {
    setMessageContent({ ...messageContent, [taskId]: content });
    
    // Check for @ mentions
    const mentionMatch = content.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionSearch({ ...mentionSearch, [taskId]: mentionMatch[1] });
      setMentionAnchorEl({ ...mentionAnchorEl, [taskId]: inputRefs.current[taskId] });
      setSelectedUserIndex({ ...selectedUserIndex, [taskId]: 0 });
    } else {
      setMentionSearch({ ...mentionSearch, [taskId]: '' });
      setMentionAnchorEl({ ...mentionAnchorEl, [taskId]: null });
    }
  };

  const handleKeyDown = (taskId: number, event: React.KeyboardEvent) => {
    if (!mentionAnchorEl[taskId]) return;

    const filteredUsers = users.filter(user => 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(mentionSearch[taskId].toLowerCase())
    );

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedUserIndex({
          ...selectedUserIndex,
          [taskId]: Math.min(selectedUserIndex[taskId] + 1, filteredUsers.length - 1)
        });
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedUserIndex({
          ...selectedUserIndex,
          [taskId]: Math.max(selectedUserIndex[taskId] - 1, 0)
        });
        break;
      case 'Enter':
        event.preventDefault();
        if (filteredUsers[selectedUserIndex[taskId]]) {
          const user = filteredUsers[selectedUserIndex[taskId]];
          const newContent = messageContent[taskId].replace(/@\w*$/, `@${user.firstName} ${user.lastName} `);
          setMessageContent({ ...messageContent, [taskId]: newContent });
          setMentionAnchorEl({ ...mentionAnchorEl, [taskId]: null });
        }
        break;
      case 'Escape':
        event.preventDefault();
        setMentionAnchorEl({ ...mentionAnchorEl, [taskId]: null });
        break;
    }
  };

  const handleUserSelect = (taskId: number, user: User) => {
    const newContent = messageContent[taskId].replace(/@\w*$/, `@${user.firstName} ${user.lastName} `);
    setMessageContent({ ...messageContent, [taskId]: newContent });
    setMentionAnchorEl({ ...mentionAnchorEl, [taskId]: null });
  };

  const handleSendMessage = (taskId: number) => {
    const content = messageContent[taskId];
    if (content) {
      const mentionMatch = content.match(/@(\w+)/);
      const mentionedUser = mentionMatch
        ? users.find(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(mentionMatch[1].toLowerCase()))
        : undefined;

      onSendMessage(taskId, content, mentionedUser?.id);
      setMessageContent({ ...messageContent, [taskId]: '' });
      setMentionSearch({ ...mentionSearch, [taskId]: '' });
    }
  };

  const formatMessageContent = (content: string, mentionedUser?: User) => {
    if (mentionedUser) {
      content = content.replace(
        new RegExp(`@${mentionedUser.firstName} ${mentionedUser.lastName}`, 'i'),
        `<strong>@${mentionedUser.firstName} ${mentionedUser.lastName}</strong>`
      );
    }
    return content;
  };

  const renderMessage = (message: TaskMessage) => {
    return (
      <Box key={message.id} mb={2}>
        <Box display="flex" alignItems="center" mb={1}>
          <Avatar src={message.user.avatar} sx={{ width: 24, height: 24, mr: 1 }}>
            {message.user.firstName[0]}
          </Avatar>
          <Typography variant="subtitle2">{`${message.user.firstName} ${message.user.lastName}`}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {format(new Date(message.createdAt), 'MMM d, yyyy HH:mm')}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          dangerouslySetInnerHTML={{
            __html: formatMessageContent(message.content, message.mentionedUser)
          }}
        />
      </Box>
    );
  };

  return (
    <Box>
      {tasks.map((task) => (
        <Accordion
          key={task.id}
          expanded={expandedTask === task.id}
          onChange={() => handleExpand(task.id)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" width="100%">
              <Box flex={1}>
                <Typography variant="subtitle1">{task.title}</Typography>
                <Box display="flex" gap={1} mt={0.5}>
                  <Chip
                    label={task.status}
                    color={getStatusColor(task.status)}
                    size="small"
                    onClick={(e) => handleStatusClick(task.id, e)}
                    sx={{ cursor: 'pointer' }}
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
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <AvatarGroup max={3} sx={{ mr: 2 }}>
                  {task.assignedTo && (
                    <Tooltip title={`Owner: ${task.assignedTo.firstName} ${task.assignedTo.lastName}`}>
                      <Avatar src={task.assignedTo.avatar} sx={{ width: 24, height: 24 }}>
                        {task.assignedTo.firstName[0]}
                      </Avatar>
                    </Tooltip>
                  )}
                  {task.auditor && (
                    <Tooltip title={`Auditor: ${task.auditor.firstName} ${task.auditor.lastName}`}>
                      <Avatar src={task.auditor.avatar} sx={{ width: 24, height: 24 }}>
                        {task.auditor.firstName[0]}
                      </Avatar>
                    </Tooltip>
                  )}
                </AvatarGroup>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Description</Typography>
              <Typography variant="body2" paragraph>{task.description}</Typography>
              
              <Typography variant="subtitle2" gutterBottom>WCAG Details</Typography>
              <Typography variant="body2" paragraph>
                Criteria: {task.wcagCriteria} (Level {task.conformanceLevel})
              </Typography>
              
              {task.defectSummary && (
                <>
                  <Typography variant="subtitle2" gutterBottom>Defect Summary</Typography>
                  <Typography variant="body2" paragraph>{task.defectSummary}</Typography>
                </>
              )}
              
              {task.recommendation && (
                <>
                  <Typography variant="subtitle2" gutterBottom>Recommendation</Typography>
                  <Typography variant="body2" paragraph>{task.recommendation}</Typography>
                </>
              )}
              
              {task.userImpact && (
                <>
                  <Typography variant="subtitle2" gutterBottom>User Impact</Typography>
                  <Typography variant="body2" paragraph>{task.userImpact}</Typography>
                </>
              )}
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Messages</Typography>
              {task.messages?.map(renderMessage)}
              
              <Box display="flex" gap={1} mt={2}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message... Use @ to mention someone"
                  value={messageContent[task.id] || ''}
                  onChange={(e) => handleMessageChange(task.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(task.id, e)}
                  inputRef={el => inputRefs.current[task.id] = el}
                />
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={() => handleSendMessage(task.id)}
                  disabled={!messageContent[task.id]}
                >
                  Send
                </Button>
              </Box>

              <Popper
                open={Boolean(mentionAnchorEl[task.id])}
                anchorEl={mentionAnchorEl[task.id]}
                placement="bottom-start"
                style={{ zIndex: 1300 }}
              >
                <Paper elevation={3} sx={{ maxHeight: 200, overflow: 'auto', width: 300 }}>
                  <List dense>
                    {users
                      .filter(user => 
                        `${user.firstName} ${user.lastName}`
                          .toLowerCase()
                          .includes(mentionSearch[task.id]?.toLowerCase() || '')
                      )
                      .map((user, index) => (
                        <ListItem
                          key={user.id}
                          button
                          selected={index === selectedUserIndex[task.id]}
                          onClick={() => handleUserSelect(task.id, user)}
                        >
                          <ListItemAvatar>
                            <Avatar src={user.avatar} sx={{ width: 24, height: 24 }}>
                              {user.firstName[0]}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${user.firstName} ${user.lastName}`}
                          />
                        </ListItem>
                      ))}
                  </List>
                </Paper>
              </Popper>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Status Update Menus */}
      {tasks.map((task) => (
        <Menu
          key={`status-menu-${task.id}`}
          anchorEl={statusAnchorEl[task.id]}
          open={Boolean(statusAnchorEl[task.id])}
          onClose={() => handleStatusClose(task.id)}
        >
          <MenuItem onClick={() => handleStatusUpdate(task.id, TaskStatus.NEW)}>
            New
          </MenuItem>
          <MenuItem onClick={() => handleStatusUpdate(task.id, TaskStatus.IN_PROGRESS)}>
            In Progress
          </MenuItem>
          <MenuItem onClick={() => handleStatusUpdate(task.id, TaskStatus.REVIEW)}>
            Review
          </MenuItem>
          <MenuItem onClick={() => handleStatusUpdate(task.id, TaskStatus.COMPLETED)}>
            Completed
          </MenuItem>
          <MenuItem onClick={() => handleStatusUpdate(task.id, TaskStatus.BLOCKED)}>
            Blocked
          </MenuItem>
        </Menu>
      ))}
    </Box>
  );
};

export default TaskAccordion; 