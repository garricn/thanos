#!/usr/bin/env node

import { runPreCommitChecks } from './git-hooks.js';

runPreCommitChecks()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
