import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
// import { ConfigModule, ConfigService } from 'nestjs-config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { resolve } from 'path';
import { GqlConfigService } from './graphql.config/graphql.config.service';
import { ConfigModule, ConfigService } from './config';
@Module({
  imports: [
    ConfigModule,
    GraphQLModule.forRootAsync({
      imports:[ConfigModule],
      useClass: GqlConfigService,
      inject: [ConfigService]
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
