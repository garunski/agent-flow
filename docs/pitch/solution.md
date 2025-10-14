# Solution: Multi-Agent Coding Workflow That Ships PRs Safely

## Overview
Build a developer-assist system that coordinates specialized agents through a deterministic workflow to produce real code changes (diffs, tests, docs) behind guardrails. Models never execute tools; they produce structured outputs that a policy-enforced executor applies. The plan (DAG) is the source of truth and every action is auditable.

## Roles (agents)
- Planner: converts a ticket into a plan (DAG) with nodes, dependencies, and expected outputs.
- Implementer: proposes minimal diffs per node with exact file/line context.
- Tester: generates/updates tests and runs them; summarizes failures.
- Refactorer: improves structure without changing behavior; proposes safe, scoped diffs.
- Documenter: updates README/CHANGELOG/API docs based on changes.

## Core artifacts
- Plan IR (DAG): nodes, edges, input_map, expected_output, review gates.
- Intent objects: structured proposals (e.g., file_change, test_run) with parameters.
- Evidence bundle: retrieved docs/specs/links used by an agent for a step.
- Execution log: applied actions, results, diffs, and test outputs.

## Guardrails and policy
- Intent-only: models output intents; executor applies them.
- Allow-lists: approved operations/tools/paths; OOS detection for the rest.
- Dry-run and approvals: risky changes require preview and human OK.
- Rollback/compensation: backups + revert plan for state-changing steps.

## Context strategy
- Minimal, targeted inputs per node: specific files, hunks, symbols, and the exact docs needed.
- Docs are first-class: structure-aware parsing (OpenAPI/TypeDoc/DocFX) with links embedded in plans/steps.
- No chat sprawl: each agent gets only the evidence relevant to its node.

## Workflow (happy path)
1) Intake: ticket/issue → Planner outputs DAG (plan of record) with review gates.
2) For each ready node:
   - Retrieve evidence (code slices, symbols, docs)
   - Implementer proposes diffs → Validator checks structure/safety → Executor applies in a branch
   - Tester adds/updates tests and runs suite → results recorded; failures loop back to fix
   - Refactorer (optional) suggests scoped improvements behind gate
   - Documenter updates docs based on final diffs
3) Aggregation: open a PR with plan, diffs, tests, docs, and audit trail.

## Integrations
- VCS: branches, commits, PRs, status checks, required reviews.
- CI: test runs (unit/integration), coverage, static analysis.
- Issue tracker: status updates and links to artifacts.

## Metrics (definition of done)
- Plan fidelity vs reviewer baseline
- Test pass rate, coverage delta, and flake rate
- Review time to merge; revision count
- Token and latency per merged PR
- Safety incidents prevented (blocked intents/dry-runs)

## Initial scope (MVP)
- Languages: TypeScript + Python
- Targets: bug-fix and refactor tickets on medium repos
- Agents: Planner, Implementer, Tester; Documenter optional
- Apply path: Git branch + PR only (no direct writes to default branch)

## Rollout plan
- Phase 1: Internal repos, low-risk tickets, gated by human review
- Phase 2: Broader repo set, add Documenter and selective Refactorer
- Phase 3: Confidence-weighted gates; expand language coverage

## Risks and mitigations
- Incorrect diffs → enforce minimal diffs with context; require dry-run + tests
- Doc drift → auto-link doc refs and require doc update nodes for API changes
- Long tail failures → checkpoint, re-plan subgraphs, compensate, and surface actionable summaries

## Why this works
It gives developers a predictable pipeline: a clear plan, small vetted steps, measurable quality gates, and traceable outcomes. The result is fewer surprises, faster PRs, and safer automation.
