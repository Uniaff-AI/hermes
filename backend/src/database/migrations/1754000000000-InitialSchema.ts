import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitialSchema1754000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
            default: "'Unnamed rule'",
          },
          {
            name: 'productId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'productName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'periodMinutes',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'minInterval',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'maxInterval',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'dailyCapLimit',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'sendWindowStart',
            type: 'varchar',
            isNullable: true,
            comment: 'Format: HH:MM',
          },
          {
            name: 'sendWindowEnd',
            type: 'varchar',
            isNullable: true,
            comment: 'Format: HH:MM',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'isInfinite',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'vertical',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'dateFrom',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'dateTo',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('rules');
  }
}
