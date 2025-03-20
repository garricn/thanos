# Project Structure

This document outlines the structure of the Thanos monorepo and explains the purpose of each directory.

## Overview

Thanos follows a typical Nx monorepo structure with separate applications for the frontend and backend. The project is organized to promote code separation, maintainability, and testability.

## Directory Structure

```
thanos/
├── apps/                  # Main applications directory
│   ├── web/               # Frontend React application
│   │   ├── src/           # Frontend source code
│   │   │   ├── app/       # Frontend application components
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── assets/    # Static assets
│   │   │   └── lib/       # Utility functions
│   │   └── e2e/           # Frontend end-to-end tests
│   └── api/               # Backend API application
│       ├── src/           # API source code
│       │   └── main.ts    # Express server entry point
│       └── e2e/           # API end-to-end tests
├── configs/               # Configuration files
│   ├── build/             # Build configurations
│   ├── lint/              # Linting configurations
│   ├── test/              # Testing configurations
│   └── quality/           # Quality tool configurations
│       └── sonar-project.properties  # SonarCloud configuration
├── docs/                  # Project documentation
│   ├── GETTING_STARTED.md # Instructions for getting started
│   ├── COMMANDS.md        # List of available commands
│   └── ...                # Other documentation files
├── scripts/               # Utility scripts for various tasks
├── .github/               # GitHub configuration (workflows, templates)
└── [config files]         # Various configuration files at root level
```

## Key Directories and Files

### Frontend (apps/web)

- **src/app**: Contains the main application components and routing
- **src/components**: Reusable UI components used throughout the application
- **src/assets**: Static assets like images, fonts, and other media
- **src/lib**: Utility functions, hooks, and other shared code

### Backend (apps/api)

- **src/main.ts**: Entry point for the Express server
- **src/app**: Application logic, controllers, and routes
- **src/db**: Database configuration and models

### Root Level

- **package.json**: Main project configuration and dependencies
- **tsconfig.json**: TypeScript configuration
- **nx.json**: Nx monorepo configuration
- **README.md**: Project overview and documentation

## Naming Conventions

- Component files: PascalCase (e.g., `Button.tsx`)
- Utility files: camelCase (e.g., `formatDate.ts`)
- Test files: ComponentName.test.tsx or utilityName.test.ts
- Snapshot tests: ComponentName.snapshot.test.tsx
- E2E test files: ComponentName.cy.ts

## Module Organization

The project uses a feature-based organization where related components, services, and utilities are grouped together. This makes it easier to understand the codebase and find related code.

## Configuration Management

Configuration files are kept at the root level for ease of access. Environment-specific configurations are handled through environment variables and default configuration files.
