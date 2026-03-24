# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BrockstonAICore is a Next.js 15 application for the Christman AI Project. It powers "Brockston C" - an embodied conversational AI designed as a "New Teacher" for nonverbal and neurodivergent populations. The architecture combines a React/TypeScript frontend with a Python-based AI core using "Carbon-Silicon Symbiosis" (CSS).

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server with Turbopack on port 9002 |
| `npm run build` | Production build (outputs to `.next/`) |
| `npm run start` | Start production server |
| `npm run typecheck` | Run TypeScript compiler check (`tsc --noEmit`) |
| `npm run lint` | Run ESLint |
| `npm run genkit:dev` | Start Genkit AI dev server (`genkit start -- tsx src/ai/dev.ts`) |
| `npm run genkit:watch` | Genkit dev server with hot reload |

## Architecture Overview

### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **UI**: React 19 + TypeScript + Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives with custom styling)
- **Fonts**: Inter (body), Montserrat (headlines), Fira Code (monospace)
- **Icons**: Lucide React

### AI Architecture (Dual-Engine)
Located in `/src/ai/`:
- **Genkit Configuration** (`genkit.ts`): Dual-model setup
  - Anthropic Claude 4 Sonnet: Main voice/conversation (requires `ANTHROPIC_API_KEY`)
  - Ollama (local): Background tasks at `http://127.0.0.1:11434` (llama3.2:1b default)
- **AI Flows** (`/src/ai/flows/`): Server-side Genkit workflows defining AI capabilities
  - `ai-core-conversational-interaction.ts`: Main chat flow
  - `soul-forge-flow.ts`: Emotional processing
  - `vision-flow.ts`: Vision analysis
  - `autonomous-learning-flow.ts`: Self-improvement

### Python AI Core
Located in `/src/ai/python_core/`:
- Hundreds of Python modules for AI processing
- Key areas: Memory, reasoning, emotion, vision, voice synthesis, learning
- Server-side execution to protect proprietary logic

### Data Persistence
- **localStorage**: All application state is persisted to localStorage
  - `brockston:chat:messages` - Chat history
  - `brockston:cognitive:weights` - Core weights/LTP data
  - `brockston:learning:domains` - Domain mastery levels
  - `brockston:learning:memories` - Spaced repetition memories
  - `brockston:learning:insights` - Learned insights
  - `brockston:vortex:intentions` - Vortex engine intentions
  - `brockston:topology:stats` - Topology engine stats

### Application Structure

The main page (`/src/app/page.tsx`) has 4 tabbed views:
1. **Brockston** (`ChatInterface`): Main conversational AI chat
2. **Learning Center** (`LearningCenter`): Educational scaffolding with autonomous learning
3. **Code Lab** (`CodeLab`): Code generation/editing
4. **Cortex Monitor** (`CortexMonitor`): System monitoring

Path alias `@/*` maps to `./src/*`.

## Key Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js config with Turbopack, image domains |
| `tailwind.config.ts` | Tailwind with custom colors (CSS variables), dark mode |
| `components.json` | shadcn/ui configuration |
| `tsconfig.json` | TypeScript paths, strict mode enabled |
| `src/ai/genkit.ts` | Genkit dual-engine setup |

## Environment Variables

Create `.env.local` with:
- `ANTHROPIC_API_KEY` - For Claude API access
- `ELEVENLABS_API_KEY` - For voice synthesis
- `ELEVENLABS_VOICE_ID` - Voice ID for Brockston

## Important Conventions

- **Server Actions**: AI flows use `'use server'` directives
- **Dark Theme**: Application uses dark mode exclusively (`className="dark"` in layout)
- **CSS Variables**: Theme colors defined via HSL in `globals.css`
- **Safety-First**: NLU core (`/src/lib/nlu-core.ts`) detects crisis/stress for intervention protocols
- **CSS Axiom Charter**: Ethical guidelines defined in `/src/lib/css-axiom.ts` govern AI behavior

## External Dependencies

- **Ollama**: Must be running locally on port 11434 for local model support
- **Anthropic API**: Required for Claude model access
- **ElevenLabs**: Used for vocal synthesis (Brockston's voice)

## Avatar System

The embodied avatar (`CoreAvatar`) provides visual presence and emotional expression:

### Avatar States
- **Status**: `idle` | `thinking` | `speaking` | `listening`
- **Emotions**: `neutral` | `happy` | `thinking` | `learning` | `excited` | `confident` | `curious` | `focused`

### Key Features
- **Lip-sync animation**: CSS-based mouth movement when speaking
- **Micro-expressions**: Random subtle movements (blink, thoughtful, subtle) every 3-8 seconds when idle
- **Emotion-based images**: Different images for each emotion state
- **Visual effects**: Dynamic glow rings, spinning accent dot, scan lines when thinking

### Avatar Engine
Located in `/src/lib/avatar-engine.ts`:
- State management for avatar status and emotions
- Maps AI tone responses to avatar emotions
- PAD model configuration (Pleasure-Arousal-Dominance)
- Intelligence level tracking

### Avatar Assets
Located in `/public/images/`:
- `brockston-blue.jpg` - Default/neutral idle
- `brockston-champagne.jpg` - Speaking
- `brockston-happy.jpg` - Happy emotion
- `brockston-thinking.png` - Thinking/learning
- `brockston-neutral.png` - Focused/neutral
- `brockston-talking-*.png` - Speaking variants for emotions

## Learning System

The autonomous learning system (`LearningCenter`) uses:
- `RetentionEngine` (`/src/lib/retention-engine.ts`) for spaced repetition
- Local storage for persistence
- 5 learning domains: Neurodivergency, Neurology, Master Coding, AI Development, Mathematics
- Local model (llama3.2:1b via Ollama) for research tasks
