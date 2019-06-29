import { GraphQLDefinitionsFactory } from '@nestjs/graphql';
import { join } from 'path';

const definitionsFactory = new GraphQLDefinitionsFactory();
definitionsFactory.generate({
  typePaths: ['./schema.(graphql|gql)'],
  path: join(process.cwd(), 'src/graphql.ts'),
  outputAs: 'class',
  watch: true
});
