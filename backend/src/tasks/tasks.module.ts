import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TestController } from './test.controller';
import { Task, TaskMessage } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { Page } from '../pages/entities/page.entity';
import { PagesModule } from '../pages/pages.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskMessage, User, Project, Page]),
    PagesModule,
    ProjectsModule
  ],
  controllers: [TasksController, TestController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {} 