# RAG Implementation Plan for Kodix Chat

> **Status**: Not Started
> **Version**: 1.0
> **Goal**: To implement a full end-to-end Retrieval-Augmented Generation (RAG) pipeline for the Chat SubApp, enabling it to answer questions using the knowledge from the `docs/` directory.

---

## 📅 Phases & Milestones

This project is divided into four sequential phases.

### Phase 1: Backend Setup - The Indexing Pipeline

**Objective**: To parse, chunk, embed, and store our documentation in a searchable vector database.

- [ ] **1.1. Choose & Configure Vector Database:**

  - **Decision**: Select a vector database provider (e.g., Supabase with `pgvector`, Pinecone).
  - **Action**: Configure the database, including setting up the necessary tables with a `vector` column type and appropriate indexes.

- [ ] **1.2. Create the Indexing Script (`packages/db/scripts/index-docs.ts`):**

  - **Action**: Develop a new script responsible for the indexing pipeline.
  - **Details**: The script must read all `.md` files, implement a text-splitting strategy (chunking), and connect to an embedding model API (e.g., OpenAI's `text-embedding-3-small`).

- [ ] **1.3. Implement Embedding & Storage Logic:**

  - **Action**: Within the script, for each text chunk, generate a vector embedding and store the original text, the vector, and metadata (source filename) in the vector database.

- [ ] **1.4. Perform Initial Indexing:**
  - **Action**: Execute the script to populate the database with all existing documentation from the `docs/` folder.
  - **Verification**: Manually query the database to ensure the data has been stored correctly.

---

### Phase 2: Backend Logic - The Retrieval Service (`RAGService`)

**Objective**: To create a service capable of searching the indexed knowledge in real-time.

- [ ] **2.1. Create the `RAGService` (`packages/api/src/services/rag.service.ts`):**

  - **Action**: Scaffold a new service file. It will have one primary method: `search(query: string)`.

- [ ] **2.2. Implement the Search Logic:**
  - **Action**: The `search` method will:
    1.  Accept a user's query string.
    2.  Convert the query into a vector using the same embedding model from Phase 1.
    3.  Execute a similarity search query against the vector database.
    4.  Return the top K most relevant text chunks.

---

### Phase 3: Integration with `AiStudioService`

**Objective**: To connect the RAG pipeline to the chat's core logic.

- [ ] **3.1. Modify `AiStudioService` to Call `RAGService`:**

  - **Action**: Update the main prompt-generation logic within `AiStudioService`.
  - **Details**: Before calling the LLM, it should first call `RAGService.search()`.

- [ ] **3.2. Implement Context Injection:**

  - **Action**: Take the context returned by the `RAGService` and format it into the final prompt sent to the LLM, following the template defined in the [Knowledge Base Strategy](./knowledge-base-strategy.md).

- [ ] **3.3. Develop a RAG Triggering Mechanism (Optional but Recommended):**
  - **Action**: Add a condition to decide when to call the `RAGService`.
  - **Initial Idea**: Trigger RAG if `message.includes('?') && message.split(' ').length > 5`.
  - **Future Improvement**: Use a lightweight LLM call to classify user intent.

---

### Phase 4: Frontend Enhancements (UI/UX)

**Objective**: To provide a transparent and trustworthy user experience.

- [ ] **4.1. Display Sources in Chat Messages:**

  - **Action**: Update the `Message` component to parse and display source metadata returned by the backend.
  - **UI Mockup**: A small tag under the message text, e.g., `Source: docs/subapps/chat/agent-switching-architecture.md`.

- [ ] **4.2. Add Visual Feedback for RAG Activity:**
  - **Action**: Implement a UI element (e.g., a loading spinner with text "Searching knowledge base...") that appears while the `RAGService` is executing.
  - **Goal**: Keep the user informed and manage expectations on response time.
