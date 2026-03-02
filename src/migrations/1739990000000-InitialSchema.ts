import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Initial schema: creates all tables from the data model (user_type, role, user,
 * student, parent_student, document_category, document, event, notification, audit_log).
 */
export class InitialSchema1739990000000 implements MigrationInterface {
  name = 'InitialSchema1739990000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_type',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '255' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'role',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '255' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'email', type: 'varchar', length: '255', isUnique: true },
          { name: 'password', type: 'varchar', length: '255' },
          { name: 'user_type_id', type: 'int' },
          { name: 'role_id', type: 'int' },
          { name: 'status', type: 'varchar', length: '50' },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
        foreignKeys: [
          { columnNames: ['user_type_id'], referencedTableName: 'user_type', referencedColumnNames: ['id'] },
          { columnNames: ['role_id'], referencedTableName: 'role', referencedColumnNames: ['id'] },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'student',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'full_name', type: 'varchar', length: '255' },
          { name: 'curp', type: 'varchar', length: '18', isUnique: true },
          { name: 'grade', type: 'varchar', length: '50' },
          { name: 'status', type: 'varchar', length: '50' },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'parent_student',
        columns: [
          { name: 'user_id', type: 'int', isPrimary: true },
          { name: 'student_id', type: 'int', isPrimary: true },
        ],
        foreignKeys: [
          { columnNames: ['user_id'], referencedTableName: 'user', referencedColumnNames: ['id'] },
          { columnNames: ['student_id'], referencedTableName: 'student', referencedColumnNames: ['id'] },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'document_category',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'description', type: 'text', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'document',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'student_id', type: 'int' },
          { name: 'category_id', type: 'int' },
          { name: 'uploaded_by', type: 'int' },
          { name: 'file_url', type: 'varchar', length: '500' },
          { name: 'uploaded_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'signature_hash', type: 'varchar', length: '255', isNullable: true },
          { name: 'deleted_at', type: 'datetime', isNullable: true },
        ],
        foreignKeys: [
          { columnNames: ['student_id'], referencedTableName: 'student', referencedColumnNames: ['id'] },
          { columnNames: ['category_id'], referencedTableName: 'document_category', referencedColumnNames: ['id'] },
          { columnNames: ['uploaded_by'], referencedTableName: 'user', referencedColumnNames: ['id'] },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'event',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'created_by', type: 'int' },
          { name: 'title', type: 'varchar', length: '255' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'event_date', type: 'datetime' },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
        ],
        foreignKeys: [
          { columnNames: ['created_by'], referencedTableName: 'user', referencedColumnNames: ['id'] },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'notification',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_id', type: 'int' },
          { name: 'message', type: 'text' },
          { name: 'type', type: 'varchar', length: '50' },
          { name: 'is_read', type: 'tinyint', default: 0 },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'document_id', type: 'int', isNullable: true },
          { name: 'event_id', type: 'int', isNullable: true },
        ],
        foreignKeys: [
          { columnNames: ['user_id'], referencedTableName: 'user', referencedColumnNames: ['id'] },
          { columnNames: ['document_id'], referencedTableName: 'document', referencedColumnNames: ['id'] },
          { columnNames: ['event_id'], referencedTableName: 'event', referencedColumnNames: ['id'] },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'audit_log',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'user_id', type: 'int', isNullable: true },
          { name: 'action', type: 'varchar', length: '100' },
          { name: 'entity_type', type: 'varchar', length: '50' },
          { name: 'entity_id', type: 'int', isNullable: true },
          { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
          { name: 'ip', type: 'varchar', length: '45', isNullable: true },
        ],
        foreignKeys: [
          { columnNames: ['user_id'], referencedTableName: 'user', referencedColumnNames: ['id'] },
        ],
      }),
      true,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_log', true);
    await queryRunner.dropTable('notification', true);
    await queryRunner.dropTable('event', true);
    await queryRunner.dropTable('document', true);
    await queryRunner.dropTable('document_category', true);
    await queryRunner.dropTable('parent_student', true);
    await queryRunner.dropTable('student', true);
    await queryRunner.dropTable('user', true);
    await queryRunner.dropTable('role', true);
    await queryRunner.dropTable('user_type', true);
  }
}
