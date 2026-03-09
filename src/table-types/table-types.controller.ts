import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { TableTypesService } from './table-types.service';
import { CacheTTL } from '@nestjs/cache-manager/dist/decorators/cache-ttl.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager/dist/interceptors/cache.interceptor';

@Controller('api/table-types')
export class TableTypesController {
  constructor(private tableTypesService: TableTypesService) {}

  @Post()
  async create(
    @Body('type') type: string,
    @Body('capacity') capacity: number,
    @Body('shopId') shopId: string,
  ) {
    return await this.tableTypesService.create(type, capacity, shopId);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600)
  async findAll() {
    return await this.tableTypesService.findAll();
  }
}
