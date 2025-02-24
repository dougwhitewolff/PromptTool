// apps/web/lib/dependency-tracker/utils.ts

import fs from 'fs/promises';
import path from 'path';
import * as babel from '@babel/parser';
import traverse from '@babel/traverse';
import { APIError } from '@/lib/error-handling/types';

export interface DependencyGraph {
  nodes: Record<string, FileDependency>;
  relationships: Record<string, string[]>;
}

export interface FileDependency {
  path: string;
  imports: string[];
  exports: string[];
  lastModified: number;
  size: number;
}

export class DependencyTracker {
  private graph: DependencyGraph;

  constructor() {
    this.graph = { nodes: {}, relationships: {} };
  }

  /**
   * Updates the dependency graph with the dependencies of the given file.
   *
   * @param filePath - The path to the file to analyze.
   * @param depth - The depth for recursive dependency tracking (not implemented in this example).
   */
  async updateDependencies(filePath: string, depth: number = 2): Promise<void> {
    try {
      // Ensure the file exists and is accessible
      await fs.access(filePath);

      // Read the file content
      const content = await fs.readFile(filePath, 'utf-8');

      // Determine file size and last modified time
      const stats = await fs.stat(filePath);

      // Parse the file content into an AST
      const ast = babel.parse(content, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      const imports: string[] = [];
      const exports: string[] = [];

      // Traverse the AST to collect imports and exports
      traverse(ast, {
        ImportDeclaration({ node }) {
          imports.push(node.source.value);
        },
        ExportNamedDeclaration({ node }) {
          if (node.source) {
            imports.push(node.source.value);
          } else if (node.declaration) {
            exports.push('namedExport');
          }
        },
        ExportAllDeclaration({ node }) {
          imports.push(node.source.value);
        },
      });

      // Update the dependency graph
      this.graph.nodes[filePath] = {
        path: filePath,
        imports,
        exports,
        lastModified: stats.mtimeMs,
        size: stats.size,
      };

      // Update relationships
      this.graph.relationships[filePath] = imports.map((importPath) => {
        // Resolve relative paths
        if (importPath.startsWith('.')) {
          return path.resolve(path.dirname(filePath), importPath);
        }
        // For module imports (like 'react'), you can choose to handle them differently or skip
        return importPath;
      });
    } catch (error: any) {
      // Log the error and continue processing other files
      console.error(`Error processing file ${filePath}:`, error.message);
    }
  }

  /**
   * Retrieves the current dependency graph.
   *
   * @returns The dependency graph.
   */
  getDependencyGraph(): DependencyGraph {
    return this.graph;
  }
}
