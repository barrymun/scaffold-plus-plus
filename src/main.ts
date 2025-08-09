#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

import { DEV_DEPENDENCIES } from './consts.js';
import { Logger } from './utils/logger/index.js';
import { PackageJson, TemplatePackage, TsConfig } from './types.js';

const logger = new Logger();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = process.argv[2] || '.';
const scriptDir = path.dirname(__dirname);
const templatesDir = path.join(scriptDir, 'templates');

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
  logger.indent();
  logger.log('📝 Updating tsconfig.app.json...');
  logger.indent()

  const tsConfigPath = path.join(process.cwd(), 'tsconfig.app.json');
  
  if (await fs.pathExists(tsConfigPath)) {
    const content = await fs.readFile(tsConfigPath, 'utf8');
    const cleanContent = content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
      .replace(/\/\/.*$/gm, '')         // Remove // comments
      .replace(/,(\s*[}\]])/g, '$1');   // Remove trailing commas
    const tsConfig = JSON.parse(cleanContent) as TsConfig;
    
    if (!tsConfig.compilerOptions) {
      tsConfig.compilerOptions = {};
    }
    
    tsConfig.compilerOptions.baseUrl = './src';
    tsConfig.compilerOptions.paths = {
      '@/*': ['./*']
    };
    
    await fs.writeJson(tsConfigPath, tsConfig, { spaces: 2 });

    logger.success('Added baseUrl and path mapping');
  } else {
    logger.warning('tsconfig.app.json not found, skipping path configuration');
  }

  logger.resetIndent();
}

async function initializeHusky(): Promise<void> {
  logger.indent();
  logger.log('🐕 Initializing Husky...');
  logger.indent();

  try {
    execSync('npx husky init', { stdio: 'inherit' });
    logger.success('Husky initialized');
  } catch (error) {
    logger.warning('Husky initialization failed, you may need to run "npx husky init" manually');
  } finally {
    logger.resetIndent();
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
  logger.warning('The following configuration files already exist:');
  logger.indent();
  conflicts.forEach((file) => logger.log(file));
  logger.outdent();
  logger.log('This will overwrite them with the new configurations.');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('Continue? (y/N): ', (answer) => {
      rl.close();
      const normalizedAnswer = answer.trim().toLowerCase();
      resolve(normalizedAnswer === 'y' || normalizedAnswer === 'yes');
    });
  });
}

async function main(): Promise<void> {
  try {
    // Change to target directory if specified
    if (targetDir !== '.') {
      if (!(await fs.pathExists(targetDir))) {
        logger.error(`Directory '${targetDir}' does not exist`);
        process.exit(1);
      }
      process.chdir(targetDir);
    }
    
    logger.log(`🔧 Setting up Vite TypeScript project in: ${process.cwd()}`);
    
    // Check if this looks like a Vite project
    if (!(await checkIfViteProject())) {
      logger.warning('This doesn\'t appear to be a Vite project (no vite dependency found)');
      logger.log('This setup is designed for Vite + TypeScript + React projects');
      logger.log('Continue anyway? The setup may not work as expected.');
      // TODO: Continue anyway for now
    }
    
    // Check for existing config files
    const conflicts = await checkForConflicts();
    if (conflicts.length > 0) {
      const shouldContinue = await promptForOverwrite(conflicts);
      if (!shouldContinue) {
        logger.error('Setup cancelled');
        process.exit(0);
      }
    }
    
    logger.log('📦 Installing dependencies (exact versions)...');
    execSync(`pnpm add -D --save-exact ${DEV_DEPENDENCIES.join(' ')}`, { stdio: 'inherit' });
    
    logger.log('📄 Copying configuration files...');
    logger.indent();
    const templateFiles = await fs.readdir(templatesDir);
    for (const file of templateFiles) {
      await fs.copy(
        path.join(templatesDir, file),
        path.join(process.cwd(), file),
        { overwrite: true }
      );
      logger.success(file);
    }
    logger.outdent();
    
    logger.log('⚙️ Updating package.json scripts...');
    const pkg = await fs.readJson('package.json') as PackageJson;
    const template = await fs.readJson(
      path.join(templatesDir, 'package-template.json')
    ) as TemplatePackage;
    
    pkg.scripts = { ...pkg.scripts, ...template.scripts };
    await fs.writeJson('package.json', pkg, { spaces: 2 });
    
    logger.log('🔧 Updating TypeScript configuration...');
    await updateTsConfig();
    
    logger.log('🎣 Setting up Husky...');
    await initializeHusky();
    
    logger.log('🎉 Setup complete!');
    logger.log('');
    logger.log('Available new scripts:');
    logger.indent();
    logger.log('pnpm lint      - Run ESLint');
    logger.log('pnpm lint-fix  - Run ESLint with auto-fix');
    logger.log('pnpm cspell    - Check spelling');
    logger.log('pnpm test      - Run tests with Vitest');
    logger.log('');
    logger.outdent();
    logger.log('You may want to run:');
    logger.indent();
    logger.log('pnpm lint-fix  - Fix any immediate linting issues');
  } catch (error) {
    logger.error(error);
    process.exit(1);
  } finally {
    logger.resetIndent();
  }
}

main();
