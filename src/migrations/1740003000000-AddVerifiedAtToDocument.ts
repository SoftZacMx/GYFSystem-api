import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Adds verified_at to document: set when signature is verified (on upload with sign, or via verify endpoint).
 * Cleared when document file is replaced (re-upload).
 */
export class AddVerifiedAtToDocument1740003000000 implements MigrationInterface {
  name = 'AddVerifiedAtToDocument1740003000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'document',
      new TableColumn({
        name: 'verified_at',
        type: 'datetime',
        isNullable: true,
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('document', 'verified_at');
  }
}
