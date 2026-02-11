import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TableTypes, TableTypesSchema } from '../schemas/TableTypes.schema';
import { TableTypesController } from './table-types.controller';
import { TableTypesService } from './table-types.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TableTypes.name, schema: TableTypesSchema },
    ]),
  ],
  controllers: [TableTypesController],
  providers: [TableTypesService],
})
export class TableTypesModule {}
