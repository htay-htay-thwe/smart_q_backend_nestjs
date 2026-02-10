import { Injectable } from '@nestjs/common';
import type { Model } from 'mongoose';
import { Shops } from '../schemas/Shops.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ShopsService {
  constructor(@InjectModel(Shops.name) private shopsModel: Model<Shops>) {}
}
