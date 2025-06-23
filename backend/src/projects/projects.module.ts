import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { Page } from '../pages/entities/page.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, User, Page]),
    forwardRef(() => UsersModule)
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService]
})
export class ProjectsModule {} 