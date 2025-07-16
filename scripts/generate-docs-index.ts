#!/usr/bin/env node

/**
 * Automatic Documentation Index Generator
 * Scans docs/ directory and generates comprehensive indexes
 *
 * Usage: npx tsx scripts/generate-docs-index.ts
 */
import { readdir, readFile, stat, writeFile } from "fs/promises";
import { basename, extname, join, relative } from "path";

interface DocEntry {
  path: string;
  title: string;
  description: string;
  category: string;
  lastModified: Date;
  complexity?: string;
  audience?: string;
}

interface DirectoryIndex {
  name: string;
  path: string;
  description: string;
  entries: DocEntry[];
  subdirectories: DirectoryIndex[];
}

class DocsIndexGenerator {
  private rootPath = "docs";
  private excludePaths = [".DS_Store", "node_modules", ".git"];

  async generateIndex(): Promise<void> {
    console.log("🔍 Scanning documentation directory...");

    const rootIndex = await this.scanDirectory(this.rootPath);

    // Generate different types of indexes
    await Promise.all([
      this.generateMainIndex(rootIndex),
      this.generateCategoryIndex(rootIndex),
      this.generateFileIndex(rootIndex),
      this.generateSearchIndex(rootIndex),
    ]);

    console.log("✅ Documentation indexes generated successfully!");
  }

  private async scanDirectory(dirPath: string): Promise<DirectoryIndex> {
    const entries: DocEntry[] = [];
    const subdirectories: DirectoryIndex[] = [];

    try {
      const items = await readdir(dirPath);

      for (const item of items) {
        if (this.excludePaths.includes(item)) continue;

        const itemPath = join(dirPath, item);
        const stats = await stat(itemPath);

        if (stats.isDirectory()) {
          const subIndex = await this.scanDirectory(itemPath);
          subdirectories.push(subIndex);
        } else if (extname(item) === ".md") {
          const entry = await this.parseMarkdownFile(itemPath);
          if (entry) entries.push(entry);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not scan directory: ${dirPath}`);
    }

    const readmePath = join(dirPath, "README.md");
    let description = "";

    try {
      const readmeContent = await readFile(readmePath, "utf-8");
      description = this.extractDescription(readmeContent);
    } catch {
      description = `Documentation for ${basename(dirPath)}`;
    }

    return {
      name: basename(dirPath),
      path: dirPath,
      description,
      entries: entries.sort((a, b) => a.title.localeCompare(b.title)),
      subdirectories: subdirectories.sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    };
  }

  private async parseMarkdownFile(filePath: string): Promise<DocEntry | null> {
    try {
      const content = await readFile(filePath, "utf-8");
      const stats = await stat(filePath);

      const title = this.extractTitle(content, filePath);
      const description = this.extractDescription(content);
      const metadata = this.extractAIMetadata(content);

      return {
        path: filePath,
        title,
        description,
        category: this.determineCategory(filePath),
        lastModified: stats.mtime,
        complexity: metadata.complexity,
        audience: metadata.audience,
      };
    } catch (error) {
      console.warn(`⚠️  Could not parse file: ${filePath}`);
      return null;
    }
  }

  private extractTitle(content: string, filePath: string): string {
    // Look for first h1 header
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1].trim();

    // Fallback to filename
    const filename = basename(filePath, ".md");
    return filename
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private extractDescription(content: string): string {
    // Look for description in AI metadata
    const metadataMatch = content.match(/<!-- AI-METADATA:[\s\S]*?-->/);
    if (metadataMatch) {
      const descMatch = metadataMatch[0].match(/description:\s*(.+)/);
      if (descMatch) return descMatch[1].trim();
    }

    // Look for > quote blocks (often used for descriptions)
    const quoteMatch = content.match(/^>\s*(.+)$/m);
    if (quoteMatch) return quoteMatch[1].trim();

    // Look for first paragraph after title
    const lines = content.split("\n");
    let foundTitle = false;

    for (const line of lines) {
      if (line.startsWith("#") && !foundTitle) {
        foundTitle = true;
        continue;
      }

      if (
        foundTitle &&
        line.trim() &&
        !line.startsWith("#") &&
        !line.startsWith("<!--")
      ) {
        return line.trim().substring(0, 150) + "...";
      }
    }

    return "No description available";
  }

  private extractAIMetadata(content: string): Record<string, string> {
    const metadata: Record<string, string> = {};
    const metadataMatch = content.match(/<!-- AI-METADATA:([\s\S]*?)-->/);

    if (metadataMatch) {
      const metadataContent = metadataMatch[1];
      const fields = ["category", "complexity", "audience", "priority"];

      for (const field of fields) {
        const fieldMatch = metadataContent.match(
          new RegExp(`${field}:\\s*(.+)`),
        );
        if (fieldMatch) {
          metadata[field] = fieldMatch[1].trim();
        }
      }
    }

    return metadata;
  }

  private determineCategory(filePath: string): string {
    const path = filePath.toLowerCase();

    if (path.includes("architecture")) return "Architecture";
    if (path.includes("development")) return "Development";
    if (path.includes("subapps")) return "SubApps";
    if (path.includes("infrastructure")) return "Infrastructure";
    if (path.includes("applications")) return "Applications";
    if (path.includes("context-engineering")) return "Context Engineering";
    if (path.includes("rules-ai")) return "AI Rules";
    if (path.includes("documentation-standards")) return "Standards";
    if (path.includes("ui-design")) return "UI Design";

    return "General";
  }

  private async generateMainIndex(rootIndex: DirectoryIndex): Promise<void> {
    const content = this.buildMainIndexContent(rootIndex);
    await writeFile("docs/AUTO-GENERATED-INDEX.md", content);
    console.log("📄 Generated main index: docs/AUTO-GENERATED-INDEX.md");
  }

  private buildMainIndexContent(index: DirectoryIndex): string {
    const timestamp = new Date().toISOString().split("T")[0];

    let content = `<!-- AUTO-GENERATED INDEX - Do not edit manually -->
<!-- Generated: ${timestamp} -->

# Kodix Documentation - Complete Index

> **Auto-generated index** of all documentation in the \`docs/\` directory.  
> For the curated main index, see [docs/README.md](./README.md)

## 📊 Documentation Statistics

- **Total Documents**: ${this.countTotalDocs(index)}
- **Categories**: ${this.getUniqueCategories(index).length}
- **Last Generated**: ${new Date().toLocaleString()}

## 📁 Directory Structure

${this.buildDirectoryTree(index, 0)}

## 📋 All Documents by Category

${this.buildCategoryListing(index)}

## 🔍 Quick Reference

### Recently Updated
${this.buildRecentlyUpdatedList(index)}

### By Complexity
${this.buildComplexityListing(index)}

---

**Auto-generated by**: \`scripts/generate-docs-index.ts\`  
**Last Updated**: ${new Date().toLocaleString()}
`;

    return content;
  }

  private buildDirectoryTree(index: DirectoryIndex, depth: number): string {
    const indent = "  ".repeat(depth);
    let content = `${indent}- **${index.name}/** - ${index.description}\n`;

    // Add documents in this directory
    for (const entry of index.entries) {
      content += `${indent}  - [${entry.title}](${relative("docs", entry.path)})\n`;
    }

    // Add subdirectories
    for (const subdir of index.subdirectories) {
      content += this.buildDirectoryTree(subdir, depth + 1);
    }

    return content;
  }

  private buildCategoryListing(index: DirectoryIndex): string {
    const categorizedDocs = this.categorizeDocs(index);
    let content = "";

    for (const [category, docs] of Object.entries(categorizedDocs)) {
      content += `\n### ${category}\n\n`;

      for (const doc of docs) {
        const relativePath = relative("docs", doc.path);
        content += `- **[${doc.title}](${relativePath})** - ${doc.description}\n`;
      }
    }

    return content;
  }

  private buildRecentlyUpdatedList(index: DirectoryIndex): string {
    const allDocs = this.getAllDocs(index);
    const recentDocs = allDocs
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
      .slice(0, 10);

    let content = "";
    for (const doc of recentDocs) {
      const relativePath = relative("docs", doc.path);
      const dateStr = doc.lastModified.toLocaleDateString();
      content += `- **[${doc.title}](${relativePath})** (${dateStr})\n`;
    }

    return content;
  }

  private buildComplexityListing(index: DirectoryIndex): string {
    const allDocs = this.getAllDocs(index);
    const complexityGroups = {
      basic: allDocs.filter((d) => d.complexity === "basic"),
      intermediate: allDocs.filter((d) => d.complexity === "intermediate"),
      advanced: allDocs.filter((d) => d.complexity === "advanced"),
    };

    let content = "";
    for (const [level, docs] of Object.entries(complexityGroups)) {
      if (docs.length > 0) {
        content += `\n**${level.charAt(0).toUpperCase() + level.slice(1)}** (${docs.length} documents)\n`;
        for (const doc of docs.slice(0, 5)) {
          const relativePath = relative("docs", doc.path);
          content += `- [${doc.title}](${relativePath})\n`;
        }
        if (docs.length > 5) {
          content += `- ... and ${docs.length - 5} more\n`;
        }
      }
    }

    return content;
  }

  private async generateCategoryIndex(
    rootIndex: DirectoryIndex,
  ): Promise<void> {
    const categorizedDocs = this.categorizeDocs(rootIndex);

    for (const [category, docs] of Object.entries(categorizedDocs)) {
      const filename = `docs/indexes/BY-CATEGORY-${category.toUpperCase().replace(/\s+/g, "-")}.md`;
      const content = this.buildCategoryIndex(category, docs);

      try {
        await writeFile(filename, content);
        console.log(`📁 Generated category index: ${filename}`);
      } catch (error) {
        console.warn(`⚠️  Could not write category index: ${filename}`);
      }
    }
  }

  private buildCategoryIndex(category: string, docs: DocEntry[]): string {
    const timestamp = new Date().toISOString().split("T")[0];

    let content = `<!-- AUTO-GENERATED CATEGORY INDEX -->
# ${category} Documentation

> **${docs.length} documents** in the ${category} category

## 📋 Documents

| Title | Description | Complexity | Last Modified |
|-------|-------------|------------|---------------|
`;

    for (const doc of docs) {
      const relativePath = relative("docs", doc.path);
      const complexity = doc.complexity || "N/A";
      const dateStr = doc.lastModified.toLocaleDateString();

      content += `| [${doc.title}](${relativePath}) | ${doc.description} | ${complexity} | ${dateStr} |\n`;
    }

    content += `\n---\n**Generated**: ${timestamp}`;

    return content;
  }

  private async generateFileIndex(rootIndex: DirectoryIndex): Promise<void> {
    const allDocs = this.getAllDocs(rootIndex);
    const content = this.buildFileIndex(allDocs);
    await writeFile("docs/indexes/BY-FILENAME.md", content);
    console.log("📄 Generated file index: docs/indexes/BY-FILENAME.md");
  }

  private buildFileIndex(docs: DocEntry[]): string {
    const sortedDocs = docs.sort((a, b) => a.title.localeCompare(b.title));

    let content = `<!-- AUTO-GENERATED FILE INDEX -->
# All Documentation Files

> **Alphabetical listing** of all ${docs.length} documentation files

`;

    for (const doc of sortedDocs) {
      const relativePath = relative("docs", doc.path);
      content += `- **[${doc.title}](${relativePath})** - ${doc.description}\n`;
    }

    return content;
  }

  private async generateSearchIndex(rootIndex: DirectoryIndex): Promise<void> {
    const allDocs = this.getAllDocs(rootIndex);
    const searchData = allDocs.map((doc) => ({
      title: doc.title,
      path: relative("docs", doc.path),
      description: doc.description,
      category: doc.category,
      complexity: doc.complexity,
      audience: doc.audience,
    }));

    const jsonContent = JSON.stringify(searchData, null, 2);
    await writeFile("docs/indexes/search-index.json", jsonContent);
    console.log("🔍 Generated search index: docs/indexes/search-index.json");
  }

  // Helper methods
  private countTotalDocs(index: DirectoryIndex): number {
    let count = index.entries.length;
    for (const subdir of index.subdirectories) {
      count += this.countTotalDocs(subdir);
    }
    return count;
  }

  private getUniqueCategories(index: DirectoryIndex): string[] {
    const categories = new Set<string>();
    const addCategories = (idx: DirectoryIndex) => {
      for (const entry of idx.entries) {
        categories.add(entry.category);
      }
      for (const subdir of idx.subdirectories) {
        addCategories(subdir);
      }
    };
    addCategories(index);
    return Array.from(categories).sort();
  }

  private getAllDocs(index: DirectoryIndex): DocEntry[] {
    let docs = [...index.entries];
    for (const subdir of index.subdirectories) {
      docs = docs.concat(this.getAllDocs(subdir));
    }
    return docs;
  }

  private categorizeDocs(index: DirectoryIndex): Record<string, DocEntry[]> {
    const allDocs = this.getAllDocs(index);
    const categorized: Record<string, DocEntry[]> = {};

    for (const doc of allDocs) {
      if (!categorized[doc.category]) {
        categorized[doc.category] = [];
      }
      categorized[doc.category].push(doc);
    }

    // Sort documents within each category
    for (const category of Object.keys(categorized)) {
      categorized[category].sort((a, b) => a.title.localeCompare(b.title));
    }

    return categorized;
  }
}

// Main execution
async function main() {
  try {
    const generator = new DocsIndexGenerator();
    await generator.generateIndex();
  } catch (error) {
    console.error("❌ Error generating documentation index:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { DocsIndexGenerator };
