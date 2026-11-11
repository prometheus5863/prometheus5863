import * as THREE from "../vendor/three.min.js";

const { BR, TREE, QUESTS, GRIND } = window.PROM;
const GH = "https://github.com/prometheus5863/";
const $ = id => document.getElementById(id);

/* ---------------- palette ---------------- */
const C = { gold: "#d4a24c", gold2: "#f2c14e", goldd: "#8a6424", crim: "#8b1e1e", crim2: "#b83232",
  parch: "#ecd9a8", parch2: "#d6bd85", ink: "#3b2614", ink2: "#7a5a33" };
const W = 18, H = 10;            // hall width / height
const LANE = 3.2;                // how far the horse may drift sideways

/* ---------------- content: chambers and their exhibits ---------------- */
const stateLabel = { u: "LEARNED", g: "GRINDING", l: "LOCKED" };
const CHAMBERS = [
  { name: "GREAT HALL", xp: 100, ex: [
    { title: "WHO GOES THERE?", lines: [
        "Harsh Vardhan Gururani. Yash to friends, promdom online.",
        "Final-year B.Tech + M.Tech in Engineering Physics at IIT (BHU) Varanasi, class of 2027.",
        "I stole fire from physics and I'm turning it into silicon, AI and games."] },
    { title: "CHARACTER SHEET", kv: [["HOMELAND", "Hills of Uttarakhand"], ["KEEP", "IIT (BHU), Varanasi"],
        ["CLASS", "Physicist-Engineer"], ["ALIGNMENT", "Ship first, optimize later"], ["WEAKNESS", "One more side quest"]],
      lines: ["Homeland: the hills of Uttarakhand. Keep: IIT (BHU), Varanasi.", "Class: Physicist-Engineer. Alignment: ship first, optimize later.", "Weakness: starting a new side quest before finishing the last."] },
  ]},
  { name: "LIBRARY", xp: 150, ex: [
    { title: "THE CHRONICLE, ACTS I-III", lines: [
        "I. Spawned in the Mining branch, then earned a class change to Engineering Physics.",
        "II. Co-founded the Quantum Vertical at the Club of Programmers, IIT (BHU).",
        "III. Quantum Research Intern and QuantumOS founding member at Silicofeller."] },
    { title: "THE CHRONICLE, ACTS IV-NOW", lines: [
        "IV. Freelance blacksmith: automation and a WhatsApp CRM for an EV startup, a 3D quantum visualizer for Qant Labs.",
        "V. Got PR #1265 merged into InVesalius, an open-source neuronavigation suite.",
        "NOW. Thesis on graphene-superconductor junctions, forging a path into silicon verification."] },
  ]},
  { name: "ARMORY", xp: 200, ex: BR.map((b, ci) => ({
      title: `${b.k} · ${b.label.toUpperCase()}`, color: b.hex,
      runes: TREE.map(row => row[ci]),
      lines: TREE.map(row => `${row[ci][1]} (${stateLabel[row[ci][2]].toLowerCase()}): ${row[ci][3]}`),
  }))},
  { name: "WAR ROOM", xp: 250, ex: QUESTS.map(q => ({
      title: q.t.toUpperCase(), quest: q, color: BR.find(b => b.k === q.b).hex,
      lines: [q.x, q.lore],
      links: [["REPO", GH + q.r], ...(q.demo ? [["DEMO", q.demo]] : [])],
  }))},
  { name: "FORGE", xp: 150, ex: [
    { title: "ON THE ANVIL", grind: GRIND, lines: GRIND.map(g => `${g[0]}: ${g[1] * 10}%`) },
  ]},
  { name: "DUNGEON", xp: 300, ex: [], end: {
      title: "SEND A RAVEN",
      lines: ["You reached the bottom. Building something at the edge of physics, AI or silicon? I'm happy to talk."],
      links: [["GITHUB", "https://github.com/prometheus5863"],
              ["LINKEDIN", "https://www.linkedin.com/in/harsh-vardhan-gururani-9b35862b5"],
              ["EMAIL", "mailto:harshvardhan.gururani.cd.phy22@itbhu.ac.in"]] } },
];

/* ---------------- canvas texture helpers ---------------- */
function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
function tex(w, h, draw, repeat) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); g.imageSmoothingEnabled = false; draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
function brickTex(repeat, pal = ["#4a4038", "#5e5248", "#77695c", "#544a40"], mortar = "#1d1915", seed = 7) {
  return tex(64, 64, (g) => {
    const r = rng(seed); g.fillStyle = mortar; g.fillRect(0, 0, 64, 64);
    for (let y = 0, row = 0; y < 64; y += 8, row++)
      for (let x = -(row % 2) * 8; x < 64; x += 16) {
        g.fillStyle = pal[Math.floor(r() * pal.length)]; g.fillRect(x + 1, y + 1, 15, 7);
        g.fillStyle = "rgba(255,255,255,.07)"; g.fillRect(x + 1, y + 1, 15, 1);
        g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(x + 1, y + 7, 15, 1);
      }
  }, repeat);
}
function floorTex(repeat) {
  return tex(64, 64, (g) => {
    const r = rng(21); g.fillStyle = "#15110e"; g.fillRect(0, 0, 64, 64);
    const pal = ["#3a332c", "#443b33", "#2f2924", "#4a4038"];
    for (let y = 0; y < 64; y += 16) for (let x = 0; x < 64; x += 16) {
      g.fillStyle = pal[Math.floor(r() * 4)]; g.fillRect(x + 1, y + 1, 15, 15);
      g.fillStyle = "rgba(255,255,255,.06)"; g.fillRect(x + 1, y + 1, 15, 1);
      if (r() > .6) { g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(x + 4 + Math.floor(r() * 8), y + 4 + Math.floor(r() * 8), 2, 1); }
    }
  }, repeat);
}
function wrap(g, text, x, y, maxW, lh) {
  let line = "";
  for (const word of text.split(" ")) {
    const t = line ? line + " " + word : word;
    if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y); y += lh; line = word; } else line = t;
  }
  if (line) { g.fillText(line, x, y); y += lh; }
  return y;
}
function parchment(g, w, h, accent) {
  g.fillStyle = C.goldd; g.fillRect(0, 0, w, h);
  g.fillStyle = C.gold; g.fillRect(6, 6, w - 12, h - 12);
  g.fillStyle = C.parch; g.fillRect(12, 12, w - 24, h - 24);
  if (accent) { g.fillStyle = accent; g.fillRect(12, 12, w - 24, 12); }
  g.fillStyle = C.gold2; for (const [x, y] of [[18, 18 + (accent ? 12 : 0)], [w - 28, 18 + (accent ? 12 : 0)], [18, h - 28], [w - 28, h - 28]]) g.fillRect(x, y, 10, 10);
}
function boardTex(ex) {
  return tex(640, 420, (g, w, h) => {
    parchment(g, w, h, ex.color);
    g.textBaseline = "top";
    let y = 44;
    if (ex.quest) {
      g.font = "12px PS2P"; g.fillStyle = C.ink2; g.fillText(`${ex.quest.b} · ${ex.quest.s}`, 44, y);
      for (let i = 0; i < 5; i++) { g.fillStyle = i < ex.quest.d ? C.ink : "#c9b480"; g.fillRect(w - 150 + i * 22, y - 2, 16, 16); g.fillStyle = C.parch; g.fillRect(w - 147 + i * 22, y + 3, 4, 4); g.fillRect(w - 141 + i * 22, y + 3, 4, 4); }
      y += 34;
    }
    g.font = "22px PS2P"; g.fillStyle = C.crim; y = wrap(g, ex.title, 44, y, w - 88, 32) + 10;
    g.fillStyle = C.ink2; g.fillRect(44, y, w - 88, 3); y += 18;
    if (ex.kv) {
      for (const [k, v] of ex.kv) { g.font = "13px PS2P"; g.fillStyle = C.ink2; g.fillText(k, 44, y + 6); g.font = "34px VT"; g.fillStyle = C.ink; g.fillText(v, 220, y - 4); y += 46; }
    } else if (ex.runes) {
      for (const [ico, name, st] of ex.runes) {
        g.fillStyle = "#1b1512"; g.fillRect(44, y, w - 88, 58);
        g.fillStyle = st === "l" ? "#3a332c" : ex.color; g.fillRect(44, y, 8, 58);
        g.font = "16px PS2P"; g.fillStyle = st === "l" ? "#6e6257" : ex.color; g.fillText(st === "l" ? "??" : ico, 68, y + 22);
        g.font = "34px VT"; g.fillStyle = st === "l" ? "#6e6257" : C.parch; g.fillText(name, 150, y + 10);
        g.font = "10px PS2P"; g.fillStyle = st === "u" ? C.gold2 : st === "g" ? "#ff8a5c" : "#6e6257";
        g.textAlign = "right"; g.fillText(stateLabel[st], w - 58, y + 24); g.textAlign = "left";
        y += 66;
      }
    } else if (ex.grind) {
      for (const [n, v, , hex] of ex.grind.map((x, i) => [...x, ["#5b8fd9", "#d9822b", "#a66fd1", "#d4a24c"][i]])) {
        g.font = "30px VT"; g.fillStyle = C.ink; g.fillText(n, 44, y); y += 32;
        g.fillStyle = "#2a1f15"; g.fillRect(44, y, w - 88, 22);
        for (let i = 0; i < 10; i++) { g.fillStyle = i < v ? hex : "#4a3a28"; g.fillRect(48 + i * ((w - 96) / 10), y + 4, (w - 96) / 10 - 4, 14); }
        y += 36;
      }
    } else {
      g.font = "32px VT"; g.fillStyle = C.ink;
      const lines = ex.quest ? [ex.quest.x] : ex.lines;
      for (const l of lines) y = wrap(g, l, 44, y, w - 88, 32) + 10;
      if (ex.quest) {
        let x = 44; g.font = "26px VT";
        for (const t of ex.quest.tags) { const tw = g.measureText(t).width + 20; g.fillStyle = C.parch2; g.fillRect(x, h - 96, tw, 32); g.fillStyle = "#a88a55"; g.fillRect(x, h - 66, tw, 3); g.fillStyle = C.ink; g.fillText(t, x + 10, h - 94); x += tw + 10; }
        g.fillStyle = ex.quest.s === "CLEARED" ? "#2f6b2f" : C.crim2; g.beginPath(); g.arc(w - 80, h - 80, 30, 0, 7); g.fill();
        g.font = "20px PS2P"; g.fillStyle = C.parch; g.textAlign = "center"; g.fillText(ex.quest.s === "CLEARED" ? "C" : "!", w - 79, h - 90); g.textAlign = "left";
      }
    }
  });
}

/* ---------------- boot ---------------- */
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas: $("gl"), antialias: false, powerPreference: "high-performance" }); }
catch (e) { $("err").style.display = "flex"; $("fade").style.opacity = 0; throw e; }
await Promise.all([document.fonts.load("16px PS2P"), document.fonts.load("16px VT")]).catch(() => {});

let pixels = true;
try { pixels = localStorage.getItem("prom-pixels") !== "off"; } catch (e) {}
const scene = new THREE.Scene();
const SKY0 = new THREE.Color("#141022"), SKY1 = new THREE.Color("#8d8fc4"), sky = SKY0.clone();
scene.background = sky;
scene.fog = new THREE.Fog("#0b0806", 22, 78);
const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 400);
function resize() {
  const s = pixels ? Math.max(0.34, Math.min(0.5, 520 / innerHeight)) : Math.min(devicePixelRatio, 1.5);
  renderer.setPixelRatio(1); renderer.setSize(Math.round(innerWidth * s), Math.round(innerHeight * s), false);
  camera.aspect = innerWidth / innerHeight; camera.fov = camera.aspect < 0.8 ? 68 : 52; camera.updateProjectionMatrix();
  $("pix").textContent = "PIXELS: " + (pixels ? "ON" : "OFF");
}
addEventListener("resize", resize); resize();
$("pix").onclick = () => { pixels = !pixels; try { localStorage.setItem("prom-pixels", pixels ? "on" : "off"); } catch (e) {} resize(); };

const hemi = new THREE.HemisphereLight("#cbbcd6", "#3a2c22", 1.5); scene.add(hemi);

/* ---------------- layout ---------------- */
const GAP = 7.5;
let cursor = -2; const exhibits = [];
for (const ch of CHAMBERS) {
  ch.start = cursor;
  ch.ex.forEach((ex, j) => { ex.z = cursor - 13 - j * GAP; ex.side = j % 2 ? 1 : -1; exhibits.push(ex); });
  cursor -= ch.end ? 26 : ch.ex.length * GAP + 18;
  ch.endZ = cursor;
}
const L_END = cursor;                      // z of the end wall
const HALL0 = 5;                           // z of the front wall
const LEN = HALL0 - L_END;

/* ---------------- hall geometry ---------------- */
const lam = (o) => new THREE.MeshLambertMaterial(o);
const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
const zMid = (HALL0 + L_END) / 2;
{
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, LEN), lam({ map: floorTex([W / 4, LEN / 4]) }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, zMid); scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, LEN), lam({ map: brickTex([W / 4, LEN / 4], ["#2a2420", "#332b25", "#241e1a"], "#120e0b", 3) }));
  ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H, zMid); scene.add(ceil);
  for (const s of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(LEN, H), lam({ map: brickTex([LEN / 4, H / 4]) }));
    wall.rotation.y = -s * Math.PI / 2; wall.position.set(s * W / 2, H / 2, zMid); scene.add(wall);
  }
  const end = new THREE.Mesh(new THREE.PlaneGeometry(W, H), lam({ map: brickTex([W / 4, H / 4]) }));
  end.position.set(0, H / 2, L_END); scene.add(end);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(W, H), lam({ map: brickTex([W / 4, H / 4]) }));
  front.rotation.y = Math.PI; front.position.set(0, H / 2, HALL0); scene.add(front);
  // carpet runner
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(5, LEN - 4), lam({ map: tex(32, 32, (g) => {
    g.fillStyle = C.crim; g.fillRect(0, 0, 32, 32); g.fillStyle = C.gold; g.fillRect(2, 0, 2, 32); g.fillRect(28, 0, 2, 32);
    g.fillStyle = "#7a1818"; g.fillRect(14, 6, 4, 4); g.fillRect(14, 22, 4, 4);
  }, [1, (LEN - 4) / 5]) }));
  carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.02, zMid); scene.add(carpet);
}

/* ---------------- flames ---------------- */
const flames = [];
const flameA = new THREE.MeshBasicMaterial({ color: "#e8590c" }), flameB = new THREE.MeshBasicMaterial({ color: "#ffd166" });
function flame(size = 1) {
  const g = new THREE.Group();
  const a = box(.34 * size, .5 * size, .34 * size, flameA); a.position.y = .25 * size;
  const b = box(.16 * size, .5 * size, .16 * size, flameB); b.position.y = .42 * size;
  g.add(a, b); g.userData.ph = Math.random() * 6; flames.push(g); return g;
}
const wood = lam({ color: "#5a3520" }), iron = lam({ color: "#444" }), stone = lam({ map: brickTex([1, 3], ["#5e5248", "#77695c", "#6a5d51"]) });

/* ---------------- arches with floor signs ---------------- */
CHAMBERS.forEach((ch, i) => {
  const z = ch.start;
  for (const s of [-1, 1]) {
    const p = box(1.6, H, 1.6, stone); p.position.set(s * (W / 2 - .8), H / 2, z); scene.add(p);
    const t = box(.14, .8, .14, wood); t.position.set(s * (W / 2 - 1.75), 4.4, z + .6); scene.add(t);
    const f = flame(1.3); f.position.set(s * (W / 2 - 1.75), 4.8, z + .6); scene.add(f);
    // banner
    const b = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 3.6), new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, map: tex(24, 58, (g) => {
      g.fillStyle = C.goldd; g.fillRect(0, 0, 24, 3); g.fillStyle = C.crim; g.fillRect(1, 3, 22, 49);
      g.clearRect(0, 52, 24, 6); g.fillStyle = C.crim; g.fillRect(1, 52, 6, 6); g.fillRect(17, 52, 6, 6);
      g.fillStyle = C.gold; g.fillRect(8, 14, 8, 8); g.fillRect(10, 26, 4, 10);
    }), transparent: true, alphaTest: .5 }));
    b.position.set(s * (W / 2 - 3.2), 6.6, z + .1); scene.add(b);
  }
  const lintel = box(W, 1.8, 1.6, lam({ map: brickTex([W / 4, .45], ["#5e5248", "#77695c", "#6a5d51"]) })); lintel.position.set(0, H - .9, z); scene.add(lintel);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.3), new THREE.MeshBasicMaterial({ map: tex(540, 78, (g, w, h) => {
    g.fillStyle = C.goldd; g.fillRect(0, 0, w, h); g.fillStyle = "#1b1210"; g.fillRect(5, 5, w - 10, h - 10);
    g.font = "20px PS2P"; g.fillStyle = C.gold2; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(`FLOOR ${i + 1} · ${ch.name}`, w / 2, h / 2 + 2);
  }) }));
  sign.position.set(0, H - .9, z + .82); scene.add(sign);
  const pl = new THREE.PointLight("#ff9a3c", 55, 34, 1.6); pl.position.set(0, 5.5, z + 1.5); scene.add(pl); ch.light = pl;
});

/* ---------------- exhibits ---------------- */
for (const ex of exhibits) {
  const g = new THREE.Group();
  const face = new THREE.MeshBasicMaterial({ map: boardTex(ex) });
  const b = new THREE.Mesh(new THREE.BoxGeometry(6.6, 4.33, .18), [wood, wood, wood, wood, face, wood]); b.position.y = 3.7; g.add(b);
  for (const x of [-2.9, 2.9]) { const p = box(.22, 1.6, .22, wood); p.position.set(x, .8, 0); g.add(p); }
  g.position.set(ex.side * 6.3, 0, ex.z); g.rotation.y = -ex.side * 0.8; scene.add(g);
  const t = box(.12, .7, .12, wood); t.position.set(ex.side * (W / 2 - .3), 5.9, ex.z - 2.2); scene.add(t);
  const f = flame(1); f.position.set(ex.side * (W / 2 - .3), 6.25, ex.z - 2.2); scene.add(f);
}
/* ---------------- wall pictures: what each quest does ----------------
   Drawn illustrations by default. To use a real screenshot, add  shot: "shots/<file>.png"  to the
   quest in data.js and drop the image in docs/dungeon/shots/. */
const P = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const lbl = (g, s, x, y, c = "#f2c14e", sz = 8) => { g.font = sz + "px PS2P"; g.fillStyle = c; g.textBaseline = "top"; g.fillText(s, x, y); };
function line(g, x0, y0, x1, y1, c, wd = 2) { g.strokeStyle = c; g.lineWidth = wd; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
const ART = {
  "muse-memory": (g, r) => {
    const cols = ["#a66fd1", "#5b8fd9", "#d4a24c"], cs = [[80, 70], [215, 60], [160, 145]], nodes = [];
    cs.forEach(([cx, cy], k) => { for (let i = 0; i < 9; i++) nodes.push([cx + (r() - .5) * 95, cy + (r() - .5) * 70, k]); });
    nodes.forEach((a, i) => nodes.forEach((b, j) => { if (j > i && ((a[2] === b[2] && r() < .38) || r() < .02)) line(g, a[0], a[1], b[0], b[1], a[2] === b[2] ? cols[a[2]] + "88" : "#ffffff44", 1); }));
    nodes.forEach(([x, y, k]) => { P(g, x - 4, y - 4, 8, 8, cols[k]); P(g, x - 2, y - 2, 3, 3, "#ffffffaa"); });
    lbl(g, "MEMORY GRAPH", 10, 182); lbl(g, "recall()", 236, 182, "#ecd9a8");
  },
  "invesalius-tep-gsoc2026": (g, r) => {
    line(g, 16, 20, 16, 170, "#6e6257"); line(g, 16, 95, 190, 95, "#6e6257");
    for (let k = 0; k < 14; k++) { const amp = (r() - .5) * 110, c = `hsl(${k * 26},70%,62%)`; g.strokeStyle = c; g.lineWidth = 1; g.beginPath();
      for (let x = 0; x < 172; x += 2) { const y = 95 + amp * Math.exp(-(((x - 62) / 16) ** 2)) - amp * .5 * Math.exp(-(((x - 104) / 24) ** 2)) + (r() - .5) * 5; x ? g.lineTo(18 + x, y) : g.moveTo(18 + x, y); } g.stroke(); }
    for (let y = 20; y < 170; y += 8) P(g, 52, y, 2, 4, "#f2c14e"); lbl(g, "TMS", 42, 8);
    for (let y = -34; y <= 34; y += 4) for (let x = -34; x <= 34; x += 4) { const d = Math.hypot(x, y); if (d > 34) continue; const v = Math.exp(-(((x + 8) ** 2 + (y + 6) ** 2) / 300)) - .8 * Math.exp(-(((x - 14) ** 2 + (y - 12) ** 2) / 260)); P(g, 258 + x, 92 + y, 4, 4, `hsl(${v > 0 ? 8 : 215},75%,${48 + Math.abs(v) * 30}%)`); }
    g.strokeStyle = "#ecd9a8"; g.lineWidth = 2; g.beginPath(); g.arc(260, 94, 37, 0, 7); g.stroke(); P(g, 256, 50, 8, 6, "#ecd9a8");
    lbl(g, "EVOKED POTENTIALS", 10, 182); lbl(g, "TOPO", 244, 140, "#ecd9a8");
  },
  "quantumtrace": (g) => {
    for (let i = 0; i <= 10; i++) { line(g, 160 + (i - 5) * 16, 96, 160 + (i - 5) * 62, 176, "#2b3a5c", 1); line(g, 160 - 80 - i * 23, 96 + i * 8, 160 + 80 + i * 23, 96 + i * 8, "#2b3a5c", 1); }
    P(g, 168, 38, 20, 104, "#8b1e1e"); P(g, 168, 38, 20, 4, "#b83232"); lbl(g, "V(x)", 164, 24, "#b83232");
    for (let x = 20; x < 300; x += 4) { const a = x < 168 ? 78 * Math.exp(-(((x - 104) / 30) ** 2)) : 30 * Math.exp(-(((x - 240) / 26) ** 2)); if (a > 2) P(g, x, 140 - a, 3, a, `hsl(${(x * 9) % 360},80%,60%)`); }
    lbl(g, "WAVE PACKET MEETS BARRIER", 10, 182);
  },
  "single-layer-graphene-structure": (g) => {
    const a = 17; for (let j = 0; j < 7; j++) for (let i = 0; i < 6; i++) { const x = 20 + i * a * 1.73 + (j % 2) * a * .866, y = 20 + j * a * 1.5;
      if (y > 160 || x > 176) continue; line(g, x, y, x, y + a, "#8a6424"); line(g, x, y, x - a * .866, y - a * .5, "#8a6424"); line(g, x, y, x + a * .866, y - a * .5, "#8a6424"); P(g, x - 3, y - 3, 6, 6, "#5b8fd9"); P(g, x - 3, y + a - 3, 6, 6, "#ecd9a8"); }
    for (let k = 0; k < 44; k++) { P(g, 250 - k * .9, 96 - k, k * 1.8 + 2, 1, `hsl(215,70%,${40 + k}%)`); P(g, 250 - k * .9, 96 + k, k * 1.8 + 2, 1, `hsl(8,70%,${40 + k}%)`); }
    lbl(g, "K", 296, 90, "#ecd9a8"); lbl(g, "LATTICE", 10, 182); lbl(g, "DIRAC CONE", 204, 182, "#ecd9a8");
  },
  "downtown-duel": (g, r) => {
    P(g, 0, 0, 320, 200, "#35501f"); for (let i = 0; i < 80; i++) P(g, r() * 320, r() * 176, 2, 2, "#4a6b2a");
    g.strokeStyle = "#5e5248"; g.lineWidth = 16; g.strokeRect(46, 40, 228, 110); g.strokeStyle = "#d6bd85"; g.lineWidth = 1; g.setLineDash([6, 6]); g.strokeRect(46, 40, 228, 110); g.setLineDash([]);
    const mon = (x, y, c) => { P(g, x, y + 4, 16, 12, c); P(g, x + 2, y, 12, 6, c); P(g, x + 3, y + 5, 3, 3, "#fff"); P(g, x + 10, y + 5, 3, 3, "#fff"); P(g, x + 4, y + 6, 1, 1, "#000"); P(g, x + 11, y + 6, 1, 1, "#000"); };
    [[90, 60, "#a66fd1"], [220, 58, "#d9822b"], [250, 120, "#5b8fd9"], [70, 128, "#b83232"]].forEach(m => mon(...m)); mon(184, 92, "#6f9a3a");
    g.strokeStyle = "#f2c14e"; g.lineWidth = 2; g.strokeRect(178, 86, 28, 28);
    P(g, 132, 92, 10, 14, "#23202b"); P(g, 133, 84, 8, 8, "#e8b48a"); P(g, 131, 81, 12, 5, "#17131a"); P(g, 143, 96, 14, 2, "#dfe4ff");
    P(g, 10, 8, 104, 10, "#1b1512"); P(g, 12, 10, 74, 6, "#b83232"); lbl(g, "LOCK-ON", 172, 118, "#f2c14e", 6); lbl(g, "61 MONSTERS · 9 ZONES", 10, 184, "#ecd9a8");
  },
  "Design-Verification-Roadmap": (g) => {
    const row = (y, name, f, c) => { lbl(g, name, 10, y + 4, "#a8957a", 6); let py = f(0) ? y : y + 16; g.strokeStyle = c; g.lineWidth = 2; g.beginPath(); g.moveTo(62, py);
      for (let x = 0; x < 240; x += 12) { const ny = f(x / 12) ? y : y + 16; g.lineTo(62 + x, py); g.lineTo(62 + x, ny); g.lineTo(74 + x, ny); py = ny; } g.stroke(); };
    row(20, "clk", i => i % 2, "#6f9a3a"); row(52, "valid", i => i > 4 && i < 15, "#5b8fd9"); row(84, "ready", i => i > 7, "#a66fd1"); row(116, "data", i => [5, 6, 9, 12, 13].includes(i), "#d9822b");
    for (let y = 16; y < 138; y += 6) P(g, 158, y, 1, 3, "#f2c14e");
    lbl(g, "assert (valid |-> ##[1:3] ready);", 10, 150, "#ecd9a8", 7); P(g, 236, 164, 74, 26, "#2f6b2f"); lbl(g, "PASS", 248, 172, "#ecd9a8", 12); lbl(g, "UVM TESTBENCH", 10, 182);
  },
  "triev-whatsapp-crm": (g) => {
    const bub = (x, y, w, c, n) => { P(g, x, y, w, 12 + n * 8, c); for (let i = 0; i < n; i++) P(g, x + 6, y + 7 + i * 8, w - 14 - i * 12, 3, "#00000055"); };
    bub(12, 14, 110, "#ecd9a8", 2); bub(60, 50, 110, "#6f9a3a", 1); bub(12, 78, 126, "#ecd9a8", 3); bub(74, 122, 96, "#6f9a3a", 1);
    g.fillStyle = "#1b1512"; for (const cx of [214, 284]) { g.beginPath(); g.arc(cx, 140, 17, 0, 7); g.fill(); } g.fillStyle = "#77695c"; for (const cx of [214, 284]) { g.beginPath(); g.arc(cx, 140, 7, 0, 7); g.fill(); }
    P(g, 206, 112, 80, 14, "#5b8fd9"); P(g, 226, 98, 34, 14, "#23202b"); P(g, 276, 78, 5, 40, "#77695c"); P(g, 266, 76, 22, 5, "#23202b"); P(g, 200, 122, 22, 6, "#5b8fd9"); P(g, 244, 118, 12, 10, "#f2c14e");
    lbl(g, "LEAD → CHAT → RIDER", 10, 182);
  },
  "embedded-systems-software": (g) => {
    P(g, 40, 50, 96, 96, "#1b1512"); P(g, 46, 56, 84, 84, "#2a2420"); for (let i = 0; i < 7; i++) { P(g, 48 + i * 12, 40, 5, 10, "#a8957a"); P(g, 48 + i * 12, 146, 5, 10, "#a8957a"); P(g, 30, 58 + i * 12, 10, 5, "#a8957a"); P(g, 136, 58 + i * 12, 10, 5, "#a8957a"); }
    lbl(g, "MCU", 70, 92, "#a8957a", 10); g.fillStyle = "#ff5a3c"; g.beginPath(); g.arc(172, 60, 9, 0, 7); g.fill(); g.fillStyle = "#ff5a3c44"; g.beginPath(); g.arc(172, 60, 18, 0, 7); g.fill(); line(g, 146, 60, 163, 60, "#a8957a");
    [["#a66fd1", 60], ["#ecd9a8", 96], ["#5b8fd9", 74], ["#ecd9a8", 110], ["#6f9a3a", 50], ["#a66fd1", 30]].forEach(([c, w], i) => P(g, 200 + (i > 0 && i < 5 ? 10 : 0), 92 + i * 12, w, 5, c));
    lbl(g, "REGISTERS AND POINTERS", 10, 182);
  },
};
for (const ex of exhibits) {
  if (!ex.quest) continue;
  const q = ex.quest, g = new THREE.Group();
  const pic = new THREE.MeshBasicMaterial({ map: tex(320, 200, (c, w, h) => { c.fillStyle = "#0e0b14"; c.fillRect(0, 0, w, h); ART[q.r]?.(c, rng(q.r.length * 977 + 3)); }) });
  if (q.shot) new THREE.TextureLoader().load(q.shot, (t) => { t.colorSpace = THREE.SRGBColorSpace; pic.map = t; pic.needsUpdate = true; });
  const frame = box(6.9, 4.5, .16, lam({ color: "#8a6424" })); g.add(frame);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4), pic); m.position.z = .09; g.add(m);
  const cap = new THREE.Mesh(new THREE.PlaneGeometry(6.9, .62), new THREE.MeshBasicMaterial({ map: tex(552, 50, (c, w, h) => {
    c.fillStyle = "#1b1210"; c.fillRect(0, 0, w, h); c.fillStyle = C.goldd; c.fillRect(0, 0, w, 4);
    c.font = "16px PS2P"; c.fillStyle = C.gold2; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(q.r.toUpperCase().slice(0, 30), w / 2, h / 2 + 3);
  }) })); cap.position.set(0, -2.6, .09); g.add(cap);
  g.position.set(ex.side * (W / 2 - .1), 5.6, ex.z + 5.6); g.rotation.y = -ex.side * Math.PI / 2; scene.add(g);
}
// end wall: contact board
const endCh = CHAMBERS[CHAMBERS.length - 1];
{
  const ex = endCh.end; ex.z = L_END; ex.side = 0; ex.isEnd = true; exhibits.push(ex);
  const m = new THREE.Mesh(new THREE.BoxGeometry(10, 6.56, .2), [wood, wood, wood, wood, new THREE.MeshBasicMaterial({ map: boardTex(ex) }), wood]);
  m.position.set(0, 4.6, L_END + .15); scene.add(m);
  for (const s of [-1, 1]) { const f = flame(1.6); f.position.set(s * 6.2, 4.4, L_END + .5); scene.add(f); const t = box(.16, 1, .16, wood); t.position.set(s * 6.2, 3.9, L_END + .5); scene.add(t); }
  const pl = new THREE.PointLight("#ff9a3c", 60, 30, 1.6); pl.position.set(0, 5, L_END + 5); scene.add(pl);
}
// forge decor: anvil + coals
{
  const z = CHAMBERS[4].start - 16;
  const a = new THREE.Group();
  const base = box(1.2, 1, 1.2, wood); base.position.y = .5;
  const body = box(.8, .5, 1.6, iron); body.position.y = 1.25;
  const horn = box(.5, .25, .7, iron); horn.position.set(0, 1.35, -1.1);
  a.add(base, body, horn); a.position.set(-6.4, 0, z); scene.add(a);
  const pit = box(2.4, .7, 2.4, lam({ color: "#2a2420" })); pit.position.set(-6.6, .35, z - 4); scene.add(pit);
  for (let i = 0; i < 4; i++) { const f = flame(1.2 + (i % 2) * .5); f.position.set(-7.2 + (i % 2) * 1.1, .7, z - 4.5 + Math.floor(i / 2) * 1); scene.add(f); }
}
// library decor: bookshelves against the walls
{
  const shelfTex = () => tex(64, 64, (g) => {
    const r = rng(5); g.fillStyle = "#3a2414"; g.fillRect(0, 0, 64, 64);
    const cols = ["#8b1e1e", "#35507d", "#4a6b2a", "#8a6424", "#5a3a6a", "#d6bd85"];
    for (let y = 2; y < 64; y += 16) { let x = 2; while (x < 60) { const bw = 3 + Math.floor(r() * 4); g.fillStyle = cols[Math.floor(r() * 6)]; g.fillRect(x, y + Math.floor(r() * 3), bw, 13); x += bw + 1; } g.fillStyle = "#24160c"; g.fillRect(0, y + 13, 64, 3); }
  });
  const lib = CHAMBERS[1];
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const m = box(.8, 6, 4.2, [0, 1, 2, 3, 4, 5].map(i => i === (s < 0 ? 0 : 1) ? lam({ map: shelfTex() }) : wood));
    m.position.set(s * (W / 2 - .4), 3, lib.start - 6 - k * 6.2 - (s > 0 ? 3 : 0)); scene.add(m);
  }
}

/* ---------------- outside: flat 2D castle, ground, storm ---------------- */
const outMats = [], clouds = [];
const outMat = (o) => { const m = new THREE.MeshBasicMaterial({ fog: false, ...o }); m.userData.base = new THREE.Color(o.color || "#ffffff"); outMats.push(m); return m; };
const castleMat = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: .05, fog: false });
{
  const CW = 30, CHh = CW * 276 / 320;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(CW, CHh), castleMat); m.position.set(0, CHh / 2 - 1.9, 6); scene.add(m);
  const img = new Image();
  img.onload = () => { castleMat.map = tex(960, 828, (g) => g.drawImage(img, 0, 0, 960, 828)); castleMat.needsUpdate = true; ready(); };
  img.onerror = () => ready();
  img.src = "../assets/castle.svg";
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 120), outMat({ map: tex(64, 64, (g) => {
    const r = rng(31); g.fillStyle = "#35501f"; g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 420; i++) { g.fillStyle = ["#3f5e25", "#2c4419", "#4a6b2a", "#557a30", "#2a3d18"][Math.floor(r() * 5)]; g.fillRect(Math.floor(r() * 64), Math.floor(r() * 64), 1 + Math.floor(r() * 2), 1 + Math.floor(r() * 3)); }
    for (let i = 0; i < 5; i++) { g.fillStyle = "#4a3b26"; g.fillRect(Math.floor(r() * 56), Math.floor(r() * 56), 5 + Math.floor(r() * 6), 3 + Math.floor(r() * 4)); }   // mud
    for (let i = 0; i < 4; i++) { g.fillStyle = ["#d9c36a", "#c9d6e8", "#b83232"][i % 3]; g.fillRect(Math.floor(r() * 62), Math.floor(r() * 62), 1, 1); }       // flowers
  }, [50, 15]) }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -.02, 66); scene.add(ground);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 120), outMat({ map: tex(32, 32, (g) => {
    const r = rng(8); g.fillStyle = "#7d6d4f"; g.fillRect(0, 0, 32, 32);
    for (let i = 0; i < 60; i++) { g.fillStyle = ["#8f7f5e", "#6b5c41", "#9c8c6a", "#5c4f38"][Math.floor(r() * 4)]; g.fillRect(Math.floor(r() * 32), Math.floor(r() * 32), 2 + Math.floor(r() * 3), 1 + Math.floor(r() * 2)); }
    g.fillStyle = "#4a3f2c"; g.fillRect(0, 0, 1, 32); g.fillRect(31, 0, 1, 32);
  }, [1, 26]) }));
  path.rotation.x = -Math.PI / 2; path.position.set(0, 0, 66); scene.add(path);
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(13, 7), outMat({ map: floorTex([3.25, 1.75]) }));
  apron.rotation.x = -Math.PI / 2; apron.position.set(0, .01, 9.6); scene.add(apron);
  // trees (crossed pixel planes), lantern posts, clouds
  const treeMat = outMat({ transparent: true, alphaTest: .5, side: THREE.DoubleSide, map: tex(32, 48, (g) => {
    const r = rng(12); g.fillStyle = "#3a2414"; g.fillRect(14, 28, 4, 20); g.fillRect(12, 44, 8, 4);
    for (let i = 0; i < 90; i++) { const a = r() * 6.28, d = r() * 13; const x = 16 + Math.cos(a) * d, y = 17 + Math.sin(a) * d * 1.1; g.fillStyle = ["#1f3a17", "#2c4f1f", "#3a6427", "#16290f"][Math.floor(r() * 4)]; g.fillRect(Math.floor(x) - 2, Math.floor(y) - 2, 5, 5); }
  }) });
  const tr = rng(77);
  for (let i = 0; i < 16; i++) {
    const sgn = i % 2 ? 1 : -1, x = sgn * (17 + tr() * 34), z = 9 + tr() * 36, h = 9 + tr() * 6;
    for (const ry of [0, Math.PI / 2]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(h * .66, h), treeMat); m.position.set(x, h / 2 - .2, z); m.rotation.y = ry + .4; scene.add(m); }
  }
  const postMat = outMat({ color: "#4a2c18" });
  for (const z of [14, 24, 34]) for (const sx of [-3.3, 3.3]) {
    const p = box(.3, 2.6, .3, postMat); p.position.set(sx, 1.3, z); scene.add(p);
    const f = flame(1.1); f.position.set(sx, 2.6, z); scene.add(f);
  }
  const cloudMat = outMat({ transparent: true, alphaTest: .5, map: tex(64, 24, (g) => {
    const r = rng(4); for (let i = 0; i < 26; i++) { g.fillStyle = ["#2a2440", "#342c4e", "#221d36"][i % 3]; const w = 10 + r() * 22, x = r() * (64 - w), y = 4 + r() * 12; g.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), 4 + Math.floor(r() * 5)); }
  }) });
  for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(46, 17), cloudMat); m.position.set(-90 + i * 30 + tr() * 10, 31 + tr() * 16, -38 - i); scene.add(m); clouds.push(m); }
  const r = rng(99), pts = [];
  for (let i = 0; i < 260; i++) pts.push((r() - .5) * 320, 4 + r() * 110, -70 - r() * 30);
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: "#f4ecd8", size: 2, sizeAttenuation: false, fog: false })));
}
// rain
const RAIN = 700, rainPos = new Float32Array(RAIN * 6), rainGeo = new THREE.BufferGeometry();
{
  const r = rng(55);
  for (let i = 0; i < RAIN; i++) { const x = (r() - .5) * 90, y = r() * 44, z = 7 + r() * 46; rainPos.set([x, y, z, x + .25, y - 1.5, z], i * 6); }
  rainGeo.setAttribute("position", new THREE.BufferAttribute(rainPos, 3));
}
const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: "#93a6cc", transparent: true, opacity: .55, fog: false })); rain.frustumCulled = false; scene.add(rain);
// lightning bolt (rebuilt on every strike)
const boltGeo = new THREE.BufferGeometry(); boltGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(16 * 2 * 3 * 2), 3));
const bolt = new THREE.LineSegments(boltGeo, new THREE.LineBasicMaterial({ color: "#f4f0ff", fog: false })); bolt.frustumCulled = false; bolt.visible = false; scene.add(bolt);
function strike() {
  const a = boltGeo.attributes.position.array; let x = (Math.random() - .5) * 110, y = 62; const z = -44;
  for (let i = 0; i < 16; i++) {
    const nx = x + (Math.random() - .5) * 7, ny = y - 3.2;
    a.set([x, y, z, nx, ny, z, x + .5, y, z, nx + .5, ny, z], i * 12); x = nx; y = ny;
  }
  boltGeo.attributes.position.needsUpdate = true;
}
let flash = 0, nextFlash = 1.2;
// window slits inside the hall flash with the storm
const WIN0 = new THREE.Color("#1c1a33"), WIN1 = new THREE.Color("#dfe4ff"), winMat = new THREE.MeshBasicMaterial({ color: WIN0.clone() });
for (const ch of CHAMBERS) for (const sd of [-1, 1]) {
  const fr = box(.3, 4.2, 1.9, stone); fr.position.set(sd * (W / 2 - .1), 6.6, ch.start - 5.2); scene.add(fr);
  const wn = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 3.4), winMat); wn.rotation.y = -sd * Math.PI / 2; wn.position.set(sd * (W / 2 - .27), 6.6, ch.start - 5.2); scene.add(wn);
}
// dust motes drifting in the torchlight
const MOTES = 700, motePos = new Float32Array(MOTES * 3), moteGeo = new THREE.BufferGeometry();
{
  const r = rng(202);
  for (let i = 0; i < MOTES; i++) motePos.set([(r() - .5) * (W - 2), .5 + r() * (H - 1.5), HALL0 - 2 - r() * (LEN - 4)], i * 3);
  moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
  scene.add(new THREE.Points(moteGeo, new THREE.PointsMaterial({ color: "#ffcf8a", size: 1.5, sizeAttenuation: false, transparent: true, opacity: .55 })));
}

/* ---------------- horse + rider (boxes, facing -z) ---------------- */
const rig = new THREE.Group(); scene.add(rig);
const legs = [];
let riderTop, torchLight;
{
  const coat = lam({ color: "#9a6238" }), dark = lam({ color: "#4a2c18" }), cream = lam({ color: "#e8dcc0" });
  const skin = lam({ color: "#e8b48a" }), hair = lam({ color: "#2a2430" }), shirt = lam({ color: "#3a3646" }), jeans = lam({ color: "#34497e" }), red = lam({ color: "#b83232" });
  const horse = new THREE.Group(); rig.add(horse); rig.userData.horse = horse;
  const add = (m, x, y, z, p = horse) => { m.position.set(x, y, z); p.add(m); return m; };
  add(box(.95, 1.0, 2.4, coat), 0, 1.75, 0);
  const neck = add(box(.5, 1.3, .6, coat), 0, 2.45, -1.25); neck.rotation.x = .5;
  const head = add(box(.48, .52, 1.0, coat), 0, 3.0, -1.85); head.rotation.x = .25; rig.userData.head = head;
  add(box(.5, .3, .3, cream), 0, 2.86, -2.3);
  for (const s of [-1, 1]) add(box(.12, .28, .12, dark), s * .17, 3.38, -1.55);
  const mane = add(box(.16, 1.3, .3, dark), 0, 2.72, -1.0); mane.rotation.x = .5;
  const tail = add(box(.22, 1.2, .22, dark), 0, 1.7, 1.3); tail.rotation.x = -.45; rig.userData.tail = tail;
  add(box(1.0, .12, .9, red), 0, 2.3, .05);                       // saddle cloth
  for (const [x, z, ph] of [[-.32, -.9, 0], [.32, -.9, Math.PI], [-.32, .9, Math.PI], [.32, .9, 0]]) {
    const pivot = new THREE.Group(); pivot.position.set(x, 1.3, z); horse.add(pivot);
    const l = box(.26, 1.3, .26, coat); l.position.y = -.65; pivot.add(l);
    const hoof = box(.3, .16, .3, dark); hoof.position.y = -1.3; pivot.add(hoof);
    legs.push([pivot, ph]);
  }
  // rider
  const rider = new THREE.Group(); horse.add(rider); rider.position.set(0, 2.35, .1);
  for (const s of [-1, 1]) { add(box(.26, .8, .34, jeans), s * .58, -.25, -.1, rider); add(box(.28, .16, .44, hair), s * .58, -.7, -.18, rider); }
  riderTop = new THREE.Group(); rider.add(riderTop);
  add(box(.72, .9, .42, shirt), 0, .5, 0, riderTop);
  add(box(.16, .1, .06, red), 0, .86, -.23, riderTop);            // bow tie
  add(box(.2, .7, .22, shirt), -.46, .5, -.1, riderTop);          // left arm
  add(box(.18, .2, .2, skin), -.46, .1, -.2, riderTop);
  const arm = add(box(.2, .7, .22, shirt), .5, .78, -.05, riderTop); arm.rotation.z = -.5;
  add(box(.18, .2, .2, skin), .72, 1.12, -.05, riderTop);
  add(box(.5, .5, .5, skin), 0, 1.22, 0, riderTop);               // head
  add(box(.66, .42, .66, hair), 0, 1.52, .02, riderTop);          // hair
  add(box(.66, .5, .2, hair), 0, 1.2, .3, riderTop);
  add(box(.3, .22, .3, hair), .1, 1.78, -.1, riderTop);           // tuft
  add(box(.1, .9, .1, wood), .74, 1.5, -.05, riderTop);           // torch
  const f = flame(1.1); f.position.set(.74, 1.95, -.05); riderTop.add(f);
  const fill = new THREE.PointLight("#ffe2c0", 26, 14, 1.4); fill.position.set(0, 4.5, 6); rig.add(fill);
  torchLight = new THREE.PointLight("#ffb060", 70, 30, 1.5); torchLight.position.set(.74, 2.3, -.05); riderTop.add(torchLight);
}

/* ---------------- state ---------------- */
const keys = {};
let mode = "loading", vz = 0, vx = 0, mouseX = 0, lookYaw = 0, gallop = 0, enterT = 0, xp = 0, activeEx = null;
const pos = rig.position; pos.set(0, 0, 34);
const TITLE_POS = new THREE.Vector3(0, 10.5, 47), TITLE_LOOK = new THREE.Vector3(0, 10.5, 6);
const seen = new Set(), XPMAX = CHAMBERS.reduce((a, c) => a + c.xp, 0);
const camLook = TITLE_LOOK.clone(); camera.position.copy(TITLE_POS); camera.lookAt(camLook);

let readyCount = 0;
function ready() {
  if (readyCount++) return;
  renderer.compile(scene, camera);
  $("fade").style.opacity = 0; mode = "title";
  if (location.hash === "#ride") start();
}
function start() {
  if (mode !== "title") return;
  mode = "enter"; enterT = 0; $("title").classList.add("hide");
}
$("title").addEventListener("click", start);
addEventListener("keydown", e => {
  if (mode === "title") { start(); return; }
  const k = e.key.toLowerCase();
  keys[{ arrowup: "w", arrowdown: "s", arrowleft: "a", arrowright: "d" }[k] || k] = true;
  if (k === "e" && activeEx?.links) window.open(activeEx.links[0][1], "_blank", "noopener");
  if (["arrowup", "arrowdown", " "].includes(k)) e.preventDefault();
});
addEventListener("keyup", e => { const k = e.key.toLowerCase(); keys[{ arrowup: "w", arrowdown: "s", arrowleft: "a", arrowright: "d" }[k] || k] = false; });
addEventListener("blur", () => { for (const k in keys) keys[k] = false; });
addEventListener("wheel", e => { if (mode === "play") vz -= Math.max(-120, Math.min(120, e.deltaY)) * 0.05; }, { passive: true });
addEventListener("pointermove", e => { if (e.pointerType === "mouse") mouseX = (e.clientX / innerWidth) * 2 - 1; });
document.querySelectorAll("#pad button").forEach(b => {
  const k = b.dataset.k;
  b.addEventListener("pointerdown", e => { e.preventDefault(); keys[k] = true; b.setPointerCapture(e.pointerId); });
  for (const ev of ["pointerup", "pointercancel"]) b.addEventListener(ev, () => { keys[k] = false; });
});

function toast(title, msg) {
  const t = document.createElement("div"); t.className = "toast"; t.innerHTML = `<b>${title}</b>${msg}`;
  const box = $("toasts"); box.appendChild(t); while (box.children.length > 2) box.firstChild.remove(); setTimeout(() => t.remove(), 3200);
}
const esc = s => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
function showPanel(ex) {
  if (ex === activeEx) return; activeEx = ex;
  const p = $("panel");
  if (!ex) { p.classList.remove("on"); return; }
  p.innerHTML = `<h3>${esc(ex.title)}</h3>` + ex.lines.map(l => `<p>${esc(l)}</p>`).join("") +
    (ex.links ? `<div class="links">${ex.links.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">▶ ${n}</a>`).join("")}<span class="k">E</span></div>` : "");
  p.classList.add("on");
}

/* ---------------- loop ---------------- */
let last = performance.now(), t = 0; const tmp = new THREE.Vector3(), chase = new THREE.Vector3(), look = new THREE.Vector3();
function chasePose() {
  chase.set(pos.x * .55 - Math.sin(lookYaw) * 2.5, 5.6, pos.z + 10.5);
  look.set(pos.x * .8 + Math.sin(lookYaw) * 12, 3.4, pos.z - 11);
}
function tick() {
  const now = performance.now(), dt = Math.min((now - last) / 1000, .05); last = now; t += dt;

  if (mode === "enter") {
    enterT += dt; vz = -13; pos.z += vz * dt;
    if (pos.z <= 0) { mode = "play"; $("hint").classList.add("on"); setTimeout(() => $("hint").classList.remove("on"), 9000); }
  } else if (mode === "play") {
    const az = (keys.w ? -1 : 0) + (keys.s ? 1 : 0), ax = (keys.d ? 1 : 0) + (keys.a ? -1 : 0);
    vz += az * 34 * dt; vz -= vz * Math.min(1, (az ? 1.6 : 3.2) * dt); vz = Math.max(-15, Math.min(8, vz));
    vx += ax * 30 * dt; vx -= vx * Math.min(1, 6 * dt);
    pos.z += vz * dt; pos.x += vx * dt;
    if (pos.x > LANE) { pos.x = LANE; vx = 0; } if (pos.x < -LANE) { pos.x = -LANE; vx = 0; }
    if (pos.z > 1) { pos.z = 1; vz = 0; } if (pos.z < L_END + 8) { pos.z = L_END + 8; vz = 0; }
  }

  // horse animation
  const sp = Math.abs(vz), amt = Math.min(1, sp / 5);
  gallop += dt * (3 + sp * .75) * (amt > .02 ? 1 : 0);
  for (const [p, ph] of legs) p.rotation.x = Math.sin(gallop + ph) * .75 * amt;
  const horse = rig.userData.horse;
  horse.position.y = Math.abs(Math.sin(gallop)) * .16 * amt;
  horse.rotation.y = -vx * .05; horse.rotation.z = -vx * .012;
  rig.userData.head.rotation.x = .25 + Math.sin(gallop * 2) * .08 * amt + Math.sin(t * 1.3) * .03;
  rig.userData.tail.rotation.z = Math.sin(t * 3) * .25;
  riderTop.scale.y = 1 + Math.sin(t * 2.2) * .025;                 // breathing
  riderTop.rotation.x = -.12 * amt;
  for (const f of flames) { const s = 1 + Math.sin(t * 14 + f.userData.ph) * .18; f.scale.set(1 / s, s, 1 / s); }
  torchLight.intensity = 70 + Math.sin(t * 11) * 9;

  // storm: lightning, rain, clouds, window flashes
  if (t > nextFlash) { flash = 1; nextFlash = t + 2.5 + Math.random() * 6; strike(); if (Math.random() < .6) setTimeout(() => { flash = Math.max(flash, .85); }, 140); }
  flash = Math.max(0, flash - dt * 3);
  const outside = camera.position.z > 2;
  sky.lerpColors(SKY0, SKY1, flash * .85);
  for (const m of outMats) m.color.copy(m.userData.base).multiplyScalar(.72 + flash * .28);
  castleMat.color.setScalar(.84 + flash * .16);
  bolt.visible = outside && flash > .5;
  winMat.color.lerpColors(WIN0, WIN1, flash);
  hemi.intensity = 1.5 + flash * .45;
  rain.visible = outside;
  if (outside) {
    for (let i = 0; i < RAIN; i++) { const k = i * 6; let y = rainPos[k + 1] - 42 * dt; if (y < 0) y += 44; rainPos[k + 1] = y; rainPos[k + 4] = y - 1.5; }
    rainGeo.attributes.position.needsUpdate = true;
    for (const c of clouds) { c.position.x += dt * 1.4; if (c.position.x > 110) c.position.x = -110; }
  }
  for (let i = 0; i < MOTES; i++) { motePos[i * 3 + 1] += Math.sin(t * .6 + i) * dt * .12; }
  moteGeo.attributes.position.needsUpdate = true;

  // nearest exhibit
  let near = null, best = 1e9;
  if (mode === "play") for (const ex of exhibits) {
    const d = Math.abs(pos.z - (ex.z + (ex.isEnd ? 9 : 5)));
    if (d < (ex.isEnd ? 8 : 4.6) && d < best) { best = d; near = ex; }
  }
  showPanel(near);

  // camera
  const want = mouseX * 0.55 + (near && !near.isEnd ? near.side * 0.22 : 0);
  lookYaw += (want - lookYaw) * Math.min(1, 4 * dt);
  chasePose();
  if (mode === "title" || mode === "loading") { camera.position.copy(TITLE_POS); camLook.copy(TITLE_LOOK); }
  else if (mode === "enter" && enterT < 1.5) {
    const k = enterT / 1.5, e = k * k * (3 - 2 * k);
    camera.position.lerpVectors(TITLE_POS, chase, e); camLook.lerpVectors(TITLE_LOOK, look, e);
  } else { camera.position.lerp(chase, Math.min(1, 7 * dt)); camLook.lerp(look, Math.min(1, 7 * dt)); }
  camera.lookAt(camLook);
  castleMat.opacity = Math.max(0, Math.min(1, (camera.position.z - 8) / 8)); castleMat.visible = castleMat.opacity > .01;

  // floors / xp
  if (mode === "play") {
    const ch = CHAMBERS.find(c => pos.z <= c.start + 2 && pos.z > c.endZ + 2) || CHAMBERS[CHAMBERS.length - 1];
    if ($("floor").textContent !== ch.name) $("floor").textContent = ch.name;
    if (!seen.has(ch.name)) {
      seen.add(ch.name); xp += ch.xp; $("xpfill").style.width = (xp / XPMAX * 100) + "%"; $("xpnum").textContent = xp;
      toast("ACHIEVEMENT", `Rode into the ${ch.name.toLowerCase()} · +${ch.xp} XP`);
    }
  }
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(tick);
window.__prom = { get mode() { return mode; }, pos, start, keys, L_END, flash: () => flash };   // handy for debugging
