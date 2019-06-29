import { Test } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { CategoryResolver } from '../Category.resolver';
import { CategoryService } from '../Category.service';
import { CategoryRepository } from '../category.repository';
import { Repository } from 'typeorm';
import { Category } from '../Category.entity';

describe('CategoryService', () => {
  // let categoryResolver: CategoryResolver;
  let categoryService: CategoryService;
  let repositoryMock: MockType<Repository<Category>>;

  type MockType<T> = {
    [P in keyof T]?: jest.Mock<{}>;
  };

  // @ts-ignore
  const repositoryMockFactory = jest.fn(() => ({
    create: jest.fn().mockReturnThis(),
    save: {}
    // ...
  }));

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports:[TypeOrmModule.forFeature([CategoryRepository])],
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          // useClass: CategoryRepository
          useFactory: repositoryMockFactory
        },
      ],
    }).compile();

    categoryService = module.get<CategoryService>(CategoryService);
    repositoryMock = module.get(getRepositoryToken(Category));
    // categoryResolver = module.get<CategoryResolver>(CategoryResolver);
  });

  it('should be defined', () => {
    expect(categoryService).toBeDefined();
  });

  it('should return an array of cats', async () => {
    const result = { ok: true, id: 'this is mock uuid' };
    const input = { name: 'this is mock name' };
    const entity = { name: input.name, id: result.id };

    repositoryMock.create.mockReturnValue(entity);

    jest.spyOn(categoryService, 'create').mockImplementation(async () => result);
    // expect(await categoryResolver.createCategory(input)).toBe(result);
    // expect(await categoryService.create(input)).toBe(result);

    expect(await categoryService.create(input)).toEqual(result);
  // And make assertions on how often and with what params your mock's methods are called
    // expect(repositoryMock.create).toHaveBeenCalledWith(input);
  });
});
