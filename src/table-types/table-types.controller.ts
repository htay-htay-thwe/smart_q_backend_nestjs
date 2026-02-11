import { Body, Controller, Get, Post } from '@nestjs/common';
import { TableTypesService } from './table-types.service';

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
  async findAll() {
    return await this.tableTypesService.findAll();
  }
}
