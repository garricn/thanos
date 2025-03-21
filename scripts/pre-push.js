#!/usr/bin/env node

import { runPrePushChecks } from './git-hooks.js';

runPrePushChecks()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
