import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createTaskDto: CreateTaskDto, @GetUser() user: User) {
    console.log('Received task creation request:', JSON.stringify(createTaskDto, null, 2));
    try {
      // Log each field for debugging
      console.log('Validating fields:');
      console.log('title:', createTaskDto.title);
      console.log('description:', createTaskDto.description);
      console.log('projectId:', createTaskDto.projectId);
      console.log('status:', createTaskDto.status);
      console.log('severity:', createTaskDto.severity);
      console.log('priority:', createTaskDto.priority);
      console.log('wcagCriteria:', createTaskDto.wcagCriteria);
      console.log('wcagVersion:', createTaskDto.wcagVersion);
      console.log('conformanceLevel:', createTaskDto.conformanceLevel);
      console.log('dueDate:', createTaskDto.dueDate);
      console.log('assignedToId:', createTaskDto.assignedToId);

      return this.tasksService.create(createTaskDto, user);
    } catch (error) {
      console.error('Error creating task:', error);
      if (error.response?.data) {
        console.error('Validation errors:', JSON.stringify(error.response.data, null, 2));
      }
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      if (error.name === 'ValidationError') {
        console.error('Validation failed:', error.message);
        console.error('Validation details:', error.errors);
      }
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('projectId') projectId?: number) {
    if (projectId) {
      return this.tasksService.findAll(projectId);
    } else {
      return this.tasksService.findAllTasks();
    }
  }

  @Get('health')
  @UseGuards() // Explicitly no guards
  healthCheck() {
    console.log('=== Health check endpoint ===');
    return { 
      message: 'Tasks controller is working',
      timestamp: new Date().toISOString(),
      status: 'ok'
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }

  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard)
  findByProject(@Param('projectId') projectId: string) {
    return this.tasksService.findByProject(+projectId);
  }

  @Post(':id/users/:userId')
  @UseGuards(JwtAuthGuard)
  assignUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.tasksService.assignUser(+id, +userId);
  }

  @Delete(':id/users')
  @UseGuards(JwtAuthGuard)
  removeUser(@Param('id') id: string) {
    return this.tasksService.removeUser(+id);
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  async addMessage(
    @Param('id') id: string,
    @Body() data: { content: string; mentionedUserId?: number },
    @GetUser() user: User,
  ) {
    return this.tasksService.addMessage(+id, data.content, user, data.mentionedUserId);
  }

  @Get(':id/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(@Param('id') id: string) {
    return this.tasksService.getMessages(+id);
  }
} 