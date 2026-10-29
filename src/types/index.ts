export const DEFAULT_AVATAR = '/assets/aistudio/image_f8b7b7a6.png';

export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  name?: string; // alias
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  avatar?: string;
  matricNumber?: string;
  enrolledCourses?: string[];
}

export interface Course {
  _id: string;
  name: string;
  title?: string; // alias
  code: string;
  description: string;
  color?: string;
  creditUnits?: number;
  studentsCount?: number;
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  department?: string;
  semester?: string;
  isEnrolled?: boolean;
  syllabus?: { week: number; topic: string; details: string }[];
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  totalPoints?: number;
  course: Course | string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  submissions?: { student: string | User; submittedAt: string; fileUrl?: string }[];
}

export interface Resource {
  _id: string;
  title: string;
  description: string;
  fileType: 'pdf' | 'slides' | 'archive' | 'doc';
  fileSize: string;
  fileUrl: string;
  downloads: number;
  course: Course | string;
  uploadedBy: {
    firstName: string;
    lastName: string;
    role: string;
  };
  createdAt: string;
  tags: string[];
}

export interface DiscussionReply {
  _id: string;
  author: {
    firstName: string;
    lastName: string;
    avatar?: string;
    role: UserRole;
  };
  content: string;
  createdAt: string;
  upvotes: number;
  isAnswer?: boolean;
}

export interface Discussion {
  _id: string;
  title: string;
  content: string;
  course: Course | string;
  author: {
    firstName: string;
    lastName: string;
    avatar?: string;
    role: UserRole;
  };
  createdAt: string;
  upvotes: number;
  repliesCount: number;
  tags?: string[];
  solved?: boolean;
  isAnnouncement?: boolean;
  replies?: DiscussionReply[];
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  course?: Course | string;
  courseName?: string;
  sender?: {
    firstName: string;
    lastName: string;
    role: string;
  };
  senderName?: string;
  senderRole?: string;
  priority: 'urgent' | 'normal' | 'info';
  createdAt?: string;
  date?: string;
}

export interface CampusAIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: { title: string; course: string; type: string }[];
  suggestedQuestions?: string[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export type ActiveView = 
  | 'landing'
  | 'dashboard' 
  | 'courses' 
  | 'course-detail'
  | 'assignments' 
  | 'resources' 
  | 'resource-detail'
  | 'discussions' 
  | 'discussion-detail'
  | 'announcements' 
  | 'campus-ai' 
  | 'profile'
  | 'settings'
  | 'login'
  | 'signup';

export type ActiveTab = ActiveView;
