import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { DataSource } from 'typeorm';
import { Rule } from '../../../rules/domain/rule.entity';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('🌱 Starting seed data for rules...');

    // Check if rules table exists and has data
    const rulesCount = await dataSource
      .getRepository(Rule)
      .createQueryBuilder('rule')
      .getCount();

    if (rulesCount === 0) {
      console.log('📝 No rules found, creating default rules...');

      // Create default rule
      const defaultRule = dataSource.getRepository(Rule).create({
        name: 'Default Rule',
        offerId: 'default-offer',
        offerName: 'Default Offer',
        periodMinutes: 60,
        minInterval: 30,
        maxInterval: 120,
        dailyLimit: 100,
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
