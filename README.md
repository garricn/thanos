# Web - A Test-Driven React App

## Description

Web is a test-driven development (TDD) React application built with Nx, featuring a Button component that demonstrates UI testing. The project showcases best practices for testing React components at different levels.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- Node.js
- Express
- SQLite (for database storage)
- Jest (for unit and snapshot tests)
- Cypress (for UI tests)
- ESLint
- Prettier
- Nx (monorepo tool)

## Commands

| Command                                            | Description                |
| -------------------------------------------------- | -------------------------- |
| `nx serve web`                                     | Run the website locally    |
| `nx serve api`                                     | Run the backend API server |
| `nx test web`                                      | Run frontend unit tests    |
| `nx test api`                                      | Run backend unit tests     |
| `nx test web --test-file=Button.snapshot.test.tsx` | Run snapshot tests         |
| `nx e2e web-e2e`                                   | Run UI tests               |
| `nx e2e web-e2e --watch`                           | Run UI tests in watch mode |
| `nx lint web`                                      | Run linting                |
| `nx format:write`                                  | Run formatting             |

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

**Prerequisites:**

- Node.js 22+
- npm

## Usage

1. Start the backend API server:

   ```
   nx serve api
   ```

2. In a separate terminal, start the frontend development server:

   ```
   nx serve web
   ```

3. Open http://localhost:4200 in your browser to see the frontend
4. Visit http://localhost:4200/api/health to see the backend API response

5. Visit http://localhost:4200/api/hello to see the backend response with database logging

6. Click the Button to see 'Clicked' state

## Project Structure

```
thanos/
├── apps/
│   ├── web/             # Frontend React application
│   │   ├── src/         # Frontend source code
│   │   │   ├── app/     # Frontend application components
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── assets/  # Static assets
│   │   │   └── lib/     # Utility functions
│   │   └── e2e/         # Frontend end-to-end tests
│   └── api/             # Backend API application
│       ├── src/         # API source code
│       │   └── main.ts  # Express server entry point
│       └── e2e/         # API end-to-end tests
└── [config files]       # Various configuration files at root level
```

## Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork this repository
2. Create a new branch for your feature
3. Make your changes
4. Submit a pull request

## License

MIT License

Copyright (c) 2025 Garric

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Troubleshooting

- **Issue**: If `nx e2e` fails, ensure `nx serve` is running on port 4200.
  **Solution**: Run `nx serve web` in a separate terminal before running e2e tests.

- **Issue**: Component tests failing with style-related errors.
  **Solution**: Make sure Tailwind CSS is properly configured and imported.

## Acknowledgements

- Built with [Nx](https://nx.dev/)
- Tested with [Cline](https://github.com/saoudrizwan/cline) by Saoud Rizwan

---

_Note: This project is a learning exercise for Test-Driven Development (TDD) with an AI agent (Cline)._
