# 🎓 LearnPath

**Adaptive Learning Platform powered by Xiaomi MiMo V2.5 Pro**

> AI-driven personalized education — quizzes, flashcards, learning roadmaps, progress tracking, and concept mapping.

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
│  │           Custom Hooks (useMiMo)        │             │
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
│  Xiaomi MiMo V2.5 Pro API                               │
│  token-plan-sgp.xiaomimimo.com/v1                       │
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
| **AI Chat** | Streaming MiMo conversation | 0.8M |

**Daily Total: ~3.1M tokens**

## Token Consumption Report

| Metric | Value |
|--------|-------|
| Daily token consumption | ~3.1M tokens |
| Per-session (avg quiz) | ~8K tokens |
| Primary model | mimo-v2.5-pro |
| API endpoint | `token-plan-sgp.xiaomimimo.com/v1` |
| Auth method | `api-key` header |

## Why MiMo?

1. **Structured output** — MiMo excels at generating consistently formatted JSON for quizzes, flashcards, and roadmaps
2. **SSE streaming** — Real-time token-by-token responses via `reasoning_content` field for interactive learning
3. **Cost efficiency** — High-volume token consumption across 6 features requires affordable per-token pricing
4. **Reasoning depth** — Chain-of-thought reasoning enables detailed explanations in quiz answers
5. **API compatibility** — OpenAI-compatible endpoint simplifies Next.js integration

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
export MIMO_API_KEY="your-key-here"

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

## API Details

- **Endpoint**: `https://token-plan-sgp.xiaomimimo.com/v1/chat/completions`
- **Model**: `mimo-v2.5-pro`
- **Auth**: `api-key` header (NOT `Authorization: Bearer`)
- **Streaming**: SSE with `reasoning_content` field

## License

MIT
