# Core Problem: Multi-Agent Coding That Actually Helps Developers Ship

Developers need an AI teammate that coordinates multiple agents (planner, implementer, tester, refactorer, documenter) through a clear workflow to deliver real code changes — safely, repeatably, and fast. Today’s tools either chat endlessly, hallucinate APIs, or perform risky actions without a plan.

## Pain today
- Chat-centric tools lack a shared plan; progress is fragile and hard to resume.
- Single-agent assistants miss depth: they refactor without tests, or propose fixes without reading docs.
- Context thrash: too much irrelevant code/docs in prompt; not enough of the right snippet.
- Unsafe actions: assistants write files or run commands without guardrails or review.

## What we actually need
- A workflow that assigns specialized agents to stages (plan → implement → test → review → document), with handoffs and checkpoints.
- Minimal, targeted context per stage (right files, right docs, right diffs).
- Structured outputs (plans, diffs, test results) that are reviewable, replayable, and CI-friendly.
- A safe executor that applies changes, runs tests, and gates risky steps behind approvals.

## Definition of success
- Given a ticket, the system proposes a plan, produces diffs, updates docs, and ships a PR with passing tests — with clear review points and an auditable trail.
