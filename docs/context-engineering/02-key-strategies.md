# 2. Key Strategies for Context Management

Effective context engineering is not just about what you put in the context window, but also what you leave out, what you summarize, and how you structure it. At Kodix, we use four key strategies to manage the context lifecycle for our AI agents.

---

## a. Write: Persisting Context Externally

The context window is finite and expensive. The "Write" strategy involves saving information outside of the immediate context window to a more permanent or persistent location. This prevents context loss and builds a foundation for long-term memory.

- **Purpose:** To prevent loss of important information, build memory across sessions, and create a "scratchpad" for complex, multi-step tasks.
- **Key Techniques:**
  - **Scratchpads:** For a given task, the agent can "write down" its plan, intermediate thoughts, or partial results to a temporary location (like a state object or a temp file). This allows it to refer back to its own work without cluttering the main conversation history.
  - **Long-Term Memory:** The agent identifies key pieces of information (e.g., a new user preference, a decision on an architectural pattern) and saves them to a persistent database. This information can then be selectively retrieved in future sessions.
  - **Knowledge Base Updates:** In some cases, the agent can be empowered to suggest or even directly make updates to the official knowledge base (our `/docs` files), effectively contributing to its own future context.

---

## b. Select: Retrieving Relevant Context

Once information is written down, we need an intelligent way to pull it back into the context window at the right moment. The "Select" strategy is about dynamically retrieving the most relevant pieces of information for the current task. This is the core of a dynamic RAG (Retrieval-Augmented Generation) system.

- **Purpose:** To provide the agent with just-in-time, relevant information without overloading the context window with irrelevant data.
- **Key Techniques:**
  - **Semantic Search:** Using embeddings to find relevant documents or code snippets from our knowledge base based on the meaning of the user's query.
  - **Keyword & File Search:** For when the agent knows exactly what it's looking for (e.g., `grep_search` for a function name, `file_search` for a specific file).
  - **Memory Retrieval:** Querying the long-term memory store for facts or summaries related to the current user or task.
  - **Tool Selection (RAG on Tools):** If an agent has a large number of tools, a retrieval step can be used to select only the most relevant tools for the current task, simplifying the model's decision-making process.

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

  - **Sandboxed Environments:** For tasks like running code, a dedicated, isolated environment (like a Docker container or a browser sandbox) is used. The main agent's context only needs to contain the code to be executed and the final result, not all the intermediate steps of the execution itself. This is highly effective for isolating token-heavy operations.
