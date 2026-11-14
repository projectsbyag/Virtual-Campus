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
  bio?: string;
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
  maxStudents?: number;
  students?: Array<string | User>;
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
  isTeaching?: boolean;
  enrollmentCode?: string;
  allowEnrollment?: boolean;
  isArchived?: boolean;
  joinLink?: string;
  createdAt?: string;
  syllabus?: { week: number; topic: string; details: string }[];
}

export interface CourseLink {
  _id: string;
  course: string | Course;
  creator: string | User;
  token: string;
  expiresAt?: string;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  isExpired?: boolean;
  hasReachedMaxUses?: boolean;
  isValid?: boolean;
}

export interface SubmissionAttachment {
  fileName: string;
  filePath?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
}

export interface AssignmentSubmission {
  _id?: string;
  assignment?: string | Assignment;
  student: string | User;
  studentName?: string;
  studentEmail?: string;
  studentAvatar?: string;
  textContent?: string;
  attachments?: SubmissionAttachment[];
  submittedAt: string;
  status?: 'draft' | 'submitted' | 'late' | 'graded' | 'returned';
  grade?: {
    score: number;
    feedback?: string;
    gradedBy?: string;
    gradedAt?: string;
  } | number;
  feedback?: string;
  fileUrl?: string;
  fileName?: string;
  isLate?: boolean;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  pointsPossible?: number;
  totalPoints?: number;
  submissionType?: 'text' | 'file' | 'both';
  allowLateSubmissions?: boolean;
  published?: boolean;
  course: Course | string;
  courseCode?: string;
  courseName?: string;
  status: 'pending' | 'submitted' | 'graded' | 'missed';
  grade?: number;
  feedback?: string;
  mySubmission?: AssignmentSubmission | null;
  submissions?: AssignmentSubmission[];
  ungradedCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceComment {
  _id: string;
  user: string | { _id?: string; firstName: string; lastName: string; email?: string };
  content: string;
  createdAt: string;
}

export interface Resource {
  _id: string;
  title: string;
  description: string;
  type?: 'file' | 'link' | 'text' | 'video' | 'audio' | 'other';
  category?: 'lecture' | 'reading' | 'exercise' | 'assignment' | 'tutorial' | 'other';
  fileType: 'pdf' | 'slides' | 'archive' | 'doc';
  fileSize: string;
  fileUrl: string;
  link?: string;
  downloads: number;
  isPinned?: boolean;
  isVisible?: boolean;
  likes?: string[];
  comments?: ResourceComment[];
  course: Course | string;
  uploadedBy: {
    _id?: string;
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
    _id?: string;
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
  courseCode?: string;
  courseName?: string;
  author: {
    _id?: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: UserRole;
  };
  createdAt: string;
  updatedAt?: string;
  upvotes: number;
  views?: number;
  repliesCount: number;
  tags?: string[];
  solved?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
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
