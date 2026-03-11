import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddThemeConfigToCompany1740007000000 implements MigrationInterface {
  name = 'AddThemeConfigToCompany1740007000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'company',
      new TableColumn({
        name: 'theme_config',
        type: 'json',
        isNullable: true,
      })
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('company', 'theme_config');
  }
}
