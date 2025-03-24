# ESM Support

This document outlines how ECMAScript Modules (ESM) are supported across the monorepo.

## Overview

- All workspaces use ESM by default
- Package.json has `"type": "module"`
- Import/export statements use ESM syntax
- Config files use `.mjs` or `.ts` extensions

## Workspace Configuration

### API Workspace

- Uses `.mjs` for config files
- Node.js native ESM support

### Web Workspace

- Uses `.ts` for config files
- Vite handles ESM bundling

## Testing Configuration

### API Workspace

- Uses Vitest for unit and E2E tests
- Config file: `apps/api/vitest.config.ts`
- E2E config file: `apps/api/vitest.config.e2e.js`

### Web Workspace

- Uses Vitest for unit tests
- Config file: `apps/web/vitest.config.ts`
- Playwright for E2E tests

## Node.js Configuration

- ESM is enabled by default
- No special flags needed for running tests
- TypeScript configured for ESM

## Common Patterns

### Import Statements

```js
// ESM imports
import { foo } from './foo.js';
import { bar } from '@app/bar';
```

### Config Files

- Use `.mjs` for Node.js config files
- Use `.ts` for TypeScript config files
- Vitest configured with TypeScript and React presets

## Troubleshooting

1. **ESM Support**:

   - Node.js 14+ required for ESM support
   - Use `.js` extension in imports
   - Configure TypeScript for ESM

2. **TypeScript**:
   - Set `module: "ESNext"` in tsconfig
   - Use `moduleResolution: "Node16"` or `"Bundler"`

## Resources

- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [TypeScript ESM Support](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [Vitest Documentation](https://vitest.dev)
