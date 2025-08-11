import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateLeadSending1754000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'lead_sending',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'ruleId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'subid',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'leadName',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'phone',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'email',
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
            type: 'enum',
            enum: ['SUCCESS', 'ERROR'],
            isNullable: false,
          },
          {
            name: 'responseStatus',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'errorDetails',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'sentAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['ruleId'],
            referencedTableName: 'rules',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('lead_sending');
  }
}
