import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { DataSource } from 'typeorm';
import { Rule } from '../../../rules/domain/rule.entity';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('🌱 Starting seed data for rules...');

    const rulesCount = await dataSource
      .getRepository(Rule)
      .createQueryBuilder('rule')
      .getCount();

    if (rulesCount === 0) {
      console.log('📝 No rules found, creating default rules...');

      const defaultRule = dataSource.getRepository(Rule).create({
        name: 'Default Rule',
        targetProductId: 'default-product',
        targetProductName: 'Default Product',
        minIntervalMinutes: 30,
        maxIntervalMinutes: 120,
        dailyCapLimit: 100,
        sendWindowStart: '09:00',
        sendWindowEnd: '18:00',
        isActive: true,
      });

      await dataSource.getRepository(Rule).save(defaultRule);
      console.log('✅ Default rule created successfully');
    } else {
      console.log(`ℹ️ Found ${rulesCount} existing rules, skipping seed`);
    }

    console.log('🎉 Seed data completed successfully');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await app.close();
  }
};

void runSeed();
