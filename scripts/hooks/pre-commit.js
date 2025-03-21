#!/usr/bin/env node

import { runPreCommitChecks } from './git-hooks.js';

// Execute pre-commit checks and exit with appropriate code
runPreCommitChecks()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
