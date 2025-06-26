import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('pages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNT_ADMIN, UserRole.PROJECT_ADMIN)
  create(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  @Post('sitemap')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNT_ADMIN, UserRole.PROJECT_ADMIN)
  async createFromSitemap(@Body() data: { projectId: number; sitemapXml: string }) {
    try {
      return await this.pagesService.createFromSitemap(data.projectId, data.sitemapXml);
    } catch (error) {
      console.error('Sitemap upload error:', error);
      throw new HttpException(
        error.message || 'Failed to process sitemap',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    if (projectId) {
      return this.pagesService.findByProject(+projectId);
    }
    return this.pagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNT_ADMIN, UserRole.PROJECT_ADMIN)
  update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(+id, updatePageDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ACCOUNT_ADMIN, UserRole.PROJECT_ADMIN)
  remove(@Param('id') id: string) {
    return this.pagesService.remove(+id);
  }
} 