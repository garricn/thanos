#!/usr/bin/env node

import { cleanDeep } from '../lib/shell-utils.js';

// Get command line arguments excluding the first two (node and script name)
const args = process.argv.slice(2);

// Run the deep clean function with provided arguments
cleanDeep(args);
