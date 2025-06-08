import React from 'react';
import { Task, TaskStatus, TaskSeverity } from '../../../types/task';
import { format } from 'date-fns';
import { Badge, Card, Table, Button, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { List, ListItem, ListItemText, Chip, Box } from '@mui/material';

interface TaskListProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onViewTask,
  onEditTask,
  onDeleteTask,
}) => {
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
        return 'red';
      case TaskSeverity.HIGH:
        return 'orange';
      case TaskSeverity.MODERATE:
        return 'blue';
      case TaskSeverity.LOW:
        return 'green';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'WCAG Criteria',
      dataIndex: 'wcagCriteria',
      key: 'wcagCriteria',
      render: (criteria: string) => (
        <span>
          {criteria}
          <br />
          <small>Level {criteria.charAt(0)}</small>
        </span>
      ),
    },
    {
      title: 'Page',
      dataIndex: 'pageUrl',
      key: 'pageUrl',
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: TaskSeverity) => (
        <Badge color={getSeverityColor(severity)} text={severity} />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: TaskStatus) => (
        <Chip
          label={status}
          color={getStatusColor(status)}
          size="small"
        />
      ),
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (user: { id: string; name: string }) => user?.name || 'Unassigned',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => format(new Date(date), 'MMM d, yyyy'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Task) => (
        <div className="flex gap-2">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onViewTask(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Task">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEditTask(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Task">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDeleteTask(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <Table
        dataSource={tasks}
        columns={columns}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total: number) => `Total ${total} tasks`,
        }}
      />
    </Card>
  );
};

export default TaskList; 