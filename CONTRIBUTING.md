# Contributing to LearnPath

Thanks for your interest in improving LearnPath. This project is a
provider-agnostic adaptive learning platform (Next.js + TypeScript) that runs
on any OpenAI-compatible LLM endpoint. Contributions of all sizes are welcome
— docs fixes, new provider presets, UI improvements, and bug reports all help.

## Getting started

```bash
git clone https://github.com/aimanmalib/learnpath.git
cd learnpath
npm install

npm run dev      # http://localhost:3000, then add your key in Settings
npm test
```

To use a server-side key instead, put `LLM_PROVIDER` and `LLM_API_KEY` in
`.env.local` (see the README for all variables).

## Development workflow

1. Fork the repo and create a feature branch: `git checkout -b feat/my-change`
2. Make your change with tests.
3. Run the full local gate before pushing (Node.js 22.12+):
   ```bash
   npm run typecheck    # tsc --noEmit
   npm run lint         # eslint
   npm test             # vitest
   npm run build        # production build
   ```
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
   (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `ci:`).
5. Open a pull request against `main`. CI runs the same gate on Node 22 and 24.

## Adding a new LLM provider

Most OpenAI-compatible providers need only a preset entry in
`src/lib/llm/providers.ts`:

```ts
{
  id: "myprovider",
  label: "My Provider",
  baseUrl: "https://api.myprovider.com/v1",
  authStyle: "bearer",          // "bearer" or "api-key"
  defaultModel: "default-model-name",
  keyRequired: true,
  selfHostOnly: false,
  keysUrl: "https://myprovider.com/keys",
},
```

The base URL becomes part of the server's allowlist, so only add public,
HTTPS endpoints of real providers. Update `tests/lib/llm-providers.test.ts`
and the provider table in the README.

## Good first issues

- Add a provider preset
- Generate the concept map from study sessions (it is static sample data today)
- Add a new study feature (essay grading, flashcard import/export)
- Improve the SM-2 spaced repetition algorithm
- Accessibility / responsive UI improvements

## Code style

- TypeScript with strict mode (see `tsconfig.json`)
- Vitest for tests
- Next.js App Router conventions
- Keep components small and focused

## Reporting bugs / requesting features

Use the issue templates (bug report / feature request). Include repro steps,
your provider/model, and your Node version for bugs.

## License

By contributing, you agree your contributions are licensed under the MIT
License, the same as the project.
