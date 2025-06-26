import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNT_ADMIN)
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.projectsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.projectsService.findOne(+id, user);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNT_ADMIN, UserRole.PROJECT_ADMIN)
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Request() req, @GetUser() user: User) {
    console.log('Update project request:', {
      projectId: id,
      user: req.user,
      userRole: req.user?.role,
      body: updateProjectDto
    });
    return this.projectsService.update(+id, updateProjectDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNT_ADMIN)
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }

  @Post(':id/users/:userId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNT_ADMIN, UserRole.PROJECT_ADMIN)
  assignUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @GetUser() user: User,
  ) {
    return this.projectsService.assignUser(+id, +userId, user);
  }

  @Delete(':id/users/:userId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNT_ADMIN, UserRole.PROJECT_ADMIN)
  removeUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @GetUser() user: User,
  ) {
    return this.projectsService.removeUser(+id, +userId, user);
  }

  @Post(':id/calculate-progress')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNT_ADMIN, UserRole.PROJECT_ADMIN)
  calculateProgress(@Param('id') id: string, @GetUser() user: User) {
    return this.projectsService.calculateAndUpdateProgress(+id, user);
  }

  @Post(':id/update-status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNT_ADMIN, UserRole.PROJECT_ADMIN)
  updateStatus(@Param('id') id: string, @GetUser() user: User) {
    return this.projectsService.updateProjectStatus(+id, user);
  }

  @Post('recalculate-all-progress')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNT_ADMIN)
  async recalculateAllProgress(@GetUser() user: User) {
    const projects = await this.projectsService.findAll(user);
    const results = [];
    
    for (const project of projects) {
      try {
        const progress = await this.projectsService.calculateAndUpdateProgress(project.id, user);
        results.push({ projectId: project.id, projectName: project.name, progress });
      } catch (error) {
        results.push({ projectId: project.id, projectName: project.name, error: error.message });
      }
    }
    
    return { message: 'Progress recalculation completed', results };
  }

  @Get('test-progress/:id')
  async testProgress(@Param('id') id: string, @GetUser() user: User) {
    try {
      const progress = await this.projectsService.calculateAndUpdateProgress(+id, user);
      return { projectId: +id, progress, message: 'Progress calculated successfully' };
    } catch (error) {
      return { projectId: +id, error: error.message };
    }
  }
} 