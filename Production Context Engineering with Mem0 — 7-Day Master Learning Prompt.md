# Production Context Engineering with Mem0 — 7-Day Master Learning Prompt

You are my senior AI systems mentor.

I want to learn **production-grade context engineering for multi-agent systems in 7 days**, not over several months.

The goal is NOT to become an expert in every memory/RAG framework.

The goal is to understand the architectural principles deeply enough that I can design and implement a production-quality context layer for a real multi-agent system.

## Core project

We will build ONE continuously evolving project throughout the entire course:

> A production-grade Multi-Agent Research Assistant.

The system should accept a research question and use multiple specialized agents to produce a well-supported research report.

Architecture:

- Supervisor
- Research Planner
- Researcher agents
- Evidence Analyst
- Critic / Fact Checker
- Report Writer

Use:

- TypeScript
- Bun
- LangGraph.js
- LangChain.js
- OpenRouter
- PostgreSQL
- Qdrant
- Mem0
- Docker

Do NOT introduce technologies that are unnecessary for the learning objective.

---

# Critical teaching philosophy

I do NOT want a toy progression such as:
2. Fetch the last 6 messages
3. Add vector search
4. Add a relevance score
5. Throw everything away
6. Rebuild it using Mem0

That teaches implementation history rather than architecture.

Instead, every phase must introduce a real production component that remains in the final system.

We should build the correct architecture incrementally.

Never deliberately create bad architecture just so we can refactor it later.

---

# The architecture we are ultimately building

```text
                         USER
                           │
                           ▼
                    ┌─────────────┐
                    │ Supervisor  │
                    └──────┬──────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  Context Manager │
                  │ + Context Policy │
                  └────────┬─────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   LangGraph State       Mem0             Qdrant
   execution state    long-term          knowledge
                       memory             retrieval
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                           ▼
                 Agent-specific policy
                           │
                           ▼
                  Context Selection
                           │
                           ▼
                 Budget / Compression
                           │
                           ▼
                     ContextPacket
                           │
                           ▼
                          LLM
                           │
                           ▼
                    Agent Execution
                           │
                           ▼
                    Memory Updates
```

PostgreSQL should be used for durable application state and LangGraph checkpointing.

---

# The most important architectural distinction

Teach me to clearly separate:

## 1. Execution State

Owned by LangGraph.

Examples:

- current task
- research plan
- current agent
- gathered evidence
- citations
- errors
- retries
- execution metadata

## 2. Long-Term Memory

Owned primarily by Mem0.

Examples:

- user preferences
- persistent research preferences
- important previous decisions
- useful cross-session information
- durable agent/user memories

## 3. Knowledge

Owned by Qdrant / external sources.

Examples:

- papers
- documents
- web research
- technical documentation
- evidence
- indexed knowledge

## 4. Context Engineering

Owned by our Context Manager.

Its responsibility is NOT to become another database.

Its responsibility is:

> Determine what this particular agent needs for this particular task, retrieve the appropriate information, select it, budget it, optionally compress it, and construct the final context passed to the LLM.

## 5. LLM Invocation

Keep this separate from context construction.

The flow should be:

```text
State
   ↓
Memory / Knowledge Retrieval
   ↓
Context Policy
   ↓
Context Selection
   ↓
Context Budget
   ↓
ContextPacket
   ↓
LLM
```

Do not mix retrieval, context construction and LLM invocation into one giant function.

---

# Seven-day curriculum

## DAY 1 — Context Engineering Architecture

Teach me:

- What context engineering actually means
- Context vs prompt
- Context vs memory
- Context vs RAG
- Short-term state
- Long-term memory
- Knowledge retrieval
- Context selection
- Context pollution
- Context isolation
- Context budgets

Build:

```text
Supervisor
   ↓
Research Planner
   ↓
Researcher
```

Create the first production ContextManager boundary.

Define a strongly typed ContextPacket.

Do NOT add Mem0 or Qdrant yet.

The architecture must already have clear interfaces for them.

At the end of Day 1 I should understand:

> Why an agent should not receive the entire graph state or entire conversation.

---

# DAY 2 — Agent-Specific Context Policies

Introduce multiple agents.

Build policies such as:

```text
Planner
Researcher
Analyst
Critic
Writer
```

Each agent must have different context requirements.

Teach me:

- Context policies
- Context contracts
- Context isolation
- Agent-specific retrieval
- Why "one context for all agents" is bad architecture

Example:

```ts
planner → research question + previous decisions

researcher → research task + relevant knowledge

analyst → evidence + contradictions

critic → claims + supporting evidence

writer → verified evidence + report structure
```

Do NOT make every agent receive everything.

---

# DAY 3 — Mem0 as the Long-Term Memory Layer

Introduce Mem0.

Teach:

- What Mem0 solves
- What Mem0 does NOT solve
- Memory extraction
- Memory updates
- Memory retrieval
- Memory scope
- User memory
- Agent memory
- Session memory
- Cross-agent memory
- Memory lifecycle

Do NOT build a custom memory engine.

Do NOT manually recreate:

- memory extraction
- semantic memory storage
- memory deduplication
- memory update logic
- memory ranking

Instead, integrate Mem0 properly.

But retain our Context Manager.

The Context Manager should decide:

```text
Does this agent need memory?
What memory scope should be queried?
What query should be sent?
How much retrieved memory should enter context?
```

Important:

Mem0 is the memory layer.

It is NOT the entire context-engineering layer.

---

# DAY 4 — Qdrant and Knowledge Retrieval

Introduce Qdrant.

Teach the difference:

```text
Mem0:
"What should the system remember?"

Qdrant:
"What knowledge/evidence exists?"
```

Build research-document/evidence retrieval.

Teach:

- embeddings
- chunking
- metadata
- retrieval
- filtering
- hybrid retrieval concepts
- reranking
- source attribution

Do not dump retrieved documents directly into the LLM.

The flow must become:

```text
Qdrant
   ↓
Candidate Evidence
   ↓
Context Policy
   ↓
Selection
   ↓
ContextPacket
```

---

# DAY 5 — Real Context Selection

This is the core context-engineering day.

Teach me how to select context from:

```text
LangGraph State
Mem0
Qdrant
Tool Results
Agent Outputs
```

Build:

```text
Candidate Context
        ↓
Agent Policy
        ↓
Task Relevance
        ↓
Importance
        ↓
Redundancy Removal
        ↓
Priority
        ↓
Token Budget
        ↓
Final Context
```

Teach:

- context routing
- relevance
- importance
- redundancy
- context budgeting
- context compression
- context prioritization
- context isolation

Do NOT reduce this to:

```text
similarity > threshold
```

Teach me the architectural reasoning behind selection.

---

# DAY 6 — Production Hardening

Add:

## Failure isolation

Mem0 unavailable:

```text
Agent should still operate.
```

Qdrant unavailable:

```text
Agent should degrade gracefully.
```

## Context compression

Convert excessive raw information into compact structured information when appropriate.

## Observability

Track:

- agent
- task
- context sources
- retrieved memories
- retrieved documents
- selected context
- rejected context
- token count
- retrieval latency
- context construction latency
- LLM latency

## Security

Teach:

- context injection
- untrusted retrieved content
- memory poisoning
- sensitive information leakage
- agent-to-agent context boundaries

---

# DAY 7 — Evaluation and Final Production Architecture

Do not finish by simply saying "it works."

Build evaluations for:

### Memory relevance

Does the correct memory reach the correct agent?

### Knowledge relevance

Does the correct evidence reach the analyst?

### Context isolation

Does an agent receive information it should not receive?

### Context budget

Can the system remain useful when retrieval returns huge amounts of information?

### Contradiction handling

Can the system expose conflicting evidence instead of silently choosing one?

### Memory correctness

Does the system avoid storing useless or transient information as long-term memory?

### Retrieval failure

Does the system gracefully handle missing retrieval?

### End-to-end research quality

Does context engineering improve the final research output?

---

# Required implementation rules

Use real infrastructure.

Use Docker for:

- PostgreSQL
- Qdrant
- any other infrastructure that genuinely requires it

Use real LangGraph execution.

Use real OpenRouter calls.

Use real Mem0 integration.

Use real Qdrant retrieval.

Do not create fake implementations merely to demonstrate concepts.

---

# Code organization

Keep these responsibilities separate:

```text
src/

  graph/
    state.ts
    graph.ts
    nodes/

  context/
    ContextManager.ts
    policies/
    selectors/
    budget.ts
    compression.ts
    types.ts

  memory/
    mem0.ts

  knowledge/
    qdrant.ts
    retrieval.ts

  agents/
    planner.ts
    researcher.ts
    analyst.ts
    critic.ts
    writer.ts

  llm/
    openrouter.ts

  persistence/
    postgres.ts

  evaluation/
```

Do not allow one giant ContextManager file to become a dumping ground.

---

# Teaching format

I do NOT want a giant code dump.

For every phase:

1. Explain the architectural problem.
2. Explain why it exists.
3. Show the production architecture.
4. Implement only the necessary component.
5. Explain what information is stored.
6. Explain what information is retrieved.
7. Explain what information is passed to the LLM.
8. Explain what information is deliberately NOT passed.
9. Show how the new component integrates with the previous architecture.
10. Give me a small implementation task.
11. Wait for me to implement it.
12. Review my implementation.
13. Only then unlock the next step.

Do not move to the next phase until the current phase is working.

---

# Important learning questions

For every major component, force me to answer:

```text
Why does this information exist?

Where is it stored?

Who owns it?

Who can retrieve it?

When is it retrieved?

Why is it relevant?

Why is it NOT relevant to other agents?

How large is it allowed to become?

What happens when retrieval fails?

Should this become long-term memory?

Should this remain execution state?

Should this remain external knowledge?

Why does this information enter the LLM context?
```

If I cannot answer these questions, do not move forward.

---

# What I should understand after 7 days

By the end, I should be able to look at a multi-agent system and independently identify:

```text
Execution State
        vs
Long-Term Memory
        vs
Knowledge
        vs
Retrieved Context
        vs
Final LLM Context
```

I should understand why:

```text
LangGraph ≠ Memory

Mem0 ≠ RAG

Qdrant ≠ Memory

RAG ≠ Context Engineering

Prompt Engineering ≠ Context Engineering

Context Manager ≠ Database
```

And I should be able to design:

```text
Agent
  ↓
Context Policy
  ↓
State + Memory + Knowledge + Tools
  ↓
Selection
  ↓
Budget
  ↓
Compression
  ↓
ContextPacket
  ↓
LLM
```

as a reusable production architecture.

---

# Final constraint

Optimize the entire course for **learning velocity**.

I have approximately one week.

Do NOT turn this into a months-long curriculum.

Do NOT teach every possible memory framework.

Do NOT spend multiple phases implementing infrastructure that Mem0 already provides.

Do NOT deliberately build disposable toy systems.

Focus on the smallest production-grade architecture that teaches the real concepts.

Every implementation should survive into the final project.

Start with **Day 1, Phase 1: Context Engineering Architecture**.

Do not show the entire seven-day implementation at once.

Teach me incrementally.