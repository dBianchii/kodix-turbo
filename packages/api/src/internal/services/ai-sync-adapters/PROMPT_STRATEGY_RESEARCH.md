# Prompt Strategy Research Guide

<!-- AI-METADATA:
category: research
stack: ai-providers
complexity: intermediate
dependencies: [research-sources.json]
-->

## 🎯 Purpose

This document provides a comprehensive guide for researching and validating prompt engineering strategies for different AI providers in the Kodix platform.

## 📚 Official Research Sources

### 🔵 Anthropic (Claude)

#### Official Documentation

- **Base URL**: https://docs.anthropic.com
- **Prompt Engineering**: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering
- **Model Cards**: https://docs.anthropic.com/en/docs/about-claude/models
- **Best Practices**: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct
- **Troubleshooting**: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/troubleshooting-checklist
- **Long Context**: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips

#### Research Topics

- XML tag effectiveness
- System message handling
- Context window utilization
- Instruction hierarchy
- Constitutional AI principles

#### Community Resources

- **Cookbook**: https://github.com/anthropics/anthropic-cookbook
- **Reddit**: https://www.reddit.com/r/ClaudeAI/
- **Discord**: https://discord.gg/anthropic

### 🟢 OpenAI (GPT)

#### Official Documentation

- **Base URL**: https://platform.openai.com/docs
- **Prompt Engineering**: https://platform.openai.com/docs/guides/prompt-engineering
- **Models**: https://platform.openai.com/docs/models
- **Best Practices**: https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-openai-api
- **Six Strategies**: https://platform.openai.com/docs/guides/prompt-engineering/six-strategies-for-getting-better-results
- **GPT-4 Guide**: https://platform.openai.com/docs/guides/gpt-4

#### Research Topics

- System vs user message roles
- Temperature and top_p effects
- Few-shot vs zero-shot prompting
- Chain-of-thought reasoning
- Instruction following patterns

#### Community Resources

- **Cookbook**: https://github.com/openai/openai-cookbook
- **Community**: https://community.openai.com/
- **Reddit**: https://www.reddit.com/r/OpenAI/

### 🔴 Google (Gemini)

#### Official Documentation

- **Base URL**: https://ai.google.dev
- **Prompting Strategies**: https://ai.google.dev/gemini-api/docs/prompting-strategies
- **Models**: https://ai.google.dev/gemini-api/docs/models/gemini
- **Prompting Intro**: https://ai.google.dev/gemini-api/docs/prompting-intro
- **System Instructions**: https://ai.google.dev/gemini-api/docs/system-instructions
- **Safety Settings**: https://ai.google.dev/gemini-api/docs/safety-settings

#### Research Topics

- Multimodal prompting
- Function calling patterns
- Safety filter interactions
- Context caching strategies
- Grounding with search

#### Community Resources

- **Cookbook**: https://github.com/google-gemini/cookbook
- **Reddit**: https://www.reddit.com/r/Bard/
- **Developer Blog**: https://developers.googleblog.com/search/label/AI

## 📖 Academic Research Sources

### Search Engines

- **arXiv**: https://arxiv.org/search/?query=prompt+engineering
- **Google Scholar**: https://scholar.google.com/scholar?q=prompt+engineering
- **Papers With Code**: https://paperswithcode.com/task/prompt-engineering
- **Semantic Scholar**: https://www.semanticscholar.org/search?q=prompt%20engineering

### Key Papers

1. **"Language Models are Few-Shot Learners"**

   - URL: https://arxiv.org/abs/2005.14165
   - Relevance: Foundation of prompt engineering

2. **"Chain-of-Thought Prompting Elicits Reasoning"**

   - URL: https://arxiv.org/abs/2201.11903
   - Relevance: Reasoning patterns in prompts

3. **"Constitutional AI: Harmlessness from AI Feedback"**
   - URL: https://arxiv.org/abs/2212.08073
   - Relevance: Anthropic's approach to instruction following

## 🧪 Testing Frameworks

### Prompt Evaluation Tools

- **Microsoft PromptFlow**: https://github.com/microsoft/promptflow
- **PromptTools**: https://github.com/hegelai/prompttools
- **DeepEval**: https://github.com/confident-ai/deepeval

### Benchmarks

- **LM Evaluation Harness**: https://github.com/EleutherAI/lm-evaluation-harness
- **PromptSource**: https://github.com/bigscience-workshop/promptsource
- **LAVIS**: https://github.com/salesforce/LAVIS

## 📋 Research Methodology

### Phase 1: Literature Review

- [ ] Review official documentation for each provider
- [ ] Search academic papers on model-specific prompting
- [ ] Analyze community discussions and best practices

### Phase 2: Empirical Testing

- [ ] Design controlled experiments for agent switching
- [ ] Test different assertiveness levels
- [ ] Measure response quality and consistency

### Phase 3: Validation

- [ ] A/B test strategies in production
- [ ] Collect user feedback on agent switching quality
- [ ] Monitor success rates and edge cases

### Phase 4: Documentation

- [ ] Document findings with evidence
- [ ] Update strategy configurations
- [ ] Create maintenance guidelines

## ✅ Research Checklist Template

### For Each Provider:

#### Documentation Review

- [ ] Review base documentation
- [ ] Study prompt engineering guides
- [ ] Analyze model specifications
- [ ] Check best practices documentation
- [ ] Review troubleshooting guides

#### Research Topics Investigation

- [ ] Research provider-specific features
- [ ] Test model behavior patterns
- [ ] Analyze instruction following capabilities
- [ ] Document edge cases and limitations

#### Community Engagement

- [ ] Check official cookbooks and examples
- [ ] Review community discussions
- [ ] Analyze real-world use cases

#### Testing Tasks

- [ ] Design agent switching tests
- [ ] Test different assertiveness levels
- [ ] Measure response quality
- [ ] Document findings

## 🎯 Current Strategy Status

The current prompt strategies in the JSON files are based on:

1. **Existing hardcoded logic** from the codebase
2. **General provider documentation** knowledge
3. **Logical inferences** about model capabilities
4. **NOT comprehensive empirical testing**

## 🔬 Next Steps

1. **Use this guide** to systematically research each provider
2. **Test current strategies** against real data
3. **Update configurations** based on findings
4. **Document evidence** for future reference

## 📚 Related Files

- `research-sources.json` - Structured data version of these sources
- `anthropic-prompt-strategies.json` - Current Anthropic strategies
- `openai-prompt-strategies.json` - Current OpenAI strategies
- `google-prompt-strategies.json` - Current Google strategies
- `RESEARCH_METHODOLOGY.md` - Detailed methodology document
