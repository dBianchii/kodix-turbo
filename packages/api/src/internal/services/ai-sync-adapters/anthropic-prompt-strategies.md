# Anthropic Prompt Strategies Documentation

## Overview

This document describes the prompt engineering strategies used for different Anthropic Claude models. Each model has specific characteristics that require tailored approaches for optimal agent switching and prompt handling.

## Strategy Types

### Claude Advanced (`claude-advanced`)

- **Used for**: Claude 4 series, Claude 3.5 Sonnet, Claude 3 Opus
- **Characteristics**: High contextual memory, resistant to instruction changes
- **Approach**: Aggressive reset with XML tags and explicit identity override

### Claude Standard (`claude-standard`)

- **Used for**: Claude 3.5 Haiku, Claude 3 Haiku
- **Characteristics**: More responsive to instruction changes, balanced performance
- **Approach**: Gentle reset with clear but less aggressive language

## Configuration Fields

### `type`

The strategy type that determines the overall approach:

- `claude-advanced`: For high-capability models that resist change
- `claude-standard`: For balanced models with good instruction following

### `agentSwitchTemplate`

The template style used for agent switching. This is a **key** that references a template in `prompt-templates.json`.

- `xml-tags-high`: Uses an aggressive XML structure for high-capability models.
- `xml-tags-default`: Uses a standard XML structure.
- `simple`: Uses straightforward markdown formatting for legacy models.

### `assertiveness`

The level of assertiveness in instructions:

- `high`: Very demanding language ("IGNORE COMPLETELY", "MUST FOLLOW")
- `medium`: Firm but polite language
- `low`: Gentle suggestions

### `contextualMemory`

How much the model retains from previous context:

- `high`: Strong memory, requires aggressive resets
- `medium`: Balanced memory retention
- `low`: Easily overridden context

### `specialHandling`

Array of special techniques applied:

- `system-reset`: Complete system context reset
- `identity-override`: Explicit identity replacement
- `gentle-reset`: Soft transition approach

## Model-Specific Strategies

### Claude 4 & 3.5 Sonnet Models

These models have the strongest contextual memory and require the most aggressive approach:

```json
{
  "type": "claude-advanced",
  "agentSwitchTemplate": "xml-tags",
  "assertiveness": "high",
  "contextualMemory": "low",
  "specialHandling": ["system-reset", "identity-override"]
}
```

**Reasoning**: These models are designed to maintain consistency and resist sudden changes. They require explicit XML tags and very assertive language to override their natural tendency to maintain the existing conversation pattern.

### Claude 3.5 Haiku & 3 Haiku Models

These models are more responsive and don't require as aggressive an approach:

```json
{
  "type": "claude-standard",
  "agentSwitchTemplate": "simple",
  "assertiveness": "medium",
  "contextualMemory": "medium",
  "specialHandling": ["gentle-reset"]
}
```

**Reasoning**: Haiku models are optimized for speed and efficiency, making them more responsive to instruction changes without requiring aggressive resets.

## Usage in Code

The strategies are loaded automatically by the `AiStudioService`. The service identifies the model's `universalModelId`, retrieves the corresponding strategy from `anthropic-prompt-strategies.json`, and uses the `agentSwitchTemplate` key to get the correct prompt from `prompt-templates.json`. The final prompt is then constructed and sent to the provider.

## Best Practices

1. **Always use XML tags for advanced models**: Claude 3.5 Sonnet and above respond best to structured XML.

2. **Be explicit about identity changes**: Use phrases like "You are NO LONGER X" and "You are NOW Y".

3. **Separate context from identity**: Keep general context guidelines separate from agent-specific instructions.

4. **Test with real conversations**: Prompt strategies should be validated with actual multi-turn conversations.

## Updating Strategies

When adding new Claude models or updating existing ones:

1. Determine the model's capability level (advanced vs standard)
2. Test the model's resistance to instruction changes
3. Update the JSON file with appropriate strategy configuration
4. Document any model-specific quirks or requirements

## References

- [Anthropic Claude Documentation](https://docs.anthropic.com/en/docs/about-claude)
- [Prompt Engineering Best Practices](../../../../../../docs/subapps/ai-studio/playbook-prompt-engineering.md)
- [Agent Switching Architecture](../../../../../../docs/subapps/chat/agent-switching-architecture.md)
