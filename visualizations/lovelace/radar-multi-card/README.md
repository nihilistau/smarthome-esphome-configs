# Radar Multi Card

A zero-dependency Lovelace custom card that renders neon radar maps for multiple LD2450 snapshot sensors. It pairs with the `ld2450_multizone.yaml` package, parsing the JSON published by the `target_snapshot` text sensor for each ESPHome node.

## Installation
1. Copy `radar-multi-card.js` into your Home Assistant `www` directory (typically `/config/www/radar-multi-card.js`).
2. In *Settings → Dashboards → Resources*, add:
   ```yaml
   url: /local/radar-multi-card.js
   type: module
   ```
3. Reload the dashboard or restart Home Assistant if prompted.

## Usage
The card reads the raw JSON string exposed by each ESPHome text sensor, so you do **not** need extra template sensors. Provide a list of sensors plus any overrides for room geometry.

```yaml
type: custom:radar-multi-card
title: Home Radar Grid
sensors:
  - name: Bedroom
    entity: sensor.mmwave_zone_1_target_snapshot
    room_width_mm: 4200
    room_depth_mm: 3600
    sensor_origin_x_mm: 2100
    sensor_origin_y_mm: 150
    image: /local/floorplans/bedroom.png
  - name: Office
    entity: sensor.mmwave_zone_2_target_snapshot
    room_width_mm: 4500
    room_depth_mm: 4200
    sensor_origin_x_mm: 2250
    sensor_origin_y_mm: 200
    accent: "#ff6df5"
    history_points: 80          # optional per-node override
    history_window_ms: 60000    # keep 60 s of trail data
    history_show_details: true  # show the collapsible history table
```

### Sensor Hints
- `entity` should point at the ESPHome text sensor created by `ld2450_multizone.yaml`.
- Geometry values fall back to whatever the device reported in JSON, but specifying them here guarantees consistent scaling if you tweak firmware later.
- Add an `image` (served from `/local/`) for a lightly blended floor plan background.
- Toggle target speed labels with `show_velocity: false` per sensor if you only care about positions.
  - Trail controls:
    - `history_points` (default 60) limits how many samples to keep per target.
    - `history_window_ms` (default 45 000) drops stale samples so the SVG polylines fade naturally.
    - Set `history_show_details` to `false` globally or per sensor to hide the collapsible table of recent distances.

## Styling Notes
The card shares the same color palette as the standalone `visualizations/radar-pro` web app. It automatically highlights active targets, shows distance + velocity badges, and degrades gracefully when a node is offline (badge switches from **LIVE** to a muted state and the map freezes on the last snapshot).
