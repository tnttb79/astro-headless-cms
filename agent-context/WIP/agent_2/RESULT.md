# What Was Done

- Preserved the previous shared WIP record in `agent-context/WIP/agent_1/`.
- Created `agent-context/WIP/agent_2/` for this rule-update iteration.
- Updated `AGENTS.md` to require incrementally numbered `agent_N` directories.
- Added an atomic claim-and-retry procedure for concurrent agents.
- Required each agent directory to contain exactly `PLAN.md` and `RESULT.md`.
- Prohibited agents from editing, renaming, moving, or deleting other agents’ WIP directories.
- Removed the obsolete shared `agent-context/WIP/PLAN.md` and `agent-context/WIP/RESULT.md` files.

# Result

Each future agent now receives an isolated WIP space selected as the current highest agent number plus one. Concurrent claims must retry atomically on collision, preventing agents from overwriting one another’s plans or results.

# Items Left to Take Care Of

None.

