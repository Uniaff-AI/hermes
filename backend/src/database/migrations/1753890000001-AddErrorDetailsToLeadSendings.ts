import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddErrorDetailsToLeadSendings1715028537218
  implements MigrationInterface
{
  name = 'AddErrorDetailsToLeadSendings1715028537218';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "lead_sendings" 
      ADD COLUMN "errorDetails" text
    `);

    await queryRunner.query(`
      ALTER TABLE "lead_sendings" 
      RENAME COLUMN "createdAt" TO "sentAt"
    `);

    await queryRunner.query(`
      ALTER TABLE "lead_sendings" 
      DROP COLUMN "updatedAt"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "lead_sendings" 
      DROP COLUMN "errorDetails"
    `);

    await queryRunner.query(`
      ALTER TABLE "lead_sendings" 
      RENAME COLUMN "sentAt" TO "createdAt"
    `);

    await queryRunner.query(`
      ALTER TABLE "lead_sendings" 
      ADD COLUMN "updatedAt" timestamp without time zone NOT NULL DEFAULT now()
    `);
  }
}
