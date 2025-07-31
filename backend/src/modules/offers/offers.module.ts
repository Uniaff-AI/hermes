import { Module } from '@nestjs/common';

import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { PhpBackendAdapter } from '@/adapters/php-backend/php-backend.adapter';
import { PhpBackendClient } from '@/adapters/php-backend/php-backend.client';

@Module({
  controllers: [OffersController],
  providers: [OffersService, PhpBackendAdapter, PhpBackendClient],
  exports: [OffersService],
})
export class OffersModule {} 