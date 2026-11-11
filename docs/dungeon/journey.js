/* The road behind the wardrobe: Kashi → snow field → counting house → EV depot → quantum chip → Qant Labs.
   A second, open-air track far to the side of the castle hall. main.js teleports the rider here. */
export function buildJourney(ctx) {
  const { THREE, scene, tex, rng, box, lam, flame, placeBoard, C, GH } = ctx;
  const CX = 300, SEC = 50;
  const anim = [];
  const basic = (o) => new THREE.MeshBasicMaterial(o);
  const phong = (o) => new THREE.MeshPhongMaterial(o);
  const at = (m, x, y, z) => { m.position.set(CX + x, y, z); scene.add(m); return m; };
  const cyl = (rt, rb, h, seg, mat) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  const cone = (r, h, seg, mat) => new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat);
  const plane = (w, h, mat) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  const noise = (base, cols, n, seed, size = 64) => (rep) => tex(size, size, (g) => {
    const r = rng(seed); g.fillStyle = base; g.fillRect(0, 0, size, size);
    for (let i = 0; i < n; i++) { g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(Math.floor(r() * size), Math.floor(r() * size), 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 2)); }
  }, rep);

  const SECTIONS = [
    { name: "KASHI", xp: 150, sky: "#d9855a", amb: 1.7, sun: 1.1, ex: [
      { title: "KASHI · WHERE IT STARTED", color: "#d9822b", lines: [
        "Engineering Physics at IIT (BHU) Varanasi: B.Tech + M.Tech, class of 2027.",
        "Arrived in the Mining branch and earned a class change into Physics.",
        "Co-founded the Quantum Vertical at the Club of Programmers."] },
      { title: "THE ROAD AHEAD", color: "#d9822b", lines: [
        "Every stop on this road is work I did for someone else:",
        "a travel agency in the hills, an insolvency firm, an EV fleet, a quantum startup and a quantum lab."] },
    ]},
    { name: "SNOW FIELD", xp: 150, sky: "#b9cfe6", amb: 1.9, sun: 1.2, ex: [
      { title: "SHIVA TOURS & TRAVELS", color: "#5b8fd9", lines: [
        "Designed and built the website for an Uttarakhand travel agency: Char Dham, Auli and the Himalayas.",
        "Paid in mountain trips instead of cash. Fair trade."],
        links: [["REPO", GH + "shiv-tour-and-travels"]] },
    ]},
    { name: "COUNTING HOUSE", xp: 150, sky: "#27484a", amb: 1.5, sun: .7, ex: [
      { title: "AARSH · THE COUNTING HOUSE", color: "#6f9a3a", lines: [
        "Freelance work for AARSH, an insolvency firm.",
        "Built the firm's website, plus automation around its filings: an IBBI data scraper and a Form G tool."],
        links: [["WEBSITE REPO", GH + "aarsh-website"], ["SCRAPER", GH + "ibbi-webscrapper-"]] },
    ]},
    { name: "EV DEPOT", xp: 200, sky: "#141d33", amb: 1.25, sun: .35, ex: [
      { title: "TRIEV · THE EV DEPOT", color: "#6f9a3a", lines: [
        "Work for TriEV, a two-wheeler EV fleet for gig riders in NCR.",
        "Replaced a manual Sheets process for rider incentives with n8n automation.",
        "Ran a WhatsApp referral campaign to about 5,000 riders and built a WhatsApp-native CRM with trigger words.",
        "QR-tagged repair parts as groundwork for inventory forecasting."],
        links: [["CRM REPO", GH + "triev-whatsapp-crm"]] },
    ]},
    { name: "QUANTUM CHIP", xp: 200, sky: "#080a1c", amb: 1.15, sun: .25, ex: [
      { title: "SILICOFELLER · THE QUANTUM CHIP", color: "#5b8fd9", lines: [
        "Quantum Research Intern at Silicofeller.",
        "Founding member of QuantumOS."] },
    ]},
    { name: "QANT LABS", xp: 250, sky: "#05060f", amb: 1.1, sun: .2, ex: [
      { title: "QANT LABS · QUANTUMTRACE", color: "#a66fd1", lines: [
        "Freelance build for Qant Labs: QuantumTrace, a 3D WebGL walk through quantum hardware, from the outer casing down to the dilution refrigerator.",
        "With a transport simulation: wavefunctions, transmission and potential landscapes."],
        links: [["REPO", GH + "quantumtrace"]] },
    ]},
  ];
  const exhibits = [];
  SECTIONS.forEach((s, i) => {
    s.start = -i * SEC; s.endZ = -(i + 1) * SEC; s.skyC = new THREE.Color(s.sky);
    s.ex.forEach((ex, j) => { ex.z = s.start - 15 - j * 13; ex.side = (i + j) % 2 ? 1 : -1; exhibits.push(ex); placeBoard(ex, CX, false); });
  });
  const Z_END = -SECTIONS.length * SEC;

  /* ---- shared helpers ---- */
  function ground(i, mk, x0 = -80, x1 = 80, rep = 8) {
    const w = x1 - x0, m = plane(w, SEC, lam({ map: mk([w / rep, SEC / rep]) }));
    m.rotation.x = -Math.PI / 2; at(m, (x0 + x1) / 2, 0, -i * SEC - SEC / 2);
  }
  function road(i, color, edge) {
    const m = plane(6, SEC, lam({ map: tex(32, 32, (g) => { g.fillStyle = color; g.fillRect(0, 0, 32, 32); g.fillStyle = edge; g.fillRect(0, 0, 2, 32); g.fillRect(30, 0, 2, 32); if (i === 3) { g.fillStyle = "#e6c84a"; g.fillRect(15, 4, 2, 12); } }, [1, SEC / 6]) }));
    m.rotation.x = -Math.PI / 2; at(m, 0, .03, -i * SEC - SEC / 2);
  }
  const bulbs = ["#ff5a5a", "#ffd166", "#6fd08c", "#6fb7ff", "#d58cff"].map(c => basic({ color: c }));
  bulbs.forEach((m, k) => { const base = m.color.clone(); anim.push((t) => m.color.copy(base).multiplyScalar(.45 + .55 * (Math.sin(t * 4 + k * 1.3) > 0 ? 1 : .2))); });
  function lights(x0, y0, z0, x1, y1, z1, n = 10) {
    for (let k = 0; k <= n; k++) { const f = k / n, sag = Math.sin(f * Math.PI) * .7; const b = box(.18, .18, .18, bulbs[k % 5]); at(b, x0 + (x1 - x0) * f, y0 + (y1 - y0) * f - sag, z0 + (z1 - z0) * f); }
  }
  const postM = lam({ color: "#4a2c18" });
  function gate(i, s) {
    const z = s.start - 1;
    for (const sx of [-5, 5]) at(box(.6, 9.6, .6, postM), sx, 4.8, z);
    at(box(11, .6, .6, postM), 0, 9.6, z);
    const sign = plane(8.4, 1.25, basic({ map: tex(504, 75, (g, w, h) => {
      g.fillStyle = C.goldd; g.fillRect(0, 0, w, h); g.fillStyle = "#1b1210"; g.fillRect(5, 5, w - 10, h - 10);
      g.font = "20px PS2P"; g.fillStyle = C.gold2; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(`${["I", "II", "III", "IV", "V", "VI"][i]} · ${s.name}`, w / 2, h / 2 + 2);
    }) })); at(sign, 0, 8.6, z + .35);
    lights(-5, 9.3, z + .4, 5, 9.3, z + .4, 14);
  }
  function billboard(src, x, z, ry, w = 8) {
    const h = w * 10 / 16, g = new THREE.Group(), mat = basic({ color: "#15131c" });
    new THREE.TextureLoader().load(src, (t) => { t.colorSpace = THREE.SRGBColorSpace; mat.map = t; mat.color.set("#ffffff"); mat.needsUpdate = true; });
    const f = box(w + .5, h + .5, .22, lam({ color: "#8a6424" })); f.position.y = 2 + h / 2; g.add(f);
    const p = plane(w, h, mat); p.position.set(0, 2 + h / 2, .12); g.add(p);
    for (const sx of [-w / 2 + .4, w / 2 - .4]) { const post = box(.3, 2, .3, postM); post.position.set(sx, 1, 0); g.add(post); }
    g.position.set(CX + x, 0, z); g.rotation.y = ry; scene.add(g);
  }
  function pine(x, z, h, snowy) {
    const g = new THREE.Group(), green = lam({ color: snowy ? "#2f5a3c" : "#2c5a2a" }), white = lam({ color: "#f2f6fb" });
    const tr = cyl(.25, .35, h * .3, 6, postM); tr.position.y = h * .15; g.add(tr);
    for (let k = 0; k < 3; k++) {
      const r = h * (.28 - k * .06), c = cone(r, h * .38, 7, green); c.position.y = h * (.42 + k * .2); g.add(c);
      if (snowy) { const s = cone(r * .62, h * .16, 7, white); s.position.y = h * (.53 + k * .2); g.add(s); }
    }
    g.position.set(CX + x, 0, z); g.rotation.y = x; scene.add(g);
  }

  /* ================= I · KASHI ================= */
  {
    const s = SECTIONS[0], z0 = s.start;
    ground(0, noise("#b89766", ["#a8875a", "#c9a877", "#9c7c50", "#d2b384"], 260, 41), -9.5, 80);
    road(0, "#8b6a45", "#6e5235");
    // the river and the ghats
    const water = tex(64, 64, (g) => { const r = rng(9); g.fillStyle = "#4a3f73"; g.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 90; i++) { g.fillStyle = ["#d9855a", "#e9a877", "#5b5391", "#3a3160", "#f2c14e"][Math.floor(r() * 5)]; g.fillRect(Math.floor(r() * 64), Math.floor(r() * 64), 4 + Math.floor(r() * 10), 1); } }, [8, 7]);
    const river = plane(70, SEC, basic({ map: water })); river.rotation.x = -Math.PI / 2; at(river, -50, -1.1, z0 - SEC / 2);
    anim.push((t) => { water.offset.y = t * .04; water.offset.x = Math.sin(t * .3) * .02; });
    const stepM = lam({ map: noise("#a8875a", ["#977850", "#b89766"], 120, 3)([1, 12]) });
    for (let k = 0; k < 4; k++) at(box(1.6, .5, SEC, stepM), -10.3 - k * 1.5, -.25 - k * .3, z0 - SEC / 2);
    const r = rng(404);
    for (let k = 0; k < 18; k++) { const f = flame(.8); at(f, -17 - r() * 30, -1, z0 - r() * SEC); const ph = r() * 6, bx = f.position.x; anim.push((t) => { f.position.y = -1.02 + Math.sin(t * 1.5 + ph) * .05; f.position.x = bx + Math.sin(t * .2 + ph) * .6; }); }
    // boats
    for (const [bx, bz] of [[-24, z0 - 14], [-34, z0 - 36]]) { const b = box(1.6, .6, 5, postM); at(b, bx, -.8, bz); anim.push((t) => { b.rotation.z = Math.sin(t + bz) * .05; }); }
    // temple spires
    const sand = lam({ color: "#c9824a" }), sand2 = lam({ color: "#b06f3c" }), gold = phong({ color: "#d4a24c", shininess: 90 });
    function spire(x, z, k) {
      at(box(5 * k, 3 * k, 5 * k, sand2), x, 1.5 * k, z);
      let y = 3 * k, w = 4.2 * k;
      for (let i = 0; i < 7; i++) { const h = 1.5 * k * (1 - i * .05); at(box(w, h, w, i % 2 ? sand2 : sand), x, y + h / 2, z); y += h; w *= .8; }
      at(cyl(.1, .55 * k, 1.2 * k, 6, gold), x, y + .6 * k, z);
      const fl = plane(1.4 * k, .8 * k, basic({ color: "#e8590c", side: THREE.DoubleSide })); at(fl, x + .8 * k, y + 1.6 * k, z); anim.push((t) => { fl.rotation.y = Math.sin(t * 3 + x) * .5; });
    }
    spire(30, z0 - 6, 1); spire(17, z0 - 42, .85); spire(38, z0 - 36, 1.2); spire(46, z0 - 16, 1.4);
    // college gateway across the road
    const zg = z0 - 33, stoneM = lam({ color: "#d8b98a" }), domeM = lam({ color: "#b5523a" });
    for (const sx of [-6.2, 6.2]) {
      at(box(2.6, 9, 2.6, stoneM), sx, 4.5, zg);
      at(new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), domeM), sx, 9, zg);
      at(cyl(.06, .12, 1.2, 5, gold), sx, 10.9, zg);
    }
    at(box(10, 1.8, 1.8, stoneM), 0, 8, zg);
    at(new THREE.Mesh(new THREE.SphereGeometry(1.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), domeM), 0, 8.9, zg);
    const sign = plane(8.6, 1.1, basic({ map: tex(516, 66, (g, w, h) => { g.fillStyle = "#5a2a1c"; g.fillRect(0, 0, w, h); g.font = "18px PS2P"; g.fillStyle = "#f2e2c0"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("IIT (BHU) · VARANASI", w / 2, h / 2 + 2); }) })); at(sign, 0, 8, zg + .92);
    for (const sx of [-4.2, 4.2]) for (let k = 0; k < 4; k++) { const zz = z0 - 6 - k * 7; at(box(.25, 3.4, .25, postM), sx, 1.7, zz); if (k) lights(sx, 3.3, zz + 7, sx, 3.3, zz, 7); }
    // the back of the wardrobe you came through
    at(box(3.8, 6.2, 1.2, lam({ color: "#3a2212" })), 0, 3.1, 22);   // well behind where the camera arrives

    // --- the temple: platform, steps, pillared hall, bells, lamps ---
    const tx = 19, tz = z0 - 21, dk = lam({ color: "#8f5a30" });
    at(box(13, 1, 11, sand2), tx, .5, tz);
    for (let k = 0; k < 3; k++) at(box(.8, .33 * (3 - k), 5, sand), tx - 6.9 - k * .8, .165 * (3 - k), tz);
    for (const px of [-5.2, -2.2]) for (const pz of [-4, 0, 4]) { at(cyl(.38, .45, 4.2, 8, sand), tx + px, 3.1, tz + pz); at(box(1.1, .3, 1.1, sand2), tx + px, 5.3, tz + pz); }
    at(box(5.6, .6, 10.4, sand2), tx - 3.7, 5.75, tz); at(box(4.4, .5, 9, sand), tx - 3.7, 6.3, tz);
    at(new THREE.Mesh(new THREE.SphereGeometry(1.6, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), sand2), tx - 3.7, 6.55, tz);
    at(box(6.4, 5, 6.4, sand), tx + 2.6, 3.5, tz);
    const door = plane(1.8, 3, basic({ color: "#2a1408" })); door.rotation.y = -Math.PI / 2; at(door, tx - .62, 2.5, tz);
    const lamp = plane(.9, .9, basic({ color: "#ffd166" })); lamp.rotation.y = -Math.PI / 2; at(lamp, tx - .64, 2.1, tz); anim.push((t) => lamp.material.color.setHSL(.11, 1, .6 + .12 * Math.sin(t * 9)));
    { let y = 6, w = 5.6; for (let i = 0; i < 9; i++) { const h = 1.5 * (1 - i * .04); at(box(w, h, w, i % 2 ? sand2 : sand), tx + 2.6, y + h / 2, tz); for (const [cx2, cz2] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) if (i < 6) at(box(w * .16, h * .7, w * .16, dk), tx + 2.6 + cx2 * w * .5, y + h * .35, tz + cz2 * w * .5); y += h; w *= .82; }
      at(cyl(.12, .7, 1.5, 6, gold), tx + 2.6, y + .75, tz); const fl = plane(1.8, 1, basic({ color: "#e8590c", side: THREE.DoubleSide })); at(fl, tx + 3.6, y + 2, tz); anim.push((t) => { fl.rotation.y = Math.sin(t * 3) * .5; }); }
    for (const pz of [-2, 0, 2]) { const bell = new THREE.Group(); const rope = box(.05, .9, .05, dk); rope.position.y = -.45; const b = cyl(.12, .3, .4, 8, gold); b.position.y = -1; bell.add(rope, b); bell.position.set(CX + tx - 5.9, 5.4, tz + pz); scene.add(bell); anim.push((t) => { bell.rotation.x = Math.sin(t * 2 + pz) * .25; }); }
    for (let k = 0; k < 8; k++) { const f = flame(.55); at(f, tx - 7.2 - (k % 3) * .8, .34 * (3 - (k % 3)) - .3 + .33, tz - 2.2 + k * .62); }
    lights(tx - 6.4, 5.5, tz - 5, tx - 6.4, 5.5, tz + 5, 12);
    // --- parasols on the ghat ---
    const par = lam({ color: "#d8b377" }), bamboo = lam({ color: "#8a6a3c" });
    for (let k = 0; k < 6; k++) { const pz = z0 - 5 - k * 8.2, px = -11.2 - (k % 2) * 1.4, py = -.3 - (k % 2) * .3; at(cyl(.06, .06, 2.6, 5, bamboo), px, py + 1.3, pz); const c = cone(1.5, .45, 9, par); at(c, px, py + 2.7, pz); c.rotation.z = (k % 3 - 1) * .12; at(box(1.2, .2, .9, lam({ color: "#7a4a2c" })), px, py + .1, pz); }
    // --- chai stall ---
    const sx = 9.5, sz = z0 - 7, stripes = tex(32, 8, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#f2e2c0" : "#b83232"; g.fillRect(i * 4, 0, 4, 8); } });
    at(box(3.6, 1.1, 1.4, lam({ color: "#6b4226" })), sx, .55, sz);
    for (const [ax, az] of [[-1.7, -.9], [1.7, -.9], [-1.7, .9], [1.7, .9]]) at(box(.14, 3, .14, bamboo), sx + ax, 1.5, sz + az);
    const aw = plane(4.2, 2.6, lam({ map: stripes, side: THREE.DoubleSide })); aw.rotation.x = -Math.PI / 2 + .22; aw.rotation.z = Math.PI / 2; at(aw, sx - .3, 3.05, sz); 
    for (let k = 0; k < 5; k++) at(box(.3, .42, .3, lam({ color: ["#d9822b", "#e6c84a", "#6f9a3a", "#b83232", "#ecd9a8"][k] })), sx - 1.3 + k * .62, 1.31, sz - .3);
    at(cyl(.22, .28, .4, 8, lam({ color: "#9aa3ad" })), sx + 1.1, 1.3, sz + .35);
    const csign = plane(2.4, .6, basic({ map: tex(96, 24, (g) => { g.fillStyle = "#1b1210"; g.fillRect(0, 0, 96, 24); g.font = "12px PS2P"; g.fillStyle = "#f2c14e"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("CHAI", 48, 13); }) })); csign.rotation.y = -Math.PI / 2; at(csign, sx - 1.82, 2.5, sz);
    for (let k = 0; k < 5; k++) { const m = basic({ color: "#ffffff", transparent: true }), st = box(.14, .14, .14, m); at(st, sx + 1.1, 1.6, sz + .35); anim.push((t) => { const u = (t * .5 + k / 5) % 1; st.position.y = 1.6 + u * 1.5; st.position.x = CX + sx + 1.1 + Math.sin(u * 5 + k) * .15; m.opacity = .7 * (1 - u); }); }
    // --- a cow that has decided the road is hers ---
    { const cw = lam({ color: "#efe7d6" }), cb = lam({ color: "#6b4a2f" }), g = new THREE.Group();
      const body = box(1.1, .9, 2, cw); body.position.y = .65; const head = box(.6, .6, .7, cw); head.position.set(0, 1.05, -1.25); const nose = box(.5, .3, .2, lam({ color: "#e0a8a0" })); nose.position.set(0, .92, -1.65);
      const patch = box(1.12, .5, .7, cb); patch.position.set(0, .8, .3); g.add(body, head, nose, patch);
      for (const hx of [-.28, .28]) { const h = box(.1, .3, .1, cb); h.position.set(hx, 1.45, -1.2); g.add(h); }
      for (const [lx, lz] of [[-.4, -.75], [.4, -.75], [-.4, .75], [.4, .75]]) { const l = box(.26, .3, .5, cw); l.position.set(lx, .15, lz); g.add(l); }
      const tail = box(.08, .7, .08, cb); tail.position.set(0, .7, 1.05); g.add(tail); anim.push((t) => { tail.rotation.z = Math.sin(t * 2.5) * .5; head.rotation.y = Math.sin(t * .6) * .3; });
      g.position.set(CX + 4.6, 0, z0 - 41); g.rotation.y = 1.9; scene.add(g); }
  }

  /* ================= II · SNOW FIELD ================= */
  {
    const s = SECTIONS[1], z0 = s.start;
    ground(1, noise("#e9f0f7", ["#dbe6f1", "#f7fbff", "#cfdcea"], 220, 14));
    road(1, "#c9d3de", "#aab6c4");
    const r = rng(1213);
    for (let k = 0; k < 26; k++) { const side = k % 2 ? 1 : -1; pine(side * (11 + r() * 40), z0 - 2 - r() * (SEC - 4), 5 + r() * 5, true); }
    const rock = lam({ color: "#8795ac" }), snow = lam({ color: "#f4f8fc" });
    for (const [mx, mz, mr, mh] of [[-62, z0 - 10, 26, 46], [-70, z0 - 38, 34, 62], [60, z0 - 20, 30, 56], [72, z0 - 44, 26, 44], [48, z0 - 2, 18, 30]]) {
      const m = cone(mr, mh, 6, rock); at(m, mx, mh / 2 - 1, mz); m.rotation.y = mx;
      const c = cone(mr * .42, mh * .42, 6, snow); at(c, mx, mh * .79 - 1 + .2, mz); c.rotation.y = mx;
    }
    // rolling hills in front of the peaks
    const hillM = lam({ color: "#eef3f9" }), hillM2 = lam({ color: "#dfe8f2" });
    for (const [hx, hz, hr, hh] of [[-30, z0 - 20, 16, 7], [-42, z0 - 26, 22, 11], [-27, z0 - 44, 14, 6], [-55, z0 - 46, 20, 13], [31, z0 - 19, 15, 6.5], [44, z0 - 30, 22, 12], [28, z0 - 46, 13, 5.5], [58, z0 - 24, 20, 10], [-20, z0 - 30, 8, 3], [22, z0 - 26, 7, 2.6]]) {
      const hgeo = new THREE.SphereGeometry(hr, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), hm = new THREE.Mesh(hgeo, (hx + hz) % 2 ? hillM : hillM2); hm.scale.y = hh / hr; at(hm, hx, -.2, hz);
      for (let k = 0; k < 3; k++) { const a = hx * 1.7 + k * 2.1, d = hr * (.25 + k * .2); const yy = (hh / hr) * Math.sqrt(Math.max(0, hr * hr - d * d)); const g = new THREE.Group(), green = lam({ color: "#2f5a3c" });
        const c1 = cone(1.1, 3, 6, green); c1.position.y = 1.8; const c2 = cone(.6, 1.1, 6, hillM); c2.position.y = 3; g.add(c1, c2); g.position.set(CX + hx + Math.cos(a) * d, yy - .4, hz + Math.sin(a) * d); scene.add(g); }
    }
    // the Shiva Tours shop, open to the road, with a kettle on
    { const sx = -11.5, sz = z0 - 13, wd = lam({ color: "#7a4a2c" }), wd2 = lam({ color: "#5a3520" });
      at(box(4, 3.4, 6, wd), sx - 1, 1.7, sz); at(box(1.2, 1.1, 5.2, wd2), sx + 1.7, .55, sz);
      const rf = box(6.6, .35, 7.2, snow); rf.rotation.z = -.14; at(rf, sx - .2, 3.75, sz);
      const stripes = tex(32, 8, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#f4f4f4" : "#2f6b4f"; g.fillRect(i * 4, 0, 4, 8); } });
      const aw = plane(5.6, 2.2, lam({ map: stripes, side: THREE.DoubleSide })); aw.rotation.x = -Math.PI / 2; aw.rotation.y = -.3; at(aw, sx + 2.2, 3.05, sz);
      for (const pz of [-2.7, 2.7]) at(box(.14, 3, .14, wd2), sx + 3.1, 1.5, sz + pz);
      const sg = plane(5.6, 1, basic({ map: tex(280, 50, (g, w, h) => { g.fillStyle = "#1f4a3a"; g.fillRect(0, 0, w, h); g.fillStyle = "#ff9a3c"; g.fillRect(0, h - 5, w, 5); g.font = "12px PS2P"; g.fillStyle = "#ffffff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("SHIVA TOURS & TRAVELS", w / 2, h / 2); }) })); sg.rotation.y = Math.PI / 2; at(sg, sx + 1.02, 3.0, sz);
      const win = plane(2.6, 1.3, basic({ color: "#ffd98a" })); win.rotation.y = Math.PI / 2; at(win, sx + 1.02, 1.9, sz);
      ["#d14b3f", "#3f6fd1", "#e6c84a", "#3fa35a"].forEach((c, k) => at(box(.7, .9, .6, lam({ color: c })), sx + 3 + (k % 2) * .2, .45, sz + 3.6 + k * .8));   // backpacks
      for (const k of [0, 1]) { const ski = box(.14, 2.6, .06, lam({ color: k ? "#d14b3f" : "#3f6fd1" })); ski.rotation.z = .18; at(ski, sx + 1.25, 1.3, sz - 3.3 - k * .3); }
      at(cyl(.2, .26, .36, 8, lam({ color: "#9aa3ad" })), sx + 1.7, 1.3, sz - 1.6);
      for (let k = 0; k < 5; k++) { const m = basic({ color: "#ffffff", transparent: true }), st = box(.14, .14, .14, m); at(st, sx + 1.7, 1.6, sz - 1.6); anim.push((t) => { const u = (t * .5 + k / 5) % 1; st.position.y = 1.6 + u * 1.6; st.position.x = CX + sx + 1.7 + Math.sin(u * 5 + k) * .15; m.opacity = .8 * (1 - u); }); }
      const f = flame(.9); at(f, sx + 3.1, 3.05, sz - 2.7); }
    // cabin
    const cabinM = lam({ color: "#6b4226" });
    at(box(6, 3.4, 5, cabinM), 14, 1.7, z0 - 34);
    const roof = cone(4.9, 2.6, 4, snow); roof.rotation.y = Math.PI / 4; at(roof, 14, 4.7, z0 - 34);
    at(plane(1.2, 1.2, basic({ color: "#ffd166" })), 14, 1.9, z0 - 31.48); at(box(.7, 1.6, .7, lam({ color: "#5e5248" })), 15.6, 5, z0 - 35);
    // prayer flags across the road
    for (const zz of [z0 - 10, z0 - 27]) {
      for (const sx of [-6, 6]) at(box(.2, 5.6, .2, postM), sx, 2.8, zz);
      const cols = ["#3f6fd1", "#f4f4f4", "#d14b3f", "#3fa35a", "#e6c84a"];
      for (let k = 0; k < 15; k++) { const f = (k + .5) / 15, fl = plane(.6, .75, basic({ color: cols[k % 5], side: THREE.DoubleSide })); at(fl, -6 + 12 * f, 5.1 - Math.sin(f * Math.PI) * .9, zz); anim.push((t) => { fl.rotation.x = Math.sin(t * 3 + k) * .35; }); }
    }
    // snowman
    for (const [y, rr] of [[.8, .9], [2.0, .65], [2.9, .45]]) at(new THREE.Mesh(new THREE.SphereGeometry(rr, 10, 8), snow), -9, y, z0 - 40);
    const nose = cone(.1, .5, 5, lam({ color: "#e8590c" })); nose.rotation.z = -Math.PI / 2; at(nose, -8.5, 2.9, z0 - 40);
    billboard("shots/shiva-tours.jpg", -9.5, z0 - 31, .75, 7.5);
    // snowfall
    const N = 900, p = new Float32Array(N * 3), geo = new THREE.BufferGeometry();
    for (let k = 0; k < N; k++) p.set([CX + (r() - .5) * 90, r() * 30, z0 - r() * SEC], k * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: "#ffffff", size: 2, sizeAttenuation: false })); pts.frustumCulled = false; scene.add(pts);
    anim.push((t, dt) => { pts.visible = ctx.pos().x > 100 && ctx.pos().z < z0 + 22; if (!pts.visible) return; for (let k = 0; k < N; k++) { let y = p[k * 3 + 1] - dt * (2.5 + (k % 5) * .5); if (y < 0) y += 30; p[k * 3 + 1] = y; p[k * 3] += Math.sin(t + k) * dt * .4; } geo.attributes.position.needsUpdate = true; });
  }

  /* ================= III · COUNTING HOUSE (AARSH) ================= */
  {
    const s = SECTIONS[2], z0 = s.start;
    ground(2, (rep) => tex(32, 32, (g) => { g.fillStyle = "#d8cfae"; g.fillRect(0, 0, 32, 32); g.fillStyle = "#2f5a4a"; g.fillRect(0, 0, 16, 16); g.fillRect(16, 16, 16, 16); g.fillStyle = "#00000022"; g.fillRect(0, 0, 32, 1); g.fillRect(0, 16, 32, 1); }, rep), -80, 80, 4);
    road(2, "#7a2a2a", "#d4a24c");
    // the adding machine
    const mx = 12.5, mz = z0 - 30, body = lam({ color: "#2f4a3a" }), brass = phong({ color: "#c79a3a", shininess: 110, specular: "#fff3c4" }), cream = lam({ color: "#ecd9a8" });
    at(box(7, 4.2, 9, body), mx, 2.1, mz); at(box(7.4, .5, 9.4, brass), mx, .25, mz); at(box(5, 1.4, 7, body), mx + .6, 4.9, mz);
    const r = rng(77);
    for (let row = 0; row < 4; row++) for (let col = 0; col < 7; col++) {
      const k = box(.5, .55, .7, cream), x0 = mx - 3.6; at(k, x0, 1 + row * .85, mz - 3.3 + col * 1.1);
      const ph = r() * 20, sp = 2 + r() * 4; anim.push((t) => { k.position.x = CX + x0 + (Math.sin(t * sp + ph) > .93 ? .28 : 0); });
    }
    const display = plane(6.4, 1, basic({ map: tex(256, 40, (g, w, h) => { g.fillStyle = "#12210f"; g.fillRect(0, 0, w, h); g.font = "20px PS2P"; g.fillStyle = "#7dff8a"; g.textBaseline = "middle"; g.fillText("ASSETS = CLAIMS", 10, h / 2 + 2); }) }));
    display.rotation.y = -Math.PI / 2; at(display, mx - 1.92, 5, mz);
    const tape = tex(32, 128, (g) => { const rr = rng(5); g.fillStyle = "#f6f0dc"; g.fillRect(0, 0, 32, 128); g.fillStyle = "#3b2614"; for (let y = 4; y < 128; y += 8) g.fillRect(4, y, 8 + Math.floor(rr() * 18), 2); g.fillStyle = "#b83232"; g.fillRect(4, 60, 22, 2); }, [1, 1]);
    const tp = plane(1.8, 7, basic({ map: tape, side: THREE.DoubleSide })); tp.rotation.y = -Math.PI / 2; at(tp, mx + .6, 9, mz + 1.5); anim.push((t) => { tape.offset.y = -t * .15; });
    const crank = new THREE.Group(); const arm = box(.25, 2.2, .25, brass); arm.position.y = 1.1; const knob = box(.5, .5, .9, lam({ color: "#8b1e1e" })); knob.position.set(0, 2.2, .4); crank.add(arm, knob);
    crank.position.set(CX + mx, 2.6, mz + 4.6); scene.add(crank); anim.push((t) => { crank.rotation.z = t * 1.4; });
    for (const [gx, gy, gz, gr, sp] of [[mx - 3.7, 5.6, mz - 2.4, 1.3, 1], [mx - 3.7, 7.3, mz - .9, .9, -1.45], [mx - 3.7, 5.9, mz + 2.2, 1.1, 1.2]]) {
      const g = new THREE.Group(); const disc = cyl(gr, gr, .3, 14, brass); disc.rotation.z = Math.PI / 2; g.add(disc);
      for (let k = 0; k < 10; k++) { const tooth = box(.3, .34, .34, brass), a = k / 10 * Math.PI * 2; tooth.position.set(0, Math.cos(a) * (gr + .12), Math.sin(a) * (gr + .12)); tooth.rotation.x = a; g.add(tooth); }
      g.position.set(CX + gx, gy, gz); scene.add(g); anim.push((t) => { g.rotation.x = t * sp; });
    }
    // ledgers and coins on the other side
    const led = ["#8b1e1e", "#35507d", "#2f5a4a", "#5a3a6a"].map(c => lam({ color: c }));
    for (let k = 0; k < 9; k++) { const b = box(2.2, .45, 1.6, led[k % 4]); at(b, -11 + (k % 3) * 2.6, .25 + Math.floor(k / 3) * .47 + (k % 3 === 1 ? .47 : 0), z0 - 34 - (k % 2) * .3); b.rotation.y = (k * 37 % 10) / 30; }
    for (let k = 0; k < 7; k++) { const h = .4 + (k * 53 % 7) * .22; at(cyl(.45, .45, h, 12, brass), -9 - (k % 4) * 1.1, h / 2, z0 - 41 - Math.floor(k / 4) * 1.2); }
    for (const zz of [z0 - 12, z0 - 38]) for (const sx of [-4.4, 4.4]) { at(box(.25, 3.2, .25, brass), sx, 1.6, zz); const f = flame(1); at(f, sx, 3.2, zz); }
  }

  /* ================= IV · EV DEPOT (TriEV) ================= */
  {
    const s = SECTIONS[3], z0 = s.start;
    ground(3, noise("#23262e", ["#2b2f38", "#1c1f26", "#343946"], 200, 31));
    road(3, "#30343e", "#e6c84a");
    const white = lam({ color: "#dfe4ea" }), dark = lam({ color: "#1b1d22" }), neon = basic({ color: "#5dff8a" });
    anim.push((t) => neon.color.setRGB(.25 + .12 * Math.sin(t * 3), .85 + .15 * Math.sin(t * 3), .45));
    function scooter(color) {
      const g = new THREE.Group(), body = lam({ color }), wheels = [];
      for (const z of [-.9, .9]) { const w = cyl(.42, .42, .2, 12, dark); w.rotation.z = Math.PI / 2; w.position.set(0, .42, z); g.add(w); wheels.push(w); }
      const deck = box(.5, .16, 1.5, body); deck.position.y = .5; g.add(deck);
      const rear = box(.55, .5, .8, body); rear.position.set(0, .85, .75); g.add(rear);
      const seat = box(.5, .14, .9, dark); seat.position.set(0, 1.18, .6); g.add(seat);
      const stem = box(.12, 1.2, .12, white); stem.position.set(0, 1.05, -.85); stem.rotation.x = -.25; g.add(stem);
      const bar = box(.9, .1, .1, dark); bar.position.set(0, 1.62, -.7); g.add(bar);
      const lamp = box(.2, .2, .1, basic({ color: "#fff6c9" })); lamp.position.set(0, 1.35, -1.02); g.add(lamp);
      g.userData.wheels = wheels; scene.add(g); return g;
    }
    // chargers with parked scooters
    for (let k = 0; k < 3; k++) {
      const zz = z0 - 12 - k * 9;
      at(box(.9, 2.8, .7, white), 9.5, 1.4, zz); const sc = plane(.6, .9, neon); sc.rotation.y = -Math.PI / 2; at(sc, 9.04, 2, zz);
      at(box(.5, .12, .12, neon), 8.9, 2.75, zz);
      const p = scooter(["#5b8fd9", "#e6c84a", "#b83232"][k]); p.position.set(CX + 7.6, 0, zz + 1.6); p.rotation.y = -.5;
    }
    // one doing laps on the service road
    const lap = scooter("#6f9a3a"); anim.push((t) => { const u = (t * .12) % 1, f = u < .5 ? u * 2 : 2 - u * 2; lap.position.set(CX - 12, 0, z0 - 4 - f * (SEC - 8)); lap.rotation.y = u < .5 ? 0 : Math.PI; for (const w of lap.userData.wheels) w.rotation.x = t * 9; });
    // phone kiosk with chat bubbles drifting up (the WhatsApp CRM)
    const kz = z0 - 33; at(box(1.8, 3.2, .3, dark), -8.5, 1.9, kz).rotation.y = .7;
    const scr = plane(1.5, 2.8, basic({ map: tex(48, 90, (g) => { g.fillStyle = "#0e1a14"; g.fillRect(0, 0, 48, 90); for (let y = 6, k = 0; y < 84; y += 13, k++) { g.fillStyle = k % 2 ? "#5dff8a" : "#e9efe9"; g.fillRect(k % 2 ? 14 : 4, y, 30, 9); } }) })); scr.rotation.y = .7; at(scr, -8.5 + .11, 1.9, kz + .13);
    const bub = (c) => basic({ transparent: true, side: THREE.DoubleSide, map: tex(48, 28, (g) => { g.fillStyle = c; g.fillRect(2, 0, 44, 22); g.fillRect(6, 22, 6, 6); g.fillStyle = "#00000066"; g.fillRect(8, 6, 30, 3); g.fillRect(8, 13, 20, 3); }) });
    for (let k = 0; k < 6; k++) { const m = bub(k % 2 ? "#5dff8a" : "#f2f2f2"), b = plane(1.5, .88, m); b.rotation.y = .7; at(b, -8.2, 0, kz + .4);
      anim.push((t) => { const u = ((t * .22 + k / 6) % 1); b.position.y = 3.6 + u * 5; b.position.x = CX - 8.2 + (k % 2 ? .9 : -.5) + Math.sin(u * 6 + k) * .2; m.opacity = u < .1 ? u * 10 : 1 - Math.max(0, (u - .6) / .4); }); }
    // QR-tagged parts crate
    const qr = lam({ map: tex(21, 21, (g) => { const r = rng(88); g.fillStyle = "#fff"; g.fillRect(0, 0, 21, 21); g.fillStyle = "#000"; for (let y = 1; y < 20; y++) for (let x = 1; x < 20; x++) if (r() > .5) g.fillRect(x, y, 1, 1); for (const [x, y] of [[1, 1], [13, 1], [1, 13]]) { g.fillStyle = "#000"; g.fillRect(x, y, 7, 7); g.fillStyle = "#fff"; g.fillRect(x + 1, y + 1, 5, 5); g.fillStyle = "#000"; g.fillRect(x + 2, y + 2, 3, 3); } }) });
    at(box(1.6, 1.6, 1.6, [qr, qr, lam({ color: "#8a6a3c" }), lam({ color: "#8a6a3c" }), qr, qr]), -7.2, .8, z0 - 43).rotation.y = .5;
    at(box(1.2, 1.2, 1.2, lam({ color: "#8a6a3c" })), -9, .6, z0 - 44.2);
    // street lamps
    for (const zz of [z0 - 6, z0 - 24, z0 - 42]) for (const sx of [-4.6, 4.6]) { at(box(.2, 5.5, .2, dark), sx, 2.75, zz); at(box(1.2, .14, .3, neon), sx - Math.sign(sx) * .5, 5.5, zz); }
    const pl = new THREE.PointLight("#5dff8a", 40, 40, 1.5); pl.position.set(CX, 6, z0 - 24); scene.add(pl);
  }

  /* ================= V · QUANTUM CHIP (Silicofeller) ================= */
  {
    const s = SECTIONS[4], z0 = s.start;
    ground(4, (rep) => tex(64, 64, (g) => { g.fillStyle = "#0b1712"; g.fillRect(0, 0, 64, 64); g.fillStyle = "#b8902f";
      for (const x of [6, 20, 38, 52]) g.fillRect(x, 0, 2, 64); for (const y of [10, 30, 50]) g.fillRect(0, y, 64, 1);
      for (const [x, y] of [[4, 8], [18, 28], [36, 48], [50, 8], [36, 28]]) { g.fillRect(x, y, 6, 6); g.fillStyle = "#0b1712"; g.fillRect(x + 2, y + 2, 2, 2); g.fillStyle = "#b8902f"; } }, rep));
    road(4, "#10241c", "#d4a24c");
    // pulses running along the traces
    const pm = basic({ color: "#7df9ff" });
    for (let k = 0; k < 26; k++) { const x = (k % 13 - 6) * 5.5 + 1.1, b = box(.3, .12, 1.2, pm); at(b, x, .08, z0); const off = (k * .37) % 1, dir = k % 2 ? 1 : -1; anim.push((t) => { const u = (t * .25 + off) % 1; b.position.z = z0 - (dir > 0 ? u : 1 - u) * SEC; }); }
    // the dilution refrigerator, hanging like a chandelier
    const gold = phong({ color: "#d9a441", shininess: 140, specular: "#fff1c2" }), copper = phong({ color: "#c0562a", shininess: 120, specular: "#ffd0a8" }), steel = lam({ color: "#3a3f4c" });
    const fx = 12, fz = z0 - 30;
    for (const [sx, sz] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) at(box(.4, 13, .4, steel), fx + sx, 6.5, fz + sz);
    at(box(10.6, .5, 10.6, steel), fx, 13, fz);
    const fridge = new THREE.Group(); fridge.position.set(CX + fx, 0, fz); scene.add(fridge);
    const levels = [[4.0, 11.2], [3.4, 9.4], [2.8, 7.7], [2.1, 6.1], [1.4, 4.7]];
    levels.forEach(([rad, y], i) => {
      const d = cyl(rad, rad, .22, 28, i % 2 ? copper : gold); d.position.y = y; fridge.add(d);
      const ny = i ? levels[i - 1][1] : 12.8;
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + i * .5, rr = rad * .78, rod = cyl(.05, .05, ny - y, 6, copper); rod.position.set(Math.cos(a) * rr, (ny + y) / 2, Math.sin(a) * rr); fridge.add(rod); }
    });
    const chip = box(.9, .25, .9, basic({ color: "#7df9ff" })); chip.position.y = 4.1; fridge.add(chip);
    anim.push((t) => { fridge.rotation.y = t * .12; chip.material.color.setHSL(.52, 1, .55 + .25 * Math.sin(t * 4)); });
    const fl = new THREE.PointLight("#ffd28a", 90, 30, 1.4); fl.position.set(CX + fx - 5, 7, fz + 4); scene.add(fl);
    // qubit lattice
    for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) { const m = basic({ color: "#7df9ff" }), q = box(.6, .6, .6, m); at(q, -8 - i * 1.9, 1.6, z0 - 22 - j * 2.6);
      anim.push((t) => { const v = .5 + .5 * Math.sin(t * 2 + i * 1.1 + j * .7); m.color.setHSL(.52 + v * .25, .9, .35 + v * .3); q.position.y = 1.6 + v * 1.4; q.rotation.y = t + i; }); }
    const r = rng(6), sp = []; for (let k = 0; k < 220; k++) sp.push(CX + (r() - .5) * 300, 20 + r() * 80, z0 - 60 - r() * 120);
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    const st = new THREE.Points(sg, new THREE.PointsMaterial({ color: "#cfd8ff", size: 2, sizeAttenuation: false, fog: false })); st.frustumCulled = false; scene.add(st);
    anim.push(() => { st.visible = ctx.pos().z < z0 + 30 && ctx.pos().x > 100; });
  }

  /* ================= VI · QANT LABS ================= */
  let backDoor;
  {
    const s = SECTIONS[5], z0 = s.start;
    ground(5, (rep) => tex(32, 32, (g) => { g.fillStyle = "#070912"; g.fillRect(0, 0, 32, 32); g.fillStyle = "#2a3d7a"; g.fillRect(0, 0, 32, 1); g.fillRect(0, 0, 1, 32); g.fillStyle = "#5b8fd9"; g.fillRect(0, 0, 2, 2); }, rep), -80, 80, 4);
    road(5, "#0d1124", "#a66fd1");
    // a wave packet meeting a barrier
    const NB = 64, bars = [], wx = -10.5, zA = z0 - 20, dz = .42, barrier = 40;
    const mats = [0, 1, 2, 3, 4, 5].map(k => basic({ color: new THREE.Color().setHSL(.55 + k * .06, .85, .6) }));
    for (let i = 0; i < NB; i++) { const b = box(1.6, 1, .3, mats[i % 6]); at(b, wx, .5, zA - i * dz); bars.push(b); }
    const wall = box(2.4, 5, .8, basic({ color: "#b83232", transparent: true, opacity: .55 })); at(wall, wx, 2.5, zA - barrier * dz);
    anim.push((t) => { const c = ((t * 9) % (NB + 24)) - 8, back = barrier - (c - barrier);
      for (let i = 0; i < NB; i++) {
        let a = Math.exp(-(((i - c) / 4) ** 2)) * (i > barrier ? .38 : 1);
        if (c > barrier && i <= barrier) a = Math.exp(-(((i - back) / 4) ** 2)) * .62;
        const h = .15 + a * 4.6 * (.75 + .25 * Math.sin(i * 1.3 - t * 12)); bars[i].scale.y = h; bars[i].position.y = h / 2;
      } });
    billboard("shots/quantumtrace.jpg", 10, z0 - 22, -.75, 8.5);
    billboard("shots/quantumtrace-2.jpg", 10, z0 - 34, -.75, 8.5);
    const pl = new THREE.PointLight("#a66fd1", 60, 40, 1.5); pl.position.set(CX, 6, z0 - 28); scene.add(pl);
    // the way back
    const dzz = Z_END + 1.5; at(box(4.4, 6.6, 1.2, lam({ color: "#3a2212" })), 0, 3.3, dzz - .5);
    const glow = plane(3, 5.4, basic({ color: "#ffd9a0" })); at(glow, 0, 3, dzz + .12); anim.push((t) => glow.material.color.setHSL(.09, 1, .72 + .1 * Math.sin(t * 3)));
    lights(-2.4, 6.9, dzz + .2, 2.4, 6.9, dzz + .2, 8); lights(-2.4, 6.6, dzz + .2, -2.4, .4, dzz + .2, 8); lights(2.4, 6.6, dzz + .2, 2.4, .4, dzz + .2, 8);
    backDoor = { title: "THE WAY BACK", lines: ["The wardrobe opens both ways. The castle is on the other side."], z: Z_END, side: 0, at: Z_END + 10, reach: 7 };
    exhibits.push(backDoor);
  }
  SECTIONS.forEach((s, i) => { if (i) gate(i, s); });

  const sun = new THREE.DirectionalLight("#fff2dc", 1); sun.position.set(CX - 40, 60, 30); sun.target.position.set(CX, 0, -100); scene.add(sun, sun.target); sun.visible = false;
  return { cx: CX, zMax: -2, zMin: Z_END + 8, sections: SECTIONS, exhibits, backDoor, sun, update(t, dt) { for (const f of anim) f(t, dt); } };
}
