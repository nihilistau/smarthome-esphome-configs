class RadarMultiCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._uid = Math.floor(Math.random() * 1e6);
    this._config = null;
    this._hass = null;
    this._history = new Map();
  }

  setConfig(config) {
    if (!config || !Array.isArray(config.sensors) || config.sensors.length === 0) {
      throw new Error("radar-multi-card: provide at least one sensor in `sensors`.");
    }
    this._config = {
      title: config.title || "Radar Overview",
      refresh_badge: config.refresh_badge ?? true,
      history_points: config.history_points ?? 60,
      history_window_ms: config.history_window_ms ?? 45000,
      history_show_details: config.history_show_details ?? true,
      sensors: config.sensors.map((sensor, index) => {
        if (!sensor.entity) {
          throw new Error("radar-multi-card: each sensor needs an entity.");
        }
        return {
          entity: sensor.entity,
          name: sensor.name || `Sensor ${index + 1}`,
          room_width_mm: Number(sensor.room_width_mm) || null,
          room_depth_mm: Number(sensor.room_depth_mm) || null,
          sensor_origin_x_mm: Number(sensor.sensor_origin_x_mm) || null,
          sensor_origin_y_mm: Number(sensor.sensor_origin_y_mm) || null,
          image: sensor.image || null,
          accent: sensor.accent || this._accentFor(index),
          show_velocity: sensor.show_velocity ?? true,
          history_points:
            typeof sensor.history_points === "number"
              ? sensor.history_points
              : null,
          history_window_ms:
            typeof sensor.history_window_ms === "number"
              ? sensor.history_window_ms
              : null,
          history_show_details:
            sensor.history_show_details ?? this._config?.history_show_details ?? true,
        };
      }),
    };
    this._renderSkeleton();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config) {
      this._render();
    const historyPointsDefault =
      typeof config.history_points === "number" ? config.history_points : 60;
    const historyWindowDefault =
      typeof config.history_window_ms === "number" ? config.history_window_ms : 45000;
    const historyShowDetailsDefault =
      config.history_show_details ?? true;
    }
  }

      history_points: historyPointsDefault,
      history_window_ms: historyWindowDefault,
      history_show_details: historyShowDetailsDefault,

  _accentFor(index) {
    const palette = ["#7df0ff", "#ff6df5", "#ffd66b", "#5df9c4"];
    return palette[index % palette.length];
  }

  _renderSkeleton() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <ha-card>
        <style>
          :host {
            font-family: "Space Grotesk", var(--paper-font-body1_-_font-family, sans-serif);
          }
          ha-card {
            background: var(--ha-card-background, var(--card-background-color, rgba(6, 8, 16, 0.85)));
            border-radius: 1.25rem;
            padding: 1.25rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
          }
          .card-header {
            display: flex;
            justify-content: space-between;
            sensor.history_show_details ?? historyShowDetailsDefault,
            margin-bottom: 1.25rem;
          }
          .card-header h3 {
            margin: 0;
            font-size: 1.35rem;
            font-weight: 600;
          }
          .eyebrow {
            margin: 0;
            letter-spacing: 0.35em;
            text-transform: uppercase;
            color: var(--secondary-text-color, #8d97b8);
            font-size: 0.65rem;
          }
          .grid {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          }
          .panel {
            background: rgba(10, 14, 29, 0.85);
            border-radius: 1.2rem;
            padding: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
            border: 1px solid rgba(255, 255, 255, 0.05);
          }
          .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 0.75rem;
          }
          .panel-header h4 {
            margin: 0.1rem 0 0;
            font-size: 1.05rem;
          }
          .badge {
            font-size: 0.65rem;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--primary-text-color, #ffffff);
            padding: 0.25rem 0.6rem;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.08);
            white-space: nowrap;
          }
          .badge.live {
            color: #7df0ff;
            background: rgba(125, 240, 255, 0.15);
          }
          .map svg {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 1rem;
            background: rgba(255, 255, 255, 0.02);
          }
          .legend {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
          }
          .legend li {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            color: var(--secondary-text-color, #b4bed6);
          }
          .legend span {
            font-weight: 600;
            color: var(--primary-text-color, #ffffff);
          }
          .empty {
            opacity: 0.7;
            font-size: 0.85rem;
            text-align: center;
            padding: 0.4rem 0.2rem;
          }
          details.history {
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 0.9rem;
            padding: 0.6rem 0.9rem;
            background: rgba(255, 255, 255, 0.02);
          }
          details.history summary {
            cursor: pointer;
            font-size: 0.85rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--secondary-text-color, #9fa9c4);
          }
          .history-grid {
            margin-top: 0.6rem;
            display: grid;
            gap: 0.45rem;
          }
          .history-entry {
            display: flex;
            justify-content: space-between;
            gap: 0.5rem;
            font-size: 0.82rem;
            color: var(--secondary-text-color, #b4bed6);
          }
          .history-entry span {
            font-weight: 600;
            color: var(--primary-text-color, #ffffff);
          }
        </style>
        <div class="card-header">
          <div>
            <p class="eyebrow">LD2450 • Multi-node</p>
            <h3>${this._config.title}</h3>
          </div>
        </div>
        <div class="grid"></div>
      </ha-card>
    `;
  }

  _render() {
    const grid = this.shadowRoot.querySelector(".grid");
    if (!grid) return;
    grid.innerHTML = "";
    this._config.sensors.forEach((sensor, index) => {
      const entity = this._hass?.states?.[sensor.entity];
      const snapshot = this._parseSnapshot(entity) || {};
      const width = Number(snapshot.room_width_mm ?? sensor.room_width_mm ?? 4000);
      const depth = Number(snapshot.room_depth_mm ?? sensor.room_depth_mm ?? 4000);
      const originX = Number(snapshot.sensor_origin_x_mm ?? sensor.sensor_origin_x_mm ?? width / 2);
      const originY = Number(snapshot.sensor_origin_y_mm ?? sensor.sensor_origin_y_mm ?? 0);
      const targets = (snapshot.targets || []).filter((t) => t.valid);
      const accent = sensor.accent;
      const historyStore = this._updateHistory(sensor, snapshot, {
        width,
        depth,
        originX,
        originY,
      });
      const svg = this._buildSvg({
        sensor,
        snapshot,
        width,
        depth,
        originX,
        originY,
        accent,
        index,
        history: historyStore,
      });
      const historyDetails = this._buildHistoryDetails(sensor, targets, historyStore);
      const panel = document.createElement("div");
      panel.className = "panel";
      const lastChanged = entity?.last_changed
        ? (this._hass?.formatDateTime
            ? this._hass.formatDateTime(new Date(entity.last_changed))
            : new Date(entity.last_changed).toLocaleString())
        : "–";
      const badgeClass = targets.length > 0 ? "badge live" : "badge";
      panel.innerHTML = `
        <div class="panel-header">
          <div>
            <p class="eyebrow">${sensor.entity}</p>
            <h4>${sensor.name}</h4>
          </div>
          <div class="${badgeClass}">${targets.length} targets</div>
        </div>
        <div class="map">${svg}</div>
        ${targets.length === 0 ? `<div class="empty">No targets · Last ping ${lastChanged}</div>` : ''}
        ${targets.length > 0 ? `<ul class="legend">
          ${targets
            .map((target, tIndex) => {
              const distance = (target.distance_mm || 0) / 1000;
              const speed = target.speed_mps || 0;
              return `<li>
                <span>T${target.index}</span>
                <span>${distance.toFixed(2)} m${sensor.show_velocity ? ` · ${speed.toFixed(2)} m/s` : ''}</span>
              </li>`;
            })
            .join("")}
        </ul>` : ''}
        ${historyDetails}
      `;
      grid.appendChild(panel);
    });
  }

  _parseSnapshot(entity) {
    if (!entity) return {};
    const state = entity.state;
    if (!state || state === "unknown" || state === "unavailable") {
      return entity.attributes?.snapshot || {};
    }
    try {
      return JSON.parse(state);
    } catch (error) {
      console.warn("radar-multi-card: unable to parse snapshot", error);
      return entity.attributes?.snapshot || {};
    }
  }

  _buildSvg({ sensor, snapshot, width, depth, originX, originY, accent, index, history }) {
    const gradientId = `radar-bg-${this._uid}-${index}`;
    const targets = (snapshot.targets || []).filter((t) => t.valid);
    const gridStep = 500;
    const historyStore = history || this._ensureHistory(sensor.entity);
    let svg = `<svg viewBox="0 0 ${width} ${depth}" preserveAspectRatio="xMidYMid slice" class="radar-svg">
      <defs>
        <radialGradient id="${gradientId}" cx="30%" cy="30%" r="1">
          <stop offset="0%" stop-color="${accent}22" />
          <stop offset="80%" stop-color="rgba(5,10,25,0.95)" />
        </radialGradient>
      </defs>
      <rect width="${width}" height="${depth}" fill="url(#${gradientId})" rx="${Math.min(180, Math.max(width, depth) * 0.05)}" />`;
    if (sensor.image) {
      svg += `<image href="${sensor.image}" width="${width}" height="${depth}" opacity="0.22" preserveAspectRatio="xMidYMid slice" />`;
    }
    svg += `<g stroke="rgba(255,255,255,0.08)" stroke-width="${Math.max(width, depth) / 600}">`;
    for (let x = gridStep; x < width; x += gridStep) {
      svg += `<line x1="${x}" y1="0" x2="${x}" y2="${depth}" />`;
    }
    for (let y = gridStep; y < depth; y += gridStep) {
      svg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" />`;
    }
    svg += `</g>`;
    svg += `<circle cx="${originX}" cy="${depth - originY}" r="${Math.max(width, depth) * 0.015}" fill="${accent}" opacity="0.9" />`;
    svg += `<text x="${originX + 120}" y="${depth - originY - 80}" fill="#ffffff" font-size="${Math.max(width, depth) * 0.04}" opacity="0.8">Sensor</text>`;
    targets.forEach((target, idx) => {
      const absX = originX + (target.x_mm || 0);
      const absY = originY + (target.y_mm || 0);
      const clampedX = Math.min(Math.max(absX, 0), width);
      const clampedY = Math.min(Math.max(absY, 0), depth);
      const color = this._accentFor(idx);
      svg += `<circle cx="${clampedX}" cy="${depth - clampedY}" r="${Math.max(width, depth) * 0.02}" fill="${color}55" stroke="${color}" stroke-width="${Math.max(width, depth) * 0.004}" />`;
      if (target.distance_mm) {
        const ringRadius = Math.min(
          Math.max(width, depth) * 0.35,
          Math.max(150, target.distance_mm)
        );
        svg += `<circle cx="${clampedX}" cy="${depth - clampedY}" r="${ringRadius}" stroke="${color}55" stroke-dasharray="12" fill="none" />`;
      }
      svg += `<text x="${clampedX + 120}" y="${depth - clampedY - 60}" fill="#fff" font-size="${Math.max(width, depth) * 0.035}">T${target.index}</text>`;
      if (sensor.show_velocity && typeof target.speed_mps === "number") {
        svg += `<text x="${clampedX + 120}" y="${depth - clampedY + 40}" fill="rgba(255,255,255,0.75)" font-size="${Math.max(width, depth) * 0.028}">${target.speed_mps.toFixed(2)} m/s</text>`;
      }
    });
    Object.entries(historyStore || {}).forEach(([targetKey, track]) => {
      if (!track || track.length < 2) return;
      const colorIndex = Number(targetKey);
      const color = Number.isFinite(colorIndex)
        ? this._accentFor(Math.max(0, colorIndex - 1))
        : accent;
      const path = track.map((point) => `${point.x},${point.y}`).join(" ");
      svg += `<polyline points="${path}" fill="none" stroke="${color}55" stroke-width="${Math.max(width, depth) * 0.003}" stroke-linecap="round" stroke-linejoin="round" />`;
    });
    svg += `</svg>`;
    return svg;
  }

  _ensureHistory(entity) {
    if (!this._history.has(entity)) {
      this._history.set(entity, {});
    }
    return this._history.get(entity);
  }

  _updateHistory(sensor, snapshot, { width, depth, originX, originY }) {
    const store = this._ensureHistory(sensor.entity);
    const targets = snapshot?.targets;
    const now = Date.now();
    const maxPoints = sensor.history_points ?? this._config.history_points;
    const windowMs = sensor.history_window_ms ?? this._config.history_window_ms;
    if (!Array.isArray(targets) || targets.length === 0) {
      this._pruneHistory(store, windowMs, now, new Set());
      return store;
    }
    const seenThisFrame = new Set();
    targets.forEach((target, idx) => {
      const key = String(target?.index ?? idx);
      seenThisFrame.add(key);
      if (!store[key]) store[key] = [];
      const track = store[key];
      if (target.valid) {
        const absX = Math.min(Math.max(originX + (target.x_mm || 0), 0), width);
        const absY = Math.min(Math.max(originY + (target.y_mm || 0), 0), depth);
        track.push({
          x: absX,
          y: depth - absY,
          distance: target.distance_mm ?? Math.hypot(target.x_mm || 0, target.y_mm || 0),
          speed: target.speed_mps || 0,
          ts: now,
        });
        while (track.length > maxPoints) {
          track.shift();
        }
      } else {
        track.length = 0;
      }
    });
    this._pruneHistory(store, windowMs, now, seenThisFrame);
    return store;
  }

  _pruneHistory(store, windowMs, now, seenSet) {
    Object.keys(store).forEach((key) => {
      store[key] = store[key].filter((point) => now - point.ts <= windowMs);
      if (store[key].length === 0 && !seenSet.has(key)) {
        delete store[key];
      }
    });
  }

  _buildHistoryDetails(sensor, targets, historyStore) {
    const showDetails = sensor.history_show_details ?? this._config.history_show_details;
    if (!showDetails) return "";
    const rows = [];
    const now = Date.now();
    const indices = new Set();
    targets.forEach((target, idx) => indices.add(String(target.index ?? idx)));
    Object.keys(historyStore || {}).forEach((key) => indices.add(key));
    Array.from(indices)
      .sort((a, b) => Number(a) - Number(b))
      .forEach((key) => {
      const track = historyStore?.[key];
      if (!track || track.length === 0) return;
      const latest = track[track.length - 1];
      const agoMs = now - latest.ts;
      const ago = agoMs < 1000 ? `${agoMs.toFixed(0)} ms` : `${(agoMs / 1000).toFixed(1)} s`;
      const distanceTrail = track
        .slice(-4)
        .map((point) => `${(point.distance / 1000).toFixed(2)} m`)
        .reverse()
        .join(" → ");
        rows.push(`
          <div class="history-entry">
            <span>T${key}</span>
            <div>
              ${distanceTrail}
              <br />
              <small>${ago} ago</small>
            </div>
          </div>
        `);
      });
    if (rows.length === 0) return "";
    return `<details class="history" open>
      <summary>History</summary>
      <div class="history-grid">${rows.join("")}</div>
    </details>`;
  }
}

customElements.define("radar-multi-card", RadarMultiCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "radar-multi-card",
  name: "Radar Multi Card",
  description: "Visualize multiple LD2450 snapshots with a shared neon theme.",
});
