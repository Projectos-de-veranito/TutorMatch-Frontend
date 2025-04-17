export type UserRole = 'student' | 'tutor' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'deleted';

export class User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  semesterNumber: number;
  academicYear: string;
  phone?: string;
  bio: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: {
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
    role?: UserRole;
    status?: UserStatus;
    semesterNumber?: number;
    academicYear?: string;
    phone?: string;
    bio?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = user.id || 0;
    this.firstName = (user.firstName || '').trim();
    this.lastName = (user.lastName || '').trim();
    this.email = (user.email || '').trim();
    this.avatar = user.avatar || undefined;
    this.role = user.role || 'student';
    this.status = user.status || 'active';
    this.semesterNumber = user.semesterNumber || 1;
    this.academicYear = (user.academicYear || '').trim();
    this.phone = user.phone || undefined;
    this.bio = (user.bio || '').trim();
    this.createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
    this.updatedAt = user.updatedAt ? new Date(user.updatedAt) : new Date();
  }
}