# Radar Pro Viewer

Multi-node LD2450 visualizer built with vanilla JS + Three.js. It now understands multiple ESPHome endpoints and can live inside Home Assistant as a panel.

## File Layout
```
visualizations/radar-pro/
├── index.html
├── styles.css
├── app.js
└── floorplan-*.png   # optional, drop your own images next to these files
```

## Copying into Home Assistant (`/local`)
1. Copy the entire `radar-pro` folder into your Home Assistant `www/` directory (for example `/config/www/radar-pro`).
2. Adjust the `CONFIG.nodes` array inside `app.js` so that each object points to your ESPHome snapshot endpoint, preferred label, and optional floorplan PNG housed in the same folder.
3. (Optional) Compress the folder into a ZIP and use the HA file editor / Samba share to upload it; then extract so HA serves it under `/local/radar-pro`.

## Adding a Panel iframe
Append the following to `configuration.yaml` (or merge into an existing `panel_iframe:` block):

```yaml
panel_iframe:
  radar_pro:
    title: Radar Pro
    icon: mdi:radar
    url: /local/radar-pro/index.html
```

Reload YAML configuration (or restart Home Assistant) and you will see a "Radar Pro" item pinned to the sidebar that opens the multi-node console directly.

> **Tip:** If you prefer HTTPS absolute URLs, replace `url: /local/...` with `https://homeassistant.local:8123/local/radar-pro/index.html`.

## Bundling like an Add-on (optional)
While this isn’t a full Supervisor add-on, you can mimic the experience:
1. Create `/config/www/radar-pro/version.json` with `{ "version": "1.0.0" }` so you can bump versions and let HA cache-bust.
2. Drop the folder into Git or Apps like the HA VS Code add-on so you can pull updates alongside your configuration.
3. Combine the panel iframe snippet above with a Lovelace dashboard button that opens `/local/radar-pro/index.html` in a dialog for tablet-friendly access.

## Troubleshooting
- If the iframe is blank, open the browser console: CORS errors usually mean the files weren’t copied under `/local`.
- Confirm each ESPHome node exposes `http://<device>.local/text_sensor/target_snapshot` and that the host running the panel can resolve the `.local` mDNS names. Otherwise point the `endpoint` fields to IPs (e.g., `http://192.168.1.87/text_sensor/target_snapshot`).
- Floorplan PNGs are optional; when missing, the viewer will fall back to `floorplan.png` (defined via `fallbackFloorplan`).
