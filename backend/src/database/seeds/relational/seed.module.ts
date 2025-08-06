import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmConfigService } from '../../typeorm-config.service';
import databaseConfig from '../../config/database.config';
import appConfig from '../../../config/app.config';
import { Rule } from '../../../rules/domain/rule.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions | undefined) => {
        if (!options) {
          throw new Error('Database options are required');
        }
        return new DataSource(options).initialize();
      },
    }),
    TypeOrmModule.forFeature([Rule]),
  ],
})
export class SeedModule {}
