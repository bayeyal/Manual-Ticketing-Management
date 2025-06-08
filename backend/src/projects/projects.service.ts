import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

    return this.projectsRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.tasks', 'task')
      .leftJoinAndSelect('project.assignedUsers', 'assignedUser')
      .leftJoinAndSelect('project.projectAdmin', 'projectAdmin')
      .getMany();
  }

  async findOne(id: number): Promise<Project> {
    console.log('Finding project with ID:', id);
    const project = await this.projectsRepository
      .createQueryBuilder('project')
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
} 