import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRulesMigration1753881131195 implements MigrationInterface {
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
          },
          {
            name: 'offerId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'offerName',
            type: 'varchar',
            isNullable: false,
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
            name: 'dailyLimit',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'sendWindowStart',
            type: 'varchar',
            isNullable: false,
            comment: 'Format: HH:MM',
          },
          {
            name: 'sendWindowEnd',
            type: 'varchar',
            isNullable: false,
            comment: 'Format: HH:MM',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
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
