# HTML Coverage Generation Issue

## Status Update (March 2024)

### Current Status

- Successfully migrated to Vitest Monocart Coverage for HTML report generation
- Resolved initial path resolution issues that occurred with `genhtml`
- Coverage reports are now generating correctly for all packages

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
