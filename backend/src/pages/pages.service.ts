import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { TaskMessage } from '../tasks/entities/task.entity';
import { parseString } from 'xml2js';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private pagesRepository: Repository<Page>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(TaskMessage)
    private taskMessagesRepository: Repository<TaskMessage>,
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

  async createFromSitemap(projectId: number, sitemapXml: string): Promise<Page[]> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId }
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return new Promise((resolve, reject) => {
      parseString(sitemapXml, (err, result) => {
        if (err) {
          reject(new Error('Invalid XML format'));
          return;
        }

        try {
          const urls = this.extractUrlsFromSitemap(result);
          
          if (urls.length === 0) {
            reject(new Error('No URLs found in sitemap'));
            return;
          }

          const pages = urls.map(url => {
            // Extract title from URL or use URL as title
            const urlObj = new URL(url);
            const title = urlObj.pathname === '/' ? 'Homepage' : urlObj.pathname.split('/').filter(Boolean).join(' - ') || url;
            
            const page = this.pagesRepository.create({
              title,
              url,
              project
            });
            return page;
          });

          this.pagesRepository.save(pages)
            .then(savedPages => resolve(savedPages))
            .catch(error => {
              console.error('Error saving pages:', error);
              reject(new Error('Failed to save pages to database'));
            });
        } catch (error) {
          console.error('Error parsing sitemap:', error);
          reject(new Error('Failed to parse sitemap URLs'));
        }
      });
    });
  }

  private extractUrlsFromSitemap(sitemapData: any): string[] {
    const urls: string[] = [];
    
    if (sitemapData.urlset && sitemapData.urlset.url) {
      const urlEntries = Array.isArray(sitemapData.urlset.url) 
        ? sitemapData.urlset.url 
        : [sitemapData.urlset.url];
      
      urlEntries.forEach((entry: any) => {
        if (entry.loc && entry.loc[0]) {
          urls.push(entry.loc[0]);
        }
      });
    }

    return urls;
  }

  async findAll(): Promise<Page[]> {
    return this.pagesRepository.find({
      relations: ['project']
    });
  }

  async findByProject(projectId: number): Promise<Page[]> {
    return this.pagesRepository.find({
      where: { project: { id: projectId } },
      relations: ['project']
    });
  }

  async findOne(id: number): Promise<Page> {
    const page = await this.pagesRepository.findOne({
      where: { id },
      relations: ['project']
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
    
    // First, find all tasks associated with this page
    const tasks = await this.tasksRepository.find({
      where: { page: { id } }
    });
    
    if (tasks.length > 0) {
      console.log(`Deleting ${tasks.length} tasks associated with page ${id}`);
      
      // For each task, delete its messages first
      for (const task of tasks) {
        const messages = await this.taskMessagesRepository.find({
          where: { task: { id: task.id } }
        });
        
        if (messages.length > 0) {
          console.log(`Deleting ${messages.length} messages for task ${task.id}`);
          await this.taskMessagesRepository.remove(messages);
        }
      }
      
      // Then delete the tasks
      await this.tasksRepository.remove(tasks);
    }
    
    // Finally delete the page
    await this.pagesRepository.remove(page);
  }
} 