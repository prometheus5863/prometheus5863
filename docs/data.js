/* Shared content for the 2D scroll site and the 3D dungeon. Edit here once. */
(() => {
const BR = [
  {k:"ARCANA",  label:"Quantum",  c:"var(--a1)", hex:"#5b8fd9"},
  {k:"SORCERY", label:"AI / ML",  c:"var(--a2)", hex:"#a66fd1"},
  {k:"CRAFT",   label:"Systems",  c:"var(--a3)", hex:"#6f9a3a"},
  {k:"SMITHING",label:"Silicon",  c:"var(--a4)", hex:"#d9822b"},
  {k:"FORGING", label:"Gamedev",  c:"var(--a5)", hex:"#d4a24c"},
];
// rows top→bottom (top = most advanced)
const TREE = [
 [["TBG","TBG–SC junctions","g","My M.Tech thesis: quantum transport in twisted bilayer graphene–superconductor junctions.","single-layer-graphene-structure"],
  ["LLM","Local memory model","l","Next for muse: a small local model that curates and groups its own memory graph.","muse-memory"],
  ["BOT","CRM automation","u","WhatsApp-based CRM and lead generation for a two-wheeler EV fleet.","triev-whatsapp-crm"],
  ["UVM","UVM testbenches","l","Locked: class-based verification with UVM. On the roadmap.","Design-Verification-Roadmap"],
  ["SL","Souls-like mobile","l","Locked: a souls-like built for phones. Dream boss fight.",""]],
 [["TX","Quantum transport","u","Transmission, wavefunction propagation, potential landscapes; rendered live in WebGL.","quantumtrace"],
  ["MEM","Agent memory graph","u","Embeddings → NetworkX over SQLite, community detection, multi-provider LLM fallback.","muse-memory"],
  ["3D","WebGL visualization","u","Real-time 3D physics visuals in the browser.","quantumtrace"],
  ["SV","SystemVerilog","g","Grinding now: RTL, assertions, and verification flows.","Design-Verification-Roadmap"],
  ["DD","Downtown Duel","u","Open-world creature battler: 9 zones, 61 animated monsters, lock-on combat.","downtown-duel"]],
 [["QT","QuTiP","u","Open quantum systems in Python. I keep a fork around for experiments.","qutip"],
  ["EEG","MNE + CNN1D","u","TMS-EEG preprocessing and artifact rejection: CNN1D F1 0.936, LaBraM variant F1 0.976.","invesalius-tep-gsoc2026"],
  ["WS","WebSockets","u","Live EEG streaming with async sessions and broadcast.","invesalius-tep-gsoc2026"],
  ["EMB","Embedded","u","Embedded C on microcontrollers.","embedded-systems-software"],
  ["GOD","Godot 4","u","Scenes, AI, animation trees; web export.","downtown-duel"]],
 [["PY","NumPy + SciPy","u","The spellbook every physicist carries.",""],
  ["PT","PyTorch","u","Training and evaluating signal models.","invesalius-tep-gsoc2026"],
  ["API","FastAPI","u","Async backends, deployed on Render.","invesalius-tep-gsoc2026"],
  ["C","C","u","Pointers, registers, and patience.","embedded-systems-software"],
  ["GD","GDScript","u","Godot's native tongue.","downtown-duel"]],
];
const QUESTS = [
 {r:"muse-memory",t:"Forge a Memory",b:"SORCERY",s:"ACTIVE",d:4,tags:["Python","NetworkX","SQLite","LLMs"],
  x:"Local-first agent memory graph plus a multi-provider LLM fallback router.",
  lore:"Local embeddings feed a NetworkX graph persisted in SQLite; community detection groups memories. When one provider fails, the router falls through to the next."},
 {r:"invesalius-tep-gsoc2026",t:"The Brain's Echo",b:"SORCERY",s:"CLEARED",d:5,tags:["Python","MNE","VTK","FastAPI"],
  x:"TMS-evoked potential visualization for InVesalius Navigator.",
  lore:"Three synchronized views: butterfly plot, topographic map, VTK cortical surface. Full MNE preprocessing. Artifact rejection: CNN1D F1 0.936, LaBraM variant F1 0.976. PR #1265 merged upstream.",
  demo:"https://invesalius-tep-gsoc2026.onrender.com/docs"},
 {r:"quantumtrace",t:"Trace the Wavefunction",b:"ARCANA",s:"CLEARED",d:4,tags:["JavaScript","WebGL","Physics"],
  x:"Real-time 3D WebGL visualization of quantum transport.",
  lore:"Wavefunction propagation, transmission coefficients and potential landscapes you can orbit. Built for Qant Labs."},
 {r:"single-layer-graphene-structure",t:"The Thesis Dungeon",b:"ARCANA",s:"ACTIVE",d:5,tags:["Python","NumPy","Matplotlib"],
  x:"Computational study of single-layer graphene's fundamental properties.",
  lore:"Groundwork for the final boss: twisted bilayer graphene–superconductor junctions (M.Tech thesis, 2027)."},
 {r:"downtown-duel",shot:"shots/downtown-duel.jpg",t:"Downtown Duel",b:"FORGING",s:"ACTIVE",d:3,tags:["GDScript","Godot 4","Web"],
  x:"Open-world creature-battle demo that runs in the browser.",
  lore:"Nine connected zones on a looping road network, 61 animated monsters with simple AI, real-time lock-on combat, and armor that changes the hero's look."},
 {r:"Design-Verification-Roadmap",t:"Into the Silicon",b:"SMITHING",s:"ACTIVE",d:4,tags:["SystemVerilog","UVM","Python"],
  x:"My roadmap from physics into design verification.",
  lore:"Verilog and SystemVerilog, UVM testbenches, assertions and formal verification, and the industry flow around them."},
 {r:"triev-whatsapp-crm",t:"The Merchant's Ledger",b:"CRAFT",s:"CLEARED",d:3,tags:["JavaScript","WhatsApp","CRM"],
  x:"WhatsApp CRM and lead-gen prototype for a 2W EV fleet.",lore:"Built as freelance work for an EV startup run by an IIT (BHU) alum."},
 {r:"embedded-systems-software",t:"Rune-Carving in C",b:"SMITHING",s:"CLEARED",d:2,tags:["C","Embedded"],
  x:"Embedded C drills and exercises.",lore:"Where the silicon branch started."},
];
const GRIND = [
 ["Thesis: graphene → TBG–SC junctions",8,"var(--a1)"],
 ["SystemVerilog + UVM",6,"var(--a4)"],
 ["muse: self-curating memory model",5,"var(--a2)"],
 ["Downtown Duel → souls-like for phones",3,"var(--a5)"],
];
window.PROM = {BR, TREE, QUESTS, GRIND};
})();
