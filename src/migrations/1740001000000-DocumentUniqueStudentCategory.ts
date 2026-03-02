import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * One document per student per category: add UNIQUE(student_id, category_id).
 * Removes duplicate rows first, keeping the row with the latest id per (student_id, category_id).
 */
export class DocumentUniqueStudentCategory1740001000000 implements MigrationInterface {
  name = 'DocumentUniqueStudentCategory1740001000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Remove duplicates: keep one row per (student_id, category_id) with the highest id
    await queryRunner.query(`
      DELETE d1 FROM document d1
      INNER JOIN document d2
        ON d1.student_id = d2.student_id
        AND d1.category_id = d2.category_id
        AND d1.id < d2.id
    `);

    await queryRunner.query(
      'ALTER TABLE `document` ADD UNIQUE KEY `UQ_document_student_category` (`student_id`, `category_id`)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `document` DROP KEY `UQ_document_student_category`');
  }
}
