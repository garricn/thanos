const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const glob = require('glob');

// Function to format a single YAML file
function formatYamlFile(filePath) {
  console.log(`Processing ${filePath}...`);
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
      // Preserve multiline strings as folded style (>-) for command arguments
      styles: {
        '!!str': 'folded',
      },
    });

    // Write the formatted YAML back to the file
    fs.writeFileSync(filePath, formattedYaml, 'utf8');

    console.log(`Successfully formatted ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error formatting ${filePath}:`, error);
    return false;
  }
}

// Find all YAML files in the .github directory
const yamlFiles = glob.sync('.github/**/*.{yml,yaml}');

if (yamlFiles.length === 0) {
  console.log('No YAML files found in .github directory');
} else {
  console.log(`Found ${yamlFiles.length} YAML files to process`);

  // Format each YAML file
  const results = yamlFiles.map(formatYamlFile);

  // Check if any files failed to format
  const failedCount = results.filter((result) => !result).length;

  if (failedCount > 0) {
    console.error(`Failed to format ${failedCount} files`);
    process.exit(1);
  } else {
    console.log('All YAML files formatted successfully');
  }
}
