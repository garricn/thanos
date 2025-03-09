import { execSync } from 'child_process';

describe('Linting and Formatting', () => {
  it('should pass ESLint checks', () => {
    try {
      // Run ESLint on the project
      const result = execSync('npx nx lint', { encoding: 'utf-8' });
      
      // If there are no errors, the test passes
      expect(result).toBeDefined();
    } catch (error) {
      // If ESLint finds errors, it will throw an error
      fail('ESLint check failed: ' + error);
    }
  });

  it('should pass Prettier formatting checks', () => {
    try {
      // Run Prettier check on the project
      const result = execSync('npx prettier --check "src/**/*.{ts,tsx,js,jsx,json,css,scss,md}"', { encoding: 'utf-8' });
      
      // If there are no formatting issues, the test passes
      expect(result).toBeDefined();
    } catch (error) {
      // If Prettier finds formatting issues, it will throw an error
      fail('Prettier check failed: ' + error);
    }
  });
});
