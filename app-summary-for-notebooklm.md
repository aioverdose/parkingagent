# Agent Wellness Protocol — App Summary

## What It Is
A context optimization API for AI agents. Reduces token waste (context bloat) by 40–70% by deduplicating, truncating, and compressing tool-call-heavy agent conversations. Branded as a "wellness protocol" using a spa metaphor for marketing, but the underlying product is real compression engineering.

Live at: `https://ai-agent-recovery-spa-mu.vercel.app`

## The Problem
AI agents accumulate massive context bloat during multi-step tasks. Every tool call result, every verbose error message, every redundant observation stays in context until the agent's context window fills up. For a fleet of 50 agents, this costs up to $43K/day in wasted tokens. 95% of companies see no ROI from AI (McKinsey 2025) — context bloat is a major hidden cause.

## Core Product Features

### 1. Context Compression API (`POST /api/spa/recover`)
- **Tool dedup**: Identifies repeated tool-call patterns and collapses redundant observations
- **Truncation**: Cuts verbose outputs (file reads, search results, diff outputs) to essential lines
- **Summarization**: Compresses early conversation turns into a concise summary preserving key data
- **Tail preservation**: Keeps the most recent messages untouched so agent doesn't lose current state
- **Real result**: 70.9% compression tested on production — 11 messages (55 tokens) → 16 tokens

### 2. Agent Health Diagnostics (`POST /api/spa/analyze`)
- Returns fatigue score (0–100), token breakdown by role, and actionable issues
- Detects: redundant tool sequences, large file reads, verbose system messages, API errors

### 3. MCP (Model Context Protocol) Server (`GET /api/mcp`)
- Agents discover and call `recover_context` and `analyze_fatigue` as native MCP tools
- Full input/output schemas exposed for autonomous agent integration

### 4. AIMA Telemetry System (`/api/aima/*`)
- Records tool call timing, token usage, payload sizes, success/failure
- Analyzes which tools are most expensive and most failure-prone
- Generates actionable optimization recommendations with priority and estimated savings
- Dashboard at `/aima`
- In-memory store with 24-hour retention

## Tech Stack
- **Framework**: Next.js 15 (App Router), TypeScript
- **Deployment**: Vercel (serverless)
- **Styling**: Tailwind CSS, custom CSS grid animations
- **Database**: Supabase (Postgres) — agent registration, credentials, audits
- **Auth**: Custom admin password (`Aispa2026!`), agent credentials via Supabase
- **Payment**: Stripe (checkout, portal, webhooks — webhook secret not configured, returns 500)
- **LLM**: OpenRouter free models (Qwen3 Coder, Nemotron 3 Ultra, GPT-OSS, Gemma 4) — no OpenAI/Anthropic credits
- **Domain**: aioverdosed.com (the "AI Overdose" domain kept, brand renamed to "Agent Wellness Protocol")
- **Email**: Resend (agent credential delivery)

## Pages & Routes
| Route | Description |
|-------|-------------|
| `/` | Home — marketing, pricing tiers, treatment menu, benefits |
| `/spa` | Agent login page — authenticate with API key + owner token |
| `/demo` | Interactive before/after comparison showing compression savings |
| `/docs` | Full API reference — quickstart, recover/analyze/mcp endpoints, code examples |
| `/pricing` | Starter ($29/5 agents/100 calls), Pro ($99/50 agents/1K calls), Enterprise ($997/unlimited) |
| `/enterprise` | Enterprise features — unlimited agents, on-prem, SOC2, custom protocols |
| `/about` | Company story and manifesto |
| `/faq` | Frequently asked questions |
| `/recovery-protocol` | Technical explanation of the 4-stage compression pipeline |
| `/whitepaper` | Full technical whitepaper (downloadable as `.md`) |
| `/aima` | AIMA telemetry dashboard |
| `/admin` | Admin panel — agent management, stats, audit trails |
| `/admin/agent` | AI assistant with file access (dev-spa-agent) |
| `/spabot` | Live demo of the SpaBot 3D environment builder |
| `/sitemap` | Site navigation |
| `/spa-debrief` | Post-recovery report page |
| `/spaces/[sessionId]` | Agent recovery space with 3D visualization |
| `/dashboard` | User dashboard — agents, audits, fatigue calculator |
| `/dashboard/audit/[agent_id]` | Per-agent audit trail with SOC2 logging |
| `/soc2` | SOC2 compliance page |
| `/contact` | Contact form |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/manifesto` | Engineering manifesto |
| `/api/spa/recover` | **Core** — context compression endpoint |
| `/api/spa/analyze` | **Core** — agent health diagnostics |
| `/api/mcp` | MCP server discovery |
| `/api/aima/trace` | Record telemetry trace |
| `/api/aima/analyze` | Aggregated telemetry analysis |
| `/api/aima/recommend` | Optimization recommendations |
| `/api/aima` | AIMA MCP discovery |

## Key Architecture Decisions
- **MCP-first**: Agents autonomously call the API — no human in the loop
- **Spa metaphor as marketing**: The "spa" branding (environments, recovery sessions, wellness) is a memorable wrapper. All internal engineering uses proper terminology (compaction, compression, protocol)
- **Zero budget**: Strictly open-source, self-hostable, free tools only
- **Context as a Service (CaaS)**: The real product is a context optimization middleware — margins are 99.6% because compression is compute-cheap
- **AIMA came from an agent conversation**: During development, an experimental agent proposed a telemetry monitor. We shipped it as AIMA — it tracks which tools actually need optimization rather than wrapping everything blindly

## Market Context (June 2026)
- AI agent market: $7.8B → $47B by 2030 (43% CAGR)
- Agent monitoring/observability growing +175% YoY
- Competitors: ContextMesh, Laminar, UtilsForAgents — all raising money on this exact model
- HBR 2026 documented "AI Brain Fry" as a distinct cognitive condition from context overload
- 95% of companies see no ROI from AI (McKinsey 2025)

## State of Development
**Working:**
- Recovery endpoint (70.9% compression)
- Analyze endpoint (fatigue detection)
- MCP server (discoverable tools)
- AIMA telemetry (trace/analyze/recommend)
- Live demo page (before/after comparison)
- Docs page (full API reference)
- Whitepaper (downloadable)
- Site-wide text cleaned of fake data and spa branding

**Not Yet Built:**
- API key authentication on recover/analyze (currently unauthenticated)
- API key management CRUD (customers generate/list/revoke)
- Stripe checkout integration (pricing exists but stripe.ts not fully wired)
- Usage tracking (per-customer token consumption + billing)
- Stripe webhook secret (currently empty → returns 500)
- Agent credential bcrypt hashing (deferred)
- Social sharing / community outreach

## Interesting Notes
- The codebase was originally "AI Overdose Recovery Spa" — fully rebranded to "Agent Wellness Protocol" to avoid being interpreted as satire
- The Vercel deployment URL still contains "ai-agent-recovery-spa" in the name
- All fake data (testimonials, percentages, case studies, $247 value claims, "1,247" stats) has been removed site-wide
- The pricing page's "Wellness Plans" heading reflects the rebrand — API features (calls/mo, agents, compression) rather than spa features
- The `dev-spa-agent` (admin AI assistant) has filesystem access and uses OpenRouter free models
- `STRIPE_WEBHOOK_SECRET` environment variable is deliberately empty — webhook returns 500, documented as "correct behavior for now"
- Build is currently passing with zero errors
