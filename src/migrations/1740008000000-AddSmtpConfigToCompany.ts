import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSmtpConfigToCompany1740008000000 implements MigrationInterface {
  name = 'AddSmtpConfigToCompany1740008000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'company',
      new TableColumn({ name: 'smtp_host', type: 'varchar', length: 255, isNullable: true })
    );
    await queryRunner.addColumn(
      'company',
      new TableColumn({ name: 'smtp_port', type: 'int', isNullable: true })
    );
    await queryRunner.addColumn(
      'company',
      new TableColumn({ name: 'smtp_user', type: 'varchar', length: '255', isNullable: true })
    );
    await queryRunner.addColumn(
      'company',
      new TableColumn({ name: 'smtp_pass', type: 'text', isNullable: true })
    );
    await queryRunner.addColumn(
      'company',
      new TableColumn({ name: 'smtp_from', type: 'varchar', length: '255', isNullable: true })
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('company', 'smtp_from');
    await queryRunner.dropColumn('company', 'smtp_pass');
    await queryRunner.dropColumn('company', 'smtp_user');
    await queryRunner.dropColumn('company', 'smtp_port');
    await queryRunner.dropColumn('company', 'smtp_host');
  }
}
