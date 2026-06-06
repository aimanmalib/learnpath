# 🎓 LearnPath

**Adaptive Learning Platform for any OpenAI-compatible LLM**

> AI-driven personalized education — quizzes, flashcards, learning roadmaps, progress tracking, and concept mapping.

[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![CI](https://github.com/aimanmalib/learnpath/actions/workflows/ci.yml/badge.svg)](https://github.com/aimanmalib/learnpath/actions/workflows/ci.yml)
[![Tests: 116](https://img.shields.io/badge/tests-116-brightgreen.svg)](tests/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Works with **OpenAI, OpenRouter, Ollama, llama.cpp, Xiaomi MiMo**, or any endpoint that speaks the OpenAI `/chat/completions` protocol. Pick a provider with one env var — no code changes.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  LearnPath (Next.js 14)                  │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Quiz    │  │Flashcard │  │ Roadmap  │              │
│  │  Page    │  │  Page    │  │  Page    │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │              │              │                    │
│  ┌────▼──────────────▼──────────────▼─────┐             │
│  │           Zustand State Stores          │             │
│  │    quiz-store │ flashcard-store │ ...   │             │
│  └────────────────────┬───────────────────┘             │
│                       │                                  │
│  ┌────────────────────▼───────────────────┐             │
│  │         Custom Hooks (useMiMo)        │             │
│  │     SSE streaming │ token tracking      │             │
│  └────────────────────┬───────────────────┘             │
│                       │                                  │
│  ┌────────────────────▼───────────────────┐             │
│  │           API Routes (Edge Runtime)     │             │
│  │  /api/chat │ /api/quiz │ /api/flashcards│             │
│  │  /api/roadmap │ /api/analyze            │             │
│  └────────────────────┬───────────────────┘             │
│                       │                                  │
│  ═══════════════════════════════════════════             │
│  Any OpenAI-compatible /chat/completions endpoint        │
│  (OpenAI · OpenRouter · Ollama · MiMo · ...)             │
└─────────────────────────────────────────────────────────┘
```

## Features

| Feature | Description | Est. Tokens/Day |
|---------|-------------|-----------------|
| **Adaptive Quiz** | AI-generated MCQs with difficulty levels | 0.6M |
| **Flashcards** | SM-2 spaced repetition scheduling | 0.4M |
| **Learning Roadmap** | Personalized learning paths by topic/level | 0.5M |
| **Progress Tracker** | Visual analytics dashboard | 0.3M |
| **Concept Map** | Knowledge graph exploration | 0.5M |
| **AI Chat** | Streaming LLM conversation | 0.8M |

**Daily Total: ~3.1M tokens**

## Supported Providers

LearnPath talks to any OpenAI-compatible `/chat/completions` endpoint. Built-in presets:

| Provider | `LLM_PROVIDER` | Default model | Auth | Key env var |
|----------|----------------|---------------|------|-------------|
| OpenAI | `openai` | `gpt-4o-mini` | Bearer | `OPENAI_API_KEY` |
| OpenRouter | `openrouter` | `openai/gpt-4o-mini` | Bearer | `OPENROUTER_API_KEY` |
| Ollama (local) | `ollama` | `llama3.1` | Bearer | `OLLAMA_BASE_URL` |
| Xiaomi MiMo | `mimo` | `mimo-v2.5-pro` | api-key | `MIMO_API_KEY` |

Set `LLM_PROVIDER` + the matching key (or just `LLM_API_KEY`). Override `LLM_BASE_URL` / `LLM_MODEL` for any other compatible endpoint. The right auth header (bearer vs api-key) is chosen automatically. Quiz answers and chat responses surface a model's `reasoning_content` when available, but it isn't required.

## Quick Start

```bash
# Install dependencies
npm install

# Set environment — pick any provider (OpenAI shown here)
echo 'LLM_PROVIDER=openai' > .env.local
echo 'OPENAI_API_KEY=*** development
# Development
npm run dev

# Build
npm run build

# Test
npm test
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (state management)
- SM-2 algorithm (spaced repetition)
- Vitest (testing)

## LLM Backend

- **Protocol**: OpenAI-compatible `/chat/completions`
- **Providers**: OpenAI, OpenRouter, Ollama, llama.cpp, Xiaomi MiMo, or any compatible endpoint
- **Auth**: bearer token or `api-key` header, selected automatically per provider
- **Config**: set `LLM_PROVIDER` + the provider's API key env var

## License

MIT
