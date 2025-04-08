# MCP Server Development Guide

## Commands
- Build: `npm run build` (uses tsup)
- Test: `npm run test` (vitest run, tsc check, JSR dry-run)
- Run a single test: `npx vitest run src/discover.test.ts`
- Format: `npm run format` (prettier + eslint)
- Start server: `node dist/bin/discover.js` or `npm run build && node dist/bin/discover.js`

## Code Style
- Use ESM modules (`import/export`), not CommonJS (`require()`)
- TypeScript with strict type checking
- Follow alphabetical imports (enforced by eslint-plugin-perfectionist)
- Indentation: 2 spaces
- Use camelCase for variables and functions
- Use PascalCase for classes and types
- Prefer `const` over `let`, avoid `var`
- Use async/await for asynchronous code
- Use zod for schema validation
- Use pino for logging

## Error Handling
- Use `UserError` for user-facing errors
- Use logger for debugging and tracking issues
- Validate inputs with zod schemas
- Properly handle async errors with try/catch
- Log errors with appropriate context

## Project Structure
- `src/` - TypeScript source files
- `dist/` - Compiled JavaScript (output of build)
- `logs/` - Application logs