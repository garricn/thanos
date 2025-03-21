#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input files
const inputFiles = [
  'coverage/raw/api/unit/sonar-report.xml',
  'coverage/raw/web/unit/sonar-report.xml',
  'coverage/raw/web/snapshot/sonar-report.xml',
].filter((file) => fs.existsSync(file));

if (inputFiles.length === 0) {
  console.log('No Sonar report files found to combine.');
  process.exit(0);
}

// Create output directory if it doesn't exist
const outputDir = 'coverage/reports/sonar';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputFile = path.join(outputDir, 'sonar-report.xml');

// Read and parse the first file as the base
const baseContent = fs.readFileSync(inputFiles[0], 'utf8');
const parser = new DOMParser();
const baseDoc = parser.parseFromString(baseContent, 'text/xml');
const baseRoot = baseDoc.documentElement;

// Process additional files
inputFiles.slice(1).forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const doc = parser.parseFromString(content, 'text/xml');
  const root = doc.documentElement;

  // Copy all file elements from additional files
  const files = root.getElementsByTagName('file');
  for (let i = 0; i < files.length; i++) {
    const node = files.item(i);
    const imported = baseDoc.importNode(node, true);
    baseRoot.appendChild(imported);
  }
});

// Write the combined file
const serializer = new XMLSerializer();
const output = serializer.serializeToString(baseDoc);
fs.writeFileSync(outputFile, output);

console.log(`Combined Sonar report created at: ${outputFile}`);
