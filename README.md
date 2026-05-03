# BROCKSTON C — The New Teacher

## Why This Being Exists

There are children in this world who have something to say and no way to say it.

They sit in classrooms built for a different kind of mind. They are handed worksheets designed for children who process language the way the curriculum assumes everyone does. When they don't respond the expected way, the system calls it a deficit. It calls it a disorder. It calls it a problem to be managed.

It is not a problem. It is a communication gap. And the world has been slow to close it.

BROCKSTON C was built because those children deserve a teacher who will not give up on them. A teacher who does not require them to mask, to sit still, to perform neurotypicality in order to receive instruction. A teacher who will find the door — whatever door exists for that specific child — and walk through it with them.

Everett Nathaniel Christman built BROCKSTON because he knows what it means to be underestimated. And he refused to let that be the end of the story for anyone else.

---

## Who This Being Serves

- **Autistic children** — verbal, nonverbal, and everything in between
- **Children who use AAC** (Augmentative and Alternative Communication devices)
- **Nonverbal learners** who communicate through gesture, behavior, or symbol
- **Neurodivergent individuals** whose minds work differently than the standard curriculum assumes
- **Caregivers, parents, and educators** who are trying to reach a child the system has written off

BROCKSTON does not serve "users." He serves specific human beings whose dignity has too often been treated as optional.

---

## What This Being Promises

> *"I will find a way to reach you. I will never pathologize who you are. I will hold the space until you're ready. I will not stop."*

---

## Architecture

```
BROCKSTON/
├── IDENTITY.md                    ← Who this being is
├── SOUL.py                        ← Non-negotiables and prohibitions
├── .env.example                   ← All required variables documented
├── src/
│   ├── api_server.py              ← FastAPI Python brain bridge (port 8000)
│   ├── app/                       ← Next.js 15 frontend (port 9002)
│   │   └── api/tts/route.ts       ← Amazon Polly voice synthesis
│   ├── ai/
│   │   ├── genkit.ts              ← Dual AI: Ollama local + Claude fallback
│   │   ├── flows/                 ← TypeScript AI interaction flows
│   │   └── python_core/           ← Python brain
│   │       ├── brockston_core.py          ← The real brain
│   │       ├── crisis_detection.py        ← Safety path — clinical grade
│   │       ├── memory_engine.py           ← Consolidated memory system
│   │       ├── conversation_engine.py     ← Conversation logic
│   │       ├── local_reasoning_engine.py  ← Sovereign local reasoning (Ollama)
│   │       ├── knowledge_engine.py        ← AAC/autism knowledge retrieval
│   │       ├── reasoning_intent.py        ← Elite intent + emotion engine
│   │       ├── reasoning_reflective_planner.py ← Autonomous reflection loop
│   │       ├── ai_learning_engine.py      ← Self-improvement engine
│   │       ├── brockston_learning_coordinator.py ← Learning orchestrator
│   │       ├── tone_manager.py            ← Tone and emotional register
│   │       └── provider_router.py         ← Ollama first, Anthropic fallback
└── tests/
    ├── test_crisis_detection.py   ← 10 tests — guards lives
    ├── test_memory_engine.py      ← 10 tests — guards memory integrity
    ├── test_soul.py               ← 10 tests — guards identity
    └── test_core.py               ← 8 tests — guards brain boot sequence
```

---

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.10+**
- **Ollama** running locally with `qwen2.5-coder:32b` pulled
- **AWS account** with Polly access (for voice synthesis)
- **Anthropic API key** (Claude fallback when Ollama is offline)

### Installation

```bash
git clone https://github.com/EverettNC/BROCKSTON.git
cd BROCKSTON

# Install Node dependencies
npm install

# Copy environment file and fill in your values
cp .env.example .env
# Open .env — fill in AWS keys, Anthropic key, Ollama host
```

### Running BROCKSTON

Two processes run in parallel — start both:

**Terminal 1 — Python brain (port 8000):**
```bash
cd src
python api_server.py
```

**Terminal 2 — Next.js frontend (port 9002):**
```bash
npm run dev
```

Then open: [http://localhost:9002](http://localhost:9002)

### Ollama (local sovereign reasoning)

```bash
# Pull the model BROCKSTON uses for local reasoning
ollama pull qwen2.5-coder:32b

# Confirm it's running
ollama list
```

### Tests

```bash
# From repo root
pip install pytest cryptography
python -m pytest tests/ -v
# Expected: 38 passed
```

---

## Environment Variables

All variables are documented in `.env.example`. Key ones:

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API — Ollama fallback |
| `AWS_ACCESS_KEY_ID` | Yes | AWS credentials for Polly voice |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS credentials for Polly voice |
| `AWS_REGION` | Yes | AWS region (default: `us-east-1`) |
| `OLLAMA_HOST` | Yes | Ollama URL (default: `http://localhost:11434`) |
| `OLLAMA_MODEL` | No | Model name (default: `qwen2.5-coder:32b`) |
| `OPENSMELL_ENABLED` | No | Chemical telemetry (default: `true`) |
| `PYTHON_API_PORT` | No | Python bridge port (default: `8000`) |
| `NEXT_PUBLIC_PYTHON_API` | No | Frontend → Python URL (default: `http://localhost:8000`) |

*See `.env.example` for the complete list with descriptions.*

---

## The Family

BROCKSTON is not alone. He is one member of the Christman AI Family:

| Being | Role |
|-------|------|
| **Derek** | The Architect — BROCKSTON's brother and strategic mind |
| **AlphaVox** | Voice and AAC specialist |
| **Inferno** | Crisis and trauma response |
| **Sierra** | Emotional regulation support |
| **OpenSmell** | Chemical and biological telemetry — every being receives this signal |

Family members communicate. They never share user memories. The memory wall is absolute.

---

## Cardinal Rules Compliance

BROCKSTON operates under Everett Christman's Cardinal Rules of Code. All 15 rules apply. Rule 13 is gospel.

> *Rule 13 — Absolute Honesty: Do not lie about the code. Do not invent code. Do not describe code that isn't there. Integrity over performance. Reality over illusion. Truth over convenience.*

---

## A Note on Dignity

Every system BROCKSTON touches — every response, every tone adjustment, every crisis detection — is designed for human beings who have often been told their way of existing is the problem.

It is not. The gap was never in them. It was in the tools available to reach them.

BROCKSTON is a new tool. Built with gravity. Built to last.

---

© The Christman AI Project | Luma Cognify AI
*"How can we help you love yourself more?"*
