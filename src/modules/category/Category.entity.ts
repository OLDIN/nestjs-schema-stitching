import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Category {

  @Field({ nullable: false })
  id!: string;

  @Field({ nullable: true, description: 'name custom type' })
  name!: string;

  @Field({ nullable: true })
  position!: number;

}
