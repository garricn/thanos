import * as fs from 'fs';
import * as path from 'path';

describe('Project Structure', () => {
  const webAppRoot = path.join(__dirname, '..');
  
  test('Required files exist in apps/web/', () => {
    // Check for required files in apps/web/
    const requiredFiles = [
      'index.html',
      'src/main.tsx',
      'src/app/app.tsx',
      'vite.config.ts',
      'tsconfig.json',
      'project.json'
    ];
    
    requiredFiles.forEach(file => {
      const filePath = path.join(webAppRoot, file);
      expect(fs.existsSync(filePath)).toBeTruthy();
    });
  });
  
  test('Tailwind config exists at the correct location', () => {
    // Check for tailwind.config.js (relative to apps/web/)
    const tailwindConfigPath = path.join(webAppRoot, '..', '..', 'tailwind.config.js');
    expect(fs.existsSync(tailwindConfigPath)).toBeTruthy();
  });
});
