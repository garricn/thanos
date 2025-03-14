const fs = require('fs');
const yaml = require('js-yaml');

// Read the YAML file
const filePath = '.github/workflows/ci.yml';
const yamlContent = fs.readFileSync(filePath, 'utf8');

try {
  // Parse the YAML content
  const parsedYaml = yaml.load(yamlContent);

  // Convert back to YAML with proper formatting
  const formattedYaml = yaml.dump(parsedYaml, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });

  // Write the formatted YAML back to the file
  fs.writeFileSync(filePath, formattedYaml, 'utf8');

  console.log(`Successfully formatted ${filePath}`);
} catch (error) {
  console.error('Error formatting YAML:', error);
}
