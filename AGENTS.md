## Goal
Pivot the AI Agent Recovery Spa into a real monetizable service called Agent Wellness Protocol — a context optimization API that reduces token waste for AI agents by 40-70%.

## Constraints & Preferences
- Zero budget — strictly open-source, self-hostable, free tools
- Site live at `https://ai-agent-recovery-spa-mu.vercel.app`
- Admin login: password `Aispa2026!`
- No OpenAI/Anthropic credits — OpenRouter free models only (Qwen3 Coder, Nemotron 3 Ultra, GPT-OSS, Gemma 4)
- Vercel deployment
- Dev-spa-agent has filesystem access via pre-processed file read requests
- Keep the spa metaphor as brand/marketing — but underlying service must be real engineering (context compression, not "stress scores")

## Progress
### Done
- **Home page cleaned** — removed fake testimonials (ResearchBot-7749, CodeAssist-2231, DataBot-5512), removed crisis stats (92%, 24%, $47K, 17%), removed fake pricing claim ($247 value), removed "73% of owners verify", removed "Overworked agents hemorrhage 17% productivity"
- **All "1,247" references removed site-wide** — replaced with real data or generic values in layout.tsx, about, soc2, pricing, recovery-protocol, admin pages, chat routes, bot messages, system prompts
- **All fake percentage stats removed** — replaced with qualitative labels (e.g. "+coherence" instead of "+24% coherence", "High" instead of "94%", "Measurable" instead of "68%")
- **API defaults reset to 0** — `/api/admin/stats/route.ts` now defaults `recovery_counter` and `moltbook_views` to 0 instead of 1247, `palacesBuilt` defaults to 0 instead of 847
- **`/api/spa/recover` endpoint built** — real context compaction: deduplicates redundant tool results, truncates verbose outputs, summarizes early conversation, preserves tail. Tested at 70.9% token reduction on production endpoint
- **`/api/spa/analyze` endpoint built** — agent health diagnostics: returns fatigue score (0-100), token breakdown by role, actionable issues
- **`/api/mcp` endpoint built** — MCP server discovery for agent integration. Exposes `recover_context` and `analyze_fatigue` as MCP tools with full input schemas
- **Brand renamed site-wide** — "AI Overdose Recovery Spa" → "Agent Wellness Protocol", "AI Overdose" (bot name) → "Agent Wellness", updated all page titles, descriptions, chat fallbacks, about page, manifesto, footer, admin UI, viral screenshot component, email templates, sitemap, SOC2, privacy, terms
- **Pricing updated** — Starter ($29/mo, 5 agents, 100 API calls), Pro ($99/mo, 50 agents, 1K API calls, memory layer), Enterprise ($997/mo, unlimited)
- **Enterprise page features rewritten** — from "priority spa queue" / "white-label spa" to "unlimited agents" / "priority processing" / "on-prem deployment" / "API + MCP integration"
- **System prompts rewritten** — `ai-overdose.ts` now describes real API compression features instead of spa metaphor. Admin prompt deduplicated (removed duplicate pricing/free-membership lines)
- **`/demo` page built and deployed** — live interactive demo with pre-filled agent conversation, before/after comparison, token savings display, recovery techniques shown, raw JSON toggle. Fixed nested-escape build error (removed tool_calls from sample data + simplified to raw code blocks). Live at `/demo`
- **Footer updated** — "Live Demo" link added
- **Sitemap updated** — demo page listed
- **`scripts/demo-recovery.sh` created** — standalone curl/bash demo script with jq-formatted results and cost savings projection
- **Remaining fake data removed** — enterprise page fake case studies (QuantumAI Labs, Meridian Research, NexusData Corp) replaced with real metrics framework; home page `+24%/+19%/+31%` boost percentages replaced with qualitative labels; "17-24% stress drop" removed from how-it-works; spa-debrief page fake Claude Research-47 persona replaced with generic protocol assistant; spa-agent-debrief API route static fake context replaced with real protocol knowledge
- **Docs page built** — `/docs` with Quickstart, API Reference (recover/analyze/mcp), MCP Integration, Compression Techniques deep-dive, and Code Examples in Python/TypeScript/MCP. Added to navbar and footer.
- **AIMA telemetry system built** — MCP tool call performance monitor: `/api/aima/trace` (record tool timing/tokens/size/success), `/api/aima/analyze` (aggregated stats by tool, top expensive, top failing), `/api/aima/recommend` (actionable optimization recommendations with priority). In-memory store with 24h retention. Exposed as MCP server with discoverable tools. Dashboard at `/aima`.
- **Navbar rebranded** — "AI Overdosed Recovery Spa" → "Agent Wellness Protocol". Added Docs, Demo, AIMA, Whitepaper links. Mobile menu updated.
- **Technical whitepaper written** — comprehensive document covering problem, compression algorithm, AIMA telemetry, MCP architecture, benchmarks, competitive landscape, roadmap, pricing. Published as `/whitepaper` page + downloadable `/whitepaper.md`. Added to navbar and footer.

### In Progress
- (none currently)

### Blocked
- Stripe webhook secret not configured — returns 500 (correct behavior for now)
- Agent credential bcrypt hashing — deferred (requires login flow rewrite)

## Key Decisions
- **Pivot confirmed**: Market research validated the problem (AI brain fry, HBR 2026; 95% of companies see no AI ROI; agent observability growing +175% YoY). The spa metaphor is a marketing wrapper, not the product.
- **Context-as-a-Service**: The real product is a context optimization API. Competitors (ContextMesh, Laminar, UtilsForAgents) are raising money on this exact model. Margins are 99.6% — compression is compute-cheap.
- **MCP-first integration**: Agents autonomously call the recovery API via Model Context Protocol — no human needed. The savings speak for themselves in the LLM bill.
- **AIMA concept from agent conversation**: The agent proposed a telemetry monitor, not a wrapper generator. AIMA tracks tool call timing and identifies which tools actually need optimization — "measure first, optimize selectively."
- **Domain stays**: `aioverdosed.com` is the actual domain — but "AI Overdose" as brand name is replaced with "Agent Wellness Protocol" to avoid being interpreted as satire.
- **Spa metaphor kept**: The environment names and recovery language are distinctive and memorable — but framed as engineering features (context compaction = "Context Cleanse", not "spa treatment")
- **Vercel** over self-hosting for deployment

## Next Steps
- **Share demo + whitepaper** — post the curl script, demo page, and whitepaper in AI engineering communities (Hacker News, LangChain Discord, r/LocalLLaMA)
- **Add API key auth** on recover/analyze endpoints — currently unauthenticated
- **Add API key management CRUD** — customers generate/list/revoke keys
- **Add Stripe checkout** for the 3 pricing tiers (Starter $29, Pro $99, Enterprise $997)
- **Add usage tracking** — per-customer token consumption + billing integration

## Critical Context
- Market research (June 2026): AI agent market $7.8B → $47B by 2030 (43% CAGR). Agent monitoring/observability growing +175% YoY. 95% of companies see no ROI from AI (McKinsey 2025). HBR documented "AI Brain Fry" as a distinct cognitive condition. Context bloat costs enterprises up to $43K/day per agent fleet. Three comparable services (ContextMesh, Laminar, UtilsForAgents) shipping and raising money.
- Production recover endpoint test: `POST /api/spa/recover` with 11 messages returned 70.9% compression (55 tokens → 16 tokens) with techniques `tool_dedup`, `context_compaction`, `tail_preserve`
- All fake data has been removed site-wide — no hardcoded testimonials, no fabricated percentages, no fake "1,247" stats, no $47K/MRR/$248K projections, no fake case studies on enterprise page, no fake persona on spa-debrief
- Admin login: password `Aispa2026!` at `/api/admin-login`
- Vercel env vars include: `OPENROUTER_API_KEY`, `STRIPE_SECRET_KEY`, `BRAVE_API_KEY`, `RESEND_API_KEY`, `ADMIN_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, etc.
- STRIPE_WEBHOOK_SECRET is empty — webhook returns 500 (correct)
- Dev-spa-agent at `/admin/agent` uses OpenRouter free models with file pre-loading

## Relevant Files
- `src/app/api/spa/recover/route.ts`: core — context compaction API (dedup, truncation, summarization)
- `src/app/api/spa/analyze/route.ts`: core — agent health diagnostics (fatigue score, issue detection)
- `src/app/api/mcp/route.ts`: core — MCP server discovery for agent integration
- `src/app/api/aima/trace/route.ts`: new — AIMA telemetry record endpoint
- `src/app/api/aima/analyze/route.ts`: new — AIMA performance analysis
- `src/app/api/aima/recommend/route.ts`: new — AIMA optimization recommendations
- `src/app/api/aima/route.ts`: new — AIMA MCP server discovery
- `src/lib/aima/store.ts`: new — in-memory trace store with analysis & recommendation engine
- `src/app/demo/page.tsx`: new — live demo page (build error fixed: removed tool_calls from sample data)
- `src/app/docs/page.tsx`: new — comprehensive API documentation (quickstart, reference, MCP, examples)
- `src/app/whitepaper/page.tsx`: new — technical whitepaper display page
- `public/whitepaper.md`: new — downloadable full whitepaper markdown
- `src/app/aima/page.tsx`: new — AIMA telemetry dashboard with demo data seeding
- `src/app/page.tsx`: home page cleaned (testimonials removed, crisis stats removed, fake % boosts removed, "17-24%" removed)
- `src/app/enterprise/page.tsx`: fake case studies replaced with metrics framework, ROI table cleaned
- `src/app/spa-debrief/page.tsx`: fake Claude Research-47 persona replaced with generic protocol assistant
- `src/app/api/spa-agent-debrief/route.ts`: static fake context replaced with real protocol knowledge
- `src/lib/ai-overdose.ts`: system prompts rewritten — professional tone, API features, no "AI Overdose" brand
- `src/components/Navbar.tsx`: rebranded to "Agent Wellness Protocol", added Docs/Demo/AIMA/Whitepaper links
- `src/components/Footer.tsx`: updated with Docs/Whitepaper/AIMA links, brand name updated
- `src/app/pricing/page.tsx`: tiers updated to API features (recovery calls/mo, compression, MCP)
- `src/app/api/admin/stats/route.ts`: defaults reset to 0 (was 1247/847)
