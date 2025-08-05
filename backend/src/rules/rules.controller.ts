// src/rules/rules.controller.ts

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';

import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

@Controller('rules')
export class RulesController {
  constructor(private readonly rules: RulesService) {}

  // 1) Партнёрские продукты
  // @Get('products')
  // getProducts() {
  //     return this.rules.getProducts();
  // }

  // 2) Создать правило и сразу расписать рассылку
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateRuleDto) {
    return this.rules.createAndSchedule(dto);
  }

  // 3) CRUD: список
  @Get()
  findAll() {
    return this.rules.findAll();
  }

  // 4) CRUD: один
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rules.findOne(id);
  }

  // 5) CRUD: удалить
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.rules.remove(id);
  }

  // 6) CRUD: обновить
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRuleDto) {
    return this.rules.update(id, dto);
  }

  // 7) Аналитика: общая статистика по всем правилам
  @Get('analytics/overview')
  getAnalyticsOverview() {
    return this.rules.getAllRulesAnalytics();
  }

  // 8) Аналитика: детальная статистика по конкретному правилу
  @Get(':id/analytics')
  getRuleAnalytics(@Param('id') id: string) {
    return this.rules.getRuleAnalytics(id);
  }
}
