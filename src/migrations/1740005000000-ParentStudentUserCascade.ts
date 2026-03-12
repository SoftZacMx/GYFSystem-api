import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds ON DELETE CASCADE and ON UPDATE CASCADE to parent_student.user_id -> user.id
 * so deleting a user automatically removes their parent_student associations.
 */
export class ParentStudentUserCascade1740005000000 implements MigrationInterface {
  name = 'ParentStudentUserCascade1740005000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const dbName = queryRunner.connection.options.database as string;
    const result = await queryRunner.query(
      `SELECT CONSTRAINT_NAME
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'parent_student'
         AND COLUMN_NAME = 'user_id' AND REFERENCED_TABLE_NAME = 'user'`,
      [dbName],
    );
    const rows = result as unknown as Record<string, string>[];
    const row = rows[0];
    const fkName = row ? (row.CONSTRAINT_NAME ?? row.constraint_name) : null;
    if (!fkName) {
      throw new Error('Could not find FK parent_student.user_id -> user.id');
    }
    await queryRunner.query(`ALTER TABLE \`parent_student\` DROP FOREIGN KEY \`${fkName}\``);
    await queryRunner.query(
      `ALTER TABLE \`parent_student\`
       ADD CONSTRAINT \`FK_parent_student_user_id\`
       FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`)
       ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`parent_student\` DROP FOREIGN KEY \`FK_parent_student_user_id\``,
    );
    const dbName = queryRunner.connection.options.database as string;
    await queryRunner.query(
      `ALTER TABLE \`parent_student\`
       ADD CONSTRAINT \`FK_parent_student_user_id_restored\`
       FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`)`,
    );
  }
}
