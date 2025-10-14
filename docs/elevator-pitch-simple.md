# Plan, Then Act: Senior Dev Pitch

## Tagline
Think first. Verify. Execute with guardrails.

## Problem
Agent frameworks often let models think and act in the same loop. That leads to:
- Hard-to-audit behavior (chat logs ≠ plans)
- Security risk (models invoking tools directly)
- Cost bloat (huge context, repetitive prompts)
- Brittle debugging (no single source of truth)

## Approach
Split responsibilities:
- Planner (LLM) produces a deterministic plan as a DAG — the plan of record.
- Decomposer (LLM) defines per-node, small, checkable work items and expected outputs.
- Executor (code) runs only validated intents. Models never touch tools.
- Docs Index provides the right snippets/specs to each step, not the whole corpus.

## Architecture (at a glance)
- Plan IR (DAG): nodes, edges, input_map, expected_output
- Validation gates: schema/type checks, goal checks, confidence threshold, dry-run when risky
- Executor: allow-listed adapters (file ops, HTTP, etc.), sandboxed, full logging
- State & recovery: checkpoints, retries/backoff, compensating actions
- Observability: immutable plan, intent ledger, execution log

## Why this is better
- Single source of truth: the DAG, not a conversation
- Safer by design: models propose; code executes under policy
- Lower cost: per-node minimal context and targeted retrieval
- Easier to debug: every decision and action is linked and replayable

## Concrete flow
1) User goal → Planner outputs DAG (plan JSON)
2) For each ready node → Decomposer specifies inputs, outputs, allowed intents
3) Validator checks structure, safety, and confidence
4) Executor performs approved intents, logs results
5) Failures: retry or compensate; optionally re-plan a subgraph

## Risks and open questions
- Goal spec: how expressive should goal checks be without adding heavy formalism?
- Retrieval quality: structure-aware parsing for OpenAPI/TypeDoc/DocFX; fallbacks when docs are thin
- Confidence: calibration method and thresholds that are meaningful per-domain
- Re-planning rules: when is changing the remaining DAG allowed, and how is it audited?

## Metrics we will track
- Plan fidelity vs expert baseline
- Validation pass rate and latency
- Retrieval precision/recall (planner vs executor needs)
- Confidence calibration error (e.g., ECE)
- Compensated failure rate and MTTR
- Cost per successful plan (tokens + compute)

## Near-term deliverables
- Schemas: Plan IR, Intent, Validation Result
- Minimal goal checks and validator contract
- Structure-aware doc ingestion for one target (e.g., OpenAPI)
- Executor with allow-listed adapters and full logs
- Small benchmark suite and KPI dashboards
