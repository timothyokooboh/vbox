# Issue Tracker: GitHub

Issues and specifications live in GitHub Issues for `timothyokooboh/vbox`.
Use the `gh` CLI. Run commands from this repository or explicitly pass
`--repo timothyokooboh/vbox`.

## Operations

- Create: `gh issue create --title "..." --body-file <file>`.
- Read: `gh issue view <number> --json number,title,body,labels,comments`.
- List: `gh issue list --state open --json number,title,labels`.
- Comment: `gh issue comment <number> --body-file <file>`.
- Apply labels: `gh issue edit <number> --add-label "..."`.
- Remove labels: `gh issue edit <number> --remove-label "..."`.
- Close: `gh issue close <number> --comment "..."`.

Use appropriate filters and pagination when a complete inventory is required.

When a skill says "publish to the issue tracker", create a GitHub issue.
When it says "fetch the relevant ticket", read the issue and its comments.

## Relationships

Use native GitHub sub-issues and issue dependencies when available:

- Create a child: `gh issue create --parent <parent> --title "..." --body-file <file>`.
- Link an existing child: `gh issue edit <parent> --add-sub-issue <child>`.
- Record a blocker: `gh issue edit <child> --add-blocked-by <blocker>`.

Check the installed CLI's help before using relationship commands.

If native relationships are unavailable, put `Part of #<parent>` and
`Blocked by: #<number>` references at the top of the child issue body,
and maintain a child task list in the parent.

## Wayfinding

- A map is one issue labelled `wayfinder:map`.
- Tickets are child issues labelled `wayfinder:research`,
  `wayfinder:prototype`, `wayfinder:grilling`, or `wayfinder:task`.
- The next available ticket is the first open, unassigned child in map
  order whose blockers are all closed.
- Claim a ticket with `gh issue edit <number> --add-assignee @me`.
- Resolve it by commenting with the outcome, closing it, and adding a
  summary and link to the map's Decisions-so-far section.

## Pull Requests

**PRs as a request surface: no.**

GitHub issues and pull requests share a number space. When the type of
a reference is ambiguous, resolve it before acting on it.
