import { Module } from '@nestjs/common';
import { CategoryResolver } from './Category.resolver';
import { CategoryController } from './category.controller';

@Module({
  imports:[],
  providers: [
    CategoryResolver
  ],
  controllers: [CategoryController]
})
export class CategoryModule {}
