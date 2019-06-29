import { ConnectionOptions } from 'typeorm';
import { join } from 'path';

const {
  TYPEORM_DATABASE,
  TYPEORM_HOST,
  TYPEORM_PASSWORD,
  TYPEORM_PORT,
  TYPEORM_USERNAME,
  REDIS_DB,
  REDIS_HOST,
  REDIS_PASS,
  REDIS_PORT
} = process.env;

const config: ConnectionOptions = {
  type: 'postgres',
  host: TYPEORM_HOST,
  port: Number(TYPEORM_PORT),
  username: TYPEORM_USERNAME,
  password: TYPEORM_PASSWORD,
  database: TYPEORM_DATABASE,
  synchronize: false,
  logging: true,
  cache: {
    type: 'redis',
    duration: 30000,
    alwaysEnabled: true, // TODO: мб это выключить нужно
    options: {
      host: REDIS_HOST,
      port: REDIS_PORT,
      db: REDIS_DB,
      password: REDIS_PASS
    }
  },
  cli: {
    migrationsDir: join('src', 'migrations'),
    entitiesDir: join('src', 'entity')
  },
  migrationsRun: true,
  migrationsTableName: 'orm_migrations',
  migrations: [
    join(__dirname, 'migrations', '*{.ts,.js}')
  ],
  entities: [
    join(__dirname, 'entity', '*{.ts,.js}')
  ]
};

export = config;
