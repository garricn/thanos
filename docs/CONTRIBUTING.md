# Contributing to Thanos

Thank you for your interest in contributing to Thanos! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md) to ensure a positive and inclusive environment for everyone.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/your-username/thanos.git
   cd thanos
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Set up your environment** following the instructions in [GETTING_STARTED.md](./GETTING_STARTED.md)

## Development Workflow

1. **Create a new branch** for your feature or bugfix:

   ```bash
   git checkout -b feature/my-feature
   # or
   git checkout -b fix/my-bugfix
   ```

2. **Make your changes** and write tests for them

3. **Run tests** to ensure everything is working:

   ```bash
   npm run test:all
   ```

4. **Run linting** to ensure code quality:

   ```bash
   npm run lint
   npm run lint:md
   ```

5. **Format your code**:

   ```bash
   npm run format
   ```

6. **Commit your changes** following our commit message convention:

   ```bash
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve issue with component"
   ```

7. **Push your branch** to your fork:

   ```bash
   git push origin feature/my-feature
   ```

8. **Create a pull request** from your fork to the main repository

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to the build process or auxiliary tools

### Special Note about Claude Commits

If you're working with Claude AI assistant, all commit messages from Claude must be prefixed with "Claude:". See the [CLAUDE.md](./CLAUDE.md) file for details.

## Pull Request Process

1. Ensure all tests pass and code is properly formatted
2. Update documentation if necessary
3. The PR should clearly describe the problem and solution
4. Your PR will be reviewed by at least one maintainer
5. Address any requested changes
6. Once approved, your PR will be merged

## Testing Guidelines

- Write tests for all new features and bugfixes
- Maintain or improve test coverage
- Test both happy path and edge cases
- Follow existing test patterns

## Documentation Guidelines

- Update documentation for any changes to APIs or user-facing features
- Keep README.md up to date
- Use clear and concise language
- Include code examples where appropriate

## Style Guidelines

- Follow the ESLint configuration
- Follow the Prettier configuration
- Use TypeScript best practices
- Follow existing patterns in the codebase

## Questions?

If you have any questions or need help, please open an issue or contact the maintainers directly.

Thank you for your contributions!
