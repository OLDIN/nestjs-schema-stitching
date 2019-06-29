import { NotFoundException } from '@nestjs/common';
import { NewCategoryInput } from './dto/new-category.input';
import { Category } from './Category.entity';
import { ResolveProperty, Resolver, Mutation, Args, Query } from '@nestjs/graphql';

@Resolver('Category')
export class CategoryResolver {
  constructor() {}

  @Query('ping')
  ping(): string {
    return 'pong';
  }

  @ResolveProperty()
  category() {
    return [];
  }

  @Mutation('createCategory')
  async createCategory(
    @Args('newCategoryData') newCategoryData: NewCategoryInput,
  ): Promise<[]> {
    return [];
  }

}
