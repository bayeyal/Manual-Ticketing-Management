import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { User } from '../types/user';

interface TaskMessageFormProps {
  users: User[];
  onSendMessage: (content: string, mentionedUserId?: number) => void;
}

const TaskMessageForm: React.FC<TaskMessageFormProps> = ({ users, onSendMessage }) => {
  const [content, setContent] = useState('');
  const [mentionedUserId, setMentionedUserId] = useState<number | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSendMessage(content, mentionedUserId);
      setContent('');
      setMentionedUserId(undefined);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        multiline
        rows={2}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your message..."
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Mention User</InputLabel>
          <Select
            value={mentionedUserId || ''}
            label="Mention User"
            onChange={(e) => setMentionedUserId(e.target.value as number)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          endIcon={<SendIcon />}
          disabled={!content.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default TaskMessageForm; 