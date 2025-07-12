# Google Prompt Strategies Documentation

## Overview

This document outlines the prompt engineering strategies for Google's Gemini models. Different model families have distinct behaviors, requiring tailored strategies for effective agent switching.

## Strategy Types

### Google Advanced (`google-advanced`)

- **Used for**: `gemini-2.5-pro`, `gemini-1.5-pro`
- **Characteristics**: High capability, strong context retention. Requires clear, direct commands.
- **Approach**: Uses structured commands and explicit role assignments.

### Google Standard (`google-standard`)

- **Used for**: `gemini-2.5-flash`, `gemini-1.5-flash`
- **Characteristics**: Balanced performance with good instruction following.
- **Approach**: Simple and direct instructions without complex structures.

### Google Lite (`google-lite`)

- **Used for**: `gemini-2.5-flash-lite`, `gemini-1.5-flash-8b`
- **Characteristics**: Fast and efficient, designed for minimal context.
- **Approach**: A minimal prompt that is direct and concise.

### Google Legacy (`google-legacy`)

- **Used for**: `gemini-1.0-pro`
- **Characteristics**: Older model version requiring a basic approach for compatibility.
- **Approach**: A simple, non-assertive prompt.

## Configuration Fields

### `type`

The overall strategy category:

- `google-advanced`: For high-capability models.
- `google-standard`: For standard, balanced models.
- `google-lite`: For lightweight, fast models.
- `google-legacy`: For older, legacy models.

### `agentSwitchTemplate`

The template style for the agent switch prompt. This is a **key** that references a template in `prompt-templates.json`.

- `direct-command`: Uses a command-like structure for high-capability models.
- `direct-simple`: Uses simple, direct instructions for standard models.
- `simple`: A basic template for legacy or lightweight models.

### `assertiveness`

The level of forcefulness in the instructions:

- `high`: Demanding language (not typically used for Gemini).
- `medium`: Firm, clear instructions.
- `low`: Gentle, suggestive instructions.

### `contextualMemory`

An estimation of how much the model retains from prior context:

- `high`: Strong memory, may require very explicit new instructions.
- `medium`: Balanced memory.
- `low`: Context is easily overwritten.

### `specialHandling`

An array of special techniques applied:

- `command-structure`: Uses a command-and-control format.
- `role-assignment`: Explicitly assigns a new role to the model.
- `direct-instructions`: Provides straightforward instructions.
- `minimal-context`: Assumes the model needs very little context.
- `legacy-compatibility`: Ensures the prompt works with older model versions.

## Model-Specific Strategies

### Gemini Pro Models (`-pro`)

```json
{
  "type": "google-advanced",
  "agentSwitchTemplate": "direct-command",
  "assertiveness": "medium",
  "contextualMemory": "high",
  "specialHandling": ["command-structure", "role-assignment"]
}
```

**Reasoning**: These models respond well to clear, structured commands and explicit role definitions.

### Gemini Flash Models (`-flash`)

```json
{
  "type": "google-standard",
  "agentSwitchTemplate": "direct-simple",
  "assertiveness": "medium",
  "contextualMemory": "medium",
  "specialHandling": ["direct-instructions"]
}
```

**Reasoning**: Standard Flash models are efficient and follow direct instructions well without needing a heavy command structure.

## Usage in Code

The strategies defined in `google-prompt-strategies.json` are loaded by the `AiStudioService`. The service uses the `agentSwitchTemplate` key from the strategy to select the correct prompt template from the centralized `prompt-templates.json` file, ensuring the right prompt structure is used for each Gemini model.

## Best Practices

1.  **Be Direct**: Gemini models respond well to direct and clear instructions.
2.  **Use `direct-command` for Pro models**: The most capable models benefit from a structured, command-like prompt.
3.  **Test New Models**: When a new Gemini model is released, test it with existing strategy types (`advanced`, `standard`, `lite`) to find the best fit.

## Updating Strategies

When adding new Gemini models:

1.  Categorize the model based on its name and capabilities (`pro`, `flash`, `lite`).
2.  Assign the corresponding strategy `type`.
3.  Update the `google-prompt-strategies.json` file.
4.  Document any new findings or model-specific behaviors in this file.

## References

- [Google AI Prompting Strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)
- [Agent Switching Architecture](../../../../../../docs/subapps/chat/agent-switching-architecture.md)
