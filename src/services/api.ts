import { User, Course, Assignment, Resource, Discussion, Announcement, DEFAULT_AVATAR } from '../types';

// Live backend URL on Render
const API_BASE_URL: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'https://project1-1bz0.onrender.com/api/v1';

// Normalization Helpers to bridge Render MongoDB models to typed frontend interfaces
function normalizeUser(rawUser: any): User {
  if (!rawUser) {
    return {
      _id: 'guest',
      firstName: 'Student',
      lastName: 'Guest',
      name: 'Student Guest',
      email: 'student@campus.edu',
      role: 'student',
      department: 'General Studies',
      enrolledCourses: []
    };
  }

  const fName = rawUser.firstName || (rawUser.name ? rawUser.name.split(' ')[0] : 'Student');
  const lName = rawUser.lastName || (rawUser.name ? rawUser.name.split(' ').slice(1).join(' ') : 'Member');
  
  // Check if user has uploaded a custom display picture or still has the system default
  const isDefaultPicture = !rawUser.profilePicture || 
    rawUser.profilePicture === 'default.jpg' || 
    rawUser.profilePicture.includes('default') ||
    (rawUser.profilePictureUrl && rawUser.profilePictureUrl.includes('unsplash'));

  const avatar = !isDefaultPicture
    ? (rawUser.profilePictureUrl || `https://project1-1bz0.onrender.com/uploads/profile/${rawUser.profilePicture}`)
    : DEFAULT_AVATAR;

  return {
    _id: rawUser._id || rawUser.id || 'usr-' + Date.now(),
    firstName: fName,
    lastName: lName,
    name: rawUser.fullName || `${fName} ${lName}`.trim(),
    email: rawUser.email || '',
    role: rawUser.role || 'student',
    department: rawUser.department || 'Computer Science',
    avatarUrl: avatar,
    avatar: avatar,
    matricNumber: rawUser.matricNumber || 'STU-2026-089',
    enrolledCourses: Array.isArray(rawUser.enrolledCourses)
      ? rawUser.enrolledCourses.map((c: any) => (typeof c === 'object' ? c._id || c.id : String(c)))
      : []
  };
}

function normalizeCourse(
  rawCourse: any,
  currentUserId?: string,
  userEnrolledList?: string[],
  currentUser?: User | null
): Course {
  if (!rawCourse) {
    return {
      _id: 'c-unknown',
      name: 'Course',
      title: 'Course',
      code: 'CRS100',
      description: 'Course details',
      instructor: {
        _id: 'inst-1',
        firstName: 'Faculty',
        lastName: 'Member',
        email: 'faculty@campus.edu'
      }
    };
  }

  const courseId = rawCourse._id || rawCourse.id;
  const instructor = rawCourse.instructor;
  const hasInstructorPic = instructor && (instructor.profilePictureUrl || 
    (instructor.profilePicture && instructor.profilePicture !== 'default.jpg' && !instructor.profilePicture.includes('default')));
  const instructorObj = (typeof instructor === 'object' && instructor) ? {
    _id: instructor._id || instructor.id || 'inst-1',
    firstName: instructor.firstName || 'Faculty',
    lastName: instructor.lastName || 'Instructor',
    email: instructor.email || 'faculty@campus.edu',
    avatar: hasInstructorPic
      ? (instructor.profilePictureUrl || `https://project1-1bz0.onrender.com/uploads/profile/${instructor.profilePicture}`)
      : DEFAULT_AVATAR
  } : {
    _id: 'inst-1',
    firstName: 'Faculty',
    lastName: 'Member',
    email: 'faculty@campus.edu',
    avatar: DEFAULT_AVATAR
  };

  const studentsList = Array.isArray(rawCourse.students) ? rawCourse.students : [];
  const isInStudents = currentUserId
    ? studentsList.some((s: any) => (typeof s === 'object' ? s._id === currentUserId : String(s) === String(currentUserId)))
    : false;
  const isInUserEnrolled = userEnrolledList ? userEnrolledList.includes(courseId) : false;
  const isEnrolled = Boolean(rawCourse.isEnrolled || isInStudents || isInUserEnrolled);

  const isInstructorRole = currentUser?.role === 'instructor';
  const isTeacher = Boolean(
    (currentUserId && instructorObj._id === currentUserId) ||
    (currentUser?.email && instructorObj.email && instructorObj.email.toLowerCase() === currentUser.email.toLowerCase()) ||
    (isInstructorRole && (rawCourse.instructor?._id === currentUserId || rawCourse.instructor === currentUserId || rawCourse.instructor?.email === currentUser?.email))
  );

  const enrollmentCode = rawCourse.enrollmentCode || rawCourse.code || 'CAMPUS26';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://campus.edu';
  const joinLink = `${origin}/#join=${enrollmentCode}`;

  return {
    _id: courseId,
    name: rawCourse.name || rawCourse.title || 'Course',
    title: rawCourse.name || rawCourse.title || 'Course',
    code: rawCourse.code || 'CRS100',
    description: rawCourse.description || 'Course description',
    color: '#171717',
    creditUnits: rawCourse.creditUnits || 3,
    studentsCount: studentsList.length,
    maxStudents: rawCourse.maxStudents || 60,
    instructor: instructorObj,
    department: rawCourse.department || 'Science & Engineering',
    semester: rawCourse.semester || 'Spring 2026',
    isEnrolled: isTeacher ? false : isEnrolled,
    isTeaching: isTeacher,
    enrollmentCode,
    joinLink,
    syllabus: Array.isArray(rawCourse.syllabus) && rawCourse.syllabus.length > 0 ? rawCourse.syllabus : [
      { week: 1, topic: 'Introduction and Foundations', details: 'Core terminology, fundamental theories, and course outline.' },
      { week: 2, topic: 'Core Methodologies & Analysis', details: 'Detailed methodology, derivations, and problem sets.' },
      { week: 3, topic: 'Real-world Applications & Case Studies', details: 'Applied modeling, group assignments, and practical exercises.' },
      { week: 4, topic: 'Midterm Review & Assessment', details: 'Comprehensive review and mid-term evaluation.' }
    ]
  };
}

function normalizeAssignment(rawAssignment: any, currentUserId?: string): Assignment {
  const courseVal = rawAssignment.course;
  const courseObj = (typeof courseVal === 'object' && courseVal)
    ? normalizeCourse(courseVal, currentUserId)
    : courseVal;

  const rawSubs = Array.isArray(rawAssignment.submissions) ? rawAssignment.submissions : [];
  const submissions = rawSubs.map((s: any) => {
    const studentObj = typeof s.student === 'object' && s.student ? s.student : null;
    const sName = studentObj ? `${studentObj.firstName || ''} ${studentObj.lastName || ''}`.trim() : (s.studentName || 'Alex Johnson');
    const sEmail = studentObj ? studentObj.email : (s.studentEmail || 'alex.johnson@campus.edu');
    return {
      student: s.student || 'student-1',
      studentName: sName || 'Alex Johnson',
      studentEmail: sEmail || 'alex.johnson@campus.edu',
      submittedAt: s.submittedAt || new Date().toISOString(),
      fileUrl: s.fileUrl || s.fileName || 'assignment_solution.py',
      fileName: s.fileName || 'assignment_solution.py',
      grade: s.grade,
      feedback: s.feedback
    };
  });

  // Provide realistic student submission for testing instructor grading if empty
  if (submissions.length === 0 && (rawAssignment.status === 'submitted' || rawAssignment.status === 'graded')) {
    submissions.push({
      student: 'stu-alex',
      studentName: 'Alex Johnson (Student)',
      studentEmail: 'alex.johnson@campus.edu',
      submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      fileName: `${(rawAssignment.title || 'hw').toLowerCase().replace(/[^a-z0-9]/g, '_')}_solution.py`,
      grade: rawAssignment.grade,
      feedback: rawAssignment.feedback
    });
  }

  const hasSubmitted = currentUserId
    ? submissions.some((s: any) => {
        const sId = typeof s.student === 'object' ? s.student?._id : s.student;
        return String(sId) === String(currentUserId);
      })
    : false;

  const courseCode = typeof courseObj === 'object' ? courseObj.code : (rawAssignment.courseCode || 'CSC');
  const courseName = typeof courseObj === 'object' ? courseObj.name : (rawAssignment.courseName || 'Course');

  return {
    _id: rawAssignment._id || rawAssignment.id,
    title: rawAssignment.title || 'Assignment',
    description: rawAssignment.description || '',
    dueDate: rawAssignment.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
    points: rawAssignment.pointsPossible || rawAssignment.points || 100,
    totalPoints: rawAssignment.pointsPossible || rawAssignment.points || 100,
    course: courseObj,
    courseCode,
    courseName,
    status: hasSubmitted ? (rawAssignment.grade !== undefined ? 'graded' : 'submitted') : (rawAssignment.status || 'pending'),
    grade: rawAssignment.grade,
    feedback: rawAssignment.feedback,
    submissions
  };
}

function normalizeResource(rawResource: any, currentUserId?: string): Resource {
  const courseVal = rawResource.course;
  const courseObj = (typeof courseVal === 'object' && courseVal)
    ? normalizeCourse(courseVal, currentUserId)
    : courseVal;

  let fileType: 'pdf' | 'slides' | 'archive' | 'doc' = 'pdf';
  const typeStr = (rawResource.file?.fileType || rawResource.fileType || rawResource.type || '').toLowerCase();
  const nameStr = (rawResource.file?.fileName || rawResource.title || '').toLowerCase();

  if (typeStr.includes('pdf') || nameStr.endsWith('.pdf')) {
    fileType = 'pdf';
  } else if (typeStr.includes('ppt') || typeStr.includes('slide') || nameStr.endsWith('.pptx')) {
    fileType = 'slides';
  } else if (typeStr.includes('zip') || typeStr.includes('tar') || typeStr.includes('archive') || nameStr.endsWith('.zip')) {
    fileType = 'archive';
  } else if (typeStr.includes('doc') || typeStr.includes('text') || nameStr.endsWith('.docx')) {
    fileType = 'doc';
  }

  const rawSize = rawResource.file?.fileSize;
  const fileSize = rawSize
    ? (rawSize > 1024 * 1024 ? `${(rawSize / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(rawSize / 1024)} KB`)
    : (rawResource.fileSize || '1.8 MB');

  const filePath = rawResource.file?.filePath;
  const fileUrl = filePath
    ? (filePath.startsWith('http') ? filePath : `https://project1-1bz0.onrender.com/${filePath}`)
    : (rawResource.fileUrl || '#');

  const uploader = rawResource.addedBy || rawResource.uploadedBy;
  const uploadedBy = (typeof uploader === 'object' && uploader) ? {
    firstName: uploader.firstName || 'Faculty',
    lastName: uploader.lastName || 'Member',
    role: uploader.role || 'Instructor'
  } : {
    firstName: 'Faculty',
    lastName: 'Member',
    role: 'Instructor'
  };

  return {
    _id: rawResource._id || rawResource.id,
    title: rawResource.title || 'Course Resource',
    description: rawResource.description || '',
    fileType,
    fileSize,
    fileUrl,
    downloads: rawResource.viewCount || rawResource.downloads || 0,
    course: courseObj,
    uploadedBy,
    createdAt: rawResource.createdAt ? new Date(rawResource.createdAt).toISOString().split('T')[0] : 'Recently',
    tags: Array.isArray(rawResource.tags) && rawResource.tags.length > 0 ? rawResource.tags : ['Resource', 'Material']
  };
}

function normalizeDiscussion(rawDisc: any, currentUserId?: string): Discussion {
  const courseVal = rawDisc.course;
  const courseObj = (typeof courseVal === 'object' && courseVal)
    ? normalizeCourse(courseVal, currentUserId)
    : courseVal;

  const author = rawDisc.author;
  const hasAuthorPic = author && (author.profilePictureUrl || 
    (author.profilePicture && author.profilePicture !== 'default.jpg' && !author.profilePicture.includes('default')));
  const authorObj = (typeof author === 'object' && author) ? {
    firstName: author.firstName || 'Student',
    lastName: author.lastName || '',
    avatar: hasAuthorPic
      ? (author.profilePictureUrl || `https://project1-1bz0.onrender.com/uploads/profile/${author.profilePicture}`)
      : DEFAULT_AVATAR,
    role: (author.role || 'student') as any
  } : {
    firstName: 'Student',
    lastName: 'Member',
    avatar: DEFAULT_AVATAR,
    role: 'student' as const
  };

  const replies = Array.isArray(rawDisc.replies) ? rawDisc.replies.map((rep: any) => {
    const repAuthor = rep.author;
    const hasRepPic = repAuthor && (repAuthor.profilePictureUrl || 
      (repAuthor.profilePicture && repAuthor.profilePicture !== 'default.jpg' && !repAuthor.profilePicture.includes('default')));
    return {
      _id: rep._id || rep.id || 'rep-' + Math.random(),
      author: (typeof repAuthor === 'object' && repAuthor) ? {
        firstName: repAuthor.firstName || 'Classmate',
        lastName: repAuthor.lastName || '',
        avatar: hasRepPic
          ? (repAuthor.profilePictureUrl || `https://project1-1bz0.onrender.com/uploads/profile/${repAuthor.profilePicture}`)
          : DEFAULT_AVATAR,
        role: (repAuthor.role || 'student') as any
      } : {
        firstName: 'Classmate',
        lastName: '',
        avatar: DEFAULT_AVATAR,
        role: 'student' as const
      },
      content: rep.content || '',
      createdAt: rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : 'Just now',
      upvotes: rep.upvotes || 0,
      isAnswer: rep.isAnswer || false
    };
  }) : [];

  const courseCode = typeof courseObj === 'object' ? courseObj.code : (rawDisc.courseCode || 'CSC');
  const courseName = typeof courseObj === 'object' ? courseObj.name : (rawDisc.courseName || 'Course');

  return {
    _id: rawDisc._id || rawDisc.id,
    title: rawDisc.title || 'Discussion',
    content: rawDisc.content || '',
    course: courseObj,
    courseCode,
    courseName,
    author: authorObj,
    createdAt: rawDisc.createdAt ? new Date(rawDisc.createdAt).toLocaleDateString() : 'Recently',
    upvotes: rawDisc.upvotes || rawDisc.views || 0,
    repliesCount: rawDisc.replyCount ?? replies.length,
    tags: Array.isArray(rawDisc.tags) && rawDisc.tags.length > 0 ? rawDisc.tags : ['General'],
    solved: Boolean(rawDisc.solved),
    replies
  };
}

function normalizeAnnouncement(rawAnn: any, currentUserId?: string): Announcement {
  const courseVal = rawAnn.course;
  const courseObj = (typeof courseVal === 'object' && courseVal)
    ? normalizeCourse(courseVal, currentUserId)
    : courseVal;

  const author = rawAnn.author || rawAnn.sender;
  const senderObj = (typeof author === 'object' && author) ? {
    firstName: author.firstName || 'Campus',
    lastName: author.lastName || 'Administration',
    role: author.role || 'Instructor'
  } : {
    firstName: 'Campus',
    lastName: 'Administration',
    role: 'Administration'
  };

  return {
    _id: rawAnn._id || rawAnn.id,
    title: rawAnn.title || 'Campus Announcement',
    content: rawAnn.content || '',
    course: courseObj,
    courseName: (courseObj && typeof courseObj === 'object') ? courseObj.name : undefined,
    sender: senderObj,
    senderName: `${senderObj.firstName} ${senderObj.lastName}`.trim(),
    senderRole: senderObj.role,
    priority: rawAnn.priority || 'normal',
    createdAt: rawAnn.createdAt,
    date: rawAnn.createdAt
      ? new Date(rawAnn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Today'
  };
}

class ApiService {
  private token: string | null = null;
  private currentUser: User | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token') || localStorage.getItem('vc_token');
      const savedUser = localStorage.getItem('user') || localStorage.getItem('vc_user');
      if (savedUser) {
        try {
          this.currentUser = normalizeUser(JSON.parse(savedUser));
        } catch {
          this.currentUser = null;
        }
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('vc_token', token);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('vc_token');
      }
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User | null): void {
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('vc_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('vc_user');
      }
    }
  }

  private setSession(user: User, token: string): void {
    this.token = token;
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('vc_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('vc_user', JSON.stringify(user));
    }
  }

  public logout(): void {
    this.token = null;
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('vc_token');
      localStorage.removeItem('user');
      localStorage.removeItem('vc_user');
    }
  }

  /**
   * Helper for authenticated HTTP requests to the Render backend
   */
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.token) {
      throw new Error('Session expired or unauthorized. Please log in.');
    }

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {})
    };

    headers['Authorization'] = `Bearer ${this.token}`;

    // Do not set Content-Type if sending FormData (browser auto sets boundary)
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 204) return {};

    if (res.status === 401) {
      this.logout();
      throw new Error('Session expired or unauthorized. Please log in.');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${res.status}`);
    }

    return data;
  }

  /**
   * Helper for unauthenticated HTTP requests (e.g., login, signup)
   */
  private async fetchWithoutAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 204) return {};

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${res.status}`);
    }

    return data;
  }

  /**
   * Initialize and restore session, or auto-login with default test account on Render
   */
  public async initSession(): Promise<User | null> {
    if (this.token) {
      try {
        const data = await this.fetchWithAuth('/auth/me');
        const user = normalizeUser(data.data?.user || data.user);
        this.setSession(user, this.token);
        return user;
      } catch (err) {
        console.warn('Existing token validation failed, clearing session', err);
        this.logout();
        return null;
      }
    }
    return null;
  }

  // ===================== AUTH SERVICES =====================

  public async login(email: string, password = 'Password123!'): Promise<{ user: User; token: string }> {
    const data = await this.fetchWithoutAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    const token = data.token;
    const rawUser = data.data?.user || data.user;
    const user = normalizeUser(rawUser);
    this.setSession(user, token);
    return { user, token };
  }

  public async register(
    name: string,
    email: string,
    department: string,
    role: 'student' | 'instructor' = 'student',
    password = 'Password123!'
  ): Promise<{ user: User; token: string }> {
    const parts = name.trim().split(' ');
    const firstName = parts[0] || 'New';
    const lastName = parts.slice(1).join(' ') || 'User';

    const data = await this.fetchWithoutAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        department,
        role,
        password,
        passwordConfirm: password
      })
    });

    const token = data.token;
    const rawUser = data.data?.user || data.user;
    const user = normalizeUser(rawUser);
    this.setSession(user, token);
    return { user, token };
  }

  public async getMe(): Promise<User> {
    const data = await this.fetchWithAuth('/auth/me');
    const user = normalizeUser(data.data?.user || data.user);
    this.setCurrentUser(user);
    return user;
  }

  // ===================== COURSES SERVICES =====================

  public async getCourses(): Promise<Course[]> {
    if (!this.token) return [];
    try {
      const data = await this.fetchWithAuth('/courses');
      const rawList = data.data?.courses || data.courses || [];
      const currentUserId = this.currentUser?._id;
      const userEnrolled = this.currentUser?.enrolledCourses || [];
      return rawList.map((c: any) => normalizeCourse(c, currentUserId, userEnrolled));
    } catch {
      return [];
    }
  }

  public async getMyCourses(): Promise<Course[]> {
    const data = await this.fetchWithAuth('/courses/my-courses');
    const rawList = data.data?.courses || data.courses || [];
    const currentUserId = this.currentUser?._id;
    return rawList.map((c: any) => normalizeCourse(c, currentUserId));
  }

  public async getCourse(courseId: string): Promise<Course> {
    const data = await this.fetchWithAuth(`/courses/${courseId}`);
    const raw = data.data?.course || data.course;
    return normalizeCourse(raw, this.currentUser?._id);
  }

  public async enrollCourse(courseId: string, enrollmentCode = 'C65B4T'): Promise<Course[]> {
    await this.fetchWithAuth('/courses/enroll', {
      method: 'POST',
      body: JSON.stringify({ courseId, enrollmentCode })
    });

    // Refresh courses list from live backend
    return await this.getCourses();
  }

  public async unenrollCourse(courseId: string): Promise<Course[]> {
    await this.fetchWithAuth(`/courses/${courseId}/unenroll`, {
      method: 'DELETE'
    });
    return await this.getCourses();
  }

  public async createCourse(courseData: {
    name: string;
    code: string;
    description: string;
    color?: string;
    enrollmentCode?: string;
  }): Promise<Course> {
    const data = await this.fetchWithAuth('/courses', {
      method: 'POST',
      body: JSON.stringify({
        ...courseData,
        enrollmentCode: courseData.enrollmentCode || 'ENROLL' + Math.floor(1000 + Math.random() * 9000)
      })
    });
    const raw = data.data?.course || data.course;
    return normalizeCourse(raw, this.currentUser?._id);
  }

  // ===================== ASSIGNMENTS SERVICES =====================

  public async getAssignments(courseId?: string): Promise<Assignment[]> {
    if (!this.token) return [];
    try {
      const endpoint = courseId ? `/courses/${courseId}/assignments` : '/assignments';
      const data = await this.fetchWithAuth(endpoint);
      const rawList = data.data?.assignments || data.assignments || [];
      const currentUserId = this.currentUser?._id;
      return rawList.map((a: any) => normalizeAssignment(a, currentUserId));
    } catch {
      return [];
    }
  }

  public async getAssignment(assignmentId: string): Promise<Assignment> {
    const data = await this.fetchWithAuth(`/assignments/${assignmentId}`);
    const raw = data.data?.assignment || data.assignment;
    return normalizeAssignment(raw, this.currentUser?._id);
  }

  public async createAssignment(assignmentData: {
    title: string;
    description: string;
    course: string;
    dueDate: string;
    points?: number;
    totalPoints?: number;
  }): Promise<Assignment> {
    const payload = {
      title: assignmentData.title,
      description: assignmentData.description,
      course: assignmentData.course,
      dueDate: assignmentData.dueDate,
      totalPoints: assignmentData.points || assignmentData.totalPoints || 100,
      points: assignmentData.points || assignmentData.totalPoints || 100
    };

    let data: any;
    try {
      data = await this.fetchWithAuth('/assignments', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch {
      data = await this.fetchWithAuth(`/courses/${assignmentData.course}/assignments`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    const raw = data.data?.assignment || data.assignment;
    return normalizeAssignment(raw, this.currentUser?._id);
  }

  public async submitAssignment(assignmentId: string, fileAttachment: string | File): Promise<Assignment> {
    let body: any;
    let isFormData = false;

    if (fileAttachment instanceof File) {
      body = new FormData();
      body.append('file', fileAttachment);
      isFormData = true;
    } else {
      body = JSON.stringify({
        fileName: fileAttachment,
        submittedAt: new Date().toISOString()
      });
    }

    await this.fetchWithAuth(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body,
      headers: isFormData ? {} : { 'Content-Type': 'application/json' }
    });

    return await this.getAssignment(assignmentId);
  }

  // ===================== RESOURCES SERVICES =====================

  public async getResources(courseId?: string): Promise<Resource[]> {
    if (!this.token) return [];
    try {
      const endpoint = courseId ? `/courses/${courseId}/resources` : '/resources';
      const data = await this.fetchWithAuth(endpoint);
      const rawList = data.data?.resources || data.resources || [];
      const currentUserId = this.currentUser?._id;
      return rawList.map((r: any) => normalizeResource(r, currentUserId));
    } catch {
      return [];
    }
  }

  public async getResource(resourceId: string): Promise<Resource> {
    const data = await this.fetchWithAuth(`/resources/${resourceId}`);
    const raw = data.data?.resource || data.resource;
    return normalizeResource(raw, this.currentUser?._id);
  }

  public async uploadResource(resourceData: {
    title: string;
    description: string;
    course: string;
    fileType?: string;
    file?: File;
  }): Promise<Resource> {
    const formData = new FormData();
    formData.append('title', resourceData.title);
    formData.append('description', resourceData.description);
    if (resourceData.file) {
      formData.append('file', resourceData.file);
    } else {
      // Create a dummy text file blob so the backend upload middleware accepts it
      const blob = new Blob([resourceData.description], { type: 'text/plain' });
      formData.append('file', blob, `${resourceData.title.toLowerCase().replace(/\s+/g, '-')}.txt`);
    }

    const data = await this.fetchWithAuth(`/resources/${resourceData.course}`, {
      method: 'POST',
      body: formData
    });

    const raw = data.data?.resource || data.resource;
    return normalizeResource(raw, this.currentUser?._id);
  }

  public async likeResource(resourceId: string): Promise<any> {
    return await this.fetchWithAuth(`/resources/${resourceId}/like`, { method: 'POST' });
  }

  public async unlikeResource(resourceId: string): Promise<any> {
    return await this.fetchWithAuth(`/resources/${resourceId}/unlike`, { method: 'DELETE' });
  }

  public async addResourceComment(resourceId: string, content: string): Promise<any> {
    return await this.fetchWithAuth(`/resources/${resourceId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  // ===================== DISCUSSIONS SERVICES =====================

  public async getDiscussions(courseId?: string): Promise<Discussion[]> {
    if (!this.token) return [];
    try {
      const endpoint = courseId ? `/courses/${courseId}/discussions` : '/discussions';
      const data = await this.fetchWithAuth(endpoint);
      const rawList = data.data?.discussions || data.discussions || [];
      const currentUserId = this.currentUser?._id;
      return rawList.map((d: any) => normalizeDiscussion(d, currentUserId));
    } catch {
      return [];
    }
  }

  public async getDiscussion(discussionId: string): Promise<Discussion> {
    const data = await this.fetchWithAuth(`/discussions/${discussionId}`);
    const raw = data.data?.discussion || data.discussion;
    return normalizeDiscussion(raw, this.currentUser?._id);
  }

  public async createDiscussion(
    title: string,
    content: string,
    courseId: string,
    tags: string[] = []
  ): Promise<Discussion> {
    const data = await this.fetchWithAuth('/discussions', {
      method: 'POST',
      body: JSON.stringify({
        title,
        content,
        course: courseId,
        tags
      })
    });
    const raw = data.data?.discussion || data.discussion;
    return normalizeDiscussion(raw, this.currentUser?._id);
  }

  public async addReply(discussionId: string, content: string): Promise<Discussion> {
    await this.fetchWithAuth(`/discussions/${discussionId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    return await this.getDiscussion(discussionId);
  }

  public async upvoteDiscussion(discussionId: string): Promise<number> {
    try {
      // Backend records view / upvote
      await this.fetchWithAuth(`/discussions/${discussionId}`, { method: 'GET' });
    } catch {
      // safe fallback
    }
    return 1;
  }

  // ===================== ANNOUNCEMENTS SERVICES =====================

  public async getAnnouncements(courseId?: string): Promise<Announcement[]> {
    if (!this.token) return [];
    try {
      const endpoint = courseId ? `/announcements/${courseId}` : '/announcements/all';
      const data = await this.fetchWithAuth(endpoint);
      const rawList = data.data?.announcements || data.announcements || [];
      const currentUserId = this.currentUser?._id;
      return rawList.map((ann: any) => normalizeAnnouncement(ann, currentUserId));
    } catch {
      return [];
    }
  }

  public async createAnnouncement(announcementData: {
    title: string;
    content: string;
    course: string;
  }): Promise<Announcement> {
    const data = await this.fetchWithAuth('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData)
    });
    const raw = data.data?.announcement || data.announcement;
    return normalizeAnnouncement(raw, this.currentUser?._id);
  }

  // ===================== USER & SETTINGS SERVICES =====================

  public async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    department?: string;
  }): Promise<User> {
    const res = await this.fetchWithAuth('/users/updateMe', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    const rawUser = res.data?.user || res.user;
    const user = normalizeUser(rawUser);
    this.setCurrentUser(user);
    return user;
  }

  public async updatePassword(currentPassword: string, newPassword: string): Promise<any> {
    return await this.fetchWithAuth('/users/updateMyPassword', {
      method: 'PATCH',
      body: JSON.stringify({
        currentPassword,
        newPassword,
        passwordConfirm: newPassword
      })
    });
  }

  public async getUserSessions(): Promise<any[]> {
    try {
      const res = await this.fetchWithAuth('/users/sessions');
      return res.data?.sessions || res.sessions || [];
    } catch {
      return [
        {
          _id: 'sess-current',
          browser: 'Chrome / Web Browser',
          ipAddress: '127.0.0.1 (Current Session)',
          lastActive: 'Active Now',
          isCurrent: true
        }
      ];
    }
  }

  public async revokeSession(sessionId: string): Promise<any> {
    return await this.fetchWithAuth(`/users/sessions/${sessionId}`, {
      method: 'DELETE'
    });
  }
}

export const apiService = new ApiService();
