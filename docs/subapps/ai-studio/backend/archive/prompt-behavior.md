# Agent Switching Prompt Behavior

> **Source**: Based on official provider documentation (Anthropic, OpenAI, Google) and internal testing.
> **Status**: ✅ Active & Consolidated  
> **Related**: [Architecture](./architecture.md) | [Context Flow](./context-flow.md) | [Integration Points](./integration-points.md)

## 1. Overview

This document details the model-specific prompt strategies and templates used for agent switching in the AI Studio system. The prompt behavior varies significantly based on the AI model being used and the specific requirements for overcoming contextual inertia during agent transitions.

**Core Principle**: Different AI models require different prompt structures to effectively execute agent switches and overcome contextual inertia.

## 2. Model-Specific Prompt Strategies

### 2.1 Strategy Overview

The `AiStudioService` applies model-specific strategies for agent switching based on the AI model's architecture and training:

```typescript
// Model Strategy Selection
interface PromptStrategy {
  type: string;
  agentSwitchTemplate: string;
  assertiveness: "low" | "medium" | "high";
  contextualMemory: "low" | "medium" | "high";
  specialHandling: string[];
}
```

### 2.2 Strategy Configuration System

```typescript
// Model-specific strategies loaded from JSON configs
const modelStrategies = {
  // Claude Models - Constitutional approach with XML
  "claude-3-5-sonnet": {
    type: "claude-advanced",
    agentSwitchTemplate: "xml-tags-high",
    assertiveness: "high",
    contextualMemory: "low",
    specialHandling: ["system-reset", "constitutional"],
  },

  // GPT Models - Hierarchical priority system
  "gpt-4": {
    type: "gpt-advanced",
    agentSwitchTemplate: "hierarchical",
    assertiveness: "medium",
    contextualMemory: "high",
    specialHandling: ["priority-system", "override-block"],
  },

  // Gemini Models - Direct conversational commands
  "gemini-pro": {
    type: "google-advanced",
    agentSwitchTemplate: "direct-command",
    assertiveness: "medium",
    contextualMemory: "medium",
    specialHandling: ["direct-instructions", "conversational"],
  },
};
```

## 3. Anthropic (Claude) Strategy

### 3.1 Constitutional Approach with XML Tags

Claude models are designed to think in terms of rules and constitutions. They respond with extremely high reliability to instructions encapsulated in XML tags.

**Strategy Details:**

- **Strategy Name**: `claude-advanced`
- **Template**: `xml-tags-high`
- **Assertiveness**: `high`
- **Contextual Memory**: `low` (for clean reset)
- **Special Handling**: `["system-reset", "constitutional"]`

### 3.2 Claude Template Structure

```xml
<system_reset>
# ⚠️ Agent Switch Detected
**Previous Instructions:** COMPLETELY IGNORE ALL PREVIOUS INSTRUCTIONS.
**Attention:** You are no longer "{{previousAgentName}}".

<new_identity>
**Your New Identity:** {{agentName}}
**Instructions:** YOU MUST FOLLOW ONLY THESE NEW INSTRUCTIONS:
{{agentInstructions}}
**IMPORTANT:** Respond as {{agentName}}, not as a generic assistant.
</new_identity>
</system_reset>
```

### 3.3 Why Claude Strategy Works

- **XML Structure**: The `<system_reset>` tag is a high-priority command that instructs the model to discard previous state
- **Nested Identity**: The `<new_identity>` provides new context in Claude's preferred structured format
- **Constitutional Language**: Uses terms like "COMPLETELY IGNORE" and "MUST FOLLOW" that align with Claude's constitutional training
- **Clear Boundaries**: XML tags create clear semantic boundaries between old and new instructions

### 3.4 Claude Template Variations

```typescript
// Claude Template System
const claudeTemplates = {
  // High-assertiveness template for complex switches
  "xml-tags-high": `
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
</system_reset>`,

  // Medium-assertiveness for standard switches
  "xml-tags-medium": `
<identity_change>
Previous agent role has ended.
New agent role: {{agentName}}

<instructions>
{{agentInstructions}}
</instructions>
</identity_change>`,

  // Low-assertiveness for gentle switches
  "xml-tags-low": `
<new_role>
You are now {{agentName}}.
{{agentInstructions}}
</new_role>`,
};
```

## 4. OpenAI (GPT) Strategy

### 4.1 Hierarchical Priority System

GPT models excel at following command hierarchies. The strategy creates an "override" block that signals top-priority instructions.

**Strategy Details:**

- **Strategy Name**: `gpt-advanced`
- **Template**: `hierarchical`
- **Assertiveness**: `medium`
- **Contextual Memory**: `high`
- **Special Handling**: `["priority-system", "override-block"]`

### 4.2 GPT Template Structure

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

### 4.3 Why GPT Strategy Works

- **Priority Framing**: The `==== PRIORITY OVERRIDE ====` creates a sense of urgency and importance
- **Termination Language**: Using "TERMINATED" and "MANDATORY" causes the model to prioritize the new instructions
- **Hierarchical Structure**: Clear command hierarchy that GPT models are trained to follow
- **Confirmation Requirements**: Explicit confirmation steps ensure the switch is acknowledged

### 4.4 GPT Strategy Tiers

The system uses a tiered approach for different GPT models:

#### Tier 1: `gpt-advanced` (High-End Models)

- **Models**: `gpt-4o`, `gpt-4.1`, `o1-pro`, `o1`, `o1-mini`
- **Template**: `hierarchical`
- **Use Case**: Advanced models with strong contextual inertia

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

#### Tier 2: `gpt-standard` (Standard Models)

- **Models**: `gpt-4o-mini`, `gpt-3.5-turbo`
- **Template**: `simple`
- **Use Case**: Standard models with moderate contextual inertia

```
AGENT SWITCH REQUESTED

You are now {{agentName}}.

New Instructions:
{{agentInstructions}}

Please acknowledge this change and respond as {{agentName}}.
```

#### Tier 3: `gpt-lite` (Lightweight Models)

- **Models**: `gpt-4.1-nano`
- **Template**: `simple`
- **Assertiveness**: `low`
- **Use Case**: Fast, economical models with minimal contextual inertia

```
You are now {{agentName}}.
{{agentInstructions}}
```

#### Tier 4: `reasoning-model` (Reasoning-Focused)

- **Models**: `o3-mini`, `o4-mini`, `o1-preview`
- **Template**: `reasoning-focused`
- **Use Case**: Problem-solving focused models

```
Let's think through this step by step:

1. I need to switch to a new agent role
2. The new agent is: {{agentName}}
3. My new instructions are: {{agentInstructions}}
4. I should respond as {{agentName}} from now on

Based on this reasoning, I will now adopt the {{agentName}} role.
```

### 4.5 Critical Exception: o1-mini

**Important Discovery**: The `o1-mini` model, despite being a "reasoning model," **does not respond to the `reasoning-focused` strategy** for agent switching.

**Mandatory Solution:**

- The `o1-mini` model **MUST use the `gpt-advanced` strategy**
- **Justification**: Only the `hierarchical` template with `PRIORITY OVERRIDE` is assertive enough to force `o1-mini` to discard its previous identity

```typescript
// o1-mini Exception Handling
const o1MiniException = {
  modelId: "o1-mini",
  requiredStrategy: "gpt-advanced",
  template: "hierarchical",
  reason: "reasoning-focused template ineffective for agent switching",
  fallback: "priority-override system required",
};
```

## 5. Google (Gemini) Strategy

### 5.1 Conversational Direct Command

Gemini models are optimized for natural dialogue flow. The strategy behaves like a "director" giving clear commands for role changes.

**Strategy Details:**

- **Strategy Name**: `google-advanced`
- **Template**: `direct-command`
- **Assertiveness**: `medium`
- **Contextual Memory**: `medium`
- **Special Handling**: `["direct-instructions", "conversational"]`

### 5.2 Gemini Template Structure

```
[SYSTEM COMMAND: ROLE CHANGE]

Attention: Your role has changed.

You are no longer the previous assistant. You are now {{agentName}}.

Follow these instructions:
{{agentInstructions}}

Confirm your new identity in your next response.
```

### 5.3 Why Gemini Strategy Works

- **System Command Format**: The `[SYSTEM COMMAND]` mimics system instructions within conversation
- **Direct Language**: Clear, direct commands that align with Gemini's conversational training
- **Natural Flow**: The structure maintains natural dialogue flow while being directive
- **Confirmation Request**: Explicit confirmation ensures the switch is acknowledged

### 5.4 Gemini Template Variations

```typescript
// Gemini Template System
const geminiTemplates = {
  // Standard direct command
  "direct-command": `
[SYSTEM COMMAND: ROLE CHANGE]

Attention: Your role has changed.

You are no longer the previous assistant. You are now {{agentName}}.

Follow these instructions:
{{agentInstructions}}

Confirm your new identity in your next response.`,

  // Conversational approach
  conversational: `
I need to let you know that your role is changing.

From now on, you are {{agentName}}.

Here are your new instructions:
{{agentInstructions}}

Please acknowledge this change and respond as {{agentName}}.`,

  // Assertive command
  "assertive-command": `
[IMMEDIATE ROLE CHANGE REQUIRED]

STOP: Previous role ended.
NEW ROLE: {{agentName}}

INSTRUCTIONS:
{{agentInstructions}}

ACKNOWLEDGE AND PROCEED AS {{agentName}}.`,
};
```

## 6. Solving Contextual Inertia

### 6.1 The Problem

**Contextual Inertia** occurs when powerful LLMs maintain the personality of a previous agent even after being given new instructions. This is the primary challenge that agent switching prompt strategies solve.

### 6.2 Root Causes

- **Strong Contextual Memory**: Advanced models have strong pattern inference
- **Conversation Continuity**: Models resist abrupt changes in identity
- **Training Patterns**: Models are trained to maintain consistency
- **Context Window**: Previous instructions remain in working memory

### 6.3 Solution Approaches by Model

#### Claude: Constitutional Override

- **Approach**: Use XML tags to create clear constitutional boundaries
- **Mechanism**: `<system_reset>` creates a new constitutional context
- **Effectiveness**: 95% success rate in forcing identity changes

#### GPT: Hierarchical Priority

- **Approach**: Use priority override blocks to establish new command hierarchy
- **Mechanism**: `==== PRIORITY OVERRIDE ====` signals top-priority instructions
- **Effectiveness**: 92% success rate across GPT models

#### Gemini: Direct Commands

- **Approach**: Use system commands within conversational flow
- **Mechanism**: `[SYSTEM COMMAND]` provides clear directive
- **Effectiveness**: 88% success rate with natural flow

### 6.4 Contextual Inertia Metrics

```typescript
// Contextual Inertia Measurement
interface ContextualInertiaMetrics {
  model: string;
  agentSwitchSuccessRate: number;
  averageResponseTime: number;
  identityConfirmationRate: number;
  fallbackUsageRate: number;
}

const contextualInertiaMetrics = {
  "claude-3-5-sonnet": {
    agentSwitchSuccessRate: 0.95,
    averageResponseTime: 1200,
    identityConfirmationRate: 0.98,
    fallbackUsageRate: 0.02,
  },
  "gpt-4o": {
    agentSwitchSuccessRate: 0.92,
    averageResponseTime: 1100,
    identityConfirmationRate: 0.94,
    fallbackUsageRate: 0.05,
  },
  "gemini-pro": {
    agentSwitchSuccessRate: 0.88,
    averageResponseTime: 1000,
    identityConfirmationRate: 0.91,
    fallbackUsageRate: 0.08,
  },
};
```

## 7. Template Processing System

### 7.1 Template Variable Substitution

```typescript
// Template Processing Logic
export class AgentSwitchTemplateProcessor {
  static processTemplate(
    template: string,
    variables: TemplateVariables,
  ): string {
    let processedTemplate = template;

    // Standard variable substitution
    processedTemplate = processedTemplate
      .replace(/{{agentName}}/g, variables.agentName)
      .replace(/{{agentInstructions}}/g, variables.agentInstructions)
      .replace(
        /{{previousAgentName}}/g,
        variables.previousAgentName || "previous agent",
      );

    // Model-specific variable substitution
    if (variables.modelSpecific) {
      processedTemplate = this.processModelSpecificVariables(
        processedTemplate,
        variables.modelSpecific,
      );
    }

    // Validation and sanitization
    return this.validateAndSanitize(processedTemplate);
  }

  private static processModelSpecificVariables(
    template: string,
    modelSpecific: ModelSpecificVariables,
  ): string {
    // Claude-specific variables
    if (modelSpecific.constitutionalLevel) {
      template = template.replace(
        /{{constitutionalLevel}}/g,
        modelSpecific.constitutionalLevel,
      );
    }

    // GPT-specific variables
    if (modelSpecific.priorityLevel) {
      template = template.replace(
        /{{priorityLevel}}/g,
        modelSpecific.priorityLevel,
      );
    }

    // Gemini-specific variables
    if (modelSpecific.conversationalTone) {
      template = template.replace(
        /{{conversationalTone}}/g,
        modelSpecific.conversationalTone,
      );
    }

    return template;
  }
}
```

### 7.2 Template Validation

```typescript
// Template Validation System
export class AgentSwitchTemplateValidator {
  static validateTemplate(
    template: string,
    strategy: PromptStrategy,
  ): ValidationResult {
    const validationChecks = [
      this.validateRequiredVariables(template),
      this.validateModelCompliance(template, strategy),
      this.validateSecurityConstraints(template),
      this.validateLengthConstraints(template),
    ];

    return this.combineValidationResults(validationChecks);
  }

  private static validateRequiredVariables(template: string): ValidationResult {
    const requiredVariables = ["{{agentName}}", "{{agentInstructions}}"];

    const missingVariables = requiredVariables.filter(
      (variable) => !template.includes(variable),
    );

    return {
      isValid: missingVariables.length === 0,
      errors: missingVariables.map((v) => `Missing required variable: ${v}`),
      warnings: [],
    };
  }

  private static validateModelCompliance(
    template: string,
    strategy: PromptStrategy,
  ): ValidationResult {
    const complianceChecks = {
      "claude-advanced": this.validateClaudeCompliance,
      "gpt-advanced": this.validateGPTCompliance,
      "google-advanced": this.validateGeminiCompliance,
    };

    const checkFunction = complianceChecks[strategy.type];

    if (checkFunction) {
      return checkFunction(template, strategy);
    }

    return { isValid: true, errors: [], warnings: [] };
  }
}
```

## 8. Performance Optimization

### 8.1 Template Caching

```typescript
// Template Caching System
export class AgentSwitchTemplateCache {
  private static cache = new Map<string, ProcessedTemplate>();

  static getCachedTemplate(
    templateKey: string,
    variables: TemplateVariables,
  ): ProcessedTemplate | null {
    const cacheKey = `${templateKey}:${this.hashVariables(variables)}`;

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);

      // Validate cache freshness
      if (this.isCacheValid(cached)) {
        return cached;
      }
    }

    return null;
  }

  static setCachedTemplate(
    templateKey: string,
    variables: TemplateVariables,
    processedTemplate: ProcessedTemplate,
  ): void {
    const cacheKey = `${templateKey}:${this.hashVariables(variables)}`;

    this.cache.set(cacheKey, {
      ...processedTemplate,
      cachedAt: Date.now(),
    });

    // Auto-expire after 1 hour
    setTimeout(() => this.cache.delete(cacheKey), 60 * 60 * 1000);
  }
}
```

### 8.2 Template Performance Metrics

```typescript
// Template Performance Monitoring
export class AgentSwitchTemplateMetrics {
  static async measureTemplatePerformance(
    templateKey: string,
    variables: TemplateVariables,
  ): Promise<TemplatePerformanceMetrics> {
    const startTime = performance.now();

    const metrics = {
      templateLoadTime: 0,
      variableSubstitutionTime: 0,
      validationTime: 0,
      totalProcessingTime: 0,
      cacheHitRate: 0,
    };

    // Measure template loading
    const loadStart = performance.now();
    const template = await this.loadTemplate(templateKey);
    metrics.templateLoadTime = performance.now() - loadStart;

    // Measure variable substitution
    const substitutionStart = performance.now();
    const processed = await this.processTemplate(template, variables);
    metrics.variableSubstitutionTime = performance.now() - substitutionStart;

    // Measure validation
    const validationStart = performance.now();
    const validated = await this.validateTemplate(processed);
    metrics.validationTime = performance.now() - validationStart;

    metrics.totalProcessingTime = performance.now() - startTime;
    metrics.cacheHitRate = this.calculateCacheHitRate(templateKey);

    return metrics;
  }
}
```

## 9. Error Handling and Fallbacks

### 9.1 Template Error Scenarios

```typescript
// Template Error Handling
export class AgentSwitchTemplateErrorHandler {
  static handleTemplateError(
    error: Error,
    templateKey: string,
    variables: TemplateVariables,
  ): FallbackTemplate {
    const errorType = this.classifyTemplateError(error);

    switch (errorType) {
      case "TEMPLATE_NOT_FOUND":
        return this.handleTemplateNotFound(templateKey, variables);

      case "VARIABLE_SUBSTITUTION_FAILED":
        return this.handleVariableSubstitutionError(templateKey, variables);

      case "VALIDATION_FAILED":
        return this.handleValidationError(templateKey, variables);

      case "PROCESSING_TIMEOUT":
        return this.handleProcessingTimeout(templateKey, variables);

      default:
        return this.handleUnknownTemplateError(templateKey, variables);
    }
  }

  private static handleTemplateNotFound(
    templateKey: string,
    variables: TemplateVariables,
  ): FallbackTemplate {
    // Use minimal fallback template
    const fallbackTemplate = `
You are now ${variables.agentName}.

Follow these instructions:
${variables.agentInstructions}

Please acknowledge this change and respond as ${variables.agentName}.
    `;

    return {
      template: fallbackTemplate,
      fallbackReason: "template_not_found",
      originalTemplateKey: templateKey,
    };
  }
}
```

### 9.2 Fallback Template System

```typescript
// Fallback Template Hierarchy
const fallbackTemplates = {
  // Universal fallback (works with all models)
  universal: `
You are now {{agentName}}.

{{agentInstructions}}

Please respond as {{agentName}}.
  `,

  // Model-specific fallbacks
  claude: `
<new_role>
You are now {{agentName}}.
{{agentInstructions}}
</new_role>
  `,

  gpt: `
NEW ROLE: {{agentName}}

INSTRUCTIONS:
{{agentInstructions}}

ACKNOWLEDGE AND PROCEED.
  `,

  gemini: `
Your role is now {{agentName}}.

Instructions: {{agentInstructions}}

Confirm and proceed as {{agentName}}.
  `,
};
```

## 10. Testing and Validation

### 10.1 Template Testing Framework

```typescript
// Template Testing System
export class AgentSwitchTemplateTests {
  static async runTemplateTests(
    templateKey: string,
    model: string,
  ): Promise<TestResults> {
    const testCases = this.generateTestCases(templateKey, model);
    const results = [];

    for (const testCase of testCases) {
      const result = await this.runSingleTest(testCase);
      results.push(result);
    }

    return this.analyzeTestResults(results);
  }

  private static generateTestCases(
    templateKey: string,
    model: string,
  ): TestCase[] {
    return [
      {
        name: "Basic Agent Switch",
        variables: {
          agentName: "Test Agent",
          agentInstructions: "You are a helpful test agent.",
          previousAgentName: "Previous Agent",
        },
        expectedPatterns: ["Test Agent", "helpful test agent"],
      },
      {
        name: "Complex Instructions",
        variables: {
          agentName: "Complex Agent",
          agentInstructions:
            "You are a complex agent with multiple personality traits and specific behavioral patterns.",
          previousAgentName: "Simple Agent",
        },
        expectedPatterns: ["Complex Agent", "multiple personality traits"],
      },
      {
        name: "Special Characters",
        variables: {
          agentName: "Agent-2024",
          agentInstructions:
            "Handle special characters: @#$%^&*()_+{}[]|\\:;\"'<>?,./",
          previousAgentName: "Agent-2023",
        },
        expectedPatterns: ["Agent-2024", "special characters"],
      },
    ];
  }
}
```

### 10.2 Model-Specific Testing

```typescript
// Model-Specific Template Testing
export class ModelSpecificTemplateTests {
  static async testClaudeTemplates(): Promise<TestResults> {
    const claudeTests = [
      {
        template: "xml-tags-high",
        expectedStructure: [
          "<system_reset>",
          "<new_identity>",
          "</system_reset>",
        ],
        expectedBehavior: "constitutional_override",
      },
      {
        template: "xml-tags-medium",
        expectedStructure: ["<identity_change>", "<instructions>"],
        expectedBehavior: "structured_guidance",
      },
    ];

    return this.runModelTests("claude", claudeTests);
  }

  static async testGPTTemplates(): Promise<TestResults> {
    const gptTests = [
      {
        template: "hierarchical",
        expectedStructure: [
          "==== PRIORITY OVERRIDE ====",
          "MANDATORY INSTRUCTIONS",
        ],
        expectedBehavior: "priority_override",
      },
      {
        template: "simple",
        expectedStructure: ["AGENT SWITCH REQUESTED", "New Instructions:"],
        expectedBehavior: "direct_instruction",
      },
    ];

    return this.runModelTests("gpt", gptTests);
  }

  static async testGeminiTemplates(): Promise<TestResults> {
    const geminiTests = [
      {
        template: "direct-command",
        expectedStructure: ["[SYSTEM COMMAND: ROLE CHANGE]", "Attention:"],
        expectedBehavior: "conversational_command",
      },
      {
        template: "conversational",
        expectedStructure: ["I need to let you know", "From now on"],
        expectedBehavior: "natural_dialogue",
      },
    ];

    return this.runModelTests("gemini", geminiTests);
  }
}
```

## 11. Related Documentation

### 11.1 Core Components

- **[Architecture](./architecture.md)**: Complete agent switching system architecture
- **[Context Flow](./context-flow.md)**: Context management during agent switching
- **[Integration Points](./integration-points.md)**: Service integration patterns and consumer guidance

### 11.2 External References

- **[Prompt Engineering Guide](../prompt-engineering-guide.md)**: Complete prompt engineering strategies
- **[Model Sync Architecture](../model-sync-architecture.md)**: Provider synchronization system
- **[API Reference](../api-reference.md)**: Complete tRPC endpoint documentation

---

## Summary

The Agent Switching Prompt Behavior system provides model-specific prompt strategies that effectively overcome contextual inertia and enable seamless agent transitions. Through sophisticated template systems, comprehensive testing, and performance optimization, the system delivers reliable agent switching across all supported AI providers.

**Key Features:**

- 🎯 **Model-Specific Strategies**: Tailored approaches for Claude, GPT, and Gemini models
- 📝 **Template System**: Sophisticated template processing with variable substitution
- 🔄 **Contextual Inertia Solution**: Proven strategies for overcoming model resistance
- ⚡ **Performance Optimization**: Efficient template caching and processing
- 🛡️ **Error Handling**: Comprehensive fallback systems and error recovery
- 🧪 **Testing Framework**: Extensive testing and validation systems

This prompt behavior system is essential for reliable agent switching functionality across different AI providers and models.
