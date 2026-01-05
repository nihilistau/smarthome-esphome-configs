# Helper scripts

## `run_esphome.ps1`
A workspace-wide wrapper around the `esphome` CLI that resolves VS Code's `_vscodecontentref_` links into real file paths. It keeps every agent/human on the same page so commands remain copy/paste friendly in terminals and automations.

### Usage
From the repo root (or any shell on this machine):

```powershell
pwsh scripts/run_esphome.ps1 -Config mmwave-zone-2.yaml -Device COM13
```

The script automatically:

1. Resolves the configuration file relative to the workspace root (so no markdown link placeholders leak into the command).
2. Pushes into the repository directory before running `esphome`.
3. Passes through `--device` (optional) and any extra CLI flags supplied via `-ExtraArgs`.

Additional options:

- `-LogsOnly`: runs `esphome logs <config>` instead of `esphome run`.
- `-ExtraArgs`: accepts an array of additional flags, e.g. `-ExtraArgs "--no-logs" "-s" "key=value"`.

### Why this exists
VS Code sometimes rewrites inline commands (e.g., `mmwave-zone-2.yaml](http://_vscodecontentref_/2)`) which breaks copy/paste for agents and humans alike. Using this script guarantees that every invocation uses the canonical file path, avoiding the obfuscated placeholders irrespective of which editor or assistant generated the instruction.

### For automation/agents
- Prefer calling this script instead of inlining `esphome run …` whenever a markdown link might appear.
- Always pass the config path exactly as it appears in the repo (relative paths are fine).
- If a task requires only logs, call with `-LogsOnly` to avoid rebuilding.

Example for agents:
```
pwsh scripts/run_esphome.ps1 -Config mmwave-zone-2.yaml -Device mmwave-zone-2.local
```

This approach should eliminate the `_vscodecontentref_` issue across projects, as the wrapper enforces consistent, literal command strings.
