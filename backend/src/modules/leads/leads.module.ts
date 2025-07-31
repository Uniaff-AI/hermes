import { Module } from '@nestjs/common';

import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { PhpBackendAdapter } from '@/adapters/php-backend/php-backend.adapter';
import { PhpBackendClient } from '@/adapters/php-backend/php-backend.client';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, PhpBackendAdapter, PhpBackendClient],
  exports: [LeadsService],
})
export class LeadsModule {} 