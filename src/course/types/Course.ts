export class Course {
  id: number;
  name: string;
  semester: number;

  constructor(course: {
    id?: number;
    name?: string;
    semester?: number;
  }) {
    this.id = course.id || 0;
    this.name = course.name || '';
    this.semester = course.semester || 0;
  }
}