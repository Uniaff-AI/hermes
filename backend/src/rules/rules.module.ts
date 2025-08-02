// src/rules/rules.module.ts

import { Module }               from '@nestjs/common';
import { TypeOrmModule }        from '@nestjs/typeorm';
import { HttpModule }           from '@nestjs/axios';
import { ConfigModule }         from '@nestjs/config';

import { Rule }                 from './domain/rule.entity';
import { RulesService }         from './rules.service';
import { RulesController }      from './rules.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Rule]), // подключаем нашу сущность
        HttpModule,                       // для HttpService
        ConfigModule,                     // для ConfigService
    ],
    providers: [RulesService],
    controllers: [RulesController],
})
export class RulesModule {}
