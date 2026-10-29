import { CampusAIMessage } from '../types';

export interface CampusAiPrompt {
  id: string;
  title: string;
  category: 'exam' | 'code' | 'summary' | 'concept';
  prompt: string;
}

export const QUICK_PROMPTS: CampusAiPrompt[] = [
  {
    id: 'p1',
    title: 'Explain Bellman-Ford Negative Cycle',
    category: 'concept',
    prompt: 'Explain how Bellman-Ford detects negative weight cycles in graphs, and why we need V-1 relaxations.'
  },
  {
    id: 'p2',
    title: 'Self-Attention Formula Intuition',
    category: 'concept',
    prompt: 'Can you break down the Transformer Scaled Dot-Product Attention formula: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V?'
  },
  {
    id: 'p3',
    title: 'Generate Practice Quiz for Midterms',
    category: 'exam',
    prompt: 'Generate an interactive 1-question practice quiz on Balanced Trees vs B+ Trees with 4 options and an explanation.'
  },
  {
    id: 'p4',
    title: 'Raft Consensus Leader Election',
    category: 'summary',
    prompt: 'Summarize the 3 states of a Raft node (Follower, Candidate, Leader) and how heartbeat timers prevent split votes.'
  }
];

class CampusAiService {
  private messages: CampusAIMessage[] = [
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Welcome to Campus AI!** I am your 24/7 academic tutor, research assistant, and study partner.

Here is what I can help you with:
- **Concept Deep Dives:** Ask about tricky course topics (Dynamic Programming, Transformers, Distributed Consensus).
- **Exam & Quiz Prep:** Ask me to quiz you on any module.
- **Resource Explanations:** Get plain-English breakdowns of research papers and lecture slides.
- **Assignment Hints:** Work through conceptual blockers on homework without violating academic honesty.

What topic are we exploring today?`,
      timestamp: 'Just now',
      suggestedQuestions: [
        'Explain how Bellman-Ford detects negative cycles',
        'Break down Transformer Self-Attention',
        'Generate an exam practice quiz for CSC 301',
        'How does Raft leader election work?'
      ]
    }
  ];

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

    if (promptLower.includes('bellman') || promptLower.includes('negative cycle') || promptLower.includes('graph')) {
      citations = [
        { title: 'Dynamic Programming Cheat Sheet & Recurrence Templates', course: 'CSC 301', type: 'PDF Guide' }
      ];
      fullAnswer = `### Bellman-Ford Negative Cycle Detection

In a directed graph with $V$ vertices and $E$ edges:

1. **Why $V - 1$ Iterations?**
   The shortest simple path between any two vertices can contain at most $V - 1$ edges (otherwise it would revisit a vertex, creating a cycle). Relaxing all edges $V - 1$ times guarantees that the shortest paths to all reachable vertices are found if there are no negative-weight cycles.

2. **The $V$-th Iteration Test:**
   If we run an additional relaxation pass (the $V$-th iteration) and find any edge $(u, v)$ where:
   $$\\text{dist}[u] + \\text{weight}(u, v) < \\text{dist}[v]$$
   then a **negative-weight cycle exists**! Why? Because we found an alternate path with $V$ or more edges that decreases the total distance, which is only mathematically possible if distance can decrease infinitely around a cycle.

3. **Reconstructing the Negative Cycle Vertices:**
   \`\`\`python
   # Trace back predecessors V times to enter the cycle
   curr = v
   for _ in range(num_vertices):
       curr = predecessor[curr]

   # Now traverse the cycle until we return to curr
   cycle = [curr]
   p = predecessor[curr]
   while p != curr:
       cycle.append(p)
       p = predecessor[p]
   cycle.reverse()
   \`\`\`
   
💡 **Pro Tip for Problem Set 4:** You can initialize distances with $0$ across all vertices if you need to detect negative cycles anywhere in disconnected components!`;
    } else if (promptLower.includes('attention') || promptLower.includes('transformer') || promptLower.includes('scaled dot')) {
      citations = [
        { title: 'Attention Is All You Need — Annotated Paper', course: 'CSC 415', type: 'Annotated PDF' }
      ];
      fullAnswer = `### Scaled Dot-Product Attention: Intuition & Mathematics

The iconic attention formula from Vaswani et al.:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$

Here is what each component represents in layman's terms:

1. **Query ($Q$), Key ($K$), Value ($V$):**
   - **Query ($Q$):** What a word is searching for (e.g., the pronoun *"it"* is looking for its antecedent noun).
   - **Key ($K$):** What each word offers or represents.
   - **Value ($V$):** The actual informational content passed forward.

2. **Dot Product ($QK^T$):**
   Computes similarity scores between every query and all keys. A high dot product means the model thinks these two words should attend to each other strongly.

3. **Why divide by $\\sqrt{d_k}$? (The Scaling Factor):**
   When the embedding dimension $d_k$ is large (e.g., $d_k = 64$ or $128$), the dot products grow proportionally large in magnitude ($E[q \\cdot k] = 0, \\text{Var}(q \\cdot k) = d_k$).
   Pumping large values into the **softmax** function pushes activations into regions with tiny gradients (the vanishing gradient problem!). Dividing by $\\sqrt{d_k}$ stabilizes the variance to $1$, keeping gradients healthy during backpropagation.

4. **Multiplication by $V$:**
   Takes a weighted sum of all Values based on the normalized attention probabilities.`;
    } else if (promptLower.includes('quiz') || promptLower.includes('test me') || promptLower.includes('practice question')) {
      quiz = {
        question: 'In a B+ Tree index with order M, why are data records or pointers stored ONLY in the leaf nodes, while internal nodes store only search keys?',
        options: [
          'Because leaf nodes are kept in RAM while internal nodes stay on disk',
          'It maximizes the fan-out of internal nodes, fitting more keys per disk page block',
          'It avoids needing rebalancing rotations during insertions',
          'To satisfy ACID durability requirements in the WAL log'
        ],
        correctIndex: 1,
        explanation: 'Correct! By keeping internal nodes small (keys + child page pointers only, no payload), a single 4KB disk page can hold hundreds of branches. This dramatically lowers the tree height to 3 or 4 levels even for millions of rows!'
      };
      fullAnswer = `### 🎯 Practice Quiz Question

Here is a targeted exam question based on your **CSC 340 (Database Systems)** syllabus:

**Topic:** B+ Tree Storage Layout & Fan-Out Optimization
Try selecting your answer below!`;
    } else if (promptLower.includes('raft') || promptLower.includes('consensus') || promptLower.includes('distributed')) {
      citations = [
        { title: 'Lecture 7 Slides: Raft vs. Paxos in High-Throughput Clusters', course: 'CSC 380', type: 'Slide Deck' }
      ];
      fullAnswer = `### Raft Consensus: States & Leader Election

Raft decomposes distributed consensus into 3 independent sub-problems: **Leader Election**, **Log Replication**, and **Safety**.

#### 1. The Three States
- **Follower:** Passive node. Responds to RPCs from candidates and leaders. If it receives no communication within an election timeout, it assumes the leader died and transitions to Candidate.
- **Candidate:** Increments its current \`term\`, votes for itself, and sends \`RequestVote\` RPCs to all peers.
- **Leader:** Handles all client requests, replicates log entries via \`AppendEntries\` RPCs, and sends periodic empty heartbeats to reset follower election timers.

#### 2. Randomized Election Timers
To prevent **split votes** (where two candidates start an election at the exact same millisecond and split votes 50/50), Raft randomizes election timeouts between **150ms and 300ms**. This ensures one node almost always times out first, claims majority votes, and becomes the leader before peers compete.`;
    } else {
      fullAnswer = `Thank you for asking! In our **Virtual Campus** curriculum, this connects directly with your enrolled courses.

### Key Conceptual Takeaways:
1. **Core Principle:** Always break the problem down into base cases, state transitions, and boundary invariants.
2. **Computational Complexity:** Consider the trade-off between memory footprint (RAM/cache) and asymptotic runtime ($O(V+E)$, $O(N \\log N)$, or $O(N^2)$).
3. **Campus Library Link:** You can check out the related lecture slides and cheat sheets in the **Resources Library** tab.

Would you like me to:
- Generate a 3-question practice quiz on this topic?
- Show a step-by-step code example in Python / TypeScript?
- Provide an exam-style conceptual summary?`;
    }

    // Stream word-by-word with small realistic delays
    const words = fullAnswer.split(' ');
    for (let i = 0; i < words.length; i++) {
      yield words[i] + (i < words.length - 1 ? ' ' : '');
      // Yield cadence
      await new Promise(resolve => setTimeout(resolve, 15));
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
        'What are the common exam pitfalls for this?',
        'Give me another practice question'
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
