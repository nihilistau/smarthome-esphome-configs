# SmartHome ESPHome Configurations

A curated collection of ESPHome firmware definitions, custom components, and visualization assets used across the smart-home deployment. This repository also includes helper tooling, documentation for human/AI agents, and CI automation to keep every configuration validated before it ever reaches a device.

## Getting started

1. **Install dependencies**
   - [ESPHome CLI](https://esphome.io/guides/getting_started_command_line.html)
   - Python 3.11+
   - PowerShell 7+ (for the helper scripts)
2. **Clone this repo** and move into the workspace root.
3. **Create `secrets.yaml`** (ignored by git) or copy `scripts/ci-secrets.yaml` and edit it with your Wi-Fi credentials.
4. **Build/flash a node** using the wrapper script so commands stay consistent:
   ```powershell
   pwsh scripts/run_esphome.ps1 -Config mmwave-zone-2.yaml -Device COM13
   ```
5. **Enable UART mode on LD2450 radars** by pressing the "Configure LD2450 UART" button that ESPHome exposes once the firmware is running.

## Repository layout

| Path | Purpose |
| ---- | ------- |
| `custom_components/` | Extended drivers (e.g., the LD2450 multi-target component). |
| `packages/` | Shared ESPHome packages imported by individual node YAMLs. |
| `visualizations/` | Lovelace dashboards and other UI helpers. |
| `scripts/run_esphome.ps1` | Command wrapper that resolves real file paths and devices to avoid VS Code link mangling. |
| `scripts/ci-secrets.yaml` | Safe placeholder secrets used in CI validation. |
| `docs/agents.md` | Playbook for humans/AI agents contributing to this repo. |
| `docs/rules.md` | Lightweight rules of engagement, coding standards, and review expectations. |

## Tooling

- **PowerShell helpers** – all CLI entry points live under `scripts/`. The `run_esphome.ps1` wrapper should be preferred over hand-written commands, especially when instructions originate from VS Code/Copilot chats.
- **CI validation** – `.github/workflows/esphome-validation.yaml` installs ESPHome and runs `esphome config --secrets scripts/ci-secrets.yaml` against key node definitions on every push/PR.
- **Agent documentation** – see `docs/agents.md` for tips on how to structure TODO lists, logging, and tool usage.

## Contributing

1. Ensure any new node references secrets via `!secret` keys present in `scripts/ci-secrets.yaml` (add new placeholders if necessary).
2. Run the wrapper script locally before opening a PR.
3. Keep YAML sections documented with header comments so future contributors can jump directly to the part they need.
4. Follow the guidance in `docs/rules.md` for code style, commit hygiene, and review expectations.

---

Questions? Open an issue or ping the maintainer. If you are an AI agent, double-check `docs/agents.md` before making sweeping changes.
