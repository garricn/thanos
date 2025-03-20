#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Input files
const inputFiles = [
  'coverage/api/unit/sonar-report.xml',
  'coverage/web/unit/sonar-report.xml',
  'coverage/web/snapshot/sonar-report.xml',
];

// Output file
const outputFile = 'coverage/combined/sonar-report.xml';

// Ensure output directory exists
const outputDir = path.dirname(path.join(projectRoot, outputFile));
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Initialize empty testExecutions document
const combinedDoc = new DOMParser().parseFromString(
  '<?xml version="1.0" encoding="UTF-8"?><testExecutions version="1"></testExecutions>',
  'text/xml'
);
const combinedRoot = combinedDoc.documentElement;

// Process each input file
inputFiles.forEach((file) => {
  const fullPath = path.join(projectRoot, file);
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const doc = new DOMParser().parseFromString(content, 'text/xml');
      const fileNodes = doc.getElementsByTagName('file');

      // Copy each file node to the combined document
      for (let i = 0; i < fileNodes.length; i++) {
        const imported = combinedDoc.importNode(fileNodes[i], true);
        combinedRoot.appendChild(imported);
      }

      console.log(`✅ Processed: ${file}`);
    } catch (err) {
      console.error(`❌ Error processing ${file}: ${err.message}`);
    }
  } else {
    console.log(`⚠️ File not found: ${file}`);
  }
});

// Write combined XML to output file
const serializer = new XMLSerializer();
const combinedXml = serializer.serializeToString(combinedDoc);
fs.writeFileSync(path.join(projectRoot, outputFile), combinedXml);
console.log(`✅ Created combined report: ${outputFile}`);
