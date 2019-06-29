import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { Category } from './Category.entity';

@Controller('categories')
export class CategoryController {

  constructor() {}

  @Get('/')
  getAllCategories() {
    return [];
  }

}
