// lib/dependency-tracker/types.ts
export interface FileDependency {
  path: string;
  imports: string[];
  exports: string[];
  lastModified: number;
  size: number;
}

export interface DependencyGraph {
  nodes: Record<string, FileDependency>;
  relationships: Record<string, string[]>;
}
