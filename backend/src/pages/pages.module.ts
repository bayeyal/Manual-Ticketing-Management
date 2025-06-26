import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { Page } from './entities/page.entity';
import { Project } from '../projects/entities/project.entity';
import { Task, TaskMessage } from '../tasks/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Page, Project, Task, TaskMessage])],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {} 