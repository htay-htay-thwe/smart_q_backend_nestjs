import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShopTypes } from '../schemas/ShopTypes.schema';

@Injectable()
export class ShopTypesService {
  constructor(
    @InjectModel(ShopTypes.name) private shopTypesModel: Model<ShopTypes>,
  ) {}

  async create(shopTypeName: string) {
    const newShopType = new this.shopTypesModel({ shopTypeName });
    return await newShopType.save();
  }

  async findAll() {
    return await this.shopTypesModel.find().exec();
  }

  async findById(id: string) {
    return await this.shopTypesModel.findById(id).exec();
  }
}
