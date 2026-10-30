import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return {
      service: 'Smart Queue API',
      status: 'ok',
      message: 'Backend is running',
    };
  }
}
