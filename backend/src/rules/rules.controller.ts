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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateRuleDto) {
    this.logger.debug(
      'CREATE RULE - Received DTO:',
      JSON.stringify(dto, null, 2),
    );
    this.logger.debug('CREATE RULE - DTO type:', typeof dto);
    this.logger.debug('CREATE RULE - DTO constructor:', dto.constructor.name);
    return this.rules.createAndSchedule(dto);
  }

  @Get()
  findAll() {
    return this.rules.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rules.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.rules.remove(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRuleDto) {
    return this.rules.update(id, dto);
  }

  // продукты из внешней ПП (для выбора офферов/гео на фронте)
  @Get('external/products')
  getProducts(): Promise<any[]> {
    return this.rules.getProducts();
  }

  // аналитика
  @Get('analytics/overview')
  async getAnalyticsOverview() {
    return this.rules.getAllRulesAnalytics();
  }

  @Get(':id/analytics')
  async getRuleAnalytics(@Param('id') id: string) {
    return this.rules.getRuleAnalytics(id);
  }

  // Тестирование и мониторинг
  @Post(':id/test')
  async testRule(@Param('id') id: string) {
    this.logger.log(`Testing rule ${id} manually`);
    return await this.rules.testRuleExecution(id);
  }

  @Post(':id/trigger')
  async triggerRule(@Param('id') id: string) {
    this.logger.log(`Triggering rule ${id} manually`);
    return await this.rules.manualTriggerRule(id);
  }

  @Get('external/test-connection')
  async testExternalConnection() {
    return await this.rules.testExternalAPIConnection();
  }

  @Get('debug/logs/:id')
  async getRuleDebugLogs(@Param('id') id: string) {
    return await this.rules.getRuleDebugLogs(id);
  }
}
