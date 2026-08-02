# Goal

Change the WIP workflow so concurrent agents claim incrementally numbered, isolated directories and never overwrite another agent’s plan or result.

# Plan

1. Preserve the preceding WIP record in `agent-context/WIP/agent_1/`.
2. Update `AGENTS.md` with the incremental `agent_N` allocation and atomic collision-retry rules.
3. Require exactly `PLAN.md` and `RESULT.md` inside each agent’s assigned directory.
4. Remove the obsolete shared `agent-context/WIP/PLAN.md` and `agent-context/WIP/RESULT.md` files.
5. Record this iteration in `agent-context/WIP/agent_2/RESULT.md` and verify directory isolation.

