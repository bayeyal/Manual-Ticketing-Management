import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User, UserRole } from '../users/entities/user.entity';
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

  // Helper method to check if user has access to a project
  private async hasProjectAccess(user: User, projectId: number): Promise<boolean> {
    if (user.role === UserRole.SUPER_ADMIN) {
      return true; // Super admin has access to all projects
    }

    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['projectAdmin', 'assignedUsers'],
    });

    if (!project) {
      return false;
    }

    if (user.role === UserRole.PROJECT_ADMIN) {
      return project.projectAdmin?.id === user.id;
    }

    if (user.role === UserRole.USER) {
      return project.assignedUsers?.some(assignedUser => assignedUser.id === user.id);
    }

    return false;
  }

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

  async findAll(user: User): Promise<Project[]> {
    let query = this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.pages', 'pages')
      .leftJoinAndSelect('project.tasks', 'task')
      .leftJoinAndSelect('project.assignedUsers', 'assignedUser')
      .leftJoinAndSelect('project.projectAdmin', 'projectAdmin');

    // Apply role-based filtering
    if (user.role === UserRole.SUPER_ADMIN) {
      // Super admin can see all projects
      console.log('Super admin - showing all projects');
    } else if (user.role === UserRole.PROJECT_ADMIN) {
      // Project admin can see projects they admin
      query = query.where('projectAdmin.id = :userId', { userId: user.id });
      console.log('Project admin - filtering by admin projects');
    } else if (user.role === UserRole.USER) {
      // Regular users can only see projects they're assigned to
      query = query.where('assignedUser.id = :userId', { userId: user.id });
      console.log('Regular user - filtering by assigned projects');
    } else {
      // No access for other roles
      return [];
    }

    return query.getMany();
  }

  async findOne(id: number, user: User): Promise<Project> {
    console.log('Finding project with ID:', id, 'for user:', user.id, 'with role:', user.role);
    
    // Check if user has access to the project
    if (!(await this.hasProjectAccess(user, id))) {
      throw new ForbiddenException('You do not have access to this project');
    }

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

  async update(id: number, updateProjectDto: UpdateProjectDto, user: User): Promise<Project> {
    // Check if user has access to the project
    if (!(await this.hasProjectAccess(user, id))) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const project = await this.findOne(id, user);
    
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
    const project = await this.projectsRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    await this.projectsRepository.remove(project);
  }

  async assignUser(projectId: number, userId: number, user: User): Promise<Project> {
    // Check if user has access to the project
    if (!(await this.hasProjectAccess(user, projectId))) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const project = await this.findOne(projectId, user);
    const assignedUser = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (!assignedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!project.assignedUsers) {
      project.assignedUsers = [];
    }

    if (!project.assignedUsers.some(u => u.id === userId)) {
      project.assignedUsers.push(assignedUser);
    }

    return this.projectsRepository.save(project);
  }

  async removeUser(projectId: number, userId: number, user: User): Promise<Project> {
    // Check if user has access to the project
    if (!(await this.hasProjectAccess(user, projectId))) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const project = await this.findOne(projectId, user);
    
    if (project.assignedUsers) {
      project.assignedUsers = project.assignedUsers.filter(
        user => user.id !== userId
      );
    }

    return this.projectsRepository.save(project);
  }

  async calculateAndUpdateProgress(projectId: number, user: User): Promise<number> {
    // Check if user has access to the project
    if (!(await this.hasProjectAccess(user, projectId))) {
      throw new ForbiddenException('You do not have access to this project');
    }

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

  async updateProjectStatus(projectId: number, user: User): Promise<Project> {
    // Check if user has access to the project
    if (!(await this.hasProjectAccess(user, projectId))) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const project = await this.findOne(projectId, user);
    
    // Simple status update logic - you can enhance this based on your requirements
    const allTasks = await this.tasksRepository.find({
      where: { project: { id: projectId } }
    });
    
    if (allTasks.length === 0) {
      project.status = ProjectStatus.NEW;
    } else if (allTasks.every(task => task.status === TaskStatus.COMPLETED)) {
      project.status = ProjectStatus.COMPLETED;
    } else if (allTasks.some(task => task.status === TaskStatus.IN_PROGRESS)) {
      project.status = ProjectStatus.IN_PROGRESS;
    } else {
      project.status = ProjectStatus.REVIEW;
    }
    
    return this.projectsRepository.save(project);
  }
} 