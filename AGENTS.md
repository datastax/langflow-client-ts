# Repository Guidelines

This guide explains how to contribute to **@datastax/langflow‑client**. Keep it short, follow the practices below, and you’ll help keep the repo healthy.

## Project Structure & Module Organization

```
src/          # TypeScript source code
src/test/     # Unit tests (TS, run via `npm test`)
dist/         # Compiled JavaScript (created by `npm run build`)
```

Public APIs are exported from `src/index.ts`, `src/consts.ts`, `src/errors.ts`, `src/flow.ts`, `src/flow_response.ts` and `src/upload_response.ts`. Tests import from the same module paths used by consumers.

## Build, Test, and Development Commands

```bash
npm run build           # Transpile TypeScript to `dist/`
npm run build:clean     # Remove dist/ directory
npm run build:watch     # Watch for changes and transpile
npm run build:check     # Run the compiler to check types, but not transpile
npm run lint            # ESLint lint check
npm run format          # Prettier format source files
npm run format:check    # Check to see if source files require formatting
npm test                # Run unit tests with tsx
npm run test:coverage   # Generate coverage report in `coverage/`
```

The project uses **TypeScript**, **ESLint**, and **Prettier** for coding style.

## Coding Style & Naming Conventions

- **Indentation**: 2 spaces (Prettier default).
- **File names**: lower‑case with hyphens (e.g., `flow_response.ts`).
- **Exports**: prefer named exports; keep modules small.
- **Constants**: UPPER_SNAKE_CASE (e.g., `const MAX_RETRY = 5`).
- **Functions/Methods**: camelCase.
- Format with `npm run format` before committing.

The ESLint configuration is in `eslint.config.mjs` and rules are pulled from `@eslint/js` + `typescript-eslint`.

## Testing Guidelines

- Tests live in `src/test/`.
- Test files end with `.test.ts` (e.g., `flow.test.ts`).
- Run tests locally with `npm test`.
- Coverage can be produced by `npm run test:coverage`.
- Aim for >80 % coverage; new features should add tests.

## Commit & Pull Request Guidelines

- Follow **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- Commit titles should be short (<50 chars) and describe the change.
- Pull Request titles should start with the same type (e.g., `feat: add upload helper`).
- Include a brief description of the change in the PR body.
- Reference any related issue with `Closes #123`.
- If the PR touches the public API, document the change in the README or CHANGELOG.
- Add screenshots or examples only when the PR adds UI or demo files.

## Security Tips

- Never commit credentials or API keys to the repository.
- Use environment variables or a `.env` file (excluded from `git`) when running locally.
- When distributing the package, the `apiKey` is always sent as a bearer token or `x-api-key` header – no credentials are stored in the library.

## Architecture Overview

The library is a thin wrapper around the **Langflow** HTTP API.

```
+-------------+        +-------------------+        +----------+
| User Code  |  =>   | LangflowClient API |  =>   | Langflow |
| (module)   |  =>   |   (HTTP requests)  |  =>   | (server)|
+-------------+        +-------------------+        +----------+
```

1. **`LangflowClient`** – handles configuration, request signing, and headers.
2. **`Flow`** – provides high‑level methods (`run`, `stream`, `uploadFile`).
3. **Response classes** (`FlowResponse`, `UploadResponse`) parse and surface
   data in a user‑friendly way.

The flow follows the standard **request → response** pattern, optionally
streaming JSON using NDJSON for efficient large payloads.

## Contribution Checklist

Before submitting a pull request, run the following to ensure code quality:

```bash
npm run format:check   # Verify files are properly formatted
npm run lint           # Catch linting errors
npm test               # Ensure all unit tests pass
```

If all checks pass, you may submit your PR with a descriptive title and body.

---

Happy coding! If you have questions, open an issue or contact the maintainer.
