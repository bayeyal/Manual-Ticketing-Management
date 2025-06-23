import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get('ping')
  ping() {
    return { 
      message: 'Ping successful',
      timestamp: new Date().toISOString(),
      status: 'ok'
    };
  }

  @Get('health')
  health() {
    return { 
      message: 'Health check successful',
      timestamp: new Date().toISOString(),
      status: 'ok'
    };
  }
} 