// src/app.module.ts

import { Module } from '@nestjs/common';
import { FilesModule } from './files/files.module';
import databaseConfig from './database/config/database.config';
import appConfig from './config/app.config';
import fileConfig from './files/config/file.config';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AllConfigType } from './config/config.type';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './database/mongoose-config.service';
import { DatabaseConfig } from './database/config/database-config.type';
import { RulesModule } from './rules/rules.module';

// Выбираем модуль для подключения БД (Mongo или Postgres)
const infrastructureDatabaseModule = (databaseConfig() as DatabaseConfig)
    .isDocumentDatabase
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
    // Конфигурируем глобально @nestjs/config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        appConfig,
        fileConfig,
      ],
      envFilePath: ['.env'],
    }),

    // Подключаем БД
    infrastructureDatabaseModule,

    // Модуль работы с файлами
    FilesModule,

    // Наш модуль правил (Rule → CRUD + расписание рассылок)
    RulesModule,
  ],
})
export class AppModule {}
