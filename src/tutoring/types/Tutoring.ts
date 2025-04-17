const defaultImageUrl = 'https://i0.wp.com/port2flavors.com/wp-content/uploads/2022/07/placeholder-614.png';

export class TutoringSession {
  id: number;
  tutorId: number;
  studentId: number;
  courseId?: number;
  title: string;
  description?: string;
  price: number;
  whatTheyWillLearn: string[];
  imageUrl: string;
  materials?: TutoringMaterial[];
  feedback?: TutoringReview[];
  availableTimes: { 
    dayOfWeek: number,            // 0-6 (domingo-sábado)
    availableHours: {
      start: string,              // Formato "HH:MM" 
      end: string,                // Formato "HH:MM"
    }[]
  }[];
  createdAt: Date;
  updatedAt: Date;

  constructor(tutoringSession: {
    id?: number;
    tutorId?: number;
    studentId?: number;
    courseId?: number;
    title?: string;
    description?: string;
    price?: number;
    whatTheyWillLearn?: string[];
    imageUrl?: string;
    materials?: TutoringMaterial[];
    feedback?: TutoringReview[];
    // Parámetro para los horarios disponibles
    availableTimes?: { 
      dayOfWeek: number, 
      availableHours: {
        start: string,
        end: string,
      }[]
    }[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = tutoringSession.id || 0;
    this.tutorId = tutoringSession.tutorId || 0;
    this.studentId = tutoringSession.studentId || 0;
    this.courseId = tutoringSession.courseId || 0;
    this.title = (tutoringSession.title || '').trim();
    this.description = (tutoringSession.description || '').trim();
    this.price = tutoringSession.price || 0;
    this.whatTheyWillLearn = (tutoringSession.whatTheyWillLearn || []).map(item => item.trim());
    this.imageUrl = tutoringSession.imageUrl || defaultImageUrl;
    this.materials = tutoringSession.materials || [];
    this.feedback = tutoringSession.feedback || [];
    // Inicialización de los horarios disponibles
    this.availableTimes = (tutoringSession.availableTimes || []).map(day => ({
      dayOfWeek: day.dayOfWeek,
      availableHours: (day.availableHours || []).map(hour => ({
        start: hour.start,
        end: hour.end,
      }))
    }));
    this.createdAt = tutoringSession.createdAt ? new Date(tutoringSession.createdAt) : new Date();
    this.updatedAt = tutoringSession.updatedAt ? new Date(tutoringSession.updatedAt) : new Date();
  }
}

export class TutoringMaterial {
  id: number;
  tutoringId: number;
  title: string;
  description?: string;
  type: 'document' | 'video' | 'link' | 'image' | 'code';
  url: string;
  size?: number;
  uploadedBy: string | number;
  createdAt: Date;
  updatedAt: Date;

  constructor(tutoringMaterial: {
    id?: number;
    tutoringId?: number;
    title?: string;
    description?: string;
    type?: 'document' | 'video' | 'link' | 'image' | 'code';
    url?: string;
    size?: number;
    uploadedBy?: string | number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = tutoringMaterial.id || 0;
    this.tutoringId = tutoringMaterial.tutoringId || 0;
    this.title = (tutoringMaterial.title || '').trim();
    this.description = (tutoringMaterial.description || '').trim();
    this.type = tutoringMaterial.type || 'document';
    this.url = (tutoringMaterial.url || '').trim();
    this.size = tutoringMaterial.size || 0;
    this.uploadedBy = tutoringMaterial.uploadedBy || 0;
    this.createdAt = tutoringMaterial.createdAt ? new Date(tutoringMaterial.createdAt) : new Date();
    this.updatedAt = tutoringMaterial.updatedAt ? new Date(tutoringMaterial.updatedAt) : new Date();
  }
}

export class TutoringReview {
  id: number;
  tutoringId: number;
  studentId: number;
  rating: number;
  comment: string;
  likes?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(tutoringReview: {
    id?: number;
    tutoringId?: number;
    studentId?: number;
    rating?: number;
    comment?: string;
    likes?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = tutoringReview.id || 0;
    this.tutoringId = tutoringReview.tutoringId || 0;
    this.studentId = tutoringReview.studentId || 0;
    this.rating = tutoringReview.rating || 0;
    this.comment = (tutoringReview.comment || '').trim();
    this.likes = tutoringReview.likes || 0;
    this.createdAt = tutoringReview.createdAt ? new Date(tutoringReview.createdAt) : new Date();
    this.updatedAt = tutoringReview.updatedAt ? new Date(tutoringReview.updatedAt) : new Date();
  }
}
