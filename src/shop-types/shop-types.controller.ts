import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { ShopTypesService } from './shop-types.service';
import { CacheInterceptor } from '@nestjs/cache-manager/dist/interceptors/cache.interceptor';
import { CacheTTL } from '@nestjs/cache-manager';

@Controller('api/shop-types')
export class ShopTypesController {
  constructor(private shopTypesService: ShopTypesService) {}

  @Post()
  async create(@Body('shopTypeName') shopTypeName: string) {
    return await this.shopTypesService.create(shopTypeName);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600) 
  async findAll() {
    return await this.shopTypesService.findAll();
  }
}
