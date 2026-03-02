import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Change signature_hash from varchar(255) to TEXT to store RSA digital signatures (base64 ~344 chars).
 */
export class SignatureHashToText1740000000000 implements MigrationInterface {
  name = 'SignatureHashToText1740000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `document` CHANGE COLUMN `signature_hash` `signature_hash` TEXT NULL',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `document` CHANGE COLUMN `signature_hash` `signature_hash` VARCHAR(255) NULL',
    );
  }
}
