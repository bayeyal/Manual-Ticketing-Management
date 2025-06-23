import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Project } from '../projects/entities/project.entity';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private pagesRepository: Repository<Page>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createPageDto: CreatePageDto): Promise<Page> {
    const project = await this.projectsRepository.findOne({
      where: { id: createPageDto.projectId }
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${createPageDto.projectId} not found`);
    }

    const page = this.pagesRepository.create({
      url: createPageDto.url,
      project
    });

    return this.pagesRepository.save(page);
  }

  async findAll(): Promise<Page[]> {
    return this.pagesRepository.find({
      relations: ['project', 'tasks']
    });
  }

  async findByProject(projectId: number): Promise<Page[]> {
    return this.pagesRepository.find({
      where: { project: { id: projectId } },
      relations: ['project', 'tasks']
    });
  }

  async findOne(id: number): Promise<Page> {
    const page = await this.pagesRepository.findOne({
      where: { id },
      relations: ['project', 'tasks', 'tasks.assignedTo', 'tasks.auditor']
    });

    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    return page;
  }

  async update(id: number, updatePageDto: UpdatePageDto): Promise<Page> {
    const page = await this.findOne(id);
    Object.assign(page, updatePageDto);
    return this.pagesRepository.save(page);
  }

  async remove(id: number): Promise<void> {
    const page = await this.findOne(id);
    await this.pagesRepository.remove(page);
  }
} 