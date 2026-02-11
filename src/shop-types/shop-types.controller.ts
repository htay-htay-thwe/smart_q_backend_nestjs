import { Body, Controller, Get, Post } from '@nestjs/common';
import { ShopTypesService } from './shop-types.service';

@Controller('api/shop-types')
export class ShopTypesController {
  constructor(private shopTypesService: ShopTypesService) {}

  @Post()
  async create(@Body('shopTypeName') shopTypeName: string) {
    return await this.shopTypesService.create(shopTypeName);
  }

  @Get()
  async findAll() {
    return await this.shopTypesService.findAll();
  }
}
