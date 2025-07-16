# Prompt Engineering Guide: Strategies by AI Model

> **Source**: Based on official provider documentation (Anthropic, OpenAI, Google) and internal testing.
> **Status**: ✅ Active & Consolidated
> **Related**: [Agent Switching Architecture](./agent-switching-architecture.md) | [Context Engineering](./context-engineering.md)

## 1. Index

1.  [Overview of Prompt Architecture](#2-prompt-architecture-overview)
2.  [The Principle: Model-Specific Strategies](#3-the-principle-model-specific-strategies)
3.  [Strategy for Anthropic (Claude)](#4-strategy-for-anthropic-claude)
4.  [Strategy for OpenAI (GPT)](#5-strategy-for-openai-gpt)
5.  [Strategy for Google (Gemini)](#6-strategy-for-google-gemini)
6.  [Solving Contextual Inertia (Agent Switching)](#7-solving-contextual-inertia-agent-switching)

---

## 2. Prompt Architecture Overview

The `AiStudioService` dynamically constructs the `systemPrompt` for each request. The complexity of this prompt varies significantly based on two factors:

1.  **The Selected AI Model**: Each model family (Claude, GPT, Gemini) responds best to different prompt structures.
2.  **The Occurrence of an Agent Switch**: If an agent switch is detected, the service applies a "Hard Reset" strategy to force the identity change.

The logic for determining which strategy to use is managed by the **Model Sync Adapters**, which use JSON configuration files to define the behavior for each model.

## 3. The Principle: Model-Specific Strategies

There is no "silver bullet" for prompt engineering. Different models are trained with distinct architectures and datasets, which influences how they interpret instructions.

- **Claude models** are explicitly trained to follow XML structures and "constitutions."
- **GPT models** respond well to clear hierarchies and imperative language.
- **Gemini models** are optimized for a "conversational" flow and respond well to direct commands.

Our system is designed to respect these nuances by applying the most effective strategy for each provider.

---

## 4. Strategy for Anthropic (Claude)

### The Approach: "Constitutional" with XML Tags

Claude models are designed to think in terms of rules and constitutions. They respond with extremely high reliability to instructions encapsulated in XML tags.

- **Strategy Name**: `claude-advanced`
- **Key Attributes**: Uses `xml-tags`, high `assertiveness`, and `low` contextual memory to force a clean reset.

### Generated Prompt Structure (`buildClaudeAgentSwitchPrompt`)

```xml
<system_reset>
CRITICAL IDENTITY CHANGE DETECTED
You are no longer the previous assistant.

<new_identity>
You are now {{agentName}}.
{{agentInstructions}}
</new_identity>

MANDATORY CONFIRMATION:
- COMPLETELY forget the previous identity
- IMMEDIATELY adopt the new identity
</system_reset>
```

**Why it works**: The `<system_reset>` tag is a high-priority command that instructs the model to discard the previous state. The nested `<new_identity>` provides the new context in a structured format, which is Claude's preferred format.

---

## 5. Strategy for OpenAI (GPT)

### The Approach: "Hierarchical" with Explicit Priority

GPT models, like GPT-4o, excel at following command hierarchies. The strategy is to create an "override" block that signals a top-priority instruction.

- **Strategy Name**: `gpt-advanced`
- **Key Attributes**: Uses a `hierarchical` template with `medium` assertiveness.

### Generated Prompt Structure (`buildGPTAgentSwitchPrompt`)

```
==== PRIORITY OVERRIDE ====
USER REQUESTED AGENT SWITCH

Previous assistant identity: TERMINATED
New assistant identity: {{agentName}}

MANDATORY INSTRUCTIONS:
{{agentInstructions}}

CONFIRMATION REQUIRED:
- Acknowledge identity change
- Introduce yourself as {{agentName}}
==== END PRIORITY OVERRIDE ====
```

**Why it works**: The framing with `==== PRIORITY OVERRIDE ====` and the use of terms like `TERMINATED` and `MANDATORY` create a sense of urgency and importance that causes the model to prioritize this block over the preceding conversation history.

### OpenAI Strategy Tiers

The `gpt-advanced` strategy is the most assertive, but not always necessary. The system uses a tiered approach to apply the right level of force, optimizing for performance and reliability. These strategies are defined in `openai-prompt-strategies.json`.

#### 1. `gpt-advanced` (For High-End Models)

- **Models**: `gpt-4o`, `gpt-4.1`, `o1-pro`, `o1`, and exceptions like `o1-mini`.
- **Template**: `hierarchical`
- **Logic**: Uses the `==== PRIORITY OVERRIDE ====` block. This is the most effective approach for forcing an identity change in powerful models.
- **Use Case**: Best for advanced models and smaller models that exhibit strong contextual "stubbornness."

#### 2. `gpt-standard` (For Standard Models)

- **Models**: `gpt-4o-mini`, `gpt-3.5-turbo`.
- **Template**: `simple`
- **Logic**: A more direct, less ceremonious instruction without the "override" block. It's sufficient for less complex models that don't have strong contextual inertia.
- **Use Case**: For cost-effective models that respond well to direct instructions.

#### 3. `gpt-lite` (For Lightweight Models)

- **Models**: `gpt-4.1-nano`.
- **Template**: `simple`
- **Assertiveness**: `low`
- **Logic**: An even gentler version of the `simple` strategy, suitable for very small models that don't require strong commands.
- **Use Case**: For the fastest and most economical models.

#### 4. `reasoning-model` (For Reasoning Tasks)

- **Models**: `o3-mini`, `o4-mini`, `o1-preview`.
- **Template**: `reasoning-focused`
- **Logic**: The prompt is optimized to guide the model through a logical thought process (`step-by-step`, `reasoning-chain`).
- **⚠️ ALERT**: This strategy is **ineffective for agent switching**, as it focuses on problem-solving, not identity change. Use with caution.

### The `o1-mini` Exception: A Critical Case Study

During testing, it was found that the `o1-mini` model, despite being a "reasoning model," **does not respond to the `reasoning-focused` strategy** for agent switching. It exhibits strong contextual inertia and ignores the identity change.

**MANDATORY SOLUTION:**

- The `o1-mini` model **MUST use the `gpt-advanced` strategy**.
- **Justification**: Only the `hierarchical` template with `PRIORITY OVERRIDE` is assertive enough to force `o1-mini` to discard its previous identity.

When adding new "o-series" models, especially "mini" versions, it is critical to test agent switching and apply the `gpt-advanced` strategy if the `reasoning-focused` one fails.

---

## 6. Strategy for Google (Gemini)

### The Approach: "Conversational" with Direct Command

Gemini models are optimized for a natural dialogue flow. The best strategy is to behave like a "director" in the conversation, giving a clear and direct command for the role change.

- **Strategy Name**: `google-advanced`
- **Key Attributes**: Uses a `direct-command` template.

### Generated Prompt Structure (`buildGoogleAgentSwitchPrompt`)

```
[SYSTEM COMMAND: ROLE CHANGE]

Attention: Your role has changed.

You are no longer the previous assistant. You are now {{agentName}}.

Follow these instructions:
{{agentInstructions}}

Confirm your new identity in your next response.
```

**Why it works**: The structure mimics a system instruction within a conversation (`[SYSTEM COMMAND]`). The language is direct and clear, acting as a new directive in the dialogue flow, which is how Gemini is trained to operate.

---

## 7. Agent Switching and Contextual Inertia

> 🔁 This content has been moved to [agent-switching](./agent-switching/)

The primary challenge of **Contextual Inertia** occurs when powerful LLMs maintain the personality of a previous agent even after being given new instructions. Our model-specific "Hard Reset" strategies were developed to overcome this.

> 📋 **Complete Implementation**: See [Agent Switching](./agent-switching/) for full technical details on solving contextual inertia.
