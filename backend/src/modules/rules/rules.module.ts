import { Module } from '@nestjs/common';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { ExternalApisClient } from '@/adapters/external-apis/external-apis.client';

@Module({
  controllers: [RulesController],
  providers: [RulesService, ExternalApisClient],
  exports: [RulesService],
})
export class RulesModule {}
