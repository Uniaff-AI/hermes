import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCleanRulesSchema1754000000001 implements MigrationInterface {
  name = 'CreateCleanRulesSchema1754000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "lead_sending_status_enum" AS ENUM(
        'SUCCESS', 
        'ERROR', 
        'PENDING', 
        'RETRY'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "rules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(200) NOT NULL DEFAULT 'Unnamed rule',
        "isActive" boolean NOT NULL DEFAULT true,
        "dailyCapLimit" integer NOT NULL DEFAULT 100,
        "leadStatus" varchar(50),
        "leadVertical" varchar(100),
        "leadCountry" varchar(10),
        "leadAffiliate" varchar(100),
        "leadDateFrom" date,
        "leadDateTo" date,
        "targetProductId" varchar(50) NOT NULL,
        "targetProductName" varchar(200) NOT NULL,
        "targetProductVertical" varchar(100),
        "targetProductCountry" varchar(10),
        "targetProductAffiliate" varchar(100),
        "minIntervalMinutes" integer NOT NULL DEFAULT 5,
        "maxIntervalMinutes" integer NOT NULL DEFAULT 15,
        "isInfinite" boolean NOT NULL DEFAULT false,
        "sendWindowStart" time,
        "sendWindowEnd" time,
        "sendDateFrom" date,
        "sendDateTo" date,
        "useEmail" boolean NOT NULL DEFAULT false,
        "usePhone" boolean NOT NULL DEFAULT false,
        "useRedirect" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_rules" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "lead_sending" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ruleId" uuid NOT NULL,
        "leadSubid" varchar(100) NOT NULL,
        "leadName" varchar(200) NOT NULL,
        "leadPhone" varchar(50) NOT NULL,
        "leadEmail" varchar(255),
        "leadCountry" varchar(10),
        "targetProductId" varchar(50) NOT NULL,
        "targetProductName" varchar(200) NOT NULL,
        "status" "lead_sending_status_enum" NOT NULL,
        "responseStatus" integer,
        "errorDetails" text,
        "externalResponseId" varchar(100),
        "sentAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "attemptNumber" integer NOT NULL DEFAULT 1,
        "responseTimeMs" integer,
        CONSTRAINT "PK_lead_sending" PRIMARY KEY ("id"),
        CONSTRAINT "FK_lead_sending_rule" FOREIGN KEY ("ruleId") REFERENCES "rules"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_rules_isActive_createdAt" ON "rules" ("isActive", "createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_rules_leadStatus_leadCountry" ON "rules" ("leadStatus", "leadCountry")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_rules_isActive" ON "rules" ("isActive")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_rules_leadStatus" ON "rules" ("leadStatus")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_rules_leadCountry" ON "rules" ("leadCountry")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_rules_targetProductId" ON "rules" ("targetProductId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_rules_createdAt" ON "rules" ("createdAt")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_lead_sending_ruleId_sentAt" ON "lead_sending" ("ruleId", "sentAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_lead_sending_status_sentAt" ON "lead_sending" ("status", "sentAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_lead_sending_targetProductId_sentAt" ON "lead_sending" ("targetProductId", "sentAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_lead_sending_ruleId" ON "lead_sending" ("ruleId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_lead_sending_status" ON "lead_sending" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_lead_sending_sentAt" ON "lead_sending" ("sentAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_lead_sending_targetProductId" ON "lead_sending" ("targetProductId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('lead_sending');
    await queryRunner.dropTable('rules');
    await queryRunner.query(`DROP TYPE IF EXISTS "lead_sending_status_enum"`);
  }
}
