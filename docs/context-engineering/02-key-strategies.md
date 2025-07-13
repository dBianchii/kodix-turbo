<!-- AI-METADATA:
category: methodology
complexity: intermediate
updated: 2025-07-13
claude-ready: true
priority: high
token-optimized: true
audience: developers
ai-context-weight: important
-->

# 2. Key Strategies for Context Management

<!-- AI-CONTEXT-BOUNDARY: start -->

Effective context engineering is not just about what you put in the context window, but also what you leave out, what you summarize, and how you structure it. At Kodix, we use four key strategies to manage the context lifecycle for our AI agents.

> **Current Implementation Status**: These strategies represent the conceptual framework. Actual implementation varies by AI assistant and use case.

---

## a. Write: Persisting Context Externally

The context window is finite and expensive. The "Write" strategy involves saving information outside of the immediate context window to a more permanent or persistent location. This prevents context loss and builds a foundation for long-term memory.

- **Purpose:** To prevent loss of important information, build memory across sessions, and create a "scratchpad" for complex, multi-step tasks.
- **Current Implementation:**
  - **Documentation Updates:** AI assistants can create and update documentation files, effectively persisting context for future use
  - **PRP System:** The PRP workflow saves feature specifications and implementation details as structured documents
  - **TODO Lists:** AI assistants use todo tracking to maintain task state across a session
  - **Planned:** Database-backed long-term memory for user preferences and project decisions

---

## b. Select: Retrieving Relevant Context

Once information is written down, we need an intelligent way to pull it back into the context window at the right moment. The "Select" strategy is about dynamically retrieving the most relevant pieces of information for the current task. This is the core of a dynamic RAG (Retrieval-Augmented Generation) system.

- **Purpose:** To provide the agent with just-in-time, relevant information without overloading the context window with irrelevant data.
- **Current Implementation:**
  - **File Search:** AI assistants use tools like `Grep`, `Glob`, and `Read` to find relevant code and documentation
  - **Documentation RAG:** The `/docs` directory serves as a searchable knowledge base
  - **Context Loading:** Strategic loading of rule files (CLAUDE.md) and relevant documentation
  - **Planned:** Vector database integration for semantic search across the entire codebase

---

## c. Compress: Reducing Context Noise

More context is not always better. As a conversation or task progresses, the history can become long and filled with redundant or low-value information. The "Compress" strategy focuses on summarizing or trimming the context to keep it concise and potent.

- **Purpose:** To manage the size of the context window, reduce costs/latency, and prevent the model from getting distracted by irrelevant details (Context Distraction/Confusion).
- **Key Techniques:**
  - **Summarization:** Using an LLM to create a condensed summary of the conversation history or a long document. This can be done recursively.
  - **Trimming/Pruning:** Using heuristics to remove less important parts of the context. Common strategies include:
    - Keeping the first message (for initial instructions).
    - Keeping the last N messages.
    - Removing intermediate tool call results that are no longer relevant.
  - **Structured Data:** Instead of providing a long, unstructured text blob, compress information into a structured format like JSON, which is more token-efficient and easier for the model to parse.

---

## d. Isolate: Separating Context for Complex Tasks

Some tasks are too complex for a single agent with a single context window. The "Isolate" strategy involves breaking down a problem and assigning different parts to specialized sub-agents or sandboxed environments, each with its own isolated context.

- **Purpose:** To enable parallelization, assign specialized tasks to expert agents, and prevent different lines of reasoning from interfering with each other (Context Clash).
- **Key Techniques:**

  - **Multi-Agent Systems:** A "supervisor" or "lead" agent decomposes a problem and delegates sub-tasks to a team of specialized agents. Each sub-agent has its own instructions, tools, and context window, focused exclusively on its part of the task.

    ```mermaid
    graph TD
        A[User Request] --> B{Lead Agent};
        B -- Sub-task 1 --> C[Research Agent<br/>(Own Context)];
        B -- Sub-task 2 --> D[Coding Agent<br/>(Own Context)];
        C -- Results --> B;
        D -- Results --> B;
        B --> E[Final Response];

        style C fill:#cce5ff,stroke:#005c99,stroke-width:2px
        style D fill:#cce5ff,stroke:#005c99,stroke-width:2px
    ```

  - **Task Isolation:** Complex tasks are broken down using the Task tool, which creates isolated execution contexts
  - **PRP Phases:** The PRP workflow naturally isolates planning (generate-prp) from execution (execute-prp) phases

<!-- AI-CONTEXT-BOUNDARY: end -->
