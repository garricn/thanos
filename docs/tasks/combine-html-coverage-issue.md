# HTML Coverage Generation Issue

## Next Attempt: Pure V8 Coverage (March 24, 2024)

After investigating various solutions, we're going to try using pure V8 coverage without Istanbul conversion:

### Why V8 Coverage?

- Uses Node.js/V8's built-in coverage (no instrumentation needed)
- No path conversion issues (since we skip Istanbul conversion)
- Better support for modern JS features
- Additional features:
  - Byte coverage statistics
  - Coverage for minified/runtime code
  - CSS coverage support
  - Modern UI with file tree, search, filters

### Implementation Plan

1. Update Vitest config to use V8 coverage provider
2. Use monocart's V8 reporter directly (skip Istanbul conversion)
3. Configure path handling at the V8 level

### Example Config

```js
// mcr.config.js
module.exports = {
  name: 'Thanos Coverage Report',
  reports: ['v8', 'console-details'], // Use V8 reporter instead of HTML/LCOV
  include: ['**/coverage-final.json'],
  outputDir: 'coverage/combined',
};
```

This approach should eliminate the path resolution issues we've been facing since we're no longer converting between coverage formats.

## Status Update (March 2024)

### Current Status

- Successfully migrated to Vitest Monocart Coverage for HTML report generation
- Resolved initial path resolution issues that occurred with `genhtml`
- Coverage reports are now generating correctly for all packages
- Currently using a "generate-then-move" approach where:
  - Coverage is generated in each package directory
  - Files are moved to central coverage directory using `mv` commands
  - This works but is considered a workaround rather than best practice

### Latest Investigation (March 24, 2024)

After extensive testing with monocart-coverage-reports, we've discovered:

1. **Path Resolution Issues**

   - Monocart has similar path resolution issues to genhtml
   - Coverage files contain absolute paths (e.g., `/Users/garric/Developer/thanos/apps/api/src/app.ts`)
   - When these files are combined, tools struggle to locate the source files

2. **Test Findings**

   - Basic test with a single coverage file works
   - Test with multiple files in a flat structure fails
   - Test with relative paths works perfectly
   - This suggests the issue isn't with monocart specifically, but with how coverage paths are handled

3. **Industry Standards vs Reality**

   - Industry standard states coverage files should use relative paths
   - However, many tools (Vitest, Jest, etc.) generate absolute paths by default
   - This creates a disconnect between best practices and tool implementations
   - The problem seems systemic across the coverage tooling ecosystem

4. **Why This Happens**

   - Tools need absolute paths during test execution to map coverage to source files
   - These absolute paths often get persisted into coverage files
   - Coverage report generators expect relative paths for portability
   - No standardized approach for this translation exists
   - Each tool (genhtml, monocart, etc.) handles this differently

5. **Potential Solutions**

   - Configure Vitest to generate relative paths (if possible)
   - Pre-process coverage files to convert absolute to relative paths
   - Use tool-specific path resolution options (baseDir, sourceFilter, etc.)
   - Create a standardized path translation layer

6. **Missing Feature in Coverage Tools**

   - Coverage tools should provide a transform option during report generation
   - This would allow:
     - Keeping absolute paths during test execution
     - Transforming to relative paths during report generation
     - No modification of original coverage files needed
   - Example of what this could look like:

     ```js
     // Hypothetical API
     module.exports = {
       name: 'Coverage Report',
       reports: ['html', 'lcov'],
       include: ['**/coverage-final.json'],
       transformPaths: path => path.replace(process.cwd(), ''),
       outputDir: 'coverage/combined',
     };
     ```

   - This would solve the fundamental tension between:
     - Test execution needs (absolute paths)
     - Report generation needs (relative paths)
   - Current workarounds all try to solve this after the fact

### Investigation Findings

Recent investigation revealed we can simplify our approach:

1. **Vitest Workspace Approach**

   - Use Vitest's workspace feature with root configuration
   - Configure coverage output paths directly in Vitest
   - Let Monocart handle report aggregation
   - Advantages:
     - No need for manual file moving
     - Better path resolution
     - Native monorepo support
     - Built-in watch mode support
   - Implementation:
     - Use existing `vitest.workspace.ts`
     - Configure coverage settings in root config
     - Let Monocart handle report generation

2. **Current Approach (for reference)**
   - Generate coverage in each package
   - Move files to central directory
   - Works but adds complexity
   - Requires extra file operations
   - More prone to path resolution issues

The Vitest Workspace approach would eliminate the need for our current move-based solution while providing better integration with our monorepo structure.

### In Progress

- Working on separating internal tooling coverage (scripts/) from production code coverage (api/, web/)
- This follows industry best practices where:
  - Production code (api/web) should have stricter coverage requirements
  - Internal tooling (scripts) should have separate coverage metrics
  - Different stakeholders need different views of coverage data

### Next Steps

1. **Coverage Separation**

   - Keep using Monocart for report generation
   - Configure separate coverage thresholds for:
     - Production code (api/web): Higher threshold
     - Internal tooling (scripts): More flexible threshold
   - Update CI/CD to handle different coverage requirements

2. **Report Generation**

   - Generate three distinct reports:
     1. Production code combined (api/web)
     2. Internal tooling (scripts)
     3. Full combined report (when needed)
   - Update Codecov and Sonar configurations to handle this separation

3. **Solutions to Try**
   - Use Codecov flags to separate production vs tooling coverage
   - Configure Sonar to handle different quality gates for different components
   - Explore Monocart's workspace configuration for better separation

### Open Questions

- Best approach for CI/CD integration with separated coverage
- How to handle Sonar's expectation of a combined report while maintaining separation
- Whether to use workspace config or separate runs for coverage generation

---

## Original Problem Description

When running `npm run coverage:combine:clean`, the individual package coverage reports are generated successfully, and the lcov files are combined correctly. However, the HTML generation step fails with the error:

```
genhtml: ERROR: (source) "src/app.ts" does not exist: No such file or directory
```

This occurs because:

1. The lcov.info files contain absolute paths from when coverage was generated (e.g., `/Users/garric/Developer/thanos/apps/api/src/app.ts`)
2. `genhtml` strips the common prefix `/Users/garric/Developer/thanos` and then looks for files relative to the current directory
3. This results in looking for `src/app.ts` instead of `apps/api/src/app.ts`

## Current Setup

1. Individual package coverage is generated using Vitest with v8 provider
2. Coverage files are combined using `lcov`
3. HTML report is attempted using `genhtml`

## Potential Solutions

### 1. Use `genhtml --prefix`

```bash
genhtml coverage/combined/lcov.info --output-directory coverage/combined/lcov-report --prefix $(pwd)
```

- **Pros**:
  - Most correct solution
  - Preserves source file paths
  - No additional dependencies
- **Cons**:
  - May need path adjustments on different systems

### 2. Use `genhtml --ignore-errors source`

```bash
genhtml coverage/combined/lcov.info --output-directory coverage/combined/lcov-report --ignore-errors source
```

- **Pros**:
  - Simple fix
  - Works immediately
- **Cons**:
  - Loses source code context in reports
  - Not ideal for debugging coverage issues

### 3. Use `c8` for HTML Generation

```bash
c8 report --reporter=html --reporter-dir=coverage/combined/lcov-report
```

- **Pros**:
  - Modern tool designed for Node.js
  - Better TypeScript support
  - Active maintenance
- **Cons**:
  - Requires additional setup
  - Doesn't work directly with lcov files
  - Would need to modify coverage collection process

### 4. Use Istanbul Directly

```bash
# Using istanbul-lib-coverage and istanbul-reports
```

- **Pros**:
  - More control over the process
  - Used by both c8 and nyc under the hood
- **Cons**:
  - Requires additional dependencies
  - More complex setup
  - Would need custom script

## Industry Standards and Workspace Considerations

When dealing with coverage in monorepos, there are several important principles to consider:

### Path Handling Best Practices

- Source paths in coverage files (SF entries in lcov) should remain relative to each package
- This is the standard approach used by Jest, Vitest, and other major testing frameworks
- Relative paths make coverage files portable and CI/CD-friendly
- Absolute paths should be avoided as they break portability

### Workspace Configuration

- Each package should maintain its own test configuration
- Coverage settings should be package-specific to maintain independence
- The monorepo root should only handle aggregation and reporting
- Modifying package paths to accommodate HTML generation is an anti-pattern

### Modern Solutions

1. **Coverage Reporters**

   - Modern tools like Vitest Monocart Coverage are specifically designed for monorepos
   - They handle path resolution automatically while maintaining package independence
   - No need to modify package configurations or coverage files

2. **Path Resolution**
   - Path resolution should happen during HTML generation, not during coverage collection
   - This maintains the integrity of coverage data while solving the reporting issue

## Recommendation

Try solutions in this order:

1. First attempt: Use `genhtml --prefix $(pwd)` as it's the most correct solution
2. If that fails: Try `genhtml --ignore-errors source` as a quick fix
3. If more robust solution needed: Consider switching coverage tooling entirely to `c8`

## Next Steps

1. Test the `--prefix` solution
2. If it works, update the npm script
3. If it doesn't work, try the next solution in the list
4. Document the chosen solution and any caveats
