import { Controller } from '@nestjs/common';
import type { ShopsService } from './shops.service';

@Controller('shops')
export class ShopsController {
  constructor(private shopsService: ShopsService) {}
}
