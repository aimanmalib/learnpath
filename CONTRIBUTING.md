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

echo 'LLM_PROVIDER=openai' > .env.local
echo 'OPENAI_API_KEY=*** .env.local

npm run dev      # http://localhost:3000
npm test         # 116 tests should pass
```

## Development workflow

1. Fork the repo and create a feature branch: `git checkout -b feat/my-change`
2. Make your change with tests.
3. Run the full local gate before pushing:
   ```bash
   npx tsc --noEmit     # type check
   npm test             # vitest
   npm run build        # production build
   ```
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
   (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `ci:`).
5. Open a pull request against `main`. CI runs type check + tests + build on
   Node 18/20 — keep it green.

## Adding a new LLM provider

LearnPath talks to any OpenAI-compatible `/chat/completions` endpoint, so most
providers need only a preset entry. In `src/lib/mimo-client.ts`, add to
`PROVIDER_PRESETS`:

```ts
myprovider: {
  baseUrl: 'https://api.myprovider.com/v1',
  authStyle: 'bearer',          // 'bearer' or 'api-key'
  model: 'default-model-name',
  envKey: 'MYPROVIDER_API_KEY',
  envBase: 'MYPROVIDER_BASE_URL',
},
```

Then add a test in `tests/lib/multi-backend.test.ts` mirroring the existing
provider cases.

## Good first issues

- Add a provider preset (Together, Groq, DeepSeek, Mistral, ...)
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
