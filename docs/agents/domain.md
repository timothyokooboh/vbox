# Domain Docs

## Layout

Use a single-context layout across all packages and applications:

- `GLOSSARY.md`: shared domain terminology at the repository root.
- `docs/adr/`: shared architecture decision records at the repository root.

## Before Exploring

Read the root glossary and any ADRs relevant to the work.

If these documents do not exist, proceed silently. Do not flag their
absence or create placeholders. The domain-modeling skill creates them
when terminology or decisions are resolved.

## Terminology

Use the glossary's terms consistently in specifications, issues, code,
tests, and design discussions.

If a needed concept is missing, reconsider whether it belongs to the
domain. Record genuine terminology gaps for domain-modeling.

## Architecture Decisions

Surface conflicts with existing ADRs explicitly. Identify the decision
and explain why it may need to be revisited rather than silently
overriding it.
