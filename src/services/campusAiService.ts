import { CampusAIMessage } from '../types';

export interface CampusAiPrompt {
  id: string;
  title: string;
  category: 'concept' | 'exam' | 'code' | 'summary';
  prompt: string;
  courseTag: string;
  icon: string;
}

export type CampusAiStudyMode = 'tutor' | 'exam_prep' | 'code_review' | 'concept_explainer';

export const QUICK_PROMPTS: CampusAiPrompt[] = [
  {
    id: 'p1',
    title: 'Bellman-Ford Negative Cycle',
    category: 'concept',
    courseTag: 'CSC 301',
    icon: 'fas fa-project-diagram',
    prompt: 'Explain how Bellman-Ford detects negative weight cycles in graphs, and why we need V-1 relaxations.'
  },
  {
    id: 'p2',
    title: 'Self-Attention Formula Intuition',
    category: 'concept',
    courseTag: 'CSC 415',
    icon: 'fas fa-brain',
    prompt: 'Can you break down the Transformer Scaled Dot-Product Attention formula: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V?'
  },
  {
    id: 'p3',
    title: 'B+ Tree Storage & Fan-Out Quiz',
    category: 'exam',
    courseTag: 'CSC 340',
    icon: 'fas fa-tasks',
    prompt: 'Generate an interactive 1-question practice quiz on Balanced Trees vs B+ Trees with 4 options and an explanation.'
  },
  {
    id: 'p4',
    title: 'Raft Consensus Leader Election',
    category: 'summary',
    courseTag: 'CSC 380',
    icon: 'fas fa-network-wired',
    prompt: 'Summarize the 3 states of a Raft node (Follower, Candidate, Leader) and how heartbeat timers prevent split votes.'
  },
  {
    id: 'p5',
    title: 'Dynamic Programming Recurrence',
    category: 'code',
    courseTag: 'CSC 301',
    icon: 'fas fa-code',
    prompt: 'Show the 0/1 Knapsack dynamic programming bottom-up table formulation in Python with time and space complexity breakdown.'
  },
  {
    id: 'p6',
    title: 'ACID vs BASE in Modern DBs',
    category: 'summary',
    courseTag: 'CSC 340',
    icon: 'fas fa-database',
    prompt: 'Compare ACID guarantees in relational PostgreSQL with BASE semantics in NoSQL/eventually consistent distributed systems.'
  }
];

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
}

class CampusAiService {
  private activeMode: CampusAiStudyMode = 'tutor';
  private selectedCourseFilter: string = 'all';

  private messages: CampusAIMessage[] = [
    {
      id: 'welcome',
      role: 'assistant',
      content: `### 👋 Welcome to Campus AI Study Assistant!
I am your dedicated curriculum tutor, research co-pilot, and exam preparation partner. 

\`\`\`python
# System Initialized: Campus Academic Intelligence v2.5
status = "Online & Grounded in Course Syllabi"
courses = ["CSC 301: Algorithms", "CSC 340: Database Systems", "CSC 380: Distributed Systems", "CSC 415: Deep Learning"]
\`\`\`

#### What I Can Help You With:
1. **Algorithmic Proofs & Invariants:** Step-by-step mathematical reasoning and edge cases.
2. **Interactive Concept Checks:** Targeted multiple-choice quizzes with instant grading.
3. **Verified Course Citations:** Direct pointers to relevant campus lecture slides and cheat sheets.
4. **Code & Complexity Breakdowns:** Python, C++, and TypeScript implementations with Big-O analysis.

Select a quick topic above or ask anything regarding your current modules!`,
      timestamp: 'Just now',
      citations: [
        { title: 'Spring 2026 CS Curriculum Handbook', course: 'General', type: 'Syllabus' }
      ],
      suggestedQuestions: [
        'Explain how Bellman-Ford detects negative cycles',
        'Break down Transformer Self-Attention',
        'Generate an exam practice quiz for CSC 301',
        'How does Raft leader election work?'
      ]
    }
  ];

  public setMode(mode: CampusAiStudyMode) {
    this.activeMode = mode;
  }

  public getMode(): CampusAiStudyMode {
    return this.activeMode;
  }

  public setCourseFilter(courseCode: string) {
    this.selectedCourseFilter = courseCode;
  }

  public getCourseFilter(): string {
    return this.selectedCourseFilter;
  }

  public getMessages(): CampusAIMessage[] {
    return this.messages;
  }

  public clearHistory(): void {
    this.messages = [this.messages[0]];
  }

  public async *streamResponse(userPrompt: string): AsyncGenerator<string, void, unknown> {
    const promptLower = userPrompt.toLowerCase();

    let fullAnswer = '';
    let citations: CampusAIMessage['citations'] = [];
    let quiz: CampusAIMessage['quiz'] | undefined = undefined;

    if (promptLower.includes('bellman') || promptLower.includes('negative cycle') || (promptLower.includes('graph') && promptLower.includes('cycle'))) {
      citations = [
        { title: 'Dynamic Programming Cheat Sheet & Recurrence Templates', course: 'CSC 301', type: 'PDF Guide' },
        { title: 'Lecture 12: Single-Source Shortest Paths', course: 'CSC 301', type: 'Slides' }
      ];
      fullAnswer = `### Bellman-Ford Negative Cycle Detection

In a directed graph with $V$ vertices and $E$ edges:

#### 1. Why Exactly $V - 1$ Iterations?
The shortest simple path between any two vertices can contain at most $V - 1$ edges (otherwise it would revisit an already-visited vertex, which would constitute a cycle). 

Relaxing all edges $V - 1$ times guarantees that the shortest paths to all reachable vertices are mathematically locked in, assuming **no negative-weight cycles** exist.

#### 2. The $V$-th Iteration Test
If we run a single additional relaxation pass (the $V$-th iteration) and observe any edge $(u, v)$ where:
$$\\text{dist}[u] + \\text{weight}(u, v) < \\text{dist}[v]$$
then a **negative-weight cycle exists**! 

Why? Because we found an alternate path with $V$ or more edges that decreases the total distance, which is only physically possible if distance decreases indefinitely around a cycle.

#### 3. Python Negative Cycle Reconstructor
\`\`\`python
def find_negative_cycle(num_vertices, edges):
    dist = [0] * num_vertices
    predecessor = [-1] * num_vertices
    cycle_vertex = -1

    for i in range(num_vertices):
        cycle_vertex = -1
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                predecessor[v] = u
                cycle_vertex = v

    if cycle_vertex == -1:
        return None  # No negative-weight cycle exists

    # Step into the cycle to avoid leading tail paths
    curr = cycle_vertex
    for _ in range(num_vertices):
        curr = predecessor[curr]

    # Reconstruct the cycle traversal
    cycle = [curr]
    p = predecessor[curr]
    while p != curr:
        cycle.append(p)
        p = predecessor[p]
    cycle.append(curr)
    cycle.reverse()
    return cycle
\`\`\`

💡 **Exam Tip for Midterms:** You can initialize distances with $0$ across all vertices if you need to detect negative cycles anywhere in disconnected components without adding a dummy source node!`;
    } else if (promptLower.includes('attention') || promptLower.includes('transformer') || promptLower.includes('scaled dot')) {
      citations = [
        { title: 'Attention Is All You Need — Annotated Paper', course: 'CSC 415', type: 'Annotated PDF' },
        { title: 'Transformer Architecture & Self-Attention Walkthrough', course: 'CSC 415', type: 'Lecture Notes' }
      ];
      fullAnswer = `### Scaled Dot-Product Attention: Intuition & Mathematics

The iconic attention formula from Vaswani et al. is:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$

Here is the exact step-by-step mechanical breakdown:

#### 1. The Matrices: Query ($Q$), Key ($K$), Value ($V$)
- **Query ($Q$):** What a token is searching for (e.g., the word *"it"* asking *"which noun do I refer to?"*).
- **Key ($K$):** What each candidate token advertises about itself.
- **Value ($V$):** The contextual informational payload that gets pooled forward.

#### 2. Dot Product ($QK^T$)
Computes similarity scores across all token pairs. A large dot product means two token vectors point in similar geometric directions in the latent embedding space.

#### 3. Why Divide by $\\sqrt{d_k}$? (The Scaling Factor)
When embedding dimension $d_k$ is high (e.g. $d_k = 64$ or $128$):
$$\\text{Var}(q \\cdot k) = d_k$$
Unscaled dot products blow up into very large magnitudes. Passing large magnitudes into the **softmax** function forces output probabilities to $0$ and $1$, plunging gradients to near-zero (the **vanishing gradient problem**). 

Dividing by $\\sqrt{d_k}$ pulls the variance back to $1$, preserving healthy non-zero gradients for backpropagation.

\`\`\`python
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
        
    attn_weights = F.softmax(scores, dim=-1)
    output = torch.matmul(attn_weights, V)
    return output, attn_weights
\`\`\``;
    } else if (promptLower.includes('quiz') || promptLower.includes('test me') || promptLower.includes('practice question') || promptLower.includes('fan-out')) {
      quiz = {
        question: 'In a B+ Tree index with order M, why are data records or pointers stored ONLY in the leaf nodes, while internal nodes store only search keys?',
        options: [
          'Because leaf nodes are kept in RAM while internal nodes stay on disk',
          'It maximizes the fan-out of internal nodes, fitting more keys per disk page block',
          'It avoids needing rebalancing rotations during insertions',
          'To satisfy ACID durability requirements in the WAL log'
        ],
        correctIndex: 1,
        explanation: 'Correct! By keeping internal nodes minimal (keys + child page pointers only, without data payloads), a standard 4KB or 8KB disk page can hold hundreds of branches. This dramatically lowers the tree height to 3 or 4 levels even for millions of rows!'
      };
      citations = [
        { title: 'CSC 340 Midterm Review & Indexing Cheat Sheet', course: 'CSC 340', type: 'Exam Guide' }
      ];
      fullAnswer = `### 🎯 Targeted Concept Check: B+ Tree Indexing

Here is an exam-style multiple choice question based on your **CSC 340 (Database Systems)** curriculum.

**Topic:** B+ Tree Physical Layout, Block Storage, & Fan-Out Optimization
Select your choice below to verify your answer and review the explanation:`;
    } else if (promptLower.includes('raft') || promptLower.includes('consensus') || promptLower.includes('distributed')) {
      citations = [
        { title: 'Lecture 7 Slides: Raft vs. Paxos in High-Throughput Clusters', course: 'CSC 380', type: 'Slide Deck' },
        { title: 'In Search of an Understandable Consensus Algorithm (Ongaro & Ousterhout)', course: 'CSC 380', type: 'Paper' }
      ];
      fullAnswer = `### Raft Consensus: States & Leader Election Mechanics

Raft decomposes distributed consensus into 3 independent sub-problems: **Leader Election**, **Log Replication**, and **Safety**.

#### 1. The Three Node States
- **Follower:** Completely passive. Responds to incoming RPCs from candidates and leaders. If it receives no heartbeat before its election timer fires, it converts to **Candidate**.
- **Candidate:** Increments its \`currentTerm\`, votes for itself, and broadcasts \`RequestVote\` RPCs to all peers in parallel.
- **Leader:** Coordinates all client writes, appends log entries, sends heartbeats, and updates \`commitIndex\`.

#### 2. The Split-Vote Solution: Randomized Election Timers
To prevent split votes where two candidates start an election simultaneously and divide votes 50/50:
- Raft picks election timeouts randomly from a fixed window (typically **150ms to 300ms**).
- One node almost always times out first, requests votes, wins a simple majority ($> N/2$), and sends heartbeats before rival timers expire.

\`\`\`
[Follower] --(election timeout)--> [Candidate] --(wins majority)--> [Leader]
     ^                                   |                             |
     +------------(discovers term)-------+-----------------------------+
\`\`\``;
    } else if (promptLower.includes('knapsack') || promptLower.includes('dp') || promptLower.includes('dynamic programming')) {
      citations = [
        { title: 'Dynamic Programming Cheat Sheet & Recurrence Templates', course: 'CSC 301', type: 'PDF Guide' }
      ];
      fullAnswer = `### 0/1 Knapsack Dynamic Programming Solution

Given $N$ items with weights $W = [w_1, \\dots, w_N]$ and values $V = [v_1, \\dots, v_N]$, and a knapsack capacity $C$:

#### 1. Recurrence Relation
Let $DP[i][w]$ be the maximum value attainable using a subset of the first $i$ items with total weight at most $w$:

$$DP[i][w] = \\begin{cases} 
DP[i-1][w] & \\text{if } w_i > w \\\\ 
\\max(DP[i-1][w],\\ DP[i-1][w - w_i] + v_i) & \\text{otherwise} 
\\end{cases}$$

#### 2. Python Space-Optimized Implementation ($O(C)$ Memory)
\`\`\`python
def knapsack_01(weights, values, capacity):
    # Space optimized to 1D array
    dp = [0] * (capacity + 1)
    
    for w_i, v_i in zip(weights, values):
        # Iterate backwards to ensure each item is only used once
        for w in range(capacity, w_i - 1, -1):
            dp[w] = max(dp[w], dp[w - w_i] + v_i)
            
    return dp[capacity]

# Example test:
weights = [2, 3, 4, 5]
values = [3, 4, 5, 8]
capacity = 5
print("Max Knapsack Value:", knapsack_01(weights, values, capacity))  # Output: 8
\`\`\`

**Complexity:**
- **Time:** $O(N \\times C)$ (Pseudo-polynomial in capacity)
- **Space:** $O(C)$ using the reverse 1D array trick`;
    } else if (promptLower.includes('acid') || promptLower.includes('base') || promptLower.includes('database')) {
      citations = [
        { title: 'CSC 340: Relational Transactions & Distributed Consistency', course: 'CSC 340', type: 'Slides' }
      ];
      fullAnswer = `### ACID vs. BASE Paradigm Comparison

#### ACID (Relational / Strongly Consistent Systems)
1. **Atomicity:** All modifications in a transaction succeed or all rollback (Write-Ahead Logging / WAL).
2. **Consistency:** Database transitions only between valid states meeting all schema constraints.
3. **Isolation:** Concurrent transactions execute without cross-contamination (Serializability / Snapshot Isolation via 2PL or MVCC).
4. **Durability:** Committed transactions persist on non-volatile disk blocks even during catastrophic power loss.

#### BASE (Distributed / High-Availability NoSQL)
1. **Basically Available:** The cluster prioritizes availability over immediate consistency (answering even with stale replicas).
2. **Soft State:** Data values may change over time without explicit user interaction due to background reconciliation.
3. **Eventual Consistency:** Given enough time without new updates, all replicas converge to identical state (Vector Clocks / CRDTs).

| Dimension | ACID (e.g. Postgres) | BASE (e.g. Cassandra, DynamoDB) |
|---|---|---|
| Focus | Absolute correctness & consistency | Horizontal scaling & 99.999% uptime |
| CAP Theorem Stance | CP (Consistency + Partition Tolerance) | AP (Availability + Partition Tolerance) |
| Transactions | Multi-table ACID support | Single-row or eventual consensus |`;
    } else {
      citations = [
        { title: 'Spring 2026 Academic Catalog & Lecture Library', course: 'Virtual Campus', type: 'Guide' }
      ];
      fullAnswer = `### Academic Insight & Study Recommendations

Thank you for your question regarding **"${userPrompt}"**. Here is how to approach this systematically within your coursework:

#### 1. Core Principles & Theoretical Foundation
- **Invariants First:** Define your base constraints, boundary edge cases, and state transitions.
- **Asymptotic Footprint:** Always benchmark asymptotic runtime ($O(N)$, $O(N \\log N)$, or $O(V+E)$) against memory cache locality.

#### 2. Curriculum Connection
- Look up the corresponding lecture slides in the **Resources Library** tab to cross-examine definitions and professor proofs.
- Discuss tricky trade-offs with peers in the **Discussions Forum**.

Would you like me to:
- Generate a 3-question **practice quiz** on this topic?
- Walk through a complete **step-by-step code implementation**?
- Provide an **exam cheat sheet** summary?`;
    }

    // High quality streaming word cadence
    const words = fullAnswer.split(' ');
    for (let i = 0; i < words.length; i++) {
      yield words[i] + (i < words.length - 1 ? ' ' : '');
      await new Promise(resolve => setTimeout(resolve, 14));
    }

    // Append to message history
    const assistantMessage: CampusAIMessage = {
      id: 'msg-' + Date.now(),
      role: 'assistant',
      content: fullAnswer,
      timestamp: 'Just now',
      citations,
      quiz,
      suggestedQuestions: [
        'Explain this with a code example',
        'What are common exam pitfalls for this topic?',
        'Generate another practice quiz question'
      ]
    };
    this.messages.push(assistantMessage);
  }

  public addUserMessage(content: string): CampusAIMessage {
    const msg: CampusAIMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content,
      timestamp: 'Just now'
    };
    this.messages.push(msg);
    return msg;
  }
}

export const campusAiService = new CampusAiService();
