export interface PackageJson {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

export interface TsConfig {
  compilerOptions?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TemplatePackage {
  scripts: Record<string, string>;
}
