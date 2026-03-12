import type { MigrationInterface, QueryRunner } from 'typeorm';

type FkSpec = {
  table: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
  constraintName: string;
};

const FKS: FkSpec[] = [
  { table: 'user', column: 'user_type_id', referencedTable: 'user_type', referencedColumn: 'id', constraintName: 'FK_user_user_type_id' },
  { table: 'user', column: 'role_id', referencedTable: 'role', referencedColumn: 'id', constraintName: 'FK_user_role_id' },
  { table: 'parent_student', column: 'user_id', referencedTable: 'user', referencedColumn: 'id', constraintName: 'FK_parent_student_user_id' },
  { table: 'parent_student', column: 'student_id', referencedTable: 'student', referencedColumn: 'id', constraintName: 'FK_parent_student_student_id' },
  { table: 'document', column: 'student_id', referencedTable: 'student', referencedColumn: 'id', constraintName: 'FK_document_student_id' },
  { table: 'document', column: 'category_id', referencedTable: 'document_category', referencedColumn: 'id', constraintName: 'FK_document_category_id' },
  { table: 'document', column: 'uploaded_by', referencedTable: 'user', referencedColumn: 'id', constraintName: 'FK_document_uploaded_by' },
  { table: 'event', column: 'created_by', referencedTable: 'user', referencedColumn: 'id', constraintName: 'FK_event_created_by' },
  { table: 'notification', column: 'user_id', referencedTable: 'user', referencedColumn: 'id', constraintName: 'FK_notification_user_id' },
  { table: 'notification', column: 'document_id', referencedTable: 'document', referencedColumn: 'id', constraintName: 'FK_notification_document_id' },
  { table: 'notification', column: 'event_id', referencedTable: 'event', referencedColumn: 'id', constraintName: 'FK_notification_event_id' },
  { table: 'audit_log', column: 'user_id', referencedTable: 'user', referencedColumn: 'id', constraintName: 'FK_audit_log_user_id' },
];

/**
 * Puts all foreign keys in CASCADE: ON DELETE CASCADE and ON UPDATE CASCADE.
 * Run this after InitialSchema (and any other schema migrations) so that
 * every relation ends with CASCADE and deletes never hit FK constraint errors.
 */
export class AllForeignKeysCascade1740006000000 implements MigrationInterface {
  name = 'AllForeignKeysCascade1740006000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const dbName = queryRunner.connection.options.database as string;

    for (const fk of FKS) {
      const result = await queryRunner.query(
        `SELECT CONSTRAINT_NAME
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
           AND REFERENCED_TABLE_NAME = ? AND REFERENCED_COLUMN_NAME = ?`,
        [dbName, fk.table, fk.column, fk.referencedTable, fk.referencedColumn],
      );
      const rows = result as Record<string, string>[];
      const row = rows[0];
      const currentName = row ? (row.CONSTRAINT_NAME ?? row.constraint_name) : null;
      if (!currentName) {
        throw new Error(`Could not find FK ${fk.table}.${fk.column} -> ${fk.referencedTable}.${fk.referencedColumn}`);
      }
      await queryRunner.query(
        `ALTER TABLE \`${fk.table}\` DROP FOREIGN KEY \`${currentName}\``,
      );
      await queryRunner.query(
        `ALTER TABLE \`${fk.table}\`
         ADD CONSTRAINT \`${fk.constraintName}\`
         FOREIGN KEY (\`${fk.column}\`) REFERENCES \`${fk.referencedTable}\`(\`${fk.referencedColumn}\`)
         ON DELETE CASCADE ON UPDATE CASCADE`,
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const fk of FKS) {
      await queryRunner.query(
        `ALTER TABLE \`${fk.table}\` DROP FOREIGN KEY \`${fk.constraintName}\``,
      );
      await queryRunner.query(
        `ALTER TABLE \`${fk.table}\`
         ADD CONSTRAINT \`${fk.constraintName}_restored\`
         FOREIGN KEY (\`${fk.column}\`) REFERENCES \`${fk.referencedTable}\`(\`${fk.referencedColumn}\`)`,
      );
    }
  }
}
