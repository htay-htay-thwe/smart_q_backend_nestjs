import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TableTypes } from '../schemas/TableTypes.schema';

@Injectable()
export class TableTypesService {
  constructor(
    @InjectModel(TableTypes.name) private tableTypesModel: Model<TableTypes>,
  ) {}

  async create(type: string, capacity: number, shopId: string) {
    const newTableType = new this.tableTypesModel({ type, capacity, shopId });
    return await newTableType.save();
  }

  async findAll() {
    return await this.tableTypesModel.find().exec();
  }

  async findById(id: string) {
    return await this.tableTypesModel.findById(id).exec();
  }
}
