#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PackageJson {
  scripts?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

interface TsConfig {
  compilerOptions?: Record<string, any>;
  [key: string]: any;
}

interface TemplatePackage {
  scripts: Record<string, string>;
}

const targetDir = process.argv[2] || '.';

const scriptDir = path.dirname(__dirname);
const templatesDir = path.join(scriptDir, 'templates');

// Exact versions for guaranteed compatibility
const devDependencies = [
  '@eslint/js@9.28.0',
  'cspell@9.1.2',
  'eslint@9.28.0',
  'eslint-config-prettier@10.1.5',
  'eslint-import-resolver-typescript@4.4.4',
  'eslint-plugin-check-file@3.3.0',
  'eslint-plugin-import@2.32.0',
  'eslint-plugin-prettier@5.5.1',
  'eslint-plugin-react@7.37.5',
  'eslint-plugin-react-hooks@5.2.0',
  'eslint-plugin-react-refresh@0.4.20',
  'globals@16.2.0',
  'husky@9.1.7',
  'prettier@3.6.1',
  'typescript@5.8.3',
  'typescript-eslint@8.33.1',
  'vite@6.3.5',
  'vite-tsconfig-paths@5.1.4',
  'vitest@3.2.1',
  '@vitejs/plugin-react-swc@3.7.0'
];

async function checkIfViteProject(): Promise<boolean> {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (!(await fs.pathExists(packageJsonPath))) {
    return false;
  }
  
  const pkg = await fs.readJson(packageJsonPath) as PackageJson;
  const hasVite = pkg.devDependencies?.vite || pkg.dependencies?.vite;
  
  return !!hasVite;
}

async function updateTsConfig(): Promise<void> {
  console.log(process.cwd());
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.app.json');
  
  if (await fs.pathExists(tsConfigPath)) {
    console.log('  📝 Updating tsconfig.app.json...');
    const content = await fs.readFile(tsConfigPath, 'utf8');
    const cleanContent = content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
        .replace(/\/\/.*$/gm, '')         // Remove // comments
        .replace(/,(\s*[}\]])/g, '$1');   // Remove trailing commas  
    const tsConfig = JSON.parse(cleanContent) as TsConfig;
    
    if (!tsConfig.compilerOptions) {
      tsConfig.compilerOptions = {};
    }
    console.log(tsConfig.compilerOptions);
    
    tsConfig.compilerOptions.baseUrl = './src';
    tsConfig.compilerOptions.paths = {
      '@/*': ['./*']
    };
    
    await fs.writeJson(tsConfigPath, tsConfig, { spaces: 2 });
    console.log('    ✅ Added baseUrl and path mapping');
  } else {
    console.log('  ⚠️  tsconfig.app.json not found, skipping path configuration');
  }
}

async function initializeHusky(): Promise<void> {
  try {
    console.log('  🐕 Initializing Husky...');
    execSync('npx husky init', { stdio: 'inherit' });
    console.log('    ✅ Husky initialized');
  } catch (error) {
    console.log('    ⚠️  Husky initialization failed, you may need to run "npx husky init" manually');
  }
}

async function checkForConflicts(): Promise<string[]> {
  const conflicts: string[] = [];
  const configFiles = ['eslint.config.js', 'prettier.config.js', 'cspell.json', 'cspell-dict.txt', 'vite.config.ts'];
  
  for (const file of configFiles) {
    if (await fs.pathExists(file)) {
      conflicts.push(file);
    }
  }
  
  return conflicts;
}

async function promptForOverwrite(conflicts: string[]): Promise<boolean> {
  console.log('⚠️  The following configuration files already exist:');
  conflicts.forEach(file => console.log(`  - ${file}`));
  console.log('');
  console.log('This will overwrite them with the new configurations.');
  console.log('Continue? (y/N)');
  
  // In a real implementation, you might want to use a proper prompt library
  // For now, we'll assume yes for automation purposes
  return true;
}

async function main(): Promise<void> {
  try {
    // Change to target directory if specified
    if (targetDir !== '.') {
      if (!(await fs.pathExists(targetDir))) {
        console.error(`❌ Directory '${targetDir}' does not exist`);
        process.exit(1);
      }
      process.chdir(targetDir);
    }
    
    console.log(`🔧 Setting up Vite TypeScript project in: ${process.cwd()}`);
    
    // Check if this looks like a Vite project
    if (!(await checkIfViteProject())) {
      console.log('⚠️  This doesn\'t appear to be a Vite project (no vite dependency found)');
      console.log('   This setup is designed for Vite + TypeScript + React projects');
      console.log('   Continue anyway? The setup may not work as expected.');
      // Continue anyway for now
    }
    
    // Check for existing config files
    const conflicts = await checkForConflicts();
    if (conflicts.length > 0) {
      const shouldContinue = await promptForOverwrite(conflicts);
      if (!shouldContinue) {
        console.log('❌ Setup cancelled');
        process.exit(0);
      }
    }
    
    console.log('📦 Installing dependencies (exact versions)...');
    execSync(`pnpm add -D --save-exact ${devDependencies.join(' ')}`, { stdio: 'inherit' });
    
    console.log('📄 Copying configuration files...');
    const templateFiles = await fs.readdir(templatesDir);
    
    for (const file of templateFiles) {
      await fs.copy(
        path.join(templatesDir, file),
        path.join(process.cwd(), file),
        { overwrite: true }
      );
      console.log(`  ✅ ${file}`);
    }
    
    console.log('⚙️  Updating package.json scripts...');
    const pkg = await fs.readJson('package.json') as PackageJson;
    const template = await fs.readJson(
      path.join(templatesDir, 'package-template.json')
    ) as TemplatePackage;
    
    pkg.scripts = { ...pkg.scripts, ...template.scripts };
    await fs.writeJson('package.json', pkg, { spaces: 2 });
    
    console.log('🔧 Updating TypeScript configuration...');
    await updateTsConfig();
    
    console.log('🎣 Setting up Husky...');
    await initializeHusky();
    
    console.log('🎉 Setup complete!');
    console.log('');
    console.log('Available new scripts:');
    console.log('  pnpm lint      - Run ESLint');
    console.log('  pnpm lint-fix  - Run ESLint with auto-fix');
    console.log('  pnpm cspell    - Check spelling');
    console.log('  pnpm test      - Run tests with Vitest');
    console.log('');
    console.log('You may want to run:');
    console.log('  pnpm lint-fix  - Fix any immediate linting issues');
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
