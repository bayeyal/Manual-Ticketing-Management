import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  async getFileUrl(filename: string): Promise<string> {
    const baseUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3001';
    return `${baseUrl}/uploads/screenshots/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    // Implementation for deleting files if needed
    // This could be used to clean up old screenshots
  }
} 