#!/usr/bin/env node

import { runPrePushChecks } from './git-hooks.js';

// Execute pre-push checks and exit with appropriate code
runPrePushChecks()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
