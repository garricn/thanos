# Getting Started with Thanos

This guide will help you get started with the Thanos project, from setting up prerequisites to running the application.

## Prerequisites

- Node.js 22+
- npm

## Using This Template

### Generating a New Project

Follow these steps to create a new project using Thanos:

1. **Clone the Thanos repository** (you only need to do this once):

   ```bash
   git clone https://github.com/garricn/thanos.git
   ```

2. **Make the generator script executable** (if not already):

   ```bash
   chmod +x /path/to/thanos/generate.js
   ```

3. **Create and navigate to a new empty directory** for your project:

   ```bash
   mkdir my-new-project
   cd my-new-project
   ```

4. **Run the generator script** using the full path to the script:

   ```bash
   /full/path/to/thanos/generate.js
   ```

   For example, if you cloned thanos to your home directory:

   ```bash
   ~/thanos/generate.js
   ```

   Or using a relative path:

   ```bash
   ../thanos/generate.js
   ```

5. **Follow the prompts** to specify your project name (defaults to the current directory name)

6. The script will:

   - Copy all necessary files to your current directory
   - Update references to "thanos" with your project name
   - Initialize a new Git repository
   - Install dependencies automatically
   - Create an initial commit with a clean git state

7. **Start your new project**:

   ```bash
   npm run start
   ```

> **Note**: The `--legacy-peer-deps` flag is required due to a dependency conflict between Cypress 14.x and @nx/cypress. An `.npmrc` file with this setting is automatically created in your project.

## Running the Generated Project

1. Start both the backend API server and frontend development server with a single command:

   ```bash
   npm run start
   ```

   This command runs both servers concurrently and will automatically kill both servers if one fails.

   Alternatively, you can start each server separately:

   ```bash
   npm run dev --workspace=apps/api    # Start the backend API server
   npm run dev --workspace=apps/web    # Start the frontend development server (in a separate terminal)
   ```

2. Open <http://localhost:4200> in your browser to see the frontend
3. Visit <http://localhost:4200/api/health> to see the backend API response
4. Visit <http://localhost:4200/api/hello> to see the backend response with database logging
5. Click the Button to see 'Clicked' state

## Next Steps

Once you have your project running, you might want to:

- Explore the [Project Structure](./PROJECT_STRUCTURE.md)
- Learn about the available [Commands](./COMMANDS.md)
- Check the [Troubleshooting](./TROUBLESHOOTING.md) guide if you encounter issues
