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
  Logger,
} from '@nestjs/common';

import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

@Controller('rules')
export class RulesController {
  private readonly logger = new Logger(RulesController.name);

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
  async getAnalyticsOverview() {
    try {
      return await this.rules.getAllRulesAnalytics();
    } catch (error) {
      this.logger.error('Error getting analytics overview:', error);
      throw error;
    }
  }

  // 8) Аналитика: детальная статистика по конкретному правилу
  @Get(':id/analytics')
  async getRuleAnalytics(@Param('id') id: string) {
    try {
      return await this.rules.getRuleAnalytics(id);
    } catch (error) {
      this.logger.error(`Error getting analytics for rule ${id}:`, error);
      throw error;
    }
  }
}
