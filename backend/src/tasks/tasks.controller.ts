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
  findAll(@Query('projectId') projectId?: number, @GetUser() user: User) {
    if (projectId) {
      return this.tasksService.findAll(projectId, user);
    } else {
      return this.tasksService.findAllTasks(user);
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
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.tasksService.findOne(+id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @GetUser() user: User) {
    return this.tasksService.update(+id, updateTaskDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.tasksService.remove(+id, user);
  }

  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard)
  findByProject(@Param('projectId') projectId: string, @GetUser() user: User) {
    return this.tasksService.findByProject(+projectId, user);
  }

  @Get('page/:pageId')
  @UseGuards(JwtAuthGuard)
  findByPage(@Param('pageId') pageId: string, @GetUser() user: User) {
    return this.tasksService.findByPage(+pageId, user);
  }

  @Post(':id/users/:userId')
  @UseGuards(JwtAuthGuard)
  assignUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @GetUser() user: User,
  ) {
    return this.tasksService.assignUser(+id, +userId, user);
  }

  @Delete(':id/users')
  @UseGuards(JwtAuthGuard)
  removeUser(@Param('id') id: string, @GetUser() user: User) {
    return this.tasksService.removeUser(+id, user);
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
  async getMessages(@Param('id') id: string, @GetUser() user: User) {
    return this.tasksService.getMessages(+id, user);
  }
} 