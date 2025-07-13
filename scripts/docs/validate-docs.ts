#!/usr/bin/env tsx

/**
 * Documentation Validation Script
 * 
 * Validates AI-optimized documentation for:
 * - Semantic markup compliance
 * - Cross-reference integrity
 * - Token optimization
 * - AI tool compatibility
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { glob } from 'glob';
import { join, relative } from 'path';

// Validation configuration
interface ValidationConfig {
  docsDir: string;
  patterns: string[];
  maxTokensPerFile: number;
  requiredMetadata: string[];
  aiTools: string[];
  strictMode: boolean;
}

const config: ValidationConfig = {
  docsDir: './docs',
  patterns: [
    'docs/**/*.md',
    'docs/**/*.mdx'
  ],
  maxTokensPerFile: 3000,
  requiredMetadata: [
    'category',
    'complexity', 
    'updated',
    'claude-ready',
    'phase',
    'priority',
    'token-optimized',
    'audience',
    'ai-context-weight'
  ],
  aiTools: ['claude-code', 'cursor', 'copilot', 'gemini', 'chatgpt'],
  strictMode: false
};

// Validation results
interface ValidationResult {
  file: string;
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metrics: FileMetrics;
}

interface ValidationError {
  type: string;
  message: string;
  line?: number;
  severity: 'error' | 'warning';
}

interface ValidationWarning {
  type: string;
  message: string;
  line?: number;
  suggestion?: string;
}

interface FileMetrics {
  tokenCount: number;
  readabilityScore: number;
  aiCompatibilityScore: number;
  linkCount: number;
  brokenLinks: number;
  codeBlockCount: number;
  optimizationScore: number;
}

class DocumentationValidator {
  private results: ValidationResult[] = [];
  private allFiles: Set<string> = new Set();

  constructor(private config: ValidationConfig) {}

  async validate(): Promise<ValidationSummary> {
    console.log('🔍 Starting documentation validation...');

    // Collect all files
    await this.collectFiles();

    // Validate each file
    for (const pattern of this.config.patterns) {
      const files = await glob(pattern);
      
      for (const file of files) {
        const result = await this.validateFile(file);
        this.results.push(result);
      }
    }

    // Generate summary
    const summary = this.generateSummary();
    this.reportResults(summary);

    return summary;
  }

  private async collectFiles(): Promise<void> {
    for (const pattern of this.config.patterns) {
      const files = await glob(pattern);
      files.forEach(file => this.allFiles.add(file));
    }
  }

  private async validateFile(filePath: string): Promise<ValidationResult> {
    console.log(`📄 Validating: ${relative(process.cwd(), filePath)}`);

    const content = readFileSync(filePath, 'utf-8');
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Run all validations
    this.validateMetadata(content, errors, warnings);
    this.validateStructure(content, errors, warnings);
    this.validateSemanticMarkup(content, errors, warnings);
    this.validateCodeBlocks(content, errors, warnings);
    this.validateLinks(content, filePath, errors, warnings);
    this.validateTokenOptimization(content, errors, warnings);
    this.validateAICompatibility(content, errors, warnings);

    const metrics = this.calculateMetrics(content, filePath);
    const passed = errors.filter(e => e.severity === 'error').length === 0;

    return {
      file: filePath,
      passed,
      errors,
      warnings,
      metrics
    };
  }

  private validateMetadata(content: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const metadataMatch = content.match(/<!-- AI-METADATA:([\s\S]*?)-->/);
    
    if (!metadataMatch) {
      errors.push({
        type: 'missing-metadata',
        message: 'Missing AI-METADATA header',
        severity: 'error'
      });
      return;
    }

    const metadata = metadataMatch[1];
    
    // Check required fields
    for (const field of this.config.requiredMetadata) {
      const fieldRegex = new RegExp(`${field}:\\s*(.+)`, 'i');
      if (!fieldRegex.test(metadata)) {
        errors.push({
          type: 'missing-metadata-field',
          message: `Missing required metadata field: ${field}`,
          severity: 'error'
        });
      }
    }

    // Validate metadata values
    this.validateMetadataValues(metadata, errors, warnings);
  }

  private validateMetadataValues(metadata: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Validate category
    const categoryMatch = metadata.match(/category:\s*(\w+)/i);
    if (categoryMatch) {
      const validCategories = ['architecture', 'component', 'api', 'guide', 'reference', 'standards', 'interactive', 'automation', 'prompt-library'];
      if (!validCategories.includes(categoryMatch[1])) {
        warnings.push({
          type: 'invalid-category',
          message: `Unknown category: ${categoryMatch[1]}`,
          suggestion: `Use one of: ${validCategories.join(', ')}`
        });
      }
    }

    // Validate complexity
    const complexityMatch = metadata.match(/complexity:\s*(\w+)/i);
    if (complexityMatch) {
      const validComplexities = ['basic', 'intermediate', 'advanced'];
      if (!validComplexities.includes(complexityMatch[1])) {
        errors.push({
          type: 'invalid-complexity',
          message: `Invalid complexity: ${complexityMatch[1]}`,
          severity: 'error'
        });
      }
    }

    // Validate date format
    const dateMatch = metadata.match(/updated:\s*(\d{4}-\d{2}-\d{2})/i);
    if (dateMatch) {
      const date = new Date(dateMatch[1]);
      if (isNaN(date.getTime())) {
        errors.push({
          type: 'invalid-date',
          message: `Invalid date format: ${dateMatch[1]}`,
          severity: 'error'
        });
      }
    }
  }

  private validateStructure(content: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Check for context boundaries
    const hasContextStart = content.includes('<!-- AI-CONTEXT-BOUNDARY: start -->');
    const hasContextEnd = content.includes('<!-- AI-CONTEXT-BOUNDARY: end -->');

    if (!hasContextStart || !hasContextEnd) {
      errors.push({
        type: 'missing-context-boundary',
        message: 'Missing AI-CONTEXT-BOUNDARY markers',
        severity: 'error'
      });
    }

    // Check heading structure
    const headings = content.match(/^#+\s+.+$/gm) || [];
    if (headings.length === 0) {
      warnings.push({
        type: 'no-headings',
        message: 'No headings found - consider adding structure',
        suggestion: 'Add headings to improve readability and navigation'
      });
    }

    // Check for purpose section
    if (!content.includes('## 🎯 Purpose') && !content.includes('## Purpose')) {
      warnings.push({
        type: 'missing-purpose',
        message: 'Consider adding a Purpose section',
        suggestion: 'Add ## 🎯 Purpose section to explain the document\'s goal'
      });
    }
  }

  private validateSemanticMarkup(content: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Check for proper AI markup
    const aiMarkupPatterns = [
      /<!-- AI-CONTEXT:/g,
      /<!-- AI-PRIORITY:/g,
      /<!-- AI-TOKENS:/g,
      /<!-- AI-SEMANTIC:/g,
      /<!-- AI-DEPENDENCIES:/g,
      /<!-- AI-RELATED:/g
    ];

    let hasSemanticMarkup = false;
    for (const pattern of aiMarkupPatterns) {
      if (pattern.test(content)) {
        hasSemanticMarkup = true;
        break;
      }
    }

    if (!hasSemanticMarkup) {
      warnings.push({
        type: 'no-semantic-markup',
        message: 'No semantic AI markup found',
        suggestion: 'Consider adding AI-CONTEXT, AI-PRIORITY, or other semantic markers'
      });
    }

    // Validate code block optimization
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    let optimizedBlocks = 0;

    for (const block of codeBlocks) {
      if (block.includes('<!-- AI-CODE-BLOCK:') || block.includes('// AI-CONTEXT:')) {
        optimizedBlocks++;
      }
    }

    if (codeBlocks.length > 0 && optimizedBlocks === 0) {
      warnings.push({
        type: 'unoptimized-code-blocks',
        message: 'Code blocks are not optimized for AI consumption',
        suggestion: 'Add AI-CODE-BLOCK markers and context comments'
      });
    }
  }

  private validateCodeBlocks(content: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const codeBlocks = content.match(/```(\w+)?\n([\s\S]*?)```/g) || [];

    for (let i = 0; i < codeBlocks.length; i++) {
      const block = codeBlocks[i];
      const langMatch = block.match(/```(\w+)/);
      
      if (!langMatch) {
        warnings.push({
          type: 'unlabeled-code-block',
          message: `Code block ${i + 1} missing language label`,
          suggestion: 'Add language identifier (e.g., ```typescript)'
        });
      }

      // Check for AI context in TypeScript blocks
      if (langMatch && langMatch[1] === 'typescript' && !block.includes('// AI-CONTEXT:')) {
        warnings.push({
          type: 'missing-ai-context',
          message: `TypeScript block ${i + 1} missing AI context comment`,
          suggestion: 'Add // AI-CONTEXT: comment to explain the code'
        });
      }
    }
  }

  private validateLinks(content: string, filePath: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const linkText = match[1];
      const linkUrl = match[2];

      // Skip external links
      if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
        continue;
      }

      // Check relative links
      if (linkUrl.startsWith('./') || linkUrl.startsWith('../')) {
        const resolvedPath = this.resolvePath(filePath, linkUrl);
        
        if (!this.allFiles.has(resolvedPath) && !existsSync(resolvedPath)) {
          errors.push({
            type: 'broken-link',
            message: `Broken link: ${linkUrl} -> ${resolvedPath}`,
            severity: 'error'
          });
        }
      }

      // Check for AI-optimized links
      if (!content.includes(`<!-- AI-LINK:`) && !content.includes(`<!-- AI-CONTEXT-REF:`)) {
        // Only warn if there are many links
        const linkCount = (content.match(linkRegex) || []).length;
        if (linkCount > 5) {
          warnings.push({
            type: 'unoptimized-links',
            message: 'Consider adding AI-LINK markup for better context',
            suggestion: 'Use AI-LINK and AI-CONTEXT-REF for important links'
          });
        }
      }
    }
  }

  private validateTokenOptimization(content: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const tokenCount = this.estimateTokenCount(content);

    if (tokenCount > this.config.maxTokensPerFile) {
      warnings.push({
        type: 'high-token-count',
        message: `High token count: ${tokenCount} (max: ${this.config.maxTokensPerFile})`,
        suggestion: 'Consider splitting into smaller files or using compression techniques'
      });
    }

    // Check for token budget comments
    if (tokenCount > 1000 && !content.includes('<!-- AI-TOKEN-BUDGET -->')) {
      warnings.push({
        type: 'missing-token-budget',
        message: 'Large file missing token budget estimation',
        suggestion: 'Add <!-- AI-TOKEN-BUDGET --> section with token estimates'
      });
    }

    // Check for compression notes
    if (tokenCount > 1500 && !content.includes('<!-- AI-COMPRESSION-NOTES -->')) {
      warnings.push({
        type: 'missing-compression-notes',
        message: 'Large file missing compression notes',
        suggestion: 'Add <!-- AI-COMPRESSION-NOTES --> explaining optimizations applied'
      });
    }
  }

  private validateAICompatibility(content: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Check for tool-specific optimizations
    const hasClaudeOptimization = content.includes('<!-- CLAUDE-CODE-OPTIMIZATION -->');
    const hasCursorOptimization = content.includes('<!-- CURSOR-OPTIMIZATION -->');
    const hasCopilotOptimization = content.includes('<!-- COPILOT-OPTIMIZATION -->');

    if (!hasClaudeOptimization && !hasCursorOptimization && !hasCopilotOptimization) {
      warnings.push({
        type: 'no-tool-optimizations',
        message: 'No tool-specific optimizations found',
        suggestion: 'Consider adding tool-specific optimization notes'
      });
    }

    // Check for universal compatibility markers
    if (!content.includes('<!-- AI-UNIVERSAL-COMPAT -->')) {
      warnings.push({
        type: 'missing-universal-compat',
        message: 'Missing universal compatibility markers',
        suggestion: 'Add <!-- AI-UNIVERSAL-COMPAT --> section'
      });
    }
  }

  private calculateMetrics(content: string, filePath: string): FileMetrics {
    const tokenCount = this.estimateTokenCount(content);
    const linkCount = (content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length;
    const codeBlockCount = (content.match(/```[\s\S]*?```/g) || []).length;
    
    // Calculate broken links
    let brokenLinks = 0;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(content)) !== null) {
      const linkUrl = match[2];
      if (linkUrl.startsWith('./') || linkUrl.startsWith('../')) {
        const resolvedPath = this.resolvePath(filePath, linkUrl);
        if (!existsSync(resolvedPath)) {
          brokenLinks++;
        }
      }
    }

    // Calculate scores
    const readabilityScore = this.calculateReadabilityScore(content);
    const aiCompatibilityScore = this.calculateAICompatibilityScore(content);
    const optimizationScore = this.calculateOptimizationScore(content);

    return {
      tokenCount,
      readabilityScore,
      aiCompatibilityScore,
      linkCount,
      brokenLinks,
      codeBlockCount,
      optimizationScore
    };
  }

  private estimateTokenCount(content: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(content.length / 4);
  }

  private calculateReadabilityScore(content: string): number {
    // Simple readability scoring
    let score = 100;
    
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgSentenceLength = words / sentences;
    
    // Penalty for very long sentences
    if (avgSentenceLength > 25) score -= 20;
    if (avgSentenceLength > 35) score -= 20;
    
    // Bonus for headings
    const headings = (content.match(/^#+\s+.+$/gm) || []).length;
    score += Math.min(headings * 5, 20);
    
    // Bonus for lists
    const lists = (content.match(/^[\s]*[-*+]\s+/gm) || []).length;
    score += Math.min(lists * 2, 10);
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateAICompatibilityScore(content: string): number {
    let score = 0;
    
    // AI metadata present
    if (content.includes('<!-- AI-METADATA:')) score += 20;
    
    // Context boundaries
    if (content.includes('<!-- AI-CONTEXT-BOUNDARY:')) score += 15;
    
    // Semantic markup
    if (content.includes('<!-- AI-CONTEXT:') || content.includes('<!-- AI-SEMANTIC:')) score += 15;
    
    // Code optimization
    if (content.includes('<!-- AI-CODE-BLOCK:') || content.includes('// AI-CONTEXT:')) score += 15;
    
    // Cross-references
    if (content.includes('<!-- AI-LINK:') || content.includes('<!-- AI-RELATED:')) score += 10;
    
    // Tool optimizations
    if (content.includes('CLAUDE-CODE-OPTIMIZATION') || content.includes('CURSOR-OPTIMIZATION')) score += 10;
    
    // Token optimization
    if (content.includes('<!-- AI-TOKEN-BUDGET -->')) score += 10;
    
    // Universal compatibility
    if (content.includes('<!-- AI-UNIVERSAL-COMPAT -->')) score += 5;
    
    return Math.min(100, score);
  }

  private calculateOptimizationScore(content: string): number {
    let score = 0;
    const tokenCount = this.estimateTokenCount(content);
    
    // Token efficiency
    if (tokenCount < 1000) score += 30;
    else if (tokenCount < 2000) score += 20;
    else if (tokenCount < 3000) score += 10;
    
    // Compression techniques
    if (content.includes('<!-- AI-COMPRESSION-NOTES -->')) score += 20;
    
    // Pattern references vs full code
    const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
    const references = (content.match(/see [^,\n]+(\.ts|\.tsx|\.js|\.jsx)/g) || []).length;
    if (references > codeBlocks / 2) score += 15;
    
    // Hierarchical structure
    const headings = (content.match(/^#+\s+.+$/gm) || []).length;
    if (headings > 3) score += 10;
    
    // Smart linking
    if (content.includes('<!-- AI-LINK:')) score += 15;
    
    // Progressive disclosure
    if (content.includes('<details>') || content.includes('<!-- AI-PROGRESSIVE-DISCLOSURE -->')) score += 10;
    
    return Math.min(100, score);
  }

  private resolvePath(fromFile: string, linkUrl: string): string {
    // Simple path resolution
    const fromDir = fromFile.substring(0, fromFile.lastIndexOf('/'));
    return join(fromDir, linkUrl);
  }

  private generateSummary(): ValidationSummary {
    const totalFiles = this.results.length;
    const passedFiles = this.results.filter(r => r.passed).length;
    const totalErrors = this.results.reduce((sum, r) => sum + r.errors.filter(e => e.severity === 'error').length, 0);
    const totalWarnings = this.results.reduce((sum, r) => sum + r.warnings.length, 0);
    
    const avgMetrics = this.calculateAverageMetrics();
    
    return {
      totalFiles,
      passedFiles,
      failedFiles: totalFiles - passedFiles,
      totalErrors,
      totalWarnings,
      overallScore: (passedFiles / totalFiles) * 100,
      averageMetrics: avgMetrics,
      fileResults: this.results
    };
  }

  private calculateAverageMetrics(): FileMetrics {
    const totals = this.results.reduce((acc, r) => ({
      tokenCount: acc.tokenCount + r.metrics.tokenCount,
      readabilityScore: acc.readabilityScore + r.metrics.readabilityScore,
      aiCompatibilityScore: acc.aiCompatibilityScore + r.metrics.aiCompatibilityScore,
      linkCount: acc.linkCount + r.metrics.linkCount,
      brokenLinks: acc.brokenLinks + r.metrics.brokenLinks,
      codeBlockCount: acc.codeBlockCount + r.metrics.codeBlockCount,
      optimizationScore: acc.optimizationScore + r.metrics.optimizationScore,
    }), {
      tokenCount: 0,
      readabilityScore: 0,
      aiCompatibilityScore: 0,
      linkCount: 0,
      brokenLinks: 0,
      codeBlockCount: 0,
      optimizationScore: 0,
    });

    const count = this.results.length;
    return {
      tokenCount: Math.round(totals.tokenCount / count),
      readabilityScore: Math.round(totals.readabilityScore / count),
      aiCompatibilityScore: Math.round(totals.aiCompatibilityScore / count),
      linkCount: Math.round(totals.linkCount / count),
      brokenLinks: totals.brokenLinks,
      codeBlockCount: Math.round(totals.codeBlockCount / count),
      optimizationScore: Math.round(totals.optimizationScore / count),
    };
  }

  private reportResults(summary: ValidationSummary): void {
    console.log('\n📊 Validation Summary');
    console.log('===================');
    console.log(`📁 Total files: ${summary.totalFiles}`);
    console.log(`✅ Passed: ${summary.passedFiles}`);
    console.log(`❌ Failed: ${summary.failedFiles}`);
    console.log(`🚨 Total errors: ${summary.totalErrors}`);
    console.log(`⚠️  Total warnings: ${summary.totalWarnings}`);
    console.log(`📈 Overall score: ${summary.overallScore.toFixed(1)}%`);
    
    console.log('\n📊 Average Metrics');
    console.log('=================');
    console.log(`🔢 Tokens: ${summary.averageMetrics.tokenCount}`);
    console.log(`📖 Readability: ${summary.averageMetrics.readabilityScore}%`);
    console.log(`🤖 AI Compatibility: ${summary.averageMetrics.aiCompatibilityScore}%`);
    console.log(`🔗 Links: ${summary.averageMetrics.linkCount} (${summary.averageMetrics.brokenLinks} broken)`);
    console.log(`💻 Code blocks: ${summary.averageMetrics.codeBlockCount}`);
    console.log(`⚡ Optimization: ${summary.averageMetrics.optimizationScore}%`);

    // Report failed files
    if (summary.failedFiles > 0) {
      console.log('\n❌ Failed Files');
      console.log('===============');
      
      summary.fileResults
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`\n📄 ${relative(process.cwd(), result.file)}`);
          result.errors
            .filter(e => e.severity === 'error')
            .forEach(error => {
              console.log(`  🚨 ${error.type}: ${error.message}`);
            });
        });
    }

    // Report warnings
    if (summary.totalWarnings > 0) {
      console.log('\n⚠️  Warnings');
      console.log('============');
      
      const warningCounts: Record<string, number> = {};
      summary.fileResults.forEach(result => {
        result.warnings.forEach(warning => {
          warningCounts[warning.type] = (warningCounts[warning.type] || 0) + 1;
        });
      });

      Object.entries(warningCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([type, count]) => {
          console.log(`  ${type}: ${count} occurrences`);
        });
    }
  }
}

// Summary interface
interface ValidationSummary {
  totalFiles: number;
  passedFiles: number;
  failedFiles: number;
  totalErrors: number;
  totalWarnings: number;
  overallScore: number;
  averageMetrics: FileMetrics;
  fileResults: ValidationResult[];
}

// Main execution
async function main() {
  const validator = new DocumentationValidator(config);
  const summary = await validator.validate();
  
  // Exit with error code if validation failed
  if (summary.failedFiles > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { DocumentationValidator, type ValidationConfig, type ValidationSummary };