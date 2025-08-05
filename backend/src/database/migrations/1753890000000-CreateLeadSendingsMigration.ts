import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateLeadSendingsMigration1753890000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'lead_sendings',
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
            enum: ['success', 'error'],
            isNullable: false,
          },
          {
            name: 'errorDetails',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'responseStatus',
            type: 'int',
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
        indices: [
          {
            name: 'IDX_lead_sendings_rule_id',
            columnNames: ['ruleId'],
          },
          {
            name: 'IDX_lead_sendings_status',
            columnNames: ['status'],
          },
          {
            name: 'IDX_lead_sendings_sent_at',
            columnNames: ['sentAt'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('lead_sendings');
  }
}
