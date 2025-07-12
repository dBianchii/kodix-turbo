# AI Engine Migration: Visual Architecture

This document provides a visual representation of the architectural changes proposed in the [AI Engine Migration Execution Plan](ai-engine-migration-execution-plan.md).

```mermaid
graph TD
    subgraph "Current Architecture (Before Migration)"
        direction LR
        A["Client<br/>(useChat hook)"] --> B{"Chat API Route<br/>apps/kdx/.../route.ts"};
        B -- "Directly uses" --> C(("Vercel AI SDK<br/>@ai-sdk/openai, etc."));
        B -- "Fetches data" --> D["AiStudioService<br/>(getModel, getToken)"];
        B -- "Saves message" --> E["ChatService<br/>(createMessage)"];

        style B fill:#f9f,stroke:#333,stroke-width:2px,color:#fff
    end

    subgraph "Proposed Architecture (After Migration)"
        direction LR
        A2["Client<br/>(useChat hook)"] --> B2{"Chat API Route<br/>(Simplified Proxy)"};
        B2 -- "Delegates to" --> D2[AiStudioService];
        D2 -- "Encapsulates" --> C2((Vercel AI SDK));
        D2 -- "Executes onFinish<br/>(via callback)" --> E2["ChatService<br/>(createMessage)"];

        style D2 fill:#9cf,stroke:#333,stroke-width:2px,color:#fff
    end

    linkStyle 0 stroke-width:2px,fill:none,stroke:orange;
    linkStyle 1 stroke-width:2px,fill:none,stroke:red;
    linkStyle 2 stroke-width:2px,fill:none,stroke:blue;
    linkStyle 3 stroke-width:2px,fill:none,stroke:green;

    linkStyle 4 stroke-width:2px,fill:none,stroke:orange;
    linkStyle 5 stroke-width:2px,fill:none,stroke:purple;
    linkStyle 6 stroke-width:2px,fill:none,stroke:purple;
    linkStyle 7 stroke-width:2px,fill:none,stroke:purple;


```

## Key Changes Explained

### Before Migration

1.  **Thick API Route**: The **Chat API Route** is responsible for everything. It directly interacts with the Vercel AI SDK, fetches configuration from `AiStudioService`, and saves messages using `ChatService`.
2.  **Decentralized Logic**: All the complex streaming logic, provider-specific handling, and metadata creation is duplicated within the API route.
3.  **`AiStudioService` as Data Provider**: The service's role is passive; it only provides data and has no knowledge of the streaming process.

### After Migration

1.  **Thin API Route (Proxy)**: The **Chat API Route** becomes a simple proxy. Its only job is to authenticate the request, gather necessary data, and delegate the entire streaming operation to `AiStudioService`.
2.  **Centralized AI Engine**: The **`AiStudioService`** becomes the central AI engine. It encapsulates all interactions with the Vercel AI SDK, including model creation, streaming, and `onFinish` callbacks.
3.  **Decoupled & Reusable**: The streaming logic is now decoupled from the API route and can be reused by any other part of the application (e.g., another SubApp, a background job) just by calling the `streamChatResponse` method.
