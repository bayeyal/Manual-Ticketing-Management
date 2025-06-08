import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

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
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNT_ADMIN, UserRole.PROJECT_ADMIN)
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(+id, updateProjectDto);
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
  ) {
    return this.projectsService.assignUser(+id, +userId);
  }

  @Delete(':id/users/:userId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNT_ADMIN, UserRole.PROJECT_ADMIN)
  removeUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.projectsService.removeUser(+id, +userId);
  }
} 