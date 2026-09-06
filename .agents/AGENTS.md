<!-- CODELENS_MANAGED_START -->

## CodeLens Graph — Mandatory Search Protocol

This workspace has a live codebase knowledge graph via **CodeLens Graph** MCP.
The graph contains **19267 symbols** across **286 files**, updated on every save.

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
