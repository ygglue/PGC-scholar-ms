# Scholar Management System — Project Instructions

## Session Initialization (Mandatory)
Every new session must begin by reading the following in order:
1. `graphify-out/GRAPH_REPORT.md` — Mandatory architecture map.
2. `.agents/rules/stack.md` — Tech stack overview.
3. `.agents/rules/schema.md` — Database schema.
4. `.agents/rules/api_endpoints.md` — API endpoints.
5. `.agents/workflows/workflow.md` — System workflows.

## Graphify Rules
This project has a Graphify knowledge graph at `graphify-out/`.
- Before answering architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md` for god nodes and community structure.
- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files.
- If the Graphify MCP server is active, utilize tools like `query_graph`, `get_node`, and `shortest_path` for precise architecture navigation instead of falling back to `grep`.
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Architecture & Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend (Scholar):** React PWA
- **Frontend (Evaluator):** React + Tauri (`evaluator-tauri`)
- **Database:** PostgreSQL (Supabase)
- **File Storage:** Supabase Storage

## Directory Status
- `evaluator-tauri/`: **Active** development for the Evaluator desktop app.
- `evaluator-app/`: **Legacy/Experimental** iteration (PySide6). Do not use for new features unless specifically requested.

## Development Conventions
- **API Calls:** Always use the centralized `apiService.ts` in `evaluator-tauri/src/services/` for all backend communication. This service handles JWT injection and global error handling.
- **CORS:** Ensure `backend/app/main.py` includes Tauri origins (`http://localhost:1420`, `tauri://localhost`, `http://tauri.localhost`) in the `CORSMiddleware` configuration.
- **Offline Support:** UI components should utilize `NetworkStatus` and `CacheService` to handle offline/cached states where appropriate.
- **Command Execution (Windows):** Avoid using `&&` as a command separator in PowerShell/Windows terminals, as it is not supported. Use `;` or execute commands sequentially (e.g., `cd backend; python ...`).

## Evaluator App (Tauri)
- **Styles:** Use Tailwind CSS for all new components.
- **Components:** Prefer functional components with TypeScript.
- **Offline Behavior:** The application is strictly **view-only** when offline. No write operations (submissions, reviews, creations) are permitted.
