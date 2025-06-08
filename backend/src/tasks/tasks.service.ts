import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskMessage } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';

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
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    console.log('Creating task with data:', JSON.stringify(createTaskDto, null, 2));
    
    try {
      // Load project first
      const project = await this.projectsRepository.findOne({ where: { id: createTaskDto.projectId } });
      console.log('Found project:', project);
      
      if (!project) {
        throw new NotFoundException(`Project with ID ${createTaskDto.projectId} not found`);
      }
      
      const task = this.tasksRepository.create(createTaskDto);
      task.project = project;
      
      if (createTaskDto.assignedToId) {
        task.assignedTo = await this.usersRepository.findOne({ where: { id: createTaskDto.assignedToId } });
      }
      if (createTaskDto.auditorId) {
        task.auditor = await this.usersRepository.findOne({ where: { id: createTaskDto.auditorId } });
      }
      
      const savedTask = await this.tasksRepository.save(task);
      console.log('Saved task:', JSON.stringify(savedTask, null, 2));
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

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'auditor', 'messages', 'messages.user', 'messages.mentionedUser'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    if (updateTaskDto.assignedToId) {
      task.assignedTo = await this.usersRepository.findOne({ where: { id: updateTaskDto.assignedToId } });
    }
    if (updateTaskDto.auditorId) {
      task.auditor = await this.usersRepository.findOne({ where: { id: updateTaskDto.auditorId } });
    }
    Object.assign(task, updateTaskDto);
    return this.tasksRepository.save(task);
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
      relations: ['assignedTo', 'auditor', 'messages', 'messages.user', 'messages.mentionedUser'],
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
} 