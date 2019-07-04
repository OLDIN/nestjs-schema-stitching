import { NewCategoryInput } from './dto/new-category.input';
import { Resolver, Mutation, Args, Query, ResolveProperty } from '@nestjs/graphql';
import { Category } from './Category.entity';

@Resolver(of => Category)
export class CategoryResolver {

  @Query(of => Category)
  category() {
    return [];
  }

  @Mutation(of => Category)
  async createCategory(
    @Args('newCategoryData') newCategoryData: NewCategoryInput,
  ): Promise<Category> {
    return {
      id: 'sdf-sdf--sdf-sd-f-sdf',
      name: 'Name test',
      position: 0
    };
  }

}
