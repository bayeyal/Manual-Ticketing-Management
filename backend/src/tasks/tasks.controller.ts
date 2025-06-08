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
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
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
      console.log('pageUrl:', createTaskDto.pageUrl);
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
  findAll(@Query('projectId') projectId: number) {
    return this.tasksService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.tasksService.findByProject(+projectId);
  }

  @Post(':id/users/:userId')
  assignUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.tasksService.assignUser(+id, +userId);
  }

  @Delete(':id/users')
  removeUser(@Param('id') id: string) {
    return this.tasksService.removeUser(+id);
  }

  @Post(':id/messages')
  async addMessage(
    @Param('id') id: string,
    @Body() data: { content: string; mentionedUserId?: number },
    @GetUser() user: User,
  ) {
    return this.tasksService.addMessage(+id, data.content, user, data.mentionedUserId);
  }

  @Get(':id/messages')
  async getMessages(@Param('id') id: string) {
    return this.tasksService.getMessages(+id);
  }
} 