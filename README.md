# Scaffold++

A TypeScript project setup tool that adds standardised ESLint, Prettier, CSpell, and Husky configurations to your existing projects.

## What it does

Scaffold++ takes your existing Vite TypeScript project and adds:

- **ESLint** - Comprehensive linting rules for TypeScript/React
- **Prettier** - Code formatting with sensible defaults
- **CSpell** - Spell checking for code and documentation
- **Husky** - Git hooks for automated code quality checks
- **TypeScript paths** - Automatic `@/*` path mapping setup

All dependencies are installed with exact versions to ensure consistency across projects.

## Quick Start

1. **Clone and build the tool:**
   ```bash
   git clone https://github.com/barrymun/scaffold-plus-plus.git
   cd scaffold-plus-plus
   pnpm install
   pnpm build
   ```

2. **Use it in your existing Vite project:**
   ```bash
   cd your-vite-project
   node /path/to/scaffold-plus-plus/dist/main.js
   ```

   Or run it on a specific directory:
   ```bash
   node /path/to/scaffold-plus-plus/dist/main.js ./my-project
   ```

## What gets added

- Configuration files: `eslint.config.js`, `prettier.config.js`, `cspell.json`
- Package.json scripts: `lint`, `lint-fix`, `cspell`, `prepare`
- TypeScript path mapping in `tsconfig.app.json`
- Husky git hooks setup

## Requirements

- Existing Vite project with TypeScript
- Node.js 18+
- pnpm package manager

## Notes

- The tool will prompt before overwriting existing configuration files
- Only copies `vite.config.ts` if you're working with a Vite project
- Installs additional React-specific rules if React is detected
