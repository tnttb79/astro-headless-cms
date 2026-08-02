# Repository Agent Rules

These instructions apply to every coding agent working in this repository, regardless of model, provider, IDE, or automation platform.

## Required isolated WIP records

Every agent must claim its own incrementally numbered directory under `agent-context/WIP/` before changing project files. Directory names use the exact form `agent_N`, where `N` is a positive integer.

### Claim an agent directory

1. List the immediate subdirectories of `agent-context/WIP/` matching `agent_[0-9]+`.
2. Find the largest existing numeric suffix. If none exist, use `1`; otherwise use the largest suffix plus `1`.
3. Atomically create that directory. If creation fails because another agent claimed the same number, rescan and retry with the new largest suffix plus `1`.
4. Once claimed, retain that path for the entire iteration. Never switch directories or reuse an existing directory.

The atomic directory-creation step is mandatory because multiple agents may scan the same latest number concurrently.

### Files inside the claimed directory

Each `agent_N/` directory must contain exactly two Markdown files:

- `PLAN.md`
- `RESULT.md`

Do not add any other files to the assigned directory.

Before implementation, create `PLAN.md`:

- The first section must be `# Goal` and state the requested outcome clearly.
- Follow it with `# Plan` containing the intended steps, scope, assumptions, and validation approach.
- Keep the plan specific to the current iteration.

After implementation, create `RESULT.md` with exactly these sections:

- `# What Was Done`
- `# Result`
- `# Items Left to Take Care Of`

Record actual work and validation results, not intended work. If nothing remains, write `None.` under the final section. Clearly identify client decisions, manual checks, blockers, or deferred work when applicable.

### Isolation and lifecycle

- Within `agent-context/WIP/`, an agent may create and edit files only inside its own claimed `agent_N/` directory.
- Never edit, rename, move, or delete another agent's directory or files.
- Normal task-scoped edits outside `agent-context/WIP/` are still allowed.
- Do not place shared `PLAN.md` or `RESULT.md` files directly in `agent-context/WIP/`.
- Do not create a root-level `WIP/` directory.
- WIP directories are temporary review artifacts owned by the user. Only the user deletes them after review unless the user explicitly directs an agent to do so.
- Never create additional iteration reports, plans, verification logs, or result files elsewhere unless the user explicitly requests them.
