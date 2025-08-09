export interface PackageJson {
  scripts?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

export interface TsConfig {
  compilerOptions?: Record<string, any>;
  [key: string]: any;
}

export interface TemplatePackage {
  scripts: Record<string, string>;
}
