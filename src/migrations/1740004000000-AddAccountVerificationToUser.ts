import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountVerificationToUser1740004000000 implements MigrationInterface {
  name = 'AddAccountVerificationToUser1740004000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`is_account_activated\` tinyint NOT NULL DEFAULT 0`
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`email_verified_at\` datetime NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`email_verified_at\``);
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`is_account_activated\``);
  }
}
