/* The fun layer: interactable props, easter eggs, coins, the character build and the map.
   Everything here is optional decoration on top of main.js; nothing in the ride depends on it. */
export function buildFun(ctx) {
  const { THREE, scene, box, lam, flame, tex, rng, C, W, rig, riderTop, exhibits, chamber, toast, addXp, refreshPanel, seen, PROM, $ } = ctx;
  const basic = (o) => new THREE.MeshBasicMaterial(o);
  const at = (m, x, y, z, parent = scene) => { m.position.set(x, y, z); parent.add(m); return m; };
  const anim = [], props = {};
  const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const wood = lam({ color: "#5a3520" }), dark = lam({ color: "#3a2212" }), stoneM = lam({ color: "#6a5d51" }), steel = lam({ color: "#b8c0cc" }), goldM = lam({ color: "#d4a24c" });
  const prop = (key, o) => { props[key] = o; exhibits.push(o); return o; };

  /* ---------- sound: tiny square-wave blips, nothing sampled ---------- */
  let ac = null, soundOn = store.get("prom-sound", true);
  function blip(freqs, len = .09, vol = .035) {
    if (!soundOn) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + i * len;
        o.type = "square"; o.frequency.value = f; g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + len * .95);
        o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + len);
      });
    } catch (e) {}
  }

  /* ---------- GREAT HALL: the stolen fire ---------- */
  {
    const z = chamber("GREAT HALL").start - 6, x = 6.6;
    at(box(1.5, 1.1, 1.5, stoneM), x, .55, z); at(box(1.9, .3, 1.9, goldM), x, 1.25, z);
    for (let i = 0; i < 3; i++) at(flame(1.8 - i * .4), x + (i - 1) * .35, 1.4, z + (i % 2) * .3 - .15);
    const pl = new THREE.PointLight("#ff8a3c", 30, 14, 1.6); at(pl, x - 1, 3, z);
    prop("stolen-fire", { title: "THE STOLEN FIRE", side: 1, z, at: z + 3.5, reach: 2.6, lines: [
      "Prometheus took fire from the gods and handed it to people who would build things with it.",
      "I took the name. The fire is on loan; I'm paying it back in projects."] });
  }

  /* ---------- LIBRARY: a white rabbit that is late ---------- */
  {
    const lib = chamber("LIBRARY"), white = lam({ color: "#f1ece0" }), g = new THREE.Group();
    at(box(.34, .3, .5, white), 0, .25, 0, g); at(box(.24, .24, .26, white), 0, .46, -.3, g);
    for (const s of [-1, 1]) at(box(.07, .3, .07, white), s * .07, .72, -.26, g);
    at(box(.12, .12, .04, goldM), .2, .3, -.1, g);                       // pocket watch
    g.visible = false; scene.add(g);
    let next = 6, run = -1;
    anim.push((t, dt, st) => {
      if (run < 0) { if (t > next && st.hall && Math.abs(st.pos.z - (lib.start - 14)) < 16) { run = 0; g.visible = true; } return; }
      run += dt / 2.2; const dir = Math.floor(next) % 2 ? 1 : -1;
      g.position.set(dir * (-8 + run * 16), Math.abs(Math.sin(run * 22)) * .35, lib.start - 9 - run * 8); g.rotation.y = dir > 0 ? -Math.PI / 2 - .4 : Math.PI / 2 + .4;
      if (run >= 1) { run = -1; g.visible = false; next = t + 14 + Math.random() * 12; }
    });
  }

  /* ---------- ARMORY: a box that may contain a cat ---------- */
  {
    const z = chamber("ARMORY").start - 7, x = 6.4, cat = new THREE.Group(), fur = lam({ color: "#2a2430" });
    at(box(1.3, 1, 1.3, wood), x, .5, z);
    const lid = at(box(1.4, .14, 1.4, dark), x, 1.07, z);
    at(box(.4, .34, .5, fur), 0, .17, 0, cat); at(box(.3, .28, .28, fur), 0, .42, -.22, cat);
    for (const s of [-1, 1]) at(box(.08, .12, .08, fur), s * .1, .6, -.22, cat);
    for (const s of [-1, 1]) at(box(.05, .05, .02, basic({ color: "#7dff9a" })), s * .07, .45, -.37, cat);
    cat.position.set(x, 1.02, z); cat.rotation.y = Math.PI / 2; cat.visible = false; scene.add(cat);
    let open = false, opens = 0;
    const o = prop("the-box", { title: "A SEALED BOX", side: 1, z, at: z + 3.5, reach: 2.4,
      lines: ["A box. Until you look, the cat inside is in a superposition of here and elsewhere."] });
    o.action = ["OPEN THE BOX", () => {
      open = !open; lid.position.set(x + (open ? .9 : 0), open ? .6 : 1.07, z); lid.rotation.z = open ? -1.1 : 0;
      const here = open && Math.random() < .5; cat.visible = here;
      if (open) { opens++; o.lines = [here ? "You looked. The cat is here, and unimpressed." : "You looked. Empty: the wavefunction collapsed the other way.", `Measurements so far: ${opens}. Close it to reset the experiment.`]; o.action[0] = "CLOSE THE BOX"; blip(here ? [660, 880] : [330, 220]); if (opens === 1) addXp(20, "Ran a measurement"); }
      else { o.lines = ["Sealed again. The cat is back to being a maybe."]; o.action[0] = "OPEN THE BOX"; }
      refreshPanel();
    }];
  }

  /* ---------- VAULT: chests and a gold pile ---------- */
  {
    const v = chamber("VAULT"), r = rng(404);
    for (let k = 0; k < 5; k++) {
      const s = k % 2 ? 1 : -1, z = v.start - 6 - k * 6.5, x = s * 7.6;
      at(box(1.6, .9, 1.1, wood), x, .45, z); at(box(1.7, .3, 1.2, dark), x, 1.0, z); at(box(.24, .3, .1, goldM), x - s * .0, .8, z + .58);
      for (let i = 0; i < 6; i++) at(box(.3, .12, .3, goldM), x - s * (1.3 + r() * .9), .06 + (i % 3) * .12, z + (r() - .5) * 1.4);
    }
  }

  /* ---------- TAVERN: jukebox, sword in the stone, tables ---------- */
  let swordInStone, swordTaken = store.get("prom-sword", false);
  {
    const tv = chamber("TAVERN"), z0 = tv.start;
    // tables and stools
    for (const [x, z] of [[-6.2, z0 - 21], [6.4, z0 - 13]]) {
      at(box(2.2, .14, 1.4, wood), x, 1.2, z); for (const sx of [-.9, .9]) at(box(.14, 1.2, .14, dark), x + sx, .6, z);
      for (const sx of [-1.6, 1.6]) at(box(.5, .7, .5, dark), x + sx, .35, z);
      at(box(.22, .3, .22, goldM), x - .4, 1.42, z); at(flame(.5), x + .5, 1.3, z);
    }
    // jukebox
    const jz = z0 - 6, jx = 7.2, panelM = basic({ color: "#ff5a5a" }), bars = [];
    at(box(1.6, 3.0, 1.1, lam({ color: "#6a2a1a" })), jx, 1.5, jz); at(box(1.7, .5, 1.2, goldM), jx, 3.2, jz); at(box(.08, 1.6, .9, panelM), jx - .82, 2.0, jz);
    for (let k = 0; k < 5; k++) { const b = at(box(.06, .2, .12, basic({ color: "#ffd166" })), jx - .88, 1.5, jz - .32 + k * .16); bars.push(b); }
    const TRACKS = ["Linkin Park · the A Thousand Suns era", "Car Seat Headrest", "American Football", "Modern Baseball", "Merchant Ships"];
    const SCALE = [262, 294, 330, 392, 440, 523, 587, 659];
    let track = -1, playing = 0;
    const jb = prop("jukebox", { title: "THE JUKEBOX", side: 1, z: jz, at: jz + 3, reach: 2.6, lines: ["It only knows one listener's taste. Put a coin in."] });
    jb.action = ["NEXT TRACK", () => {
      track = (track + 1) % TRACKS.length; playing = 2.4;
      const r = rng(track * 97 + 13); blip(Array.from({ length: 8 }, () => SCALE[Math.floor(r() * SCALE.length)]), .14, .03);   // an original 8-note riff per slot
      jb.lines = [`Now playing: ${TRACKS[track]}.`, "The speaker can only manage eight square-wave notes, so use your imagination."]; refreshPanel();
    }];
    anim.push((t, dt) => { playing = Math.max(0, playing - dt); panelM.color.setHSL((t * .15) % 1, .8, playing ? .6 : .35); bars.forEach((b, k) => b.scale.y = 1 + (playing ? Math.abs(Math.sin(t * 9 + k * 1.7)) * 5 : 0)); });
    // sword in the stone
    const sz = z0 - 18, sx = 6.6;
    at(box(1.8, .9, 1.6, stoneM), sx, .45, sz); at(box(1.2, .4, 1.1, stoneM), sx, 1.1, sz);
    swordInStone = new THREE.Group();
    at(box(.14, 1.5, .05, steel), 0, .75, 0, swordInStone); at(box(.6, .1, .12, goldM), 0, 1.5, 0, swordInStone); at(box(.1, .36, .1, wood), 0, 1.72, 0, swordInStone);
    swordInStone.position.set(sx, 1.2, sz); swordInStone.rotation.z = .12; swordInStone.visible = !swordTaken; scene.add(swordInStone);
    const NEED = 6;
    const sw = prop("sword", { title: "THE SWORD IN THE STONE", side: 1, z: sz, at: sz + 3, reach: 2.6, lines: swordTaken ? ["An empty stone. You already carry the blade."] : [`Whoever has seen ${NEED} rooms of this castle may draw it.`] });
    sw.action = ["PULL THE SWORD", () => {
      if (swordTaken) return;
      if (seen.size < NEED) { sw.lines = [`It doesn't move. Rooms seen: ${seen.size} of ${NEED}. Come back when you've earned it.`]; blip([196, 147]); refreshPanel(); return; }
      swordTaken = true; store.set("prom-sword", true); swordInStone.visible = false; equip.sword = true; saveGear(); applyGear();
      sw.lines = ["It slides free like it was waiting. The Stonebound Blade is yours."]; blip([392, 523, 659, 784], .11); addXp(100, "Drew the sword from the stone"); refreshPanel(); renderBuild();
    }];
  }

  /* ---------- DUNGEON: a horseman with no head, seen only by lightning ---------- */
  let ghostRun = -1;
  {
    const gm = basic({ color: "#bfe0ff", transparent: true, opacity: .0, depthWrite: false }), g = new THREE.Group();
    at(box(.9, .9, 2.2, gm), 0, 1.7, 0, g); at(box(.45, 1.1, .5, gm), 0, 2.4, -1.15, g).rotation.x = .5; at(box(.42, .46, .9, gm), 0, 2.9, -1.7, g);
    for (const [x, z] of [[-.3, -.8], [.3, -.8], [-.3, .8], [.3, .8]]) at(box(.22, 1.3, .22, gm), x, .65, z, g);
    at(box(.66, .9, .4, gm), 0, 2.85, .1, g); at(box(.9, 1.0, .1, gm), 0, 2.7, .45, g);     // rider and cape, nothing above the collar
    at(box(.34, .34, .34, basic({ color: "#ff9a3c", transparent: true, opacity: 0 })), .5, 2.6, -.2, g);   // the lantern he carries instead
    g.rotation.y = -Math.PI / 2; scene.add(g);
    const d = chamber("DUNGEON");
    anim.push((t, dt, st) => {
      if (ghostRun < 0) { if (st.hall && st.flash > .9 && st.pos.z < d.start - 2 && Math.random() < .5) ghostRun = 0; else { gm.opacity = 0; g.children[g.children.length - 1].material.opacity = 0; return; } }
      ghostRun += dt / 2.6; const o = Math.sin(Math.min(1, ghostRun) * Math.PI) * .55;
      gm.opacity = o; g.children[g.children.length - 1].material.opacity = o * 1.6;
      g.position.set(-11 + ghostRun * 22, .2 + Math.abs(Math.sin(ghostRun * 30)) * .2, d.endZ + 3.2);
      if (ghostRun >= 1) { ghostRun = -1; if (!st.sawGhost) { st.sawGhost = true; addXp(30, "Saw the horseman"); } }
    });
  }

  /* ---------- coins along the hall ---------- */
  const coins = [], coinM = basic({ color: "#f2c14e" }), coinM2 = basic({ color: "#8a6424" });
  {
    const r = rng(2026), zs = ctx.hallRange;
    const N = 16; for (let k = 0; k < N; k++) {
      const g = new THREE.Group(); at(box(.5, .5, .1, coinM), 0, 0, 0, g); at(box(.2, .2, .12, coinM2), 0, 0, 0, g);
      g.position.set([0, -2.2, 2.2, 0][k % 4], 1.5, zs[0] - 8 - (k + r() * .6) * ((zs[0] - zs[1] - 30) / N)); scene.add(g); coins.push(g);
    }
  }
  let got = 0;
  const coinHud = $("coins"); const drawCoins = () => { coinHud.textContent = `◎ ${got}/${coins.length}`; }; drawCoins();
  anim.push((t, dt, st) => {
    for (const c of coins) {
      if (!c.visible) continue; c.rotation.y = t * 3; c.position.y = 1.5 + Math.sin(t * 2 + c.position.z) * .12;
      if (st.hall && Math.abs(st.pos.x - c.position.x) < 1.3 && Math.abs(st.pos.z - c.position.z) < 1.4) {
        c.visible = false; got++; drawCoins(); blip([988, 1319], .06); addXp(10);
        if (got === coins.length) { toast("ACHIEVEMENT", "Treasurer: every coin in the castle"); blip([523, 659, 784, 1047], .1); }
      }
    }
  });

  /* ---------- character build: one piece of gear per skill branch ---------- */
  const GEAR = PROM.GEAR, BR = PROM.BR, TREE = PROM.TREE;
  const equip = Object.assign({ staff: true, cloak: true, shield: true, helm: false, barding: true, sword: swordTaken }, store.get("prom-gear", {}));
  if (!swordTaken) equip.sword = false;
  const saveGear = () => store.set("prom-gear", equip);
  const hex = Object.fromEntries(BR.map(b => [b.k, b.hex]));
  const gear = {};
  {
    const mk = (id, parent) => { const g = new THREE.Group(); parent.add(g); gear[id] = g; return g; };
    const orbM = basic({ color: hex.ARCANA });
    let g = mk("staff", riderTop); at(box(.08, 2.0, .08, wood), -.22, .75, .34, g).rotation.z = .3; at(box(.24, .24, .24, orbM), -.52, 1.72, .34, g);
    anim.push((t) => orbM.color.set(hex.ARCANA).multiplyScalar(.7 + .3 * Math.sin(t * 3)));
    g = mk("cloak", riderTop); const cl = lam({ color: hex.SORCERY }); at(box(.82, 1.15, .08, cl), 0, .32, .3, g).rotation.x = .16; at(box(.9, .16, .52, cl), 0, .97, .02, g);
    g = mk("shield", riderTop); at(box(.1, .74, .62, lam({ color: hex.CRAFT })), -.63, .5, -.1, g); at(box(.12, .2, .2, goldM), -.66, .5, -.1, g);
    g = mk("helm", riderTop); const hm = lam({ color: "#9aa3b0" }); at(box(.72, .4, .72, hm), 0, 1.58, .02, g); at(box(.72, .3, .24, hm), 0, 1.24, .3, g); at(box(.08, .32, .06, hm), 0, 1.3, -.28, g); at(box(.12, .3, .5, lam({ color: hex.SMITHING })), 0, 1.9, .05, g);
    g = mk("barding", rig.userData.horse); const bd = lam({ color: "#7a1818" }); at(box(1.03, .62, 1.5, bd), 0, 1.5, .35, g); at(box(1.05, .1, 1.52, lam({ color: hex.FORGING })), 0, 1.84, .35, g); at(box(1.05, .1, 1.52, lam({ color: hex.FORGING })), 0, 1.2, .35, g);
    const chan = box(.52, .12, .7, lam({ color: hex.FORGING })); chan.position.set(0, .3, -.05); rig.userData.head.add(chan); gear.barding.userData.extra = chan;
    g = mk("sword", riderTop); at(box(.07, .95, .05, steel), -.5, -.05, .2, g).rotation.x = .9; at(box(.26, .07, .09, goldM), -.5, .22, -.02, g).rotation.x = .9;
  }
  function applyGear() { for (const id in gear) { gear[id].visible = !!equip[id]; if (gear[id].userData.extra) gear[id].userData.extra.visible = !!equip[id]; } }
  applyGear();

  const branchStats = BR.map((b, ci) => { const col = TREE.map(row => row[ci]); return { ...b, learned: col.filter(c => c[2] === "u"), grinding: col.filter(c => c[2] === "g"), locked: col.filter(c => c[2] === "l"), total: col.length }; });
  function renderBuild() {
    const xp = ctx.xp(), lvl = 1 + Math.floor(xp / 150);
    $("buildbody").innerHTML = `<div class="bhead"><div><b class="px">PROMDOM</b><br>Physicist-Engineer · level ${lvl}</div><div class="bxp px">${xp} XP · ${seen.size} ROOMS · ${got}/${coins.length} COINS</div></div>` +
      branchStats.map((b) => { const gr = GEAR.find(x => x.k === b.k), on = equip[gr.id];
        return `<div class="brow" style="--c:${b.hex}"><div class="bname px">${b.k}<small>${b.label}</small></div>
          <div class="bmid"><div class="bbar">${b.learned.map(() => "<i class='u'></i>").join("")}${b.grinding.map(() => "<i class='g'></i>").join("")}${b.locked.map(() => "<i></i>").join("")}</div>
          <div class="bperk">${b.learned.map(c => c[1]).join(" · ")}${b.grinding.length ? ` · <em>grinding: ${b.grinding.map(c => c[1]).join(", ")}</em>` : ""}</div>
          <div class="bgear"><b>${gr.name}</b> — ${gr.perk}</div></div>
          <button class="bbtn px ${on ? "on" : ""}" data-g="${gr.id}">${on ? "EQUIPPED" : "EQUIP"}</button></div>`; }).join("") +
      `<div class="brow" style="--c:#b8c0cc"><div class="bname px">RELIC<small>Tavern</small></div><div class="bmid"><div class="bgear"><b>Stonebound Blade</b> — ${swordTaken ? "Drawn from the stone in the tavern." : "Still in the stone. See six rooms, then visit the tavern."}</div></div>
        <button class="bbtn px ${equip.sword ? "on" : ""}" data-g="sword" ${swordTaken ? "" : "disabled"}>${swordTaken ? (equip.sword ? "EQUIPPED" : "EQUIP") : "LOCKED"}</button></div>`;
    $("buildbody").querySelectorAll("[data-g]").forEach(b => b.onclick = () => { const id = b.dataset.g; equip[id] = !equip[id]; saveGear(); applyGear(); blip([equip[id] ? 660 : 330]); renderBuild(); });
  }

  /* ---------- map / quick travel ---------- */
  function renderMap() {
    const col = (title, list) => `<div class="mcol"><h4 class="px">${title}</h4>${list.map(([k, n, sub]) => `<button class="mbtn ${seen.has(n) ? "seen" : ""}" data-room="${k}"><span class="px">${n}</span>${sub ? `<small>${sub}</small>` : ""}</button>`).join("")}</div>`;
    $("mapbody").innerHTML = col("THE CASTLE", ctx.mapHall()) + col("THE ROAD FROM KASHI", ctx.mapRoad()) +
      `<div class="mcol"><h4 class="px">SECRETS</h4><p>${[["A fire on loan", props["stolen-fire"]], ["A box with a maybe-cat", props["the-box"]], ["A jukebox", props.jukebox], ["A sword in a stone", props.sword]].map(([n, p]) => `${ctx.touched.has(p) ? "✓" : "?"} ${ctx.touched.has(p) ? n : "?????"}`).join("<br>")}<br>${ctx.state.sawGhost ? "✓ A rider with no head" : "? ?????"}</p>
       <button class="mbtn" id="snd"><span class="px">SOUND: ${soundOn ? "ON" : "OFF"}</span></button></div>`;
    $("mapbody").querySelectorAll("[data-room]").forEach(b => b.onclick = () => { closeAll(); ctx.warp(b.dataset.room); });
    $("snd").onclick = () => { soundOn = !soundOn; store.set("prom-sound", soundOn); blip([660]); renderMap(); };
  }
  const overlays = { map: renderMap, build: renderBuild };
  function open(id) { const was = $(id).classList.contains("on"); closeAll(); if (!was) { overlays[id](); $(id).classList.add("on"); } }
  function closeAll() { for (const id in overlays) $(id).classList.remove("on"); }
  $("bmap").onclick = () => open("map"); $("bbuild").onclick = () => open("build");
  document.querySelectorAll(".ovx").forEach(b => b.onclick = closeAll);
  for (const id in overlays) $(id).addEventListener("pointerdown", (e) => { if (e.target === $(id)) closeAll(); });

  /* ---------- konami: the horse catches fire (it's fine) ---------- */
  const KON = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"]; let kon = 0, fire = null;
  function onKey(k) {
    kon = k === KON[kon] ? kon + 1 : k === KON[0] ? 1 : 0;
    if (kon === KON.length) { kon = 0; if (!fire) { fire = new THREE.Group(); for (const [x, z] of [[-.32, -.9], [.32, -.9], [-.32, .9], [.32, .9]]) at(flame(.9), x, .1, z, fire); at(flame(1.2), 0, 1.6, 1.6, fire); rig.userData.horse.add(fire); addXp(50, "Fire mode: the horse is fine"); } else fire.visible = !fire.visible; blip([523, 659, 784, 1047, 1319], .07); }
    if (k === "m") open("map"); else if (k === "c") open("build"); else if (k === "escape") closeAll();
  }

  return { props, onKey, open, closeAll, isOpen: () => Object.keys(overlays).some(id => $(id).classList.contains("on")), update: (t, dt, st) => { for (const f of anim) f(t, dt, st); }, bonusXp: coins.length * 10 + 100 + 20 + 30 + 50, blip };
}
