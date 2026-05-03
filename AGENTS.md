# Agent Instructions

## HARD GATE — Read this before anything else
You are running on PowerShell 7.
**Do NOT write, edit, or search any code until you have read `graphify-out/GRAPH_REPORT.md` in full.**

Reading the graph first is mandatory because:
- It reveals god nodes (high-blast-radius abstractions) you must handle carefully
- It maps cross-community connections you won't find by reading files individually
- It prevents redundant grep/file reads by giving you the architecture upfront

After reading it, briefly summarize: god nodes, relevant communities, and any surprising connections that relate to the current task.

---

## Session start — read in this order

1. `graphify-out/GRAPH_REPORT.md` — **architecture map (MANDATORY FIRST)**
2. `.agents/rules/stack.md` - Tech stack overview (~250 lines)
3. `.agents/rules/schema.md` - Database schema (~270 lines)
4. `.agents/rules/api_endpoints.md` - API endpoints (~365 lines)
5. `.agents/rules/graphify.md` - Graphify usage (~10 lines)
6. `.agents/workflows/workflow.md` - System workflows (~200 lines)
7. `.agents/workflows/graphify.md` - Graphify command (~10 lines)

For detailed skills/patterns, reference:
- `.agents/skills/scholar-ms-skill/SKILL.md` - On-demand reference (~680 lines)
