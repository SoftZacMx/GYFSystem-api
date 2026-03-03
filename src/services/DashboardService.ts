import type { IStudentRepository } from '../repositories/interfaces/IStudentRepository';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { IEventRepository } from '../repositories/interfaces/IEventRepository';
import type { IDocumentRepository } from '../repositories/interfaces/IDocumentRepository';
import type { IDocumentCategoryRepository } from '../repositories/interfaces/IDocumentCategoryRepository';

export interface DashboardStats {
  students: number;
  users: number;
  events: number;
}

export interface DashboardRecentDoc {
  id: number;
  name: string;
}

export interface DashboardChartItem {
  grade: string;
  totalStudents: number;
  studentsWithAllCategories: number;
}

export interface DashboardDto {
  stats: DashboardStats;
  recentDocs: DashboardRecentDoc[];
  chartData: DashboardChartItem[];
}

function fileNameFromUrl(url: string): string {
  try {
    const segment = url.split('/').filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : 'Documento';
  } catch {
    return 'Documento';
  }
}

export class DashboardService {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly userRepository: IUserRepository,
    private readonly eventRepository: IEventRepository,
    private readonly documentRepository: IDocumentRepository,
    private readonly documentCategoryRepository: IDocumentCategoryRepository,
  ) {}

  async getDashboard(): Promise<DashboardDto> {
    const [studentsCount, usersCount, eventsCount, categories, students, pairs, recentDocs] = await Promise.all([
      this.studentRepository.count(),
      this.userRepository.count(),
      this.eventRepository.count(),
      this.documentCategoryRepository.findAll(),
      this.studentRepository.findAll({}),
      this.documentRepository.findStudentCategoryPairs(),
      this.documentRepository.findAll({ take: 5, sortBy: 'uploadedAt', order: 'desc' }),
    ]);

    const stats: DashboardStats = {
      students: studentsCount,
      users: usersCount,
      events: eventsCount,
    };

    const recentDocsDto: DashboardRecentDoc[] = recentDocs.map((doc) => ({
      id: doc.id,
      name: fileNameFromUrl(doc.fileUrl),
    }));

    const categoryIds = new Set(categories.map((c) => c.id));
    const categoriesCount = categoryIds.size;

    const studentIdToCategories = new Map<number, Set<number>>();
    for (const { studentId, categoryId } of pairs) {
      let set = studentIdToCategories.get(studentId);
      if (!set) {
        set = new Set();
        studentIdToCategories.set(studentId, set);
      }
      set.add(categoryId);
    }

    const studentIdToComplete = new Map<number, boolean>();
    for (const student of students) {
      const studentCats = studentIdToCategories.get(student.id) ?? new Set();
      const hasAll =
        categoriesCount > 0 &&
        studentCats.size === categoriesCount &&
        [...categoryIds].every((id) => studentCats.has(id));
      studentIdToComplete.set(student.id, hasAll);
    }

    const gradeToTotal = new Map<string, number>();
    const gradeToComplete = new Map<string, number>();
    for (const student of students) {
      const grade = student.grade || 'Sin grado';
      gradeToTotal.set(grade, (gradeToTotal.get(grade) ?? 0) + 1);
      if (studentIdToComplete.get(student.id)) {
        gradeToComplete.set(grade, (gradeToComplete.get(grade) ?? 0) + 1);
      }
    }

    const chartData: DashboardChartItem[] = [...gradeToTotal.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([grade, totalStudents]) => ({
        grade,
        totalStudents,
        studentsWithAllCategories: gradeToComplete.get(grade) ?? 0,
      }));

    return {
      stats,
      recentDocs: recentDocsDto,
      chartData,
    };
  }
}
