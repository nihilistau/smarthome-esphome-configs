// Each endpoint should point at the ESPHome text sensor REST endpoint in the form:
// http://<device-id>.local/text_sensor/<sensor_id>
// The sensor_id defaults to the `id` you set on the text_sensor ("target_snapshot" in ld2450_multizone.yaml)
const CONFIG = {
  refreshMs: 300,
  maxTrail: 40,
  fallbackFloorplan: "floorplan.png",
  nodes: [
    {
      id: "mmwave-zone-1",
      label: "Zone 1 • Bedroom",
      endpoint: "http://mmwave-zone-1.local/text_sensor/target_snapshot",
      floorplanImage: "floorplan-bedroom.png",
      accent: "#7df0ff",
    },
    {
      id: "mmwave-zone-2",
      label: "Zone 2 • Office",
      endpoint: "http://mmwave-zone-2.local/text_sensor/target_snapshot",
      floorplanImage: "floorplan-office.png",
      accent: "#ff6df5",
    },
  ],
};

const TRAIL_COLORS = ["#7df0ff", "#ff6df5", "#ffd66b"];
const FALLBACK_FLOORPLAN =
  CONFIG.fallbackFloorplan || CONFIG.floorplanImage || "floorplan.png";

const state = {
  mode: "plan",
  activeNodeIndex: 0,
  nodes: (CONFIG.nodes || []).map(() => ({
    latest: null,
    trails: [[], [], []],
    connected: false,
    lastUpdate: null,
    latency: null,
    error: null,
  })),
};

const planCanvas = document.getElementById("plan-canvas");
const planCtx = planCanvas.getContext("2d");
const connectionDot = document.getElementById("connection-dot");
const connectionLabel = document.getElementById("connection-label");
const targetCountEl = document.getElementById("target-count");
const lastUpdateEl = document.getElementById("last-update");
const latencyEl = document.getElementById("latency");
const endpointDisplay = document.getElementById("endpoint-display");
const floorplan = document.getElementById("floorplan");
const nodeSelect = document.getElementById("node-select");
const activeNodeLabel = document.getElementById("active-node-label");
const nodeList = document.getElementById("node-list");

if (!CONFIG.nodes || CONFIG.nodes.length === 0) {
  connectionLabel.textContent = "Add nodes in app.js";
  throw new Error("CONFIG.nodes must contain at least one node.");
}

floorplan.src = FALLBACK_FLOORPLAN;

function initNodePicker() {
  nodeSelect.innerHTML = "";
  CONFIG.nodes.forEach((node, idx) => {
    const option = document.createElement("option");
    option.value = String(idx);
    option.textContent = node.label || node.id;
    nodeSelect.appendChild(option);
  });
  nodeSelect.disabled = CONFIG.nodes.length === 1;
  nodeSelect.addEventListener("change", (event) => {
    setActiveNode(Number(event.target.value));
  });
  setActiveNode(0);
}

function setActiveNode(index) {
  if (Number.isNaN(index) || !CONFIG.nodes[index]) return;
  state.activeNodeIndex = index;
  nodeSelect.value = String(index);
  document.title = `${CONFIG.nodes[index].label || CONFIG.nodes[index].id} • Radar Pro`;
  activeNodeLabel.textContent = CONFIG.nodes[index].label || CONFIG.nodes[index].id;
  const nextFloor = CONFIG.nodes[index].floorplanImage || FALLBACK_FLOORPLAN;
  if (floorplan.dataset.src !== nextFloor) {
    floorplan.src = nextFloor;
    floorplan.dataset.src = nextFloor;
  }
  updateMeta();
  updateStatus();
  drawPlan();
  update3d();
}

function getActiveNodeState() {
  return state.nodes[state.activeNodeIndex];
}

function getActiveNodeConfig() {
  return CONFIG.nodes[state.activeNodeIndex];
}

function updateMeta() {
  const nodeState = getActiveNodeState();
  const snapshot = nodeState?.latest;
  targetCountEl.textContent = snapshot
    ? (snapshot.targets || []).filter((t) => t.valid).length
    : "0";
  lastUpdateEl.textContent = nodeState?.lastUpdate
    ? nodeState.lastUpdate.toLocaleTimeString()
    : "–";
  latencyEl.textContent = nodeState?.latency
    ? `${nodeState.latency.toFixed(0)} ms`
    : "–";
  const config = getActiveNodeConfig();
  endpointDisplay.textContent = config.endpoint;
  renderNodeList();
}

// --- Three.js scene setup ---
const sceneEl = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas: sceneEl, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
const scene3d = new THREE.Scene();
scene3d.background = new THREE.Color(0x030407);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
camera.position.set(0, 160, 260);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.maxPolarAngle = Math.PI / 2.1;
controls.enableDamping = true;
controls.autoRotate = false;

// Toggle handling (after controls exist)
[...document.querySelectorAll(".toggle")].forEach((btn) => {
  btn.addEventListener("click", () => {
    state.mode = btn.dataset.mode;
    document
      .querySelectorAll(".toggle")
      .forEach((el) => el.classList.toggle("active", el === btn));
    controls.autoRotate = state.mode === "isometric";
    drawPlan();
  });
});
const ambient = new THREE.AmbientLight(0xaad0ff, 0.6);
scene3d.add(ambient);
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(120, 200, 60);
scene3d.add(dir);

const roomGroup = new THREE.Group();
scene3d.add(roomGroup);
const sensorMarker = new THREE.Mesh(
  new THREE.SphereGeometry(4, 24, 24),
  new THREE.MeshStandardMaterial({ color: 0x7df0ff })
);
roomGroup.add(sensorMarker);

const targetMeshes = [0, 1, 2].map(() => {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(6, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xff6df5, emissive: 0x331133 })
  );
  mesh.visible = false;
  roomGroup.add(mesh);
  return mesh;
});

const trailLines = [0, 1, 2].map(() => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(3 * CONFIG.maxTrail), 3)
  );
  const material = new THREE.LineBasicMaterial({
    color: 0xff6df5,
    transparent: true,
    opacity: 0.4,
  });
  const line = new THREE.Line(geometry, material);
  line.visible = false;
  roomGroup.add(line);
  return line;
});

function resize() {
  const rect = sceneEl.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene3d, camera);
}
animate();

function pollNode(index) {
  const nodeConfig = CONFIG.nodes[index];
  const nodeState = state.nodes[index];
  const start = performance.now();
  fetch(nodeConfig.endpoint, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      nodeState.latency = performance.now() - start;
      return response.json();
    })
    .then((json) => {
      nodeState.latest = json;
      nodeState.connected = true;
      nodeState.error = null;
      nodeState.lastUpdate = new Date();
      updateTrails(nodeState, json);
      if (index === state.activeNodeIndex) {
        updateMeta();
        updateStatus();
        drawPlan();
        update3d();
      }
      renderNodeList();
    })
    .catch((error) => {
      nodeState.connected = false;
      nodeState.error = error.message;
      if (index === state.activeNodeIndex) {
        updateStatus(error.message);
      }
      renderNodeList();
    })
    .finally(() => {
      setTimeout(() => pollNode(index), CONFIG.refreshMs);
    });
}

function updateStatus(message = null) {
  const nodeState = getActiveNodeState();
  const config = getActiveNodeConfig();
  if (nodeState?.connected) {
    connectionDot.style.background = config.accent || "#7df0ff";
    connectionDot.style.boxShadow = `0 0 12px ${config.accent || "#7df0ff"}`;
    connectionLabel.textContent = `${config.label || config.id} · Live`;
  } else {
    connectionDot.style.background = "#ff5f8f";
    connectionDot.style.boxShadow = "0 0 12px #ff5f8f";
    const reason = message || nodeState?.error;
    connectionLabel.textContent = reason
      ? `${config.label || config.id} · Offline (${reason})`
      : `${config.label || config.id} · Offline`;
  }
}

function drawPlan() {
  planCtx.clearRect(0, 0, planCanvas.width, planCanvas.height);
  const nodeState = getActiveNodeState();
  const snapshot = nodeState?.latest;
  if (!snapshot) return;
  const {
    room_width_mm: width,
    room_depth_mm: depth,
    sensor_origin_x_mm: originX,
    sensor_origin_y_mm: originY,
    targets = [],
  } = snapshot;
  if (!width || !depth) return;
  const scaleX = planCanvas.width / width;
  const scaleY = planCanvas.height / depth;
  const gridSize = 500;
  const config = getActiveNodeConfig();

  // background grid
  planCtx.strokeStyle = "rgba(255,255,255,0.08)";
  planCtx.lineWidth = 1;
  for (let x = 0; x <= width; x += gridSize) {
    const px = x * scaleX;
    planCtx.beginPath();
    planCtx.moveTo(px, 0);
    planCtx.lineTo(px, planCanvas.height);
    planCtx.stroke();
  }
  for (let y = 0; y <= depth; y += gridSize) {
    const py = planCanvas.height - y * scaleY;
    planCtx.beginPath();
    planCtx.moveTo(0, py);
    planCtx.lineTo(planCanvas.width, py);
    planCtx.stroke();
  }

  // sensor
  const sensorPx = originX * scaleX;
  const sensorPy = planCanvas.height - originY * scaleY;
  planCtx.fillStyle = config.accent || "#7df0ff";
  planCtx.beginPath();
  planCtx.arc(sensorPx, sensorPy, 8, 0, Math.PI * 2);
  planCtx.fill();
  planCtx.font = "14px Space Grotesk";
  planCtx.fillText("Sensor", sensorPx + 10, sensorPy - 10);

  const validTargets = targets.filter((t) => t.valid);
  validTargets.forEach((target, idx) => {
    const absX = originX + target.x_mm;
    const absY = originY + target.y_mm;
    const px = Math.max(0, Math.min(planCanvas.width, absX * scaleX));
    const py = Math.max(0, Math.min(planCanvas.height, planCanvas.height - absY * scaleY));

    if (state.mode === "velocity") {
      const speed = target.speed_mps || 0;
      const hue = Math.min(120, speed * 80);
      planCtx.fillStyle = `hsla(${120 - hue},70%,55%,0.9)`;
      planCtx.strokeStyle = `hsla(${120 - hue},70%,55%,0.35)`;
    } else {
      const color = TRAIL_COLORS[idx % TRAIL_COLORS.length];
      planCtx.fillStyle = `${color}E6`;
      planCtx.strokeStyle = `${color}66`;
    }

    planCtx.beginPath();
    planCtx.arc(px, py, 10, 0, Math.PI * 2);
    planCtx.fill();

    if (state.mode !== "velocity" && target.distance_mm) {
      planCtx.beginPath();
      const radius = Math.min(80, Math.max(16, target.distance_mm / 30 * (scaleX + scaleY) * 0.5));
      planCtx.arc(px, py, radius, 0, Math.PI * 2);
      planCtx.stroke();
    }

    planCtx.fillStyle = "#fff";
    planCtx.font = "13px Space Grotesk";
    planCtx.fillText(`T${target.index}`, px + 12, py - 10);
  });
}

function update3d() {
  const nodeState = getActiveNodeState();
  const snapshot = nodeState?.latest;
  if (!snapshot) {
    targetMeshes.forEach((mesh) => (mesh.visible = false));
    trailLines.forEach((line) => (line.visible = false));
    return;
  }
  const {
    room_width_mm: width,
    room_depth_mm: depth,
    targets = [],
    sensor_origin_x_mm: originX,
    sensor_origin_y_mm: originY,
  } = snapshot;
  if (!width || !depth) return;
  const config = getActiveNodeConfig();
  roomGroup.scale.set(width / 100, 1, depth / 100);
  sensorMarker.material.color.set(config.accent || "#7df0ff");
  sensorMarker.position.set((originX - width / 2) / 10, 0, (originY - depth / 2) / 10);

  targets.forEach((target, idx) => {
    const mesh = targetMeshes[idx];
    const line = trailLines[idx];
    const trail = nodeState.trails[idx];
    if (!mesh || !line) return;

    if (!target.valid) {
      mesh.visible = false;
      line.visible = false;
      if (trail) trail.length = 0;
      return;
    }

    const targetColor = TRAIL_COLORS[idx % TRAIL_COLORS.length];
    mesh.material.color.set(targetColor);
    line.material.color.set(targetColor);

    mesh.visible = true;
    const x = (originX + target.x_mm - width / 2) / 10;
    const z = (originY + target.y_mm - depth / 2) / 10;
    const y = (target.speed_mps || 0) * 5;
    mesh.position.set(x, y, z);

    if (trail && trail.length > 1) {
      line.visible = true;
      const positions = line.geometry.attributes.position.array;
      for (let i = 0; i < CONFIG.maxTrail; i++) {
        const point = trail[i] || trail[trail.length - 1] || [x, y, z];
        positions[i * 3 + 0] = point[0];
        positions[i * 3 + 1] = point[1];
        positions[i * 3 + 2] = point[2];
      }
      line.geometry.attributes.position.needsUpdate = true;
    } else {
      line.visible = false;
    }
  });
}

function updateTrails(nodeState, snapshot) {
  const width = snapshot.room_width_mm || 4000;
  const depth = snapshot.room_depth_mm || 4000;
  const originX = snapshot.sensor_origin_x_mm ?? width / 2;
  const originY = snapshot.sensor_origin_y_mm ?? 0;
  const targets = snapshot.targets || [];
  for (let idx = 0; idx < nodeState.trails.length; idx++) {
    const target = targets[idx];
    const trail = nodeState.trails[idx] || (nodeState.trails[idx] = []);
    if (!target || !target.valid) {
      trail.length = 0;
      continue;
    }
    const x = (originX + (target.x_mm || 0) - width / 2) / 10;
    const z = (originY + (target.y_mm || 0) - depth / 2) / 10;
    const y = (target.speed_mps || 0) * 5;
    trail.push([x, y, z]);
    if (trail.length > CONFIG.maxTrail) trail.shift();
  }
}

function renderNodeList() {
  if (!nodeList) return;
  nodeList.innerHTML = "";
  CONFIG.nodes.forEach((node, idx) => {
    const li = document.createElement("li");
    const badge = document.createElement("span");
    const code = document.createElement("code");
    const name = document.createElement("span");
    name.textContent = node.label || node.id;
    if (idx === state.activeNodeIndex) {
      li.classList.add("active-node");
    }
    badge.classList.add("badge");
    const nodeState = state.nodes[idx];
    if (nodeState?.connected) {
      badge.classList.add("live");
      badge.textContent = "LIVE";
    } else {
      badge.classList.add("offline");
      badge.textContent = "OFF";
    }
    code.textContent = node.endpoint.replace(/^https?:\/\//i, "");
    li.appendChild(name);
    li.appendChild(badge);
    li.appendChild(code);
    nodeList.appendChild(li);
  });
}

function boot() {
  initNodePicker();
  CONFIG.nodes.forEach((_, idx) => pollNode(idx));
  renderNodeList();
}
boot();
