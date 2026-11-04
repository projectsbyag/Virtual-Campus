import { apiService } from './api';
import { Course } from '../types';

export interface SeedProgress {
  step: string;
  progress: number;
  total: number;
}

export const SEED_COURSES = [
  {
    code: 'CSC 301',
    name: 'Design & Analysis of Algorithms',
    description: 'Algorithmic complexity, Bellman-Ford negative weight cycle detection, dynamic programming recurrences, amortized bounds, maximum network flow, and NP-completeness proofs.',
    color: '#000000',
    enrollmentCode: 'CSC301'
  },
  {
    code: 'CSC 340',
    name: 'Distributed Systems & Cloud Architecture',
    description: 'Consensus protocols (Raft, Paxos), vector clocks, distributed transactions (2PC, Sagas), Byzantine fault tolerance, and high-throughput replication architectures.',
    color: '#171717',
    enrollmentCode: 'CSC340'
  },
  {
    code: 'CSC 380',
    name: 'Database Storage Engines & Query Optimization',
    description: 'Relational storage engines, concurrent B+ Tree latch crabbing, Write-Ahead Logging (WAL), ARIES crash recovery, and cost-based query plan optimizers.',
    color: '#262626',
    enrollmentCode: 'CSC380'
  },
  {
    code: 'CSC 415',
    name: 'Deep Learning & Neural Architectures',
    description: 'Transformer multi-head self-attention, backpropagation mathematics, loss landscape optimization, rotary positional embeddings, and distributed GPU training.',
    color: '#0a0a0a',
    enrollmentCode: 'CSC415'
  }
];

export const SEED_ASSIGNMENTS: Record<string, Array<{ title: string; description: string; daysFromNow: number; points: number }>> = {
  'CSC 301': [
    {
      title: 'Problem Set 4: Bellman-Ford & Negative Cycles',
      description: 'Implement the Bellman-Ford algorithm with early termination. Prove that detecting a negative weight cycle requires inspecting distance improvements on the V-th relaxation step. Include cycle path extraction.',
      daysFromNow: 3,
      points: 100
    },
    {
      title: 'Midterm Coding Exam: Dynamic Programming',
      description: 'Solve optimal matrix chain multiplication, longest common subsequence, and knapsack problem under strict O(N*W) time and O(W) space constraints.',
      daysFromNow: 8,
      points: 150
    }
  ],
  'CSC 340': [
    {
      title: 'Lab 3: Raft Leader Election & Heartbeats',
      description: 'Implement RequestVote and AppendEntries RPC handlers in Python/Go. Simulate network partitions and verify that a minority partition cannot elect a leader or commit entries.',
      daysFromNow: 5,
      points: 100
    },
    {
      title: 'Design Doc: Two-Phase Commit with Coordinator Failure Recovery',
      description: 'Specify state transitions, prepare/commit log records, and timeout recovery protocols when the coordinator crashes after phase 1.',
      daysFromNow: 11,
      points: 80
    }
  ],
  'CSC 380': [
    {
      title: 'Milestone 2: Concurrent B+ Tree Indexing Engine',
      description: 'Build a page-based B+ Tree storage engine supporting concurrent reads and writes with latch crabbing protocol. Ensure root split and leaf node merges pass concurrency stress tests.',
      daysFromNow: 7,
      points: 100
    }
  ],
  'CSC 415': [
    {
      title: 'Mini-Project 3: Vectorized Multi-Head Self-Attention',
      description: 'Derive and implement Scaled Dot-Product Attention Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V in PyTorch without using torch.nn.MultiheadAttention. Visualize attention matrix heatmaps.',
      daysFromNow: 12,
      points: 120
    }
  ]
};

export const SEED_DISCUSSIONS: Record<string, Array<{ title: string; content: string; tags: string[] }>> = {
  'CSC 301': [
    {
      title: 'Clarification: Why does Bellman-Ford require V-1 relaxations before cycle test?',
      content: 'Can someone explain why a simple shortest path without cycles can have at most V-1 edges, and why any relaxation improvement on iteration V strictly implies a negative cycle?',
      tags: ['bellman-ford', 'graph-theory', 'algorithms', 'homework-help']
    },
    {
      title: 'Dynamic Programming vs Memoization Space Overhead in Python',
      content: 'When writing recurrences for 2D DP grids, is the recursion stack frame depth significant enough to prefer iterative tabular arrays over functools.lru_cache?',
      tags: ['dynamic-programming', 'optimization', 'python']
    }
  ],
  'CSC 340': [
    {
      title: 'Raft split votes: Randomized election timeout ranges',
      content: 'In paper Section 5.2, Diego Ongaro suggests timeouts between 150ms and 300ms. Has anyone experimented with shorter ranges (e.g. 50-100ms) on low-latency LANs?',
      tags: ['raft', 'consensus', 'distributed-systems']
    }
  ],
  'CSC 415': [
    {
      title: 'Mathematical intuition behind 1/sqrt(d_k) scaling factor in Attention',
      content: 'If components of Q and K are independent zero-mean unit-variance variables, their dot product has mean 0 and variance d_k. Scaling by sqrt(d_k) keeps the variance at 1, avoiding softmax gradient saturation!',
      tags: ['transformers', 'attention', 'deep-learning', 'math-proof']
    }
  ]
};

export const SEED_ANNOUNCEMENTS = [
  {
    title: 'Midterm Examination Logistics & Approved Formula Sheet Guidelines',
    content: 'The Spring 2026 Midterm Examination will take place in Turing Hall Auditorium on Thursday. A single double-sided handwritten 8.5x11 reference sheet is permitted. Office hours are extended this week.'
  },
  {
    title: 'Campus AI Study Engine Update: Real-Time LaTeX and Code Syntax Grounding',
    content: 'Virtual Campus now features verified syllabus grounding, step-by-step math derivations, and custom exam practice quiz generation via Campus AI.'
  },
  {
    title: 'Faculty Office Hours Schedule (Spring 2026)',
    content: 'Prof. Alan Turing office hours: Tuesdays & Thursdays 2:00 PM - 4:30 PM in Room 304 and online via Campus chat.'
  }
];

export const SEED_RESOURCES = [
  {
    courseCode: 'CSC 301',
    title: 'Lecture 12: Bellman-Ford & Negative Weight Cycles',
    description: 'Complete slide deck covering single-source shortest paths on directed graphs with negative edge weights and negative cycle detection algorithms.'
  },
  {
    courseCode: 'CSC 301',
    title: 'Dynamic Programming Recurrence Cheat Sheet',
    description: 'Standard recurrence formulas for 0/1 Knapsack, Longest Common Subsequence, Matrix Chain Multiplication, and Bellman-Ford DP formulation.'
  },
  {
    courseCode: 'CSC 340',
    title: 'In Search of an Understandable Consensus Algorithm (Raft Paper)',
    description: 'Annotated copy of the landmark consensus paper by Ongaro and Ousterhout with diagrammatic walk-throughs of log replication and safety invariants.'
  },
  {
    courseCode: 'CSC 415',
    title: 'Attention Is All You Need Annotated Companion',
    description: 'Step-by-step tensor dimensions, positional encoding equations, and multi-head projection guide for Transformer architectures.'
  }
];

/**
 * Pushes comprehensive seed curriculum to the live Render backend database.
 */
export async function seedLiveDatabase(
  onProgress?: (progress: SeedProgress) => void
): Promise<{
  success: boolean;
  message: string;
  createdCourses: number;
  createdAssignments: number;
  createdDiscussions: number;
  createdAnnouncements: number;
  createdResources: number;
}> {
  const originalUser = apiService.getCurrentUser();
  const originalToken = apiService.getToken();

  let instructorToken = originalToken;
  let isTempInstructor = false;

  const totalSteps = 12;
  let currentStep = 0;

  const update = (step: string) => {
    currentStep++;
    onProgress?.({ step, progress: currentStep, total: totalSteps });
  };

  try {
    // Step 1: Ensure instructor authority for creating courses/assignments
    update('Verifying instructor authorization on live Render backend...');

    if (!originalUser || originalUser.role !== 'instructor') {
      isTempInstructor = true;
      try {
        const loginRes = await apiService.login('prof.turing@campus.edu', 'Password123!');
        instructorToken = loginRes.token;
      } catch {
        // Auto-register instructor if account does not exist yet on Render
        const regRes = await apiService.register(
          'Alan Turing',
          'prof.turing@campus.edu',
          'Computer Science',
          'instructor',
          'Password123!'
        );
        instructorToken = regRes.token;
      }
    }

    // Step 2: Fetch existing courses from live Render backend
    update('Scanning existing courses in database...');
    const existingCourses = await apiService.getCourses();
    const courseMap = new Map<string, Course>();
    existingCourses.forEach((c) => {
      courseMap.set(c.code, c);
    });

    let createdCourses = 0;
    let createdAssignments = 0;
    let createdDiscussions = 0;
    let createdAnnouncements = 0;
    let createdResources = 0;

    // Step 3: Create missing courses
    for (const sc of SEED_COURSES) {
      if (!courseMap.has(sc.code)) {
        update(`Pushing course to DB: ${sc.code} - ${sc.name}...`);
        try {
          const newCourse = await apiService.createCourse({
            code: sc.code,
            name: sc.name,
            description: sc.description,
            color: sc.color,
            enrollmentCode: sc.enrollmentCode
          });
          courseMap.set(sc.code, newCourse);
          createdCourses++;
        } catch (err) {
          console.warn(`Could not create course ${sc.code}:`, err);
        }
      }
    }

    // Refresh courses list to ensure IDs are active
    const activeCourses = await apiService.getCourses();
    activeCourses.forEach((c) => courseMap.set(c.code, c));

    // Step 4: Seed Assignments
    update('Pushing curriculum problem sets and project milestones...');
    for (const [code, assignments] of Object.entries(SEED_ASSIGNMENTS)) {
      const course = courseMap.get(code);
      if (!course) continue;

      for (const a of assignments) {
        try {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + a.daysFromNow);
          await apiService.createAssignment({
            title: a.title,
            description: a.description,
            course: course._id,
            dueDate: dueDate.toISOString(),
            points: a.points
          });
          createdAssignments++;
        } catch (err) {
          console.warn(`Could not seed assignment "${a.title}":`, err);
        }
      }
    }

    // Step 5: Seed Discussions
    update('Seeding academic discussions and peer discourse...');
    for (const [code, discussions] of Object.entries(SEED_DISCUSSIONS)) {
      const course = courseMap.get(code);
      if (!course) continue;

      for (const d of discussions) {
        try {
          await apiService.createDiscussion(d.title, d.content, course._id, d.tags);
          createdDiscussions++;
        } catch (err) {
          console.warn(`Could not seed discussion "${d.title}":`, err);
        }
      }
    }

    // Step 6: Seed Resources
    update('Uploading verified lecture notes and reference guides...');
    for (const r of SEED_RESOURCES) {
      const course = courseMap.get(r.courseCode);
      if (!course) continue;

      try {
        await apiService.uploadResource({
          title: r.title,
          description: r.description,
          course: course._id
        });
        createdResources++;
      } catch (err) {
        console.warn(`Could not seed resource "${r.title}":`, err);
      }
    }

    // Step 7: Seed Announcements
    update('Publishing university bulletins and exam notices...');
    const firstCourse = activeCourses[0];
    if (firstCourse) {
      for (const ann of SEED_ANNOUNCEMENTS) {
        try {
          await apiService.createAnnouncement({
            title: ann.title,
            content: ann.content,
            course: firstCourse._id
          });
          createdAnnouncements++;
        } catch (err) {
          console.warn(`Could not seed announcement "${ann.title}":`, err);
        }
      }
    }

    // Step 8: Restore student session & enroll student in all seeded courses if applicable
    if (isTempInstructor && originalUser && originalToken) {
      update('Enrolling student account in all curriculum courses...');
      // Restore student session
      apiService.setToken(originalToken);
      apiService.setCurrentUser(originalUser);

      for (const [, course] of courseMap.entries()) {
        try {
          await apiService.enrollCourse(course._id, course.code);
        } catch {
          // already enrolled or enrollment non-blocking
        }
      }
    }

    update('Seed operation finalized successfully!');

    return {
      success: true,
      message: `Database populated: ${createdCourses} courses, ${createdAssignments} assignments, ${createdDiscussions} discussions, ${createdResources} resources.`,
      createdCourses,
      createdAssignments,
      createdDiscussions,
      createdAnnouncements,
      createdResources
    };
  } catch (err: any) {
    if (isTempInstructor && originalUser && originalToken) {
      apiService.setToken(originalToken);
      apiService.setCurrentUser(originalUser);
    }
    return {
      success: false,
      message: err?.message || 'Failed to populate database with seed curriculum.',
      createdCourses: 0,
      createdAssignments: 0,
      createdDiscussions: 0,
      createdAnnouncements: 0,
      createdResources: 0
    };
  }
}
