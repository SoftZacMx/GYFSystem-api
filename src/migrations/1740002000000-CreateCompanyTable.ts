import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Creates company table (single-tenant: one row for company info).
 */
export class CreateCompanyTable1740002000000 implements MigrationInterface {
  name = 'CreateCompanyTable1740002000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'company',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'email', type: 'varchar', length: '255' },
          { name: 'phone', type: 'varchar', length: '50', isNullable: true },
          { name: 'address', type: 'text', isNullable: true },
          { name: 'logo_url', type: 'varchar', length: '500', isNullable: true },
          { name: 'timezone', type: 'varchar', length: '50', isNullable: true },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('company', true);
  }
}
