import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskMessage } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { TaskSeverity, TaskStatus, TaskPriority } from './entities/task.entity';
import { ProjectsService } from '../projects/projects.service';
import { Page } from '../pages/entities/page.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(TaskMessage)
    private taskMessagesRepository: Repository<TaskMessage>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private projectsService: ProjectsService,
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    console.log('Creating task with data:', JSON.stringify(createTaskDto, null, 2));
    
    try {
      // Load project first
      const project = await this.projectsRepository.findOne({ 
        where: { id: createTaskDto.projectId }
      });
      console.log('Found project:', project);
      
      if (!project) {
        throw new NotFoundException(`Project with ID ${createTaskDto.projectId} not found`);
      }
      
      // Load page if specified
      let page = null;
      if (createTaskDto.pageId) {
        page = await this.pageRepository.findOne({ where: { id: createTaskDto.pageId } });
        if (!page) {
          throw new NotFoundException(`Page with ID ${createTaskDto.pageId} not found`);
        }
      }
      
      // Create task with basic data
      const task = this.tasksRepository.create({
        title: createTaskDto.title,
        description: createTaskDto.description,
        wcagCriteria: createTaskDto.wcagCriteria,
        defectSummary: createTaskDto.defectSummary,
        recommendation: createTaskDto.recommendation,
        userImpact: createTaskDto.userImpact,
        comments: createTaskDto.comments,
        disabilityType: createTaskDto.disabilityType,
        screenshot: createTaskDto.screenshot,
        screenshotTitle: createTaskDto.screenshotTitle,
        severity: createTaskDto.severity || TaskSeverity.MODERATE,
        status: createTaskDto.status || TaskStatus.NEW,
        priority: createTaskDto.priority || TaskPriority.MEDIUM,
        dueDate: new Date(createTaskDto.dueDate),
        project: project,
        page: page,
      });
      
      // Load assigned user if specified
      if (createTaskDto.assignedToId) {
        const assignedUser = await this.usersRepository.findOne({ where: { id: createTaskDto.assignedToId } });
        if (assignedUser) {
          task.assignedTo = assignedUser;
        }
      }
      
      // Load auditor if specified
      if (createTaskDto.auditorId) {
        const auditor = await this.usersRepository.findOne({ where: { id: createTaskDto.auditorId } });
        if (auditor) {
          task.auditor = auditor;
        }
      }
      
      console.log('Task to save:', JSON.stringify(task, null, 2));
      const savedTask = await this.tasksRepository.save(task);
      console.log('Saved task:', JSON.stringify(savedTask, null, 2));
      
      // Update project progress after creating new task
      if (savedTask.project?.id) {
        console.log('New task created, updating project progress for project:', savedTask.project.id);
        await this.projectsService.calculateAndUpdateProgress(savedTask.project.id);
      }
      
      return savedTask;
    } catch (error) {
      console.error('Error creating task:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }

  async findAll(projectId: number): Promise<Task[]> {
    console.log('Finding tasks for project:', projectId);
    const tasks = await this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.page', 'page')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.auditor', 'auditor')
      .leftJoinAndSelect('task.messages', 'messages')
      .leftJoinAndSelect('messages.user', 'messageUser')
      .leftJoinAndSelect('messages.mentionedUser', 'mentionedUser')
      .where('project.id = :projectId', { projectId })
      .getMany();
    
    console.log('Found tasks:', JSON.stringify(tasks, null, 2));
    return tasks;
  }

  async findAllTasks(): Promise<Task[]> {
    console.log('Finding all tasks');
    const tasks = await this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.page', 'page')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.auditor', 'auditor')
      .leftJoinAndSelect('task.messages', 'messages')
      .leftJoinAndSelect('messages.user', 'messageUser')
      .leftJoinAndSelect('messages.mentionedUser', 'mentionedUser')
      .getMany();
    
    console.log('Found all tasks:', JSON.stringify(tasks, null, 2));
    return tasks;
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'auditor', 'page', 'messages', 'messages.user', 'messages.mentionedUser'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    console.log('=== TASK UPDATE STARTED ===');
    console.log('Updating task with ID:', id, 'and data:', JSON.stringify(updateTaskDto, null, 2));
    
    try {
      const task = await this.findOne(id);
      console.log('Found existing task:', JSON.stringify(task, null, 2));
      
      // Handle project assignment
      if (updateTaskDto.projectId) {
        const project = await this.projectsRepository.findOne({ where: { id: updateTaskDto.projectId } });
        if (!project) {
          throw new NotFoundException(`Project with ID ${updateTaskDto.projectId} not found`);
        }
        task.project = project;
      }
      
      // Handle page assignment
      if (updateTaskDto.pageId) {
        const page = await this.pageRepository.findOne({ where: { id: updateTaskDto.pageId } });
        if (!page) {
          throw new NotFoundException(`Page with ID ${updateTaskDto.pageId} not found`);
        }
        task.page = page;
      }
      
      // Handle user assignments
      if (updateTaskDto.assignedToId) {
        const assignedUser = await this.usersRepository.findOne({ where: { id: updateTaskDto.assignedToId } });
        if (assignedUser) {
          task.assignedTo = assignedUser;
        } else {
          console.warn(`User with ID ${updateTaskDto.assignedToId} not found for assignment`);
        }
      }
      
      if (updateTaskDto.auditorId) {
        const auditor = await this.usersRepository.findOne({ where: { id: updateTaskDto.auditorId } });
        if (auditor) {
          task.auditor = auditor;
        } else {
          console.warn(`User with ID ${updateTaskDto.auditorId} not found for auditor assignment`);
        }
      }
      
      // Only assign valid entity properties (exclude ID-based properties)
      const validProperties = {
        title: updateTaskDto.title,
        description: updateTaskDto.description,
        wcagCriteria: updateTaskDto.wcagCriteria,
        defectSummary: updateTaskDto.defectSummary,
        recommendation: updateTaskDto.recommendation,
        userImpact: updateTaskDto.userImpact,
        comments: updateTaskDto.comments,
        disabilityType: updateTaskDto.disabilityType,
        screenshot: updateTaskDto.screenshot,
        severity: updateTaskDto.severity,
        status: updateTaskDto.status,
        priority: updateTaskDto.priority,
        dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
      };
      
      // Remove undefined properties
      Object.keys(validProperties).forEach(key => {
        if (validProperties[key] === undefined) {
          delete validProperties[key];
        }
      });
      
      console.log('Applying valid properties to task:', JSON.stringify(validProperties, null, 2));
      Object.assign(task, validProperties);
      
      const savedTask = await this.tasksRepository.save(task);
      console.log('Task updated successfully:', JSON.stringify(savedTask, null, 2));
      
      // ALWAYS update project progress when a task is updated
      // Get the task with project relationship to ensure we have the project ID
      const taskWithProject = await this.tasksRepository.findOne({
        where: { id: savedTask.id },
        relations: ['project']
      });
      
      if (taskWithProject?.project?.id) {
        console.log('=== TRIGGERING PROGRESS CALCULATION ===');
        console.log('Task updated, updating project progress for project:', taskWithProject.project.id);
        try {
          const newProgress = await this.projectsService.calculateAndUpdateProgress(taskWithProject.project.id);
          console.log('Progress calculation completed successfully. New progress:', newProgress + '%');
        } catch (progressError) {
          console.error('ERROR in progress calculation:', progressError);
          console.error('Progress calculation failed, but task update was successful');
          // Don't throw the error - we want the task update to succeed even if progress calculation fails
        }
      } else {
        console.warn('Task has no project ID, skipping progress calculation');
      }
      
      console.log('=== TASK UPDATE COMPLETED ===');
      return savedTask;
    } catch (error) {
      console.error('=== TASK UPDATE FAILED ===');
      console.error('Error updating task:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
  }

  async addMessage(taskId: number, content: string, user: User, mentionedUserId?: number): Promise<TaskMessage> {
    const task = await this.findOne(taskId);
    const message = this.taskMessagesRepository.create({
      content,
      task,
      user,
    });

    if (mentionedUserId) {
      const mentionedUser = await this.usersRepository.findOne({ where: { id: mentionedUserId } });
      if (mentionedUser) {
        message.mentionedUser = mentionedUser;
      }
    }

    return this.taskMessagesRepository.save(message);
  }

  async getMessages(taskId: number): Promise<TaskMessage[]> {
    const task = await this.findOne(taskId);
    return this.taskMessagesRepository.find({
      where: { task: { id: taskId } },
      relations: ['user', 'mentionedUser'],
      order: { createdAt: 'ASC' },
    });
  }

  async findByProject(projectId: number): Promise<Task[]> {
    return this.tasksRepository.find({
      where: { project: { id: projectId } },
      relations: ['assignedTo', 'auditor', 'page', 'messages', 'messages.user', 'messages.mentionedUser'],
    });
  }

  async assignUser(taskId: number, userId: number): Promise<Task> {
    const task = await this.findOne(taskId);
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    task.assignedTo = user;
    return this.tasksRepository.save(task);
  }

  async removeUser(taskId: number): Promise<Task> {
    const task = await this.findOne(taskId);
    task.assignedTo = null;
    return this.tasksRepository.save(task);
  }

  async testDatabaseConnection() {
    try {
      const projectCount = await this.projectsRepository.count();
      const userCount = await this.usersRepository.count();
      
      return {
        success: true,
        counts: {
          projects: projectCount,
          users: userCount
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async findByPage(pageId: number): Promise<Task[]> {
    console.log('Finding tasks for page:', pageId);
    const tasks = await this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.page', 'page')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.auditor', 'auditor')
      .leftJoinAndSelect('task.messages', 'messages')
      .leftJoinAndSelect('messages.user', 'messageUser')
      .leftJoinAndSelect('messages.mentionedUser', 'mentionedUser')
      .where('page.id = :pageId', { pageId })
      .getMany();
    
    console.log('Found tasks for page:', JSON.stringify(tasks, null, 2));
    return tasks;
  }
} 