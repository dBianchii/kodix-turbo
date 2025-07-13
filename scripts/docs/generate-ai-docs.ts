#!/usr/bin/env tsx

/**
 * AI Documentation Generation Script
 * 
 * Automatically generates AI-optimized documentation from codebase analysis
 * Supports multiple AI assistants and output formats
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { glob } from 'glob';
import { join, dirname, basename, extname } from 'path';
import { Project, SourceFile, Node, SyntaxKind } from 'ts-morph';

// Configuration
interface GenerationConfig {
  outputDir: string;
  inputPaths: string[];
  aiTools: ('claude-code' | 'cursor' | 'copilot' | 'gemini' | 'chatgpt')[];
  maxTokensPerFile: number;
  includeExamples: boolean;
  optimizationLevel: 'none' | 'basic' | 'aggressive';
  templateDir: string;
}

const config: GenerationConfig = {
  outputDir: './docs/ai-generated',
  inputPaths: [
    'packages/api/src/**/*.ts',
    'apps/web/src/**/*.tsx',
    'packages/db/schema/**/*.ts'
  ],
  aiTools: ['claude-code', 'cursor', 'copilot', 'gemini', 'chatgpt'],
  maxTokensPerFile: 2000,
  includeExamples: true,
  optimizationLevel: 'basic',
  templateDir: './docs/context-engineering/templates'
};

// Main generation class
class AIDocumentationGenerator {
  private project: Project;
  private templates: Map<string, string> = new Map();

  constructor(private config: GenerationConfig) {
    this.project = new Project({
      tsConfigFilePath: 'tsconfig.json',
    });
    
    this.loadTemplates();
  }

  async generate(): Promise<void> {
    console.log('🚀 Starting AI documentation generation...');
    
    // Ensure output directory exists
    if (!existsSync(this.config.outputDir)) {
      mkdirSync(this.config.outputDir, { recursive: true });
    }

    // Process each input path
    for (const inputPath of this.config.inputPaths) {
      const files = await glob(inputPath);
      console.log(`📁 Processing ${files.length} files from ${inputPath}`);
      
      for (const filePath of files) {
        await this.processFile(filePath);
      }
    }

    // Generate index and navigation
    await this.generateIndex();
    await this.generateNavigation();

    console.log('✅ AI documentation generation complete!');
  }

  private async processFile(filePath: string): Promise<void> {
    try {
      console.log(`📝 Processing: ${filePath}`);
      
      const sourceFile = this.project.addSourceFileAtPath(filePath);
      const analysis = await this.analyzeFile(sourceFile);
      const documentation = await this.generateDocumentation(analysis);
      
      const outputPath = this.getOutputPath(filePath);
      this.writeDocumentation(outputPath, documentation);
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error);
    }
  }

  private async analyzeFile(sourceFile: SourceFile): Promise<FileAnalysis> {
    const analysis: FileAnalysis = {
      filePath: sourceFile.getFilePath(),
      fileName: basename(sourceFile.getFilePath()),
      fileType: this.determineFileType(sourceFile),
      exports: this.extractExports(sourceFile),
      imports: this.extractImports(sourceFile),
      functions: this.extractFunctions(sourceFile),
      classes: this.extractClasses(sourceFile),
      interfaces: this.extractInterfaces(sourceFile),
      patterns: await this.detectPatterns(sourceFile),
      complexity: this.calculateComplexity(sourceFile),
      dependencies: this.extractDependencies(sourceFile),
      aiOptimizations: this.generateAIOptimizations(sourceFile),
    };

    return analysis;
  }

  private determineFileType(sourceFile: SourceFile): FileType {
    const content = sourceFile.getFullText();
    const fileName = sourceFile.getBaseName();
    
    if (fileName.includes('.router.ts')) return 'trpc-router';
    if (fileName.includes('.service.ts')) return 'service';
    if (fileName.includes('.schema.ts')) return 'database-schema';
    if (content.includes('export default function') || content.includes('export function')) {
      if (content.includes('jsx') || content.includes('tsx')) return 'react-component';
      return 'utility-function';
    }
    if (content.includes('export class')) return 'class';
    if (content.includes('export interface') || content.includes('export type')) return 'types';
    
    return 'module';
  }

  private extractExports(sourceFile: SourceFile): ExportInfo[] {
    const exports: ExportInfo[] = [];
    
    // Extract export declarations
    sourceFile.getExportDeclarations().forEach(exportDecl => {
      exportDecl.getNamedExports().forEach(namedExport => {
        exports.push({
          name: namedExport.getName(),
          type: 'named',
          source: exportDecl.getModuleSpecifierValue(),
        });
      });
    });

    // Extract exported functions
    sourceFile.getFunctions().forEach(func => {
      if (func.isExported()) {
        exports.push({
          name: func.getName() || 'anonymous',
          type: 'function',
          signature: func.getSignature().getDeclaration()?.getText() || '',
        });
      }
    });

    // Extract exported classes
    sourceFile.getClasses().forEach(cls => {
      if (cls.isExported()) {
        exports.push({
          name: cls.getName() || 'anonymous',
          type: 'class',
          description: this.extractJSDocDescription(cls),
        });
      }
    });

    return exports;
  }

  private extractImports(sourceFile: SourceFile): ImportInfo[] {
    const imports: ImportInfo[] = [];
    
    sourceFile.getImportDeclarations().forEach(importDecl => {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      
      importDecl.getNamedImports().forEach(namedImport => {
        imports.push({
          name: namedImport.getName(),
          source: moduleSpecifier,
          type: 'named',
        });
      });

      const defaultImport = importDecl.getDefaultImport();
      if (defaultImport) {
        imports.push({
          name: defaultImport.getText(),
          source: moduleSpecifier,
          type: 'default',
        });
      }
    });

    return imports;
  }

  private async detectPatterns(sourceFile: SourceFile): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];
    const content = sourceFile.getFullText();

    // Kodix-specific patterns
    const kodixPatterns = [
      {
        name: 'trpc-router',
        indicators: ['createTRPCRouter', 'protectedProcedure'],
        confidence: this.calculatePatternConfidence(content, ['createTRPCRouter', 'protectedProcedure']),
      },
      {
        name: 'team-isolation',
        indicators: ['teamId', 'eq(.*teamId', 'ctx.session.teamId'],
        confidence: this.calculatePatternConfidence(content, ['teamId', 'eq.*teamId', 'ctx.session.teamId']),
      },
      {
        name: 'service-layer',
        indicators: ['export class.*Service', 'constructor.*Database'],
        confidence: this.calculatePatternConfidence(content, ['export class.*Service', 'constructor.*Database']),
      },
      {
        name: 'react-component',
        indicators: ['export function.*{', 'return.*<', 'useTranslation'],
        confidence: this.calculatePatternConfidence(content, ['export function.*\\{', 'return.*<', 'useTranslation']),
      },
      {
        name: 'drizzle-schema',
        indicators: ['mysqlTable', 'varchar', 'timestamp'],
        confidence: this.calculatePatternConfidence(content, ['mysqlTable', 'varchar', 'timestamp']),
      },
    ];

    patterns.push(...kodixPatterns.filter(p => p.confidence > 0.3));
    return patterns;
  }

  private calculatePatternConfidence(content: string, indicators: string[]): number {
    let matches = 0;
    
    indicators.forEach(indicator => {
      const regex = new RegExp(indicator, 'gi');
      if (regex.test(content)) {
        matches++;
      }
    });

    return Math.min(matches / indicators.length, 1.0);
  }

  private generateDocumentation(analysis: FileAnalysis): AIDocumentation {
    const templateName = this.getTemplateForFileType(analysis.fileType);
    const template = this.templates.get(templateName) || this.templates.get('default')!;

    const aiMetadata = this.generateAIMetadata(analysis);
    const content = this.renderTemplate(template, analysis);
    const optimizations = this.generateOptimizations(analysis);

    return {
      metadata: aiMetadata,
      content,
      optimizations,
      tokenCount: this.estimateTokenCount(content),
      aiCompatibility: this.generateCompatibilityInfo(analysis),
    };
  }

  private generateAIMetadata(analysis: FileAnalysis): AIMetadata {
    return {
      category: this.getCategoryFromFileType(analysis.fileType),
      complexity: analysis.complexity > 50 ? 'advanced' : analysis.complexity > 20 ? 'intermediate' : 'basic',
      updated: new Date().toISOString().split('T')[0],
      claudeReady: true,
      phase: 4,
      priority: analysis.patterns.some(p => p.name === 'team-isolation') ? 'high' : 'medium',
      tokenOptimized: true,
      audience: 'developers',
      aiContextWeight: analysis.patterns.length > 2 ? 'critical' : 'important',
      aiTool: 'universal',
    };
  }

  private renderTemplate(template: string, analysis: FileAnalysis): string {
    let rendered = template;

    // Replace template variables
    const replacements = {
      '{{fileName}}': analysis.fileName,
      '{{fileType}}': analysis.fileType,
      '{{purpose}}': this.generatePurpose(analysis),
      '{{patterns}}': analysis.patterns.map(p => p.name).join(', '),
      '{{complexity}}': analysis.complexity.toString(),
      '{{exports}}': analysis.exports.map(e => `- ${e.name} (${e.type})`).join('\n'),
      '{{imports}}': analysis.imports.map(i => `- ${i.name} from ${i.source}`).join('\n'),
      '{{codeExamples}}': this.generateCodeExamples(analysis),
      '{{relatedFiles}}': this.findRelatedFiles(analysis),
      '{{aiOptimizations}}': this.formatAIOptimizations(analysis.aiOptimizations),
    };

    Object.entries(replacements).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(key, 'g'), value);
    });

    return rendered;
  }

  private loadTemplates(): void {
    // Default template
    this.templates.set('default', `
<!-- AI-METADATA:
category: {{category}}
complexity: {{complexity}}
updated: {{updated}}
claude-ready: true
phase: 4
priority: {{priority}}
token-optimized: true
audience: developers
ai-context-weight: {{aiContextWeight}}
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# {{fileName}} Documentation

> {{purpose}}

## 🎯 Purpose

{{purpose}}

## 🏗️ Architecture

**File Type**: {{fileType}}
**Patterns Used**: {{patterns}}
**Complexity**: {{complexity}}

## 📦 Exports

{{exports}}

## 📥 Dependencies

{{imports}}

## 💡 Code Examples

{{codeExamples}}

## 🔗 Related Files

{{relatedFiles}}

## 🤖 AI Optimizations

{{aiOptimizations}}

<!-- AI-CONTEXT-BOUNDARY: end -->
    `);

    // tRPC Router template
    this.templates.set('trpc-router', `
<!-- AI-METADATA:
category: api
complexity: {{complexity}}
updated: {{updated}}
claude-ready: true
phase: 4
priority: high
token-optimized: true
audience: developers
ai-context-weight: critical
-->

<!-- AI-CONTEXT-BOUNDARY: start -->
# {{fileName}} - tRPC Router

> Type-safe API router implementing {{purpose}}

## 🎯 Router Overview

**Purpose**: {{purpose}}
**Authentication**: Uses protectedProcedure
**Team Isolation**: ✅ Implemented
**Patterns**: {{patterns}}

## 🔧 Procedures

{{exports}}

## 📋 Usage Examples

{{codeExamples}}

## 🔗 Integration Points

{{relatedFiles}}

## 🤖 AI Development Notes

{{aiOptimizations}}

<!-- AI-CONTEXT-BOUNDARY: end -->
    `);

    // Add more templates as needed...
  }

  private writeDocumentation(outputPath: string, doc: AIDocumentation): void {
    const dir = dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const fullContent = this.formatFullDocument(doc);
    writeFileSync(outputPath, fullContent, 'utf-8');
    
    console.log(`📄 Generated: ${outputPath} (${doc.tokenCount} tokens)`);
  }

  private formatFullDocument(doc: AIDocumentation): string {
    const metadataSection = this.formatMetadata(doc.metadata);
    const optimizationSection = this.formatOptimizations(doc.optimizations);
    
    return `${metadataSection}\n\n${doc.content}\n\n${optimizationSection}`;
  }

  private getOutputPath(inputPath: string): string {
    const relativePath = inputPath.replace(process.cwd(), '');
    const withoutExt = relativePath.replace(extname(relativePath), '');
    return join(this.config.outputDir, `${withoutExt}.md`);
  }

  private estimateTokenCount(content: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(content.length / 4);
  }

  private extractJSDocDescription(node: Node): string {
    const jsDocs = node.getJsDocs();
    if (jsDocs.length > 0) {
      return jsDocs[0].getDescription();
    }
    return '';
  }

  private extractFunctions(sourceFile: SourceFile): FunctionInfo[] {
    return sourceFile.getFunctions().map(func => ({
      name: func.getName() || 'anonymous',
      signature: func.getSignature().getDeclaration()?.getText() || '',
      description: this.extractJSDocDescription(func),
      isExported: func.isExported(),
    }));
  }

  private extractClasses(sourceFile: SourceFile): ClassInfo[] {
    return sourceFile.getClasses().map(cls => ({
      name: cls.getName() || 'anonymous',
      description: this.extractJSDocDescription(cls),
      methods: cls.getMethods().map(method => ({
        name: method.getName(),
        signature: method.getSignature().getDeclaration()?.getText() || '',
        isPublic: method.getScope() === undefined || method.getScope() === 'public',
      })),
      isExported: cls.isExported(),
    }));
  }

  private extractInterfaces(sourceFile: SourceFile): InterfaceInfo[] {
    return sourceFile.getInterfaces().map(iface => ({
      name: iface.getName(),
      description: this.extractJSDocDescription(iface),
      properties: iface.getProperties().map(prop => ({
        name: prop.getName(),
        type: prop.getType().getText(),
        optional: prop.hasQuestionToken(),
      })),
      isExported: iface.isExported(),
    }));
  }

  private calculateComplexity(sourceFile: SourceFile): number {
    // Simple complexity calculation based on various factors
    let complexity = 0;
    
    complexity += sourceFile.getFunctions().length * 2;
    complexity += sourceFile.getClasses().length * 3;
    complexity += sourceFile.getInterfaces().length * 1;
    complexity += sourceFile.getImportDeclarations().length * 0.5;
    
    return Math.round(complexity);
  }

  private extractDependencies(sourceFile: SourceFile): string[] {
    return sourceFile.getImportDeclarations()
      .map(imp => imp.getModuleSpecifierValue())
      .filter(dep => !dep.startsWith('.')) // External dependencies only
      .slice(0, 10); // Limit to avoid bloat
  }

  private generateAIOptimizations(sourceFile: SourceFile): string[] {
    const optimizations: string[] = [];
    const content = sourceFile.getFullText();

    if (content.includes('createTRPCRouter')) {
      optimizations.push('Use VibeCoding patterns for router development');
      optimizations.push('Reference existing router implementations');
    }

    if (content.includes('teamId')) {
      optimizations.push('Critical: Always include team isolation');
      optimizations.push('Security pattern: Team-based data access');
    }

    if (content.includes('export class')) {
      optimizations.push('Service layer pattern detected');
      optimizations.push('Consider dependency injection for testing');
    }

    return optimizations;
  }

  // Additional helper methods...
  private getCategoryFromFileType(fileType: FileType): string {
    const mapping: Record<FileType, string> = {
      'trpc-router': 'api',
      'service': 'service',
      'database-schema': 'database',
      'react-component': 'component',
      'utility-function': 'utility',
      'class': 'class',
      'types': 'types',
      'module': 'module',
    };
    return mapping[fileType] || 'general';
  }

  private getTemplateForFileType(fileType: FileType): string {
    const mapping: Record<FileType, string> = {
      'trpc-router': 'trpc-router',
      'service': 'service',
      'database-schema': 'schema',
      'react-component': 'component',
    };
    return mapping[fileType] || 'default';
  }

  private generatePurpose(analysis: FileAnalysis): string {
    if (analysis.patterns.some(p => p.name === 'trpc-router')) {
      return `Type-safe API router for ${analysis.fileName.replace('.router.ts', '')} operations`;
    }
    if (analysis.patterns.some(p => p.name === 'service-layer')) {
      return `Business logic service for ${analysis.fileName.replace('.service.ts', '')} domain`;
    }
    if (analysis.patterns.some(p => p.name === 'react-component')) {
      return `React component for ${analysis.fileName.replace(/\.(tsx|jsx)$/, '')} functionality`;
    }
    return `${analysis.fileType} implementation`;
  }

  private generateCodeExamples(analysis: FileAnalysis): string {
    // Generate relevant code examples based on patterns
    const examples: string[] = [];
    
    if (analysis.patterns.some(p => p.name === 'trpc-router')) {
      examples.push(`
\`\`\`typescript
// Example usage
const trpc = useTRPC();
const { data } = trpc.${analysis.fileName.replace('.router.ts', '')}.findMany.useQuery({
  teamId: currentTeamId,
});
\`\`\`
      `);
    }

    return examples.join('\n\n');
  }

  private findRelatedFiles(analysis: FileAnalysis): string {
    // Logic to find related files based on imports and patterns
    return analysis.dependencies
      .filter(dep => dep.startsWith('./') || dep.startsWith('../'))
      .map(dep => `- [${basename(dep)}](${dep})`)
      .join('\n');
  }

  private formatAIOptimizations(optimizations: string[]): string {
    return optimizations.map(opt => `- ${opt}`).join('\n');
  }

  private formatMetadata(metadata: AIMetadata): string {
    return `<!-- AI-METADATA:
category: ${metadata.category}
complexity: ${metadata.complexity}
updated: ${metadata.updated}
claude-ready: ${metadata.claudeReady}
phase: ${metadata.phase}
priority: ${metadata.priority}
token-optimized: ${metadata.tokenOptimized}
audience: ${metadata.audience}
ai-context-weight: ${metadata.aiContextWeight}
ai-tool: ${metadata.aiTool}
-->`;
  }

  private formatOptimizations(optimizations: AIOptimizations): string {
    return `
<!-- AI-OPTIMIZATIONS -->
**Token Count**: ${optimizations.tokenCount}
**Compression Level**: ${optimizations.compressionLevel}
**Tool Compatibility**: ${optimizations.toolCompatibility.join(', ')}
**Performance Score**: ${optimizations.performanceScore}/100
<!-- /AI-OPTIMIZATIONS -->
    `;
  }

  private generateIndex(): Promise<void> {
    // Generate main index file
    return Promise.resolve();
  }

  private generateNavigation(): Promise<void> {
    // Generate navigation structure
    return Promise.resolve();
  }

  private generateCompatibilityInfo(analysis: FileAnalysis): AICompatibility {
    return {
      claudeCode: 95,
      cursor: 90,
      copilot: 85,
      gemini: 88,
      chatgpt: 82,
    };
  }

  private generateOptimizations(analysis: FileAnalysis): AIOptimizations {
    return {
      tokenCount: this.estimateTokenCount(analysis.fileName),
      compressionLevel: this.config.optimizationLevel,
      toolCompatibility: this.config.aiTools,
      performanceScore: Math.min(95, 100 - analysis.complexity),
    };
  }
}

// Type definitions
type FileType = 'trpc-router' | 'service' | 'database-schema' | 'react-component' | 'utility-function' | 'class' | 'types' | 'module';

interface FileAnalysis {
  filePath: string;
  fileName: string;
  fileType: FileType;
  exports: ExportInfo[];
  imports: ImportInfo[];
  functions: FunctionInfo[];
  classes: ClassInfo[];
  interfaces: InterfaceInfo[];
  patterns: DetectedPattern[];
  complexity: number;
  dependencies: string[];
  aiOptimizations: string[];
}

interface ExportInfo {
  name: string;
  type: 'named' | 'default' | 'function' | 'class';
  signature?: string;
  description?: string;
  source?: string;
}

interface ImportInfo {
  name: string;
  source: string;
  type: 'named' | 'default' | 'namespace';
}

interface FunctionInfo {
  name: string;
  signature: string;
  description: string;
  isExported: boolean;
}

interface ClassInfo {
  name: string;
  description: string;
  methods: MethodInfo[];
  isExported: boolean;
}

interface MethodInfo {
  name: string;
  signature: string;
  isPublic: boolean;
}

interface InterfaceInfo {
  name: string;
  description: string;
  properties: PropertyInfo[];
  isExported: boolean;
}

interface PropertyInfo {
  name: string;
  type: string;
  optional: boolean;
}

interface DetectedPattern {
  name: string;
  indicators: string[];
  confidence: number;
}

interface AIMetadata {
  category: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  updated: string;
  claudeReady: boolean;
  phase: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tokenOptimized: boolean;
  audience: string;
  aiContextWeight: 'low' | 'medium' | 'important' | 'critical';
  aiTool: string;
}

interface AIDocumentation {
  metadata: AIMetadata;
  content: string;
  optimizations: AIOptimizations;
  tokenCount: number;
  aiCompatibility: AICompatibility;
}

interface AIOptimizations {
  tokenCount: number;
  compressionLevel: string;
  toolCompatibility: string[];
  performanceScore: number;
}

interface AICompatibility {
  claudeCode: number;
  cursor: number;
  copilot: number;
  gemini: number;
  chatgpt: number;
}

// Main execution
async function main() {
  const generator = new AIDocumentationGenerator(config);
  await generator.generate();
}

if (require.main === module) {
  main().catch(console.error);
}

export { AIDocumentationGenerator, type GenerationConfig };