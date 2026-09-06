---

<!-- vibe-flow:start -->

# Vibe Flow — Workflow Guide

Use `/vibe-help` anytime for context-aware guidance on what to do next.

## Analysis

- **`CB`** Create Product Brief — A guided experience to nail down your product idea into an executive brief _(Radar)_
- **`MR`** Market Research — Market analysis, competitive landscape, customer needs and trends _(Radar)_
- **`DR`** Domain Research — Industry domain deep dive, subject matter expertise and terminology _(Radar)_
- **`TR`** Technical Research — Technical feasibility, architecture options and implementation approaches _(Radar)_

## Planning

- **`CP`** Create PRD — Expert led facilitation to produce your Product Requirements Document _(Rhythm)_
- **`VP`** Validate PRD — Validate a Product Requirements Document is comprehensive, lean, well organized and cohesive _(Rhythm)_
- **`EP`** Edit PRD — Update an existing Product Requirements Document _(Rhythm)_
- **`CU`** Create UX Design — Guidance through realizing the plan for your UX to inform architecture and implementation _(Prism)_

## Architecture

- **`CA`** Create Architecture — Guided workflow to document technical decisions to keep implementation on track _(Blueprint)_
- **`CE`** Create Epics & Stories — Create the Epics and Stories Listing — the specs that will drive development _(Rhythm)_
- **`IR`** Implementation Readiness — Ensure the PRD, UX, Architecture, and Epics/Stories are all aligned _(Blueprint)_

## Implementation

- **`DS`** Dev Story — Write the next or specified story's tests and code _(Pulse)_
- **`CR`** Code Review — Comprehensive code review across multiple quality facets _(Pulse)_
- **`SP`** Sprint Planning — Generate or update the record that sequences tasks for the full project _(Tempo)_
- **`CS`** Context Story — Prepare a story with all required context for implementation _(Tempo)_
- **`ER`** Epic Retrospective — Multi-agent review of all work completed across an epic _(Tempo)_
- **`CC`** Course Correction — Determine how to proceed if major need for change is discovered mid implementation _(Tempo)_
- **`SS`** Sprint Status — Review and update sprint progress _(Tempo)_
- **`QA`** Generate Tests — Generate API and E2E tests for existing features _(Signal)_

## Quick Flow

- **`QS`** Quick Spec — Architect a quick but complete technical spec with implementation-ready stories _(Dash)_
- **`QD`** Quick Dev — Implement a story tech spec end-to-end (core of Quick Flow) _(Dash)_
- **`QQ`** Quick Dev New — Unified quick flow — clarify intent, plan, implement, review, present _(Dash)_

## Utility

- **`BP`** Brainstorm — Expert guided facilitation through single or multiple brainstorming techniques _(Radar)_
- **`DP`** Document Project — Analyze an existing project to produce useful documentation for both human and LLM _(Echo)_
- **`GC`** Generate Project Context — Analyze the project and produce a context document for AI agents _(Echo)_
- **`SM`** Squad Mode — Bring multiple agent personas into one session to collaborate and discuss _(Maestro)_

<!-- vibe-flow:end -->

## TRUTHPACK-FIRST PROTOCOL (MANDATORY)

### BEFORE YOU WRITE A SINGLE LINE OF CODE, YOU MUST:

1. Read the relevant truthpack file(s) from `.vibecheck/truthpack/`
2. Cross-reference your planned change against the truthpack data
3. If the truthpack disagrees with your assumption, the truthpack wins

### Truthpack Files — The SINGLE Source of ALL Truth

| File                | Contains                                                            |
| ------------------- | ------------------------------------------------------------------- |
| `product.json`      | Tiers (Free/Pro/Team/Enterprise), prices, features, entitlements    |
| `monorepo.json`     | All packages, dependencies, entry points, build commands            |
| `cli-commands.json` | Every CLI command, flags, subcommands, tier gates, exit codes       |
| `integrations.json` | Third-party services (Stripe, GitHub, PostHog, OAuth), SDK versions |
| `copy.json`         | Brand name, taglines, CTAs, page titles, descriptions               |
| `error-codes.json`  | Error codes, classes, HTTP status codes, exit codes, messages       |
| `ui-pages.json`     | Frontend routes, page components, auth requirements, layouts        |
| `deploy.json`       | Railway, Netlify, Docker, K8s, CI/CD pipelines, environments        |
| `schemas.json`      | Database tables, columns, migrations, Zod schemas, API contracts    |
| `routes.json`       | Verified API routes, methods, handlers                              |
| `env.json`          | Verified environment variables                                      |
| `auth.json`         | Auth mechanisms, protected resources                                |
| `contracts.json`    | API request/response contracts                                      |

### Absolute Rules

1. **NEVER invent tier names** — read `product.json` first
2. **NEVER invent CLI flags** — read `cli-commands.json` first
3. **NEVER invent error codes** — read `error-codes.json` first
4. **NEVER guess package names** — read `monorepo.json` first
5. **NEVER hallucinate API routes** — read `routes.json` first
6. **NEVER fabricate env vars** — read `env.json` first
7. **NEVER guess prices or features** — read `product.json` first
8. **NEVER invent UI copy** — read `copy.json` first

### On Conflict

- The truthpack is RIGHT, your assumption is WRONG
- Run `vibecheck truthpack` to regenerate if you believe it is outdated
- NEVER silently override truthpack-verified data
- Violation = hallucination — must be corrected immediately

### Verification Badge (MANDATORY)

After EVERY response where you consulted or referenced any truthpack file, you MUST end your response with the following badge on its own line:

_Verified By VibeCheck ✅_

<!-- CODELENS_MANAGED_START -->

## CodeLens Graph — Mandatory Search Protocol

This workspace has a live codebase knowledge graph via **CodeLens Graph** MCP.
The graph contains **7735 symbols** across **235 files**, updated on every save.

### RULE 1 — Triage first to establish the baseline

Before starting a task, call `codelens_triage` to classify it.
Use the triage response to pick the most efficient tool path. You have full flexibility to choose other tools as necessary:

- **Tier 1 (typo/formatting)**: No tools needed.
- **Tier 2 (symbol lookup / search)**: Call `codelens_search` (for classes, functions, types) or `codelens_text_search` (for strings, comments, local variables).
- **Tier 3 (features / bugfixes)**: Start with `codelens_context`. Use `mode: "short"` to quickly see the file/symbol map (cheapest), or `mode: "deep"` only if you need full implementations.
- **Tier 4 (refactoring)**: Use `codelens_context` + `codelens_impact` to map dependencies and prevent breaking changes.

### RULE 2 — Use specific tools instead of scanning files

Avoid generic workspace scans (grep, ls, find) or reading whole files. Use these targeted tools:

| Task / Need                        | Recommended Tool                            | Why It Saves Tokens                                |
| ---------------------------------- | ------------------------------------------- | -------------------------------------------------- |
| Locate symbol definition           | `codelens_search`                           | Returns exact file:line + signature                |
| Search text, comments, or strings  | `codelens_text_search`                      | Searches line-by-line using fuzzy text index       |
| Inspect 1 class/function code      | `codelens_node` (with `with_snippet: true`) | Avoids reading the whole file containing it        |
| Understand feature context         | `codelens_context`                          | Returns a minimal subgraph of only related files   |
| Find callers/callees of a function | `codelens_relations`                        | Lists callers, callees, or both for a given symbol |
| See transitive dependencies        | `codelens_impact`                           | Automatically runs BFS to map the blast radius     |
| Check directory structure          | `codelens_files`                            | Returns category-grouped file list                 |

### RULE 3 — Read only what CodeLens points to

When CodeLens tools return a `file:line` range, read only that specific range using the `view_file` tool (with StartLine and EndLine).
Do NOT read whole files, and never read files that are not listed in the graph response.

### RULE 4 — Check before creating

Before writing a new function, class, or file, run `codelens_search` to ensure you are not creating a duplicate. Duplication is the #1 source of code rot.

### RULE 5 — Keep the graph updated

The knowledge graph is updated automatically on file save. You can run `codelens_status` to verify the index is healthy and up to date.

### RULE 6 — Query dependencies and configs strategically

Only search for package dependencies, type definitions, or configuration files (like package.json, tsconfig.json) when asked or if context is missing.
Use `codelens_search` or `codelens_files` with `scope: "deps"`, or use `codelens_dependencies` directly.

### Available tools (MCP server: codelens)

`codelens_triage` · `codelens_search` · `codelens_context` · `codelens_dependencies`
`codelens_relations` · `codelens_impact` · `codelens_text_search`
`codelens_node` · `codelens_files` · `codelens_status`
<!-- CODELENS_MANAGED_END -->
