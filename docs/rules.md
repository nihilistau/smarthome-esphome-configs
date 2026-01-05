# Repository Rules & Standards

## Coding & configuration

- **YAML structure** – group related keys with section header comments (e.g., `# --- Substitutions ---`).
- **Custom components** – follow ESPHome C++ style (2 spaces, snake_case identifiers for members).
- **Scripts** – new automation scripts belong under `scripts/` and must include inline help or a README entry.
- **Secrets** – never commit `secrets.yaml`. Use `scripts/ci-secrets.yaml` (or add new placeholder files) for CI and examples.

## Documentation

- Every new feature/config gets at least one paragraph in `README.md` or a linked doc.
- Long-form guidance for contributors belongs under `docs/`.
- Include change logs or rationale within PR descriptions or commit messages.

## Git hygiene

- Keep commits scoped and descriptive (e.g., `feat: add LD2450 UART helper script`).
- Run CI locally (when feasible) before pushing.
- Avoid force pushes to shared branches unless coordinated.

## Reviews & testing

- Ensure `.github/workflows/esphome-validation.yaml` passes before merging.
- For hardware-facing changes, attach OTA log snippets or photos when relevant.
- If a change cannot be tested locally, explain why and what would be required.

## Automation ownership

- CI pipelines live under `.github/workflows/` and must be idempotent.
- Keep reusable helpers in `scripts/` and mention them in `README.md` and `docs/agents.md`.

Adhering to these rules keeps the codebase approachable, auditable, and safe for continuous deployment.
