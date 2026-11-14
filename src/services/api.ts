import {
  User,
  Course,
  CourseLink,
  Assignment,
  AssignmentSubmission,
  Resource,
  Discussion,
  Announcement,
  DEFAULT_AVATAR,
} from '../types';

const BACKEND_ORIGIN = 'https://project1-1bz0.onrender.com';

const API_BASE_URL: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  `${BACKEND_ORIGIN}/api/v1`;

function buildFileUrl(filePath?: string): string {
  if (!filePath) return '#';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  const cleaned = filePath.replace(/^\/+/, '');
  return `${BACKEND_ORIGIN}/${cleaned}`;
}

export function normalizeUser(rawUser: any): User {
  if (!rawUser) {
    return {
      _id: 'guest',
      firstName: 'Student',
      lastName: 'Guest',
      name: 'Student Guest',
      email: 'student@campus.edu',
      role: 'student',
      department: 'General Studies',
      enrolledCourses: [],
    };
  }

  const fName = rawUser.firstName || (rawUser.name ? rawUser.name.split(' ')[0] : 'Student');
  const lName = rawUser.lastName || (rawUser.name ? rawUser.name.split(' ').slice(1).join(' ') : 'Member');

  const isDefaultPicture =
    !rawUser.profilePicture ||
    rawUser.profilePicture === 'default.jpg' ||
    rawUser.profilePicture.includes('default') ||
    (rawUser.profilePictureUrl && rawUser.profilePictureUrl.includes('unsplash'));

  const avatar = !isDefaultPicture
    ? rawUser.profilePictureUrl || `${BACKEND_ORIGIN}/uploads/profile/${rawUser.profilePicture}`
    : DEFAULT_AVATAR;

  return {
    _id: String(rawUser._id || rawUser.id || 'usr-' + Date.now()),
    firstName: fName,
    lastName: lName,
    name: rawUser.fullName || `${fName} ${lName}`.trim(),
    email: rawUser.email || '',
    role: rawUser.role || 'student',
    department: rawUser.department || 'Computer Science',
    bio: rawUser.bio || '',
    avatarUrl: avatar,
    avatar,
    matricNumber: rawUser.matricNumber || (rawUser.role === 'instructor' ? 'FAC-CS-01' : 'STU-2026-089'),
    enrolledCourses: Array.isArray(rawUser.enrolledCourses)
      ? rawUser.enrolledCourses.map((c: any) => String(typeof c === 'object' ? c._id || c.id : c))
      : [],
  };
}

export function normalizeCourse(
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
        email: 'faculty@campus.edu',
        avatar: DEFAULT_AVATAR,
      },
    };
  }

  const courseId = String(rawCourse._id || rawCourse.id);
  const instructor = rawCourse.instructor;
  const hasInstructorPic =
    instructor &&
    (instructor.profilePictureUrl ||
      (instructor.profilePicture &&
        instructor.profilePicture !== 'default.jpg' &&
        !instructor.profilePicture.includes('default')));

  const instructorId =
    typeof instructor === 'object' && instructor
      ? String(instructor._id || instructor.id || 'inst-1')
      : String(instructor || 'inst-1');

  const instructorObj =
    typeof instructor === 'object' && instructor
      ? {
          _id: instructorId,
          firstName: instructor.firstName || 'Faculty',
          lastName: instructor.lastName || 'Instructor',
          email: instructor.email || 'faculty@campus.edu',
          avatar: hasInstructorPic
            ? instructor.profilePictureUrl || `${BACKEND_ORIGIN}/uploads/profile/${instructor.profilePicture}`
            : DEFAULT_AVATAR,
        }
      : {
          _id: instructorId,
          firstName: 'Faculty',
          lastName: 'Member',
          email: 'faculty@campus.edu',
          avatar: DEFAULT_AVATAR,
        };

  const studentsList = Array.isArray(rawCourse.students) ? rawCourse.students : [];
  const normalizedStudents = studentsList.map((s: any) =>
    typeof s === 'object' && s !== null ? normalizeUser(s) : String(s)
  );

  const isInStudents = currentUserId
    ? normalizedStudents.some((s) =>
        typeof s === 'object' ? String(s._id) === String(currentUserId) : String(s) === String(currentUserId)
      )
    : false;
  const isInUserEnrolled = userEnrolledList ? userEnrolledList.includes(courseId) : false;

  // Strictly match ownership to THIS course's instructor (or admin)
  const isCourseOwner = Boolean(
    (currentUserId && instructorId === String(currentUserId)) ||
      (currentUser?.email &&
        instructorObj.email &&
        instructorObj.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      currentUser?.role === 'admin'
  );

  // Instructors cannot be counted as enrolled students in a course they teach
  const isEnrolled = isCourseOwner ? false : Boolean(rawCourse.isEnrolled || isInStudents || isInUserEnrolled);

  const enrollmentCode = rawCourse.enrollmentCode || '';
  const origin = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://campus.edu/';
  const joinLink = enrollmentCode ? `${origin}?code=${enrollmentCode}` : '';

  return {
    _id: courseId,
    name: rawCourse.name || rawCourse.title || 'Course',
    title: rawCourse.name || rawCourse.title || 'Course',
    code: rawCourse.code || 'CRS100',
    description: rawCourse.description || '',
    color: rawCourse.color && rawCourse.color.startsWith('#') ? rawCourse.color : '#171717',
    creditUnits: rawCourse.creditUnits || 3,
    studentsCount: normalizedStudents.length,
    maxStudents: rawCourse.maxStudents || 60,
    students: normalizedStudents,
    instructor: instructorObj,
    department: rawCourse.department || 'Computer Science',
    semester: rawCourse.semester || 'Spring 2026',
    isEnrolled,
    isTeaching: isCourseOwner,
    enrollmentCode,
    allowEnrollment: rawCourse.allowEnrollment !== false,
    isArchived: Boolean(rawCourse.isArchived),
    joinLink,
    createdAt: rawCourse.createdAt,
    syllabus:
      Array.isArray(rawCourse.syllabus) && rawCourse.syllabus.length > 0
        ? rawCourse.syllabus
        : [
            { week: 1, topic: 'Introduction and Foundations', details: 'Core terminology, fundamental theories, and course outline.' },
            { week: 2, topic: 'Core Methodologies & Analysis', details: 'Detailed methodology, derivations, and problem sets.' },
            { week: 3, topic: 'Real-world Applications & Case Studies', details: 'Applied modeling, group assignments, and practical exercises.' },
            { week: 4, topic: 'Midterm Review & Assessment', details: 'Comprehensive review and mid-term evaluation.' },
          ],
  };
}

export function normalizeSubmission(rawSub: any): AssignmentSubmission {
  const studentObj = typeof rawSub.student === 'object' && rawSub.student ? rawSub.student : null;
  const sName = studentObj
    ? `${studentObj.firstName || ''} ${studentObj.lastName || ''}`.trim()
    : rawSub.studentName || 'Student';
  const sEmail = studentObj ? studentObj.email || '' : rawSub.studentEmail || '';

  const hasPic =
    studentObj &&
    (studentObj.profilePictureUrl ||
      (studentObj.profilePicture &&
        studentObj.profilePicture !== 'default.jpg' &&
        !studentObj.profilePicture.includes('default')));

  const studentAvatar = hasPic
    ? studentObj.profilePictureUrl || `${BACKEND_ORIGIN}/uploads/profile/${studentObj.profilePicture}`
    : DEFAULT_AVATAR;

  const attachments = Array.isArray(rawSub.attachments)
    ? rawSub.attachments.map((att: any) => ({
        fileName: att.fileName || 'Attachment',
        filePath: att.filePath,
        fileUrl: att.fileUrl || buildFileUrl(att.filePath),
        fileType: att.fileType,
        fileSize: att.fileSize,
      }))
    : [];

  return {
    _id: rawSub._id || rawSub.id,
    assignment: rawSub.assignment,
    student: studentObj ? normalizeUser(studentObj) : String(rawSub.student || ''),
    studentName: sName || 'Student',
    studentEmail: sEmail,
    studentAvatar,
    textContent: rawSub.textContent || '',
    attachments,
    submittedAt: rawSub.submittedAt || rawSub.createdAt || new Date().toISOString(),
    status: rawSub.status || (rawSub.grade && rawSub.grade.score !== undefined ? 'graded' : 'submitted'),
    grade: rawSub.grade,
    feedback: typeof rawSub.grade === 'object' ? rawSub.grade?.feedback : rawSub.feedback,
    fileName: attachments[0]?.fileName || rawSub.fileName,
    fileUrl: attachments[0]?.fileUrl || rawSub.fileUrl,
    isLate: Boolean(rawSub.isLate),
  };
}

export function normalizeAssignment(
  rawAssignment: any,
  currentUserId?: string,
  fetchedSubmissions?: AssignmentSubmission[],
  currentUser?: User | null
): Assignment {
  const courseVal = rawAssignment.course;
  const courseObj =
    typeof courseVal === 'object' && courseVal
      ? normalizeCourse(courseVal, currentUserId, currentUser?.enrolledCourses, currentUser)
      : courseVal;

  const submissions: AssignmentSubmission[] =
    fetchedSubmissions !== undefined
      ? fetchedSubmissions
      : Array.isArray(rawAssignment.submissions)
      ? rawAssignment.submissions.map(normalizeSubmission)
      : [];

  const mySubmission = currentUserId
    ? submissions.find((s) => {
        const sId = typeof s.student === 'object' ? s.student?._id : s.student;
        return String(sId) === String(currentUserId);
      }) || null
    : null;

  const isSubmitted = Boolean(mySubmission);
  const gradeScore =
    mySubmission?.grade && typeof mySubmission.grade === 'object'
      ? mySubmission.grade.score
      : typeof mySubmission?.grade === 'number'
      ? mySubmission.grade
      : rawAssignment.grade;
  const isGraded = Boolean(
    mySubmission && (mySubmission.status === 'graded' || (gradeScore !== undefined && gradeScore !== null))
  );
  const feedbackText =
    mySubmission?.grade && typeof mySubmission.grade === 'object'
      ? mySubmission.grade.feedback
      : mySubmission?.feedback || rawAssignment.feedback;

  const dueDate = rawAssignment.dueDate || new Date(Date.now() + 7 * 86400000).toISOString();
  const isPastDue = new Date(dueDate).getTime() < Date.now();

  let status: Assignment['status'] = 'pending';
  if (isGraded) status = 'graded';
  else if (isSubmitted) status = 'submitted';
  else if (isPastDue) status = 'missed';

  const ungradedCount = submissions.filter(
    (s) => s.status !== 'graded' && !(typeof s.grade === 'object' && s.grade?.score !== undefined)
  ).length;

  const pointsPossible = rawAssignment.pointsPossible ?? rawAssignment.points ?? rawAssignment.totalPoints ?? 100;
  const courseCode = typeof courseObj === 'object' ? courseObj.code : rawAssignment.courseCode || 'CRS';
  const courseName = typeof courseObj === 'object' ? courseObj.name : rawAssignment.courseName || 'Course';

  return {
    _id: String(rawAssignment._id || rawAssignment.id),
    title: rawAssignment.title || 'Assignment',
    description: rawAssignment.description || '',
    dueDate,
    points: pointsPossible,
    pointsPossible,
    totalPoints: pointsPossible,
    submissionType: rawAssignment.submissionType || 'both',
    allowLateSubmissions: Boolean(rawAssignment.allowLateSubmissions),
    published: rawAssignment.published !== false,
    course: courseObj,
    courseCode,
    courseName,
    status,
    grade: typeof gradeScore === 'number' ? gradeScore : undefined,
    feedback: feedbackText,
    mySubmission,
    submissions,
    ungradedCount,
    createdAt: rawAssignment.createdAt,
    updatedAt: rawAssignment.updatedAt,
  };
}

function normalizeResource(rawResource: any, currentUserId?: string, currentUser?: User | null): Resource {
  const courseVal = rawResource.course;
  const courseObj =
    typeof courseVal === 'object' && courseVal
      ? normalizeCourse(courseVal, currentUserId, currentUser?.enrolledCourses, currentUser)
      : courseVal;

  let fileType: 'pdf' | 'slides' | 'archive' | 'doc' = 'pdf';
  const typeStr = (rawResource.file?.fileType || rawResource.fileType || rawResource.type || '').toLowerCase();
  const nameStr = (rawResource.file?.fileName || rawResource.title || '').toLowerCase();

  if (typeStr.includes('pdf') || nameStr.endsWith('.pdf')) {
    fileType = 'pdf';
  } else if (typeStr.includes('ppt') || typeStr.includes('slide') || nameStr.endsWith('.pptx')) {
    fileType = 'slides';
  } else if (
    typeStr.includes('zip') ||
    typeStr.includes('tar') ||
    typeStr.includes('archive') ||
    nameStr.endsWith('.zip')
  ) {
    fileType = 'archive';
  } else if (typeStr.includes('doc') || typeStr.includes('text') || nameStr.endsWith('.docx')) {
    fileType = 'doc';
  }

  const rawSize = rawResource.file?.fileSize;
  const fileSize = rawSize
    ? rawSize > 1024 * 1024
      ? `${(rawSize / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(rawSize / 1024))} KB`
    : rawResource.fileSize || '1.0 MB';

  const filePath = rawResource.file?.filePath;
  const fileUrl = filePath ? buildFileUrl(filePath) : rawResource.link || rawResource.fileUrl || '#';

  const uploader = rawResource.addedBy || rawResource.uploadedBy;
  const uploadedBy =
    typeof uploader === 'object' && uploader
      ? {
          _id: String(uploader._id || uploader.id || ''),
          firstName: uploader.firstName || 'Faculty',
          lastName: uploader.lastName || 'Member',
          role: uploader.role || 'Instructor',
        }
      : {
          firstName: 'Faculty',
          lastName: 'Member',
          role: 'Instructor',
        };

  return {
    _id: String(rawResource._id || rawResource.id),
    title: rawResource.title || 'Course Resource',
    description: rawResource.description || '',
    type: rawResource.type || 'file',
    category: rawResource.category || 'other',
    fileType,
    fileSize,
    fileUrl,
    link: rawResource.link,
    downloads: rawResource.viewCount || rawResource.downloads || 0,
    isPinned: Boolean(rawResource.isPinned),
    isVisible: rawResource.isVisible !== false,
    likes: Array.isArray(rawResource.likes) ? rawResource.likes.map(String) : [],
    comments: Array.isArray(rawResource.comments) ? rawResource.comments : [],
    course: courseObj,
    uploadedBy,
    createdAt: rawResource.createdAt ? new Date(rawResource.createdAt).toISOString().split('T')[0] : 'Recently',
    tags: Array.isArray(rawResource.tags) && rawResource.tags.length > 0 ? rawResource.tags : [rawResource.category || 'Material'],
  };
}

function normalizeDiscussion(rawDisc: any, currentUserId?: string, currentUser?: User | null): Discussion {
  const courseVal = rawDisc.course;
  const courseObj =
    typeof courseVal === 'object' && courseVal
      ? normalizeCourse(courseVal, currentUserId, currentUser?.enrolledCourses, currentUser)
      : courseVal;

  const author = rawDisc.author;
  const hasAuthorPic =
    author &&
    (author.profilePictureUrl ||
      (author.profilePicture &&
        author.profilePicture !== 'default.jpg' &&
        !author.profilePicture.includes('default')));
  const authorObj =
    typeof author === 'object' && author
      ? {
          _id: String(author._id || author.id || ''),
          firstName: author.firstName || 'Student',
          lastName: author.lastName || '',
          avatar: hasAuthorPic
            ? author.profilePictureUrl || `${BACKEND_ORIGIN}/uploads/profile/${author.profilePicture}`
            : DEFAULT_AVATAR,
          role: (author.role || 'student') as any,
        }
      : {
          firstName: 'Student',
          lastName: 'Member',
          avatar: DEFAULT_AVATAR,
          role: 'student' as const,
        };

  const replies = Array.isArray(rawDisc.replies)
    ? rawDisc.replies.map((rep: any) => {
        const repAuthor = rep.author;
        const hasRepPic =
          repAuthor &&
          (repAuthor.profilePictureUrl ||
            (repAuthor.profilePicture &&
              repAuthor.profilePicture !== 'default.jpg' &&
              !repAuthor.profilePicture.includes('default')));
        return {
          _id: String(rep._id || rep.id || 'rep-' + Math.random()),
          author:
            typeof repAuthor === 'object' && repAuthor
              ? {
                  _id: String(repAuthor._id || repAuthor.id || ''),
                  firstName: repAuthor.firstName || 'Classmate',
                  lastName: repAuthor.lastName || '',
                  avatar: hasRepPic
                    ? repAuthor.profilePictureUrl || `${BACKEND_ORIGIN}/uploads/profile/${repAuthor.profilePicture}`
                    : DEFAULT_AVATAR,
                  role: (repAuthor.role || 'student') as any,
                }
              : {
                  firstName: 'Classmate',
                  lastName: '',
                  avatar: DEFAULT_AVATAR,
                  role: 'student' as const,
                },
          content: rep.content || '',
          createdAt: rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : 'Just now',
          upvotes: rep.upvotes || 0,
          isAnswer: rep.isAnswer || false,
        };
      })
    : [];

  const courseCode = typeof courseObj === 'object' ? courseObj.code : rawDisc.courseCode || 'CRS';
  const courseName = typeof courseObj === 'object' ? courseObj.name : rawDisc.courseName || 'Course';

  return {
    _id: String(rawDisc._id || rawDisc.id),
    title: rawDisc.title || 'Discussion',
    content: rawDisc.content || '',
    course: courseObj,
    courseCode,
    courseName,
    author: authorObj,
    createdAt: rawDisc.createdAt ? new Date(rawDisc.createdAt).toLocaleDateString() : 'Recently',
    updatedAt: rawDisc.updatedAt,
    upvotes: rawDisc.upvotes || rawDisc.views || 0,
    views: rawDisc.views || 0,
    repliesCount: rawDisc.replyCount ?? replies.length,
    tags: Array.isArray(rawDisc.tags) && rawDisc.tags.length > 0 ? rawDisc.tags : ['General'],
    solved: Boolean(rawDisc.solved),
    isPinned: Boolean(rawDisc.isPinned),
    isLocked: Boolean(rawDisc.isLocked),
    replies,
  };
}

function normalizeAnnouncement(rawAnn: any, currentUserId?: string, currentUser?: User | null): Announcement {
  const courseVal = rawAnn.course;
  const courseObj =
    typeof courseVal === 'object' && courseVal
      ? normalizeCourse(courseVal, currentUserId, currentUser?.enrolledCourses, currentUser)
      : courseVal;

  const author = rawAnn.author || rawAnn.sender;
  const senderObj =
    typeof author === 'object' && author
      ? {
          firstName: author.firstName || 'Campus',
          lastName: author.lastName || 'Administration',
          role: author.role || 'Instructor',
        }
      : {
          firstName: 'Campus',
          lastName: 'Administration',
          role: 'Administration',
        };

  return {
    _id: String(rawAnn._id || rawAnn.id),
    title: rawAnn.title || 'Campus Announcement',
    content: rawAnn.content || '',
    course: courseObj,
    courseName: courseObj && typeof courseObj === 'object' ? courseObj.name : undefined,
    sender: senderObj,
    senderName: `${senderObj.firstName} ${senderObj.lastName}`.trim(),
    senderRole: senderObj.role,
    priority: rawAnn.priority || 'normal',
    createdAt: rawAnn.createdAt,
    date: rawAnn.createdAt
      ? new Date(rawAnn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Today',
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

  private async fetchWithAuth(
    endpoint: string,
    options: RequestInit & { noContentType?: boolean } = {}
  ): Promise<any> {
    if (!this.token) {
      throw new Error('Session expired or unauthorized. Please log in.');
    }

    const { noContentType, ...fetchOptions } = options;
    const headers: Record<string, string> = {
      ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    headers['Authorization'] = `Bearer ${this.token}`;

    if (!noContentType && !(fetchOptions.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (res.status === 204) return {};

    if (res.status === 401) {
      // Distinguish between auth session expiration and enrollment code validation 401
      const errBody = await res.json().catch(() => ({}));
      const msg = errBody.message || errBody.error || '';
      if (msg.toLowerCase().includes('enrollment') || endpoint.includes('/courses/enroll')) {
        throw new Error(msg || 'Invalid enrollment code.');
      }
      this.logout();
      throw new Error('Session expired or unauthorized. Please log in.');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${res.status}`);
    }

    return data;
  }

  private async fetchWithoutAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 204) return {};

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || `Request failed with status ${res.status}`);
    }

    return data;
  }

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
      body: JSON.stringify({ email, password }),
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
        passwordConfirm: password,
      }),
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
      return rawList.map((c: any) => normalizeCourse(c, currentUserId, userEnrolled, this.currentUser));
    } catch {
      return [];
    }
  }

  public async getMyCourses(): Promise<Course[]> {
    const data = await this.fetchWithAuth('/courses/my-courses');
    const rawList = data.data?.courses || data.courses || [];
    const currentUserId = this.currentUser?._id;
    const userEnrolled = this.currentUser?.enrolledCourses || [];
    return rawList.map((c: any) => normalizeCourse(c, currentUserId, userEnrolled, this.currentUser));
  }

  public async getCourse(courseId: string): Promise<Course> {
    const data = await this.fetchWithAuth(`/courses/${courseId}`);
    const raw = data.data?.course || data.course;
    return normalizeCourse(raw, this.currentUser?._id, this.currentUser?.enrolledCourses, this.currentUser);
  }

  public async enrollCourse(courseId: string, enrollmentCode: string): Promise<Course[]> {
    if (!this.currentUser) {
      throw new Error('Please log in to enroll in a course.');
    }
    if (this.currentUser.role === 'instructor' || this.currentUser.role === 'admin') {
      throw new Error('Instructors and administrators cannot enroll in courses as students.');
    }

    // Double-check course constraints client-side before sending
    const targetCourse = await this.getCourse(courseId).catch(() => null);
    if (targetCourse) {
      if (targetCourse.instructor._id === this.currentUser._id || targetCourse.isTeaching) {
        throw new Error('An instructor cannot enroll in a course they are teaching.');
      }
      if (targetCourse.isArchived) {
        throw new Error('Cannot enroll in an archived course.');
      }
      if (targetCourse.allowEnrollment === false) {
        throw new Error('This course is not accepting new student enrollments.');
      }
    }

    await this.fetchWithAuth('/courses/enroll', {
      method: 'POST',
      body: JSON.stringify({ courseId, enrollmentCode: enrollmentCode.trim() }),
    });

    await this.getMe().catch(() => null);
    return await this.getCourses();
  }

  public async unenrollCourse(courseId: string): Promise<Course[]> {
    if (this.currentUser?.role === 'instructor') {
      throw new Error('Instructors cannot unenroll from a taught course; manage or archive it instead.');
    }
    await this.fetchWithAuth(`/courses/${courseId}/unenroll`, {
      method: 'DELETE',
    });
    await this.getMe().catch(() => null);
    return await this.getCourses();
  }

  public async createCourse(courseData: {
    name: string;
    code: string;
    description: string;
    color?: string;
    enrollmentCode?: string;
  }): Promise<Course> {
    if (this.currentUser?.role !== 'instructor' && this.currentUser?.role !== 'admin') {
      throw new Error('Only instructors and administrators can create courses.');
    }
    const payload: Record<string, any> = {
      name: courseData.name,
      code: courseData.code,
      description: courseData.description,
      color: courseData.color || '#171717',
    };
    if (courseData.enrollmentCode) {
      payload.enrollmentCode = courseData.enrollmentCode;
    }
    const data = await this.fetchWithAuth('/courses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const raw = data.data?.course || data.course;
    return normalizeCourse(raw, this.currentUser?._id, this.currentUser?.enrolledCourses, this.currentUser);
  }

  public async updateCourse(
    courseId: string,
    updateData: {
      name?: string;
      code?: string;
      description?: string;
      color?: string;
      enrollmentCode?: string;
      allowEnrollment?: boolean;
      isArchived?: boolean;
    }
  ): Promise<Course> {
    if (this.currentUser?.role !== 'instructor' && this.currentUser?.role !== 'admin') {
      throw new Error('Only the course instructor or admin can modify course settings.');
    }
    const data = await this.fetchWithAuth(`/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
    const raw = data.data?.course || data.course;
    return normalizeCourse(raw, this.currentUser?._id, this.currentUser?.enrolledCourses, this.currentUser);
  }

  public async deleteCourse(courseId: string): Promise<void> {
    if (this.currentUser?.role !== 'instructor' && this.currentUser?.role !== 'admin') {
      throw new Error('Only the course instructor or admin can delete a course.');
    }
    await this.fetchWithAuth(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  public async addStudentToCourse(courseId: string, email: string): Promise<any> {
    if (this.currentUser?.role !== 'instructor' && this.currentUser?.role !== 'admin') {
      throw new Error('Only instructors can manually add students.');
    }
    if (this.currentUser?.email?.toLowerCase() === email.trim().toLowerCase()) {
      throw new Error('An instructor cannot enroll themselves in a course they teach.');
    }
    return await this.fetchWithAuth(`/courses/${courseId}/students`, {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
  }

  public async removeStudentFromCourse(courseId: string, studentId: string): Promise<any> {
    if (this.currentUser?.role !== 'instructor' && this.currentUser?.role !== 'admin') {
      throw new Error('Only instructors can remove students.');
    }
    return await this.fetchWithAuth(`/courses/${courseId}/students/${studentId}`, {
      method: 'DELETE',
    });
  }

  // ===================== COURSE LINKS SERVICES =====================

  public async generateCourseLink(
    courseId: string,
    options: { expiresIn?: number; maxUses?: number | null } = {}
  ): Promise<CourseLink> {
    if (this.currentUser?.role !== 'instructor' && this.currentUser?.role !== 'admin') {
      throw new Error('Only the course instructor or admin can generate enrollment links.');
    }
    const data = await this.fetchWithAuth(`/courses/${courseId}/links`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return data.data?.courseLink || data.courseLink;
  }

  public async getCourseLinks(courseId: string): Promise<CourseLink[]> {
    const data = await this.fetchWithAuth(`/courses/${courseId}/links`);
    return data.data?.courseLinks || data.courseLinks || [];
  }

  public async revokeCourseLink(linkId: string): Promise<CourseLink> {
    const data = await this.fetchWithAuth(`/links/${linkId}/revoke`, {
      method: 'PATCH',
      noContentType: true,
    });
    return data.data?.courseLink || data.courseLink;
  }

  public async joinCourseViaLink(token: string): Promise<Course | null> {
    if (!this.currentUser) {
      throw new Error('Please log in before joining a course via link.');
    }
    if (this.currentUser.role === 'instructor' || this.currentUser.role === 'admin') {
      throw new Error('Instructors and administrators cannot enroll via student invite links.');
    }
    const data = await this.fetchWithAuth(`/join/${token}`, {
      method: 'POST',
      noContentType: true,
    });
    await this.getMe().catch(() => null);
    const raw = data.data?.course || data.course;
    return raw ? normalizeCourse(raw, this.currentUser?._id, this.currentUser?.enrolledCourses, this.currentUser) : null;
  }

  // ===================== ASSIGNMENTS & SUBMISSIONS SERVICES =====================

  public async getAssignments(courseId?: string, includeSubmissions = true): Promise<Assignment[]> {
    if (!this.token) return [];
    try {
      const endpoint = courseId ? `/courses/${courseId}/assignments` : '/assignments';
      const data = await this.fetchWithAuth(endpoint);
      const rawList = data.data?.assignments || data.assignments || [];
      const currentUserId = this.currentUser?._id;

      if (!includeSubmissions || rawList.length === 0) {
        return rawList.map((a: any) => normalizeAssignment(a, currentUserId, undefined, this.currentUser));
      }

      const enriched = await Promise.all(
        rawList.map(async (raw: any) => {
          const aId = raw._id || raw.id;
          let subs: AssignmentSubmission[] = [];
          try {
            subs = await this.getSubmissions(aId);
          } catch {
            subs = [];
          }
          return normalizeAssignment(raw, currentUserId, subs, this.currentUser);
        })
      );

      return enriched;
    } catch {
      return [];
    }
  }

  public async getAssignment(assignmentId: string): Promise<Assignment> {
    const data = await this.fetchWithAuth(`/assignments/${assignmentId}`);
    const raw = data.data?.assignment || data.assignment;
    let subs: AssignmentSubmission[] = [];
    try {
      subs = await this.getSubmissions(assignmentId);
    } catch {
      subs = [];
    }
    return normalizeAssignment(raw, this.currentUser?._id, subs, this.currentUser);
  }

  public async createAssignment(assignmentData: {
    title: string;
    description: string;
    course: string;
    dueDate: string;
    pointsPossible?: number;
    submissionType?: 'text' | 'file' | 'both';
    allowLateSubmissions?: boolean;
  }): Promise<Assignment> {
    if (this.currentUser?.role !== 'instructor' && this.currentUser?.role !== 'admin') {
      throw new Error('Only instructors can create assignments.');
    }
    const payload = {
      title: assignmentData.title,
      description: assignmentData.description,
      course: assignmentData.course,
      dueDate: assignmentData.dueDate,
      pointsPossible: assignmentData.pointsPossible ?? 100,
      submissionType: assignmentData.submissionType || 'both',
      allowLateSubmissions: Boolean(assignmentData.allowLateSubmissions),
    };

    const data = await this.fetchWithAuth('/assignments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const raw = data.data?.assignment || data.assignment;
    return normalizeAssignment(raw, this.currentUser?._id, [], this.currentUser);
  }

  public async updateAssignment(
    assignmentId: string,
    assignmentData: {
      title?: string;
      description?: string;
      dueDate?: string;
      pointsPossible?: number;
      submissionType?: 'text' | 'file' | 'both';
      allowLateSubmissions?: boolean;
    }
  ): Promise<Assignment> {
    if (this.currentUser?.role !== 'instructor' && this.currentUser?.role !== 'admin') {
      throw new Error('Only instructors can update assignments.');
    }
    const data = await this.fetchWithAuth(`/assignments/${assignmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(assignmentData),
    });
    const raw = data.data?.assignment || data.assignment;
    return normalizeAssignment(raw, this.currentUser?._id, undefined, this.currentUser);
  }

  public async deleteAssignment(assignmentId: string): Promise<void> {
    if (this.currentUser?.role !== 'instructor' && this.currentUser?.role !== 'admin') {
      throw new Error('Only instructors can delete assignments.');
    }
    await this.fetchWithAuth(`/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  }

  public async submitAssignment(
    assignmentId: string,
    payload: { textContent?: string; files?: File[] }
  ): Promise<Assignment> {
    if (this.currentUser?.role === 'instructor') {
      throw new Error('Instructors cannot submit student assignments.');
    }
    const formData = new FormData();
    if (payload.textContent !== undefined) {
      formData.append('textContent', payload.textContent);
    }
    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    await this.fetchWithAuth(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: formData,
    });

    return await this.getAssignment(assignmentId);
  }

  public async getSubmissions(assignmentId: string): Promise<AssignmentSubmission[]> {
    const data = await this.fetchWithAuth(`/assignments/${assignmentId}/submissions`);
    const rawList = data.data?.submissions || data.submissions || [];
    return rawList.map(normalizeSubmission);
  }

  public async gradeSubmission(
    submissionId: string,
    gradeData: { score: number; feedback?: string }
  ): Promise<AssignmentSubmission> {
    if (this.currentUser?.role !== 'instructor' && this.currentUser?.role !== 'admin') {
      throw new Error('Only instructors can grade student submissions.');
    }
    const data = await this.fetchWithAuth(`/assignments/submissions/${submissionId}/grade`, {
      method: 'PATCH',
      body: JSON.stringify(gradeData),
    });
    const raw = data.data?.submission || data.submission;
    return normalizeSubmission(raw);
  }

  // ===================== RESOURCES SERVICES =====================

  public async getResources(courseId?: string): Promise<Resource[]> {
    if (!this.token) return [];
    try {
      const endpoint = courseId ? `/courses/${courseId}/resources` : '/resources';
      const data = await this.fetchWithAuth(endpoint);
      const rawList = data.data?.resources || data.resources || [];
      const currentUserId = this.currentUser?._id;
      return rawList.map((r: any) => normalizeResource(r, currentUserId, this.currentUser));
    } catch {
      return [];
    }
  }

  public async getResource(resourceId: string): Promise<Resource> {
    const data = await this.fetchWithAuth(`/resources/${resourceId}`);
    const raw = data.data?.resource || data.resource;
    return normalizeResource(raw, this.currentUser?._id, this.currentUser);
  }

  public async uploadResource(resourceData: {
    title: string;
    description: string;
    course: string;
    type?: 'file' | 'link' | 'text';
    category?: string;
    link?: string;
    fileType?: string;
    file?: File;
    isVisible?: boolean;
  }): Promise<Resource> {
    const formData = new FormData();
    formData.append('title', resourceData.title);
    formData.append('description', resourceData.description || '');
    formData.append('type', resourceData.type || 'file');
    if (resourceData.category) formData.append('category', resourceData.category);
    if (resourceData.link) formData.append('link', resourceData.link);
    if (resourceData.isVisible !== undefined) formData.append('isVisible', String(resourceData.isVisible));

    if (resourceData.file) {
      formData.append('file', resourceData.file);
    } else {
      const stubContent = resourceData.link || resourceData.description || resourceData.title;
      const blob = new Blob([stubContent], { type: 'application/pdf' });
      formData.append('file', blob, `${resourceData.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    }

    const data = await this.fetchWithAuth(`/resources/${resourceData.course}`, {
      method: 'POST',
      body: formData,
    });

    const raw = data.data?.resource || data.resource;
    return normalizeResource(raw, this.currentUser?._id, this.currentUser);
  }

  public async deleteResource(resourceId: string): Promise<void> {
    await this.fetchWithAuth(`/resources/${resourceId}`, { method: 'DELETE' });
  }

  public async pinResource(resourceId: string): Promise<any> {
    return await this.fetchWithAuth(`/resources/${resourceId}/pin`, { method: 'POST', noContentType: true });
  }

  public async unpinResource(resourceId: string): Promise<any> {
    return await this.fetchWithAuth(`/resources/${resourceId}/pin`, { method: 'DELETE' });
  }

  public async recordResourceView(resourceId: string): Promise<any> {
    return await this.fetchWithAuth(`/resources/${resourceId}/view`, { method: 'POST', noContentType: true });
  }

  public async likeResource(resourceId: string): Promise<any> {
    return await this.fetchWithAuth(`/resources/${resourceId}/like`, { method: 'POST', noContentType: true });
  }

  public async unlikeResource(resourceId: string): Promise<any> {
    return await this.fetchWithAuth(`/resources/${resourceId}/unlike`, { method: 'DELETE' });
  }

  public async addResourceComment(resourceId: string, content: string): Promise<any> {
    return await this.fetchWithAuth(`/resources/${resourceId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
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
      return rawList.map((d: any) => normalizeDiscussion(d, currentUserId, this.currentUser));
    } catch {
      return [];
    }
  }

  public async getDiscussion(discussionId: string): Promise<Discussion> {
    const data = await this.fetchWithAuth(`/discussions/${discussionId}`);
    const raw = data.data?.discussion || data.discussion;
    return normalizeDiscussion(raw, this.currentUser?._id, this.currentUser);
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
        tags,
      }),
    });
    const raw = data.data?.discussion || data.discussion;
    return normalizeDiscussion(raw, this.currentUser?._id, this.currentUser);
  }

  public async updateDiscussion(
    discussionId: string,
    updates: { title?: string; content?: string; isPinned?: boolean; isLocked?: boolean }
  ): Promise<Discussion> {
    const data = await this.fetchWithAuth(`/discussions/${discussionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    const raw = data.data?.discussion || data.discussion;
    return normalizeDiscussion(raw, this.currentUser?._id, this.currentUser);
  }

  public async deleteDiscussion(discussionId: string): Promise<void> {
    await this.fetchWithAuth(`/discussions/${discussionId}`, {
      method: 'DELETE',
    });
  }

  public async addReply(discussionId: string, content: string): Promise<Discussion> {
    await this.fetchWithAuth(`/discussions/${discussionId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return await this.getDiscussion(discussionId);
  }

  public async deleteReply(discussionId: string, replyId: string): Promise<void> {
    await this.fetchWithAuth(`/discussions/${discussionId}/replies/${replyId}`, {
      method: 'DELETE',
    });
  }

  public async upvoteDiscussion(discussionId: string): Promise<number> {
    try {
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
      return rawList.map((ann: any) => normalizeAnnouncement(ann, currentUserId, this.currentUser));
    } catch {
      return [];
    }
  }

  public async createAnnouncement(announcementData: {
    title: string;
    content: string;
    course: string;
  }): Promise<Announcement> {
    if (this.currentUser?.role !== 'instructor' && this.currentUser?.role !== 'admin') {
      throw new Error('Only instructors and administrators can create announcements.');
    }
    const data = await this.fetchWithAuth('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
    const raw = data.data?.announcement || data.announcement;
    return normalizeAnnouncement(raw, this.currentUser?._id, this.currentUser);
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
      body: JSON.stringify(data),
    });
    const rawUser = res.data?.user || res.user;
    const user = normalizeUser(rawUser);
    this.setCurrentUser(user);
    return user;
  }

  public async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await this.fetchWithAuth('/users/updateAvatar', {
      method: 'PATCH',
      body: formData,
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
        passwordConfirm: newPassword,
      }),
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
          ipAddress: 'Current Device',
          lastActive: 'Active Now',
          isCurrent: true,
        },
      ];
    }
  }

  public async revokeSession(sessionId: string): Promise<any> {
    return await this.fetchWithAuth(`/users/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  public async deleteAccount(): Promise<void> {
    await this.fetchWithAuth('/users/deleteMe', {
      method: 'DELETE',
    });
    this.logout();
  }
}

export const apiService = new ApiService();
