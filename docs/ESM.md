# ESM Strategy

This document outlines our strategy for ES Modules (ESM) in the Thanos project.

## Overview

The project uses ES Modules as its primary module system, migrated from CommonJS in [commit 2eca358](https://github.com/garricn/thanos/commit/2eca358094e666143172c6268f119c428dbe9cd8). This decision aligns with modern JavaScript practices and provides better tree-shaking, static analysis, and future compatibility.

## Implementation Details

### Package Configuration

All workspaces use ESM by default through the `"type": "module"` setting in their `package.json`:

```json
{
  "type": "module"
}
```

### File Extensions

- **Source Files**: Use `.ts`/`.tsx` for TypeScript files
- **Configuration Files**:
  - API workspace: Uses `.mjs` for Jest and other configs
  - Web workspace: Uses `.ts` for better type safety
  - Root level: Supports both `.mjs` and `.ts`

### Jest Configuration

- API workspace uses `.mjs` for Jest configs:

  ```
  apps/api/configs/test/jest.config.mjs
  apps/api/e2e/configs/test/jest.config.mjs
  ```

- Web workspace uses `.ts` for Jest config:

  ```
  apps/web/configs/test/jest.config.ts
  ```

- Root Jest config supports both:

  ```typescript
  projects: [
    '<rootDir>/apps/*/configs/test/jest.config.{ts,mjs}',
    '<rootDir>/apps/*/e2e/configs/test/jest.config.{ts,mjs}',
    '<rootDir>/apps/*/tests/configs/test/jest.config.{ts,mjs}',
  ];
  ```

### Import/Export Syntax

Use ES Module syntax consistently:

```typescript
// ✅ Do this
import { something } from './module.js';
export const thing = {};
export default thing;

// ❌ Don't do this
const something = require('./module');
module.exports = thing;
```

### Node.js Configuration

- API uses `--experimental-vm-modules` for Jest tests
- Uses `tsx` for running TypeScript files directly
- Development uses `nodemon` with ESM support

## Workspace-Specific Details

### API Workspace

- Uses `.mjs` for configuration files to ensure Node.js treats them as ES Modules
- Test setup includes:

  ```bash
  NODE_OPTIONS='--experimental-vm-modules' jest
  ```

- Development uses:

  ```bash
  nodemon --exec 'npx tsx --tsconfig path/to/tsconfig.json'
  ```

### Web Workspace

- Uses `.ts` for configuration files for better TypeScript integration
- Vite handles ESM transpilation automatically
- Jest configured with TypeScript and React presets

## Migration Guidelines

When adding new files or configurations:

1. Always use ES Module syntax for imports/exports
2. For the API workspace:
   - Use `.mjs` for configuration files
   - Ensure Node.js flags are set for ESM compatibility
3. For the Web workspace:
   - Use `.ts` for configuration files
   - Leverage TypeScript for type safety

## Testing

- Run `npm run test:all` to verify all tests work with ESM configuration
- E2E tests use ESM-compatible configurations
- Coverage reporting works with both `.mjs` and `.ts` config files

## Common Issues

1. **Jest ESM Support**:

   - Solution: Use `--experimental-vm-modules` flag
   - Example: `NODE_OPTIONS='--experimental-vm-modules' jest`

2. **TypeScript Path Resolution**:

   - Solution: Use `.js` extensions in imports
   - Example: `import { thing } from './module.js'`

3. **Configuration File Loading**:
   - Solution: Use `.mjs` for Node.js configs that must run directly
   - Solution: Use `.ts` where TypeScript support is more important

## Future Considerations

1. Monitor Node.js ESM support status
2. Consider migrating remaining `.ts` configs to `.mjs` when TypeScript ESM support improves
3. Keep dependencies updated for best ESM compatibility
