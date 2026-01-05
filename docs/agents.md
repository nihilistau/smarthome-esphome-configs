# Agent Guide

This document captures the expectations for both human and AI agents that interact with this repository.

## Core principles

1. **Plan before you act** – build a TODO list (see `manage_todo_list` instructions) and keep it updated as tasks progress.
2. **Prefer tooling over freehand commands** – the `scripts/run_esphome.ps1` wrapper was built specifically to avoid VS Code's `_vscodecontentref_` links. Use it for all ESPHome builds/logs.
3. **Respect secrets** – never commit real Wi-Fi credentials. If you need a new secret key, add a placeholder to `scripts/ci-secrets.yaml` and reference it with `!secret`.
4. **Log intent in commits** – every commit message should explain *why* the change exists, not just *what* it does.
5. **Surface diagnostics** – when touching firmware, capture OTA logs or CLI output and summarize them in the PR/issue.

## Workflow checklist

- [ ] Read `README.md` to understand current structure.
- [ ] Update/consult this doc whenever automation, scripts, or repo rules change.
- [ ] Use `pwsh scripts/run_esphome.ps1 -Config <node>.yaml [-Device ...]` for every firmware build or log session.
- [ ] Run `esphome config` locally (via the wrapper) before opening a PR.
- [ ] Keep YAML/JSON edits commented with section headers so future agents can find context quickly.

## Writing documentation

- Keep prose concise but actionable.
- Prefer tables or bullet lists for repeated instructions.
- When referencing files, wrap them in backticks (`like_this.yaml`).

## Escalation

If automation, CI, or GitHub access fails:
1. Document the exact command/output in the issue/PR/comment.
2. If the failure is tooling-related, propose a script fix inside `scripts/` with unit instructions in this doc.

Remember: clarity today saves hours tomorrow—for both humans and fellow agents.
