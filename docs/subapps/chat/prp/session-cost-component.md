
# PRP: Chat Session Cost Component

## 1. Feature Description

This feature introduces a new UI component in the chat interface that displays the real-time cost of the active chat session in USD. The component will provide users with immediate feedback on their consumption of AI resources.

## 2. Rationale

- **Cost Transparency**: Users should be aware of the costs they are incurring during a chat session.
- **Resource Management**: Helps users and teams manage their AI budgets effectively.
- **Improved User Experience**: Provides valuable, real-time information to the user.

## 3. Technical Implementation Plan

### 3.1. Backend (tRPC API)

1.  **Create a new tRPC endpoint**: `chat.getSessionCost`
    -   **Input**: `sessionId: string`
    -   **Output**: `{ cost: number }`
2.  **Endpoint Logic**:
    -   Fetch all messages for the given `sessionId` using `chatRepository.ChatMessageRepository`.
    -   For each message, retrieve the token count from the `metadata` field. If the token count is not available, this feature cannot be implemented.
    -   Fetch the `aiModel` associated with the `chatSession`.
    -   Retrieve the cost per token from the `config` field of the `aiModel`. The `config` field is expected to have a structure like `{ "costPerInputToken": 0.0001, "costPerOutputToken": 0.0002 }`.
    -   Calculate the cost for each message (distinguishing between input and output tokens if possible).
    -   Sum the costs of all messages to get the total session cost.
    -   Return the total cost.

### 3.2. Frontend (React Component)

1.  **Create a new React component**: `SessionCost.tsx`
    -   This component will be placed in the `apps/kdx/src/app/[locale]/(authed)/apps/chat/_components/` directory.
2.  **Component Logic**:
    -   Use the `useTRPC()` hook to call the `chat.getSessionCost` endpoint.
    -   The component should take the `sessionId` as a prop.
    -   Display the returned cost in a clear and concise way (e.g., "Session Cost: $0.12").
    -   The component should automatically update as new messages are sent and received. This can be achieved by calling the endpoint again when the messages in the chat window change.
3.  **Integration**:
    -   Integrate the `SessionCost` component into the `ActiveChatWindow.tsx` component, likely near the `TokenUsageBadge` or other session-related information.

## 4. Data Schema Changes

No database schema changes are required if the `metadata` field in `chatMessage` and the `config` field in `aiModel` contain the necessary information. If not, the following changes will be needed:

-   **`chatMessage` table**: Add `inputTokens: number` and `outputTokens: number` columns.
-   **`aiModel` table**: Add `costPerInputToken: number` and `costPerOutputToken: number` columns to the `config` JSON field.

## 5. Acceptance Criteria

-   A new component displaying the session cost is visible in the chat interface.
-   The cost is displayed in USD and updated in real-time.
-   The calculation is accurate based on the token usage and model pricing.
-   The new tRPC endpoint is well-tested.
-   The new React component is well-tested.

