import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../users/entities/user.entity';
import { Page } from '../pages/entities/page.entity';
import { Task, TaskStatus } from '../tasks/entities/task.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Page)
    private pagesRepository: Repository<Page>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const projectAdmin = await this.usersRepository.findOne({
      where: { id: createProjectDto.projectAdminId }
    });

    if (!projectAdmin) {
      throw new NotFoundException(`User with ID ${createProjectDto.projectAdminId} not found`);
    }

    const project = this.projectsRepository.create({
      ...createProjectDto,
      projectAdmin,
    });

    if (createProjectDto.assignedUserIds) {
      const assignedUsers = await this.usersRepository.findBy({
        id: In(createProjectDto.assignedUserIds)
      });
      project.assignedUsers = assignedUsers;
    }

    const savedProject = await this.projectsRepository.save(project);

    // Create a default page with the project's URL
    const defaultPage = this.pagesRepository.create({
      url: createProjectDto.url,
      project: savedProject,
    });
    await this.pagesRepository.save(defaultPage);

    return savedProject;
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.pages', 'pages')
      .leftJoinAndSelect('project.tasks', 'task')
      .leftJoinAndSelect('project.assignedUsers', 'assignedUser')
      .leftJoinAndSelect('project.projectAdmin', 'projectAdmin')
      .getMany();
  }

  async findOne(id: number): Promise<Project> {
    console.log('Finding project with ID:', id);
    const project = await this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.pages', 'pages')
      .leftJoinAndSelect('project.tasks', 'task')
      .leftJoinAndSelect('project.assignedUsers', 'assignedUser')
      .leftJoinAndSelect('project.projectAdmin', 'projectAdmin')
      .where('project.id = :id', { id })
      .getOne();

    console.log('Found project:', project);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);
    
    if (updateProjectDto.projectAdminId) {
      const projectAdmin = await this.usersRepository.findOne({
        where: { id: updateProjectDto.projectAdminId }
      });
      if (!projectAdmin) {
        throw new NotFoundException(`User with ID ${updateProjectDto.projectAdminId} not found`);
      }
      project.projectAdmin = projectAdmin;
    }

    if (updateProjectDto.assignedUserIds) {
      const assignedUsers = await this.usersRepository.findBy({
        id: In(updateProjectDto.assignedUserIds)
      });
      project.assignedUsers = assignedUsers;
    }

    Object.assign(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(id: number): Promise<void> {
    const project = await this.findOne(id);
    await this.projectsRepository.remove(project);
  }

  async assignUser(projectId: number, userId: number): Promise<Project> {
    const project = await this.findOne(projectId);
    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!project.assignedUsers) {
      project.assignedUsers = [];
    }

    if (!project.assignedUsers.some(u => u.id === userId)) {
      project.assignedUsers.push(user);
    }

    return this.projectsRepository.save(project);
  }

  async removeUser(projectId: number, userId: number): Promise<Project> {
    const project = await this.findOne(projectId);
    
    if (project.assignedUsers) {
      project.assignedUsers = project.assignedUsers.filter(
        user => user.id !== userId
      );
    }

    return this.projectsRepository.save(project);
  }

  async calculateAndUpdateProgress(projectId: number): Promise<number> {
    console.log('=== PROGRESS CALCULATION STARTED ===');
    console.log('Calculating progress for project:', projectId);
    
    try {
      // Get all tasks for the project directly
      const allTasks = await this.tasksRepository.find({
        where: { project: { id: projectId } },
        relations: ['project']
      });
      
      console.log(`Found ${allTasks.length} tasks for project ${projectId}`);
      console.log('All tasks:', allTasks.map(task => ({ 
        id: task.id, 
        title: task.title, 
        status: task.status,
        projectId: task.project?.id 
      })));
      
      if (allTasks.length === 0) {
        console.log('No tasks found for project, setting progress to 0');
        await this.projectsRepository.update(projectId, { progress: 0 });
        console.log('=== PROGRESS CALCULATION COMPLETED: 0% ===');
        return 0;
      }
      
      // Count completed tasks
      const completedTasks = allTasks.filter(task => task.status === TaskStatus.COMPLETED);
      const progress = Math.round((completedTasks.length / allTasks.length) * 100);
      
      console.log(`=== Progress calculation for project ${projectId} ===`);
      console.log(`Total tasks: ${allTasks.length}`);
      console.log(`Completed tasks: ${completedTasks.length}`);
      console.log(`Progress: ${completedTasks.length}/${allTasks.length} = ${progress}%`);
      console.log('Completed task IDs:', completedTasks.map(task => task.id));
      console.log('All task statuses:', allTasks.map(task => ({ id: task.id, status: task.status })));
      
      // Update the project's progress
      console.log(`Updating project ${projectId} progress to ${progress}%`);
      await this.projectsRepository.update(projectId, { progress });
      console.log(`Successfully updated project ${projectId} progress to ${progress}%`);
      
      console.log('=== PROGRESS CALCULATION COMPLETED: ' + progress + '% ===');
      return progress;
    } catch (error) {
      console.error('=== PROGRESS CALCULATION FAILED ===');
      console.error('Error calculating progress for project', projectId, ':', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async updateProjectStatus(projectId: number): Promise<Project> {
    const project = await this.findOne(projectId);
    const progress = await this.calculateAndUpdateProgress(projectId);
    
    // Update project status based on progress
    let newStatus = project.status;
    
    if (progress === 100) {
      newStatus = ProjectStatus.COMPLETED;
    } else if (progress > 0) {
      newStatus = ProjectStatus.IN_PROGRESS;
    } else {
      newStatus = ProjectStatus.NEW;
    }
    
    if (newStatus !== project.status) {
      project.status = newStatus;
      await this.projectsRepository.save(project);
    }
    
    return project;
  }
} 