# OpenAI Prompt Strategies Documentation

## Overview

This document describes the prompt engineering strategies used for OpenAI's GPT and O-series models. Each model family has unique characteristics that require different approaches for agent switching.

## Strategy Types

### GPT Advanced (`gpt-advanced`)

- **Used for**: `gpt-4o`, `gpt-4-turbo`, `gpt-4.1`
- **Characteristics**: High capability, strong contextual memory. Responds well to structured, hierarchical instructions.
- **Approach**: Uses a priority system and explicit role overrides.

### GPT Standard (`gpt-standard`)

- **Used for**: `gpt-4o-mini`, `gpt-3.5-turbo`, `gpt-4.1-mini`
- **Characteristics**: Balanced performance, good instruction following.
- **Approach**: A simple, direct instruction set with a gentle reset.

### GPT Lite (`gpt-lite`)

- **Used for**: `gpt-4.1-nano`
- **Characteristics**: Very fast, lightweight, designed for minimal context.
- **Approach**: A minimal and concise prompt.

### Reasoning Model (`reasoning-model`)

- **Used for**: O-series models (`o1`, `o3`, etc.)
- **Characteristics**: Specialized for complex reasoning, follows step-by-step instructions.
- **Approach**: A prompt that encourages a chain-of-thought process.

## Configuration Fields

(See `anthropic-prompt-strategies.md` or `google-prompt-strategies.md` for detailed field descriptions.)

## Model-Specific Strategies & Exceptions

### Standard GPT Models (`gpt-4o`, `gpt-4-turbo`)

These models use the `gpt-advanced` strategy with a `hierarchical-default` template key, which provides clear, prioritized instructions from `prompt-templates.json`.

```json
{
  "type": "gpt-advanced",
  "agentSwitchTemplate": "hierarchical-default",
  "assertiveness": "medium",
  "contextualMemory": "high",
  "specialHandling": ["priority-system", "role-override"]
}
```

### O-Series Reasoning Models (`o1`, `o3`)

These models are specialized for reasoning and use the `reasoning-focused` template key to encourage step-by-step thinking.

```json
{
  "type": "reasoning-model",
  "agentSwitchTemplate": "reasoning-focused",
  "assertiveness": "high",
  "contextualMemory": "high",
  "specialHandling": ["reasoning-chain", "step-by-step"]
}
```

### Configuration Note for `o1-mini`

The `o1-mini` model requires a specific strategy that differs from other O-series models. While it is a reasoning model, empirical testing has shown that it does not respond well to complex templates like `reasoning-focused`.

- **Problem**: Using a complex template causes `o1-mini` to ignore agent switch instructions.
- **Solution**: The strategy for `o1-mini` in `openai-prompt-strategies.json` is intentionally configured to use the `simple` template key. This provides a clear, direct instruction from the centralized `prompt-templates.json` file that the model can follow reliably.

```json
// packages/api/src/internal/services/ai-sync-adapters/openai-prompt-strategies.json
{
  "modelId": "o1-mini",
  "strategy": {
    "type": "gpt-advanced",
    "agentSwitchTemplate": "simple",
    "assertiveness": "medium",
    "contextualMemory": "low",
    "specialHandling": ["gentle-reset"]
  }
}
```

This is a critical **configuration**, not a code exception. The system correctly applies this specific strategy because it is defined in the JSON file. It demonstrates the importance of tailoring strategies to the specific behavior of each model.

## Best Practices

1.  **Use Hierarchical for Advanced GPT**: `gpt-4o` and above benefit from the structure of the `hierarchical` template.
2.  **Use Simple for Standard/Lite GPT**: Less powerful models respond better to direct, simple instructions.
3.  **Use Reasoning for O-Series**: The `reasoning-focused` template is designed for these models (except for `o1-mini`).
4.  **Do Not Change `o1-mini` without testing**: The current strategy is the result of specific debugging and is known to work.

## Updating Strategies

When adding new OpenAI models:

1.  Categorize the model (`advanced`, `standard`, `lite`, `reasoning`).
2.  Assign a template key based on its family (`hierarchical-default`, `simple`, `reasoning-focused`).
3.  **If the model is a small reasoning model, test the `simple` template first.**
4.  Update the `openai-prompt-strategies.json` file.

## References

- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Agent Switching Architecture](../../../../../../docs/subapps/chat/agent-switching-architecture.md)
