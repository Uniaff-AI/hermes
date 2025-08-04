// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { DataSource, DataSourceOptions } from 'typeorm';

import databaseConfig from './database/config/database.config';
import appConfig from './config/app.config';
import fileConfig from './files/config/file.config';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { MongooseConfigService } from './database/mongoose-config.service';
import { DatabaseConfig } from './database/config/database-config.type';

import { FilesModule } from './files/files.module';
import { RulesModule } from './rules/rules.module';

const infrastructureDatabaseModule =
    (databaseConfig() as DatabaseConfig).isDocumentDatabase
        ? MongooseModule.forRootAsync({
          useClass: MongooseConfigService,
        })
        : TypeOrmModule.forRootAsync({
          useClass: TypeOrmConfigService,
          dataSourceFactory: async (options: DataSourceOptions) => {
            return new DataSource(options).initialize();
          },
        });

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [databaseConfig, appConfig, fileConfig],
    }),

    infrastructureDatabaseModule,

    // 3) Очередь Bull для фоновых задач (Redis)
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    FilesModule,
    RulesModule,
  ],
})
export class AppModule {}
