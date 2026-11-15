// 3D-scenen: atomer med synlige valenselektroner, bindinger, og en levende VSEPR-modell.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const ELECTRON = new THREE.Color('#ffd76a');
const E_HDR = new THREE.Color(1.75, 1.2, 0.2);   // samme gule, men lys nok til å gløde
const SHELL = new THREE.Color('#86cfdc');          // ufullstendig skall: nøytral blågrønn (grønn = fullt)
const GOOD = new THREE.Color('#6fe3a5');
const WARN = new THREE.Color('#ff8f6b');
const UP = new THREE.Vector3(0, 1, 0);
const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), tmpC = new THREE.Vector3(), tmpD = new THREE.Vector3();
const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SHELL_VERT = `
varying vec3 vN; varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const SHELL_FRAG = `
uniform vec3 uColor; uniform float uIntensity;
varying vec3 vN; varying vec3 vV;
void main() {
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.4);
  gl_FragColor = vec4(uColor * (f * uIntensity * 0.62 + 0.03), 1.0);
}`;
const SKY_FRAG = `
varying vec3 vP;
void main() {
  float h = normalize(vP).y * 0.5 + 0.5;
  vec3 low = vec3(0.012, 0.032, 0.045), mid = vec3(0.024, 0.085, 0.11), high = vec3(0.045, 0.16, 0.19);
  vec3 c = mix(low, mid, smoothstep(0.0, 0.55, h));
  c = mix(c, high, smoothstep(0.55, 1.0, h) * 0.8);
  gl_FragColor = vec4(c, 1.0);
}`;

function fibDir(i) { // spredte startretninger
  const g = 2.399963, y = 1 - ((i * 0.37) % 1) * 2, r = Math.sqrt(Math.max(0, 1 - y * y));
  return new THREE.Vector3(Math.cos(g * i) * r, y, Math.sin(g * i) * r).normalize();
}

export class Engine {
  constructor(container, world, cb = {}) {
    this.container = container; this.world = world; this.cb = cb;
    this.vis = new Map();           // atom-id -> visuelt objekt
    this.sticks = new Map();        // "a-b" -> bindingsgruppe
    this.bursts = [];
    this.selected = null; this.hover = null; this.drag = null;
    this.spawnCount = 0; this.clock = new THREE.Clock(); this.frameAvg = 16; this.frames = 0; this.lowQ = false;

    const renderer = this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
    renderer.domElement.setAttribute('aria-label', '3D-verksted med atomer');

    const scene = this.scene = new THREE.Scene();
    scene.background = new THREE.Color('#06141b');
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(0, 1.2, 11.5);
    const controls = this.controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.minDistance = 5; controls.maxDistance = 22; controls.autoRotateSpeed = 2.2;
    controls.target.set(0, 0.6, 0);

    const key = new THREE.DirectionalLight('#eaffff', 1.15); key.position.set(4, 7, 6); scene.add(key);
    const rim = new THREE.DirectionalLight('#3fd0d8', 0.9); rim.position.set(-6, 2, -5); scene.add(rim);

    { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); this.dot = new THREE.CanvasTexture(c); }
    this._buildBackdrop();

    // delte geometrier/materialer
    this.gSphere = new THREE.SphereGeometry(1, 48, 32);
    this.gElectron = new THREE.SphereGeometry(0.062, 16, 12);
    this.mElectron = new THREE.MeshBasicMaterial({ color: E_HDR.clone(), toneMapped: false });
    this.gStick = new THREE.CylinderGeometry(1, 1, 1, 12, 1, true);
    this.mStick = new THREE.MeshStandardMaterial({ color: '#cfeef0', roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.55 });
    this.mIon = new THREE.MeshBasicMaterial({ color: '#7fd6e0', transparent: true, opacity: 0.16, depthWrite: false });
    this.mHit = new THREE.MeshBasicMaterial({ visible: false });

    // linjen eleven drar når en binding lages
    this.dragLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
      new THREE.LineBasicMaterial({ color: ELECTRON.clone().multiplyScalar(1.8), toneMapped: false }));
    this.dragLine.visible = false; this.dragLine.frustumCulled = false; scene.add(this.dragLine);

    // etterbehandling: bare elektronene (HDR > 1) gløder
    const composer = this.composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.4, 1.1);
    composer.addPass(this.bloom);
    composer.addPass(new OutputPass());

    this.ray = new THREE.Raycaster(); this.pointer = new THREE.Vector2(); this.pointerMoved = false;
    this._bindInput();
    this._ro = new ResizeObserver(() => this._resize()); this._ro.observe(container); this._resize();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this.vis.forEach((v) => this._drawLabel(v)));
    renderer.setAnimationLoop(() => this._frame());
  }

  // ---------- oppbygging ----------
  _buildBackdrop() {
    const sky = new THREE.Mesh(new THREE.SphereGeometry(90, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fragmentShader: SKY_FRAG,
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    }));
    this.scene.add(sky);
    // arbeidsbordet: tynne ringer under atomene
    const bench = new THREE.Group(); bench.position.y = -3.4; bench.rotation.x = -Math.PI / 2;
    for (let i = 1; i <= 7; i++) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(i * 1.6 - 0.012, i * 1.6 + 0.012, 96),
        new THREE.MeshBasicMaterial({ color: '#7fd6e0', transparent: true, opacity: 0.16 - i * 0.017, depthWrite: false }));
      bench.add(ring);
    }
    const disc = new THREE.Mesh(new THREE.CircleGeometry(11.4, 96),
      new THREE.MeshBasicMaterial({ color: '#0b2a36', transparent: true, opacity: 0.35, depthWrite: false }));
    disc.position.z = -0.01; bench.add(disc); this.scene.add(bench);
    // støv i lufta
    const n = 260, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 34; pos[i * 3 + 1] = (Math.random() - 0.5) * 18; pos[i * 3 + 2] = (Math.random() - 0.5) * 34; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.dust = new THREE.Points(g, new THREE.PointsMaterial({ color: '#9fe6ea', size: 0.09, map: this.dot, transparent: true, opacity: 0.4, depthWrite: false }));
    this.scene.add(this.dust);
  }

  _resize() {
    const w = Math.max(2, this.container.clientWidth), h = Math.max(2, this.container.clientHeight);
    this.renderer.setSize(w, h, false); this.composer.setSize(w, h);
    this.camera.aspect = w / h; this.camera.setViewOffset(w, h, 0, Math.round(h * 0.13), w, h); this.camera.updateProjectionMatrix();
  }

  _drawLabel(v) {
    const c = v.labelCanvas, x = c.getContext('2d'); x.clearRect(0, 0, 128, 128);
    const col = new THREE.Color(v.atom.el.color), lum = 0.299 * col.r + 0.587 * col.g + 0.114 * col.b;
    x.font = `700 ${v.atom.sym.length > 1 ? 62 : 76}px "Bricolage Grotesque", "Trebuchet MS", system-ui, sans-serif`;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = lum > 0.38 ? '#06141b' : '#f2fbfb'; x.fillText(v.atom.sym, 64, 68);
    v.label.material.map.needsUpdate = true;
  }

  _drawCharge(v, q) {
    const c = v.chargeCanvas, x = c.getContext('2d'); x.clearRect(0, 0, 128, 128);
    if (q !== 0) {
      const txt = (Math.abs(q) > 1 ? Math.abs(q) : '') + (q > 0 ? '+' : '−');
      x.beginPath(); x.arc(64, 64, 50, 0, Math.PI * 2); x.fillStyle = 'rgba(6,20,27,0.85)'; x.fill();
      x.lineWidth = 5; x.strokeStyle = q > 0 ? '#ff8f6b' : '#7fd6e0'; x.stroke();
      x.font = '700 58px "JetBrains Mono", ui-monospace, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = '#e6f3f2'; x.fillText(txt, 64, 68);
    }
    v.charge.material.map.needsUpdate = true; v.charge.visible = q !== 0; v.q = q;
  }

  addAtom(atom, at) {
    const el = atom.el, r = 0.34 * el.size, R = r * 1.9 + 0.14;
    const color = new THREE.Color(el.color);
    const body = new THREE.Mesh(this.gSphere, new THREE.MeshPhysicalMaterial({
      color, roughness: 0.28, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.25, emissive: color, emissiveIntensity: 0.06, envMapIntensity: 0.45 }));
    body.material.color.multiplyScalar(0.82);
    body.scale.setScalar(r);
    const shell = new THREE.Mesh(this.gSphere, new THREE.ShaderMaterial({
      uniforms: { uColor: { value: SHELL.clone() }, uIntensity: { value: 0.9 } },
      vertexShader: SHELL_VERT, fragmentShader: SHELL_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    shell.scale.setScalar(R); shell.userData.atomId = atom.id;
    const group = new THREE.Group(); group.add(body, shell); this.scene.add(group);

    const mk = () => { const c = document.createElement('canvas'); c.width = c.height = 128; return c; };
    const labelCanvas = mk(), chargeCanvas = mk();
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(labelCanvas), transparent: true, depthWrite: false }));
    label.scale.setScalar(r * 1.55); this.scene.add(label);
    const charge = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(chargeCanvas), transparent: true, depthWrite: false }));
    charge.scale.setScalar(0.42); charge.visible = false; this.scene.add(charge);
    const needCanvas = mk();
    const need = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(needCanvas), transparent: true, depthWrite: false, depthTest: false }));
    need.scale.setScalar(0.46); need.visible = false; need.renderOrder = 6; this.scene.add(need);

    let pos = at;
    if (!pos) {
      const a = this.spawnCount++ * 2.4 + 0.5, rad = 1.5 + (this.spawnCount % 3) * 0.55;
      pos = new THREE.Vector3(Math.cos(a) * rad, 0.6 + Math.sin(a * 1.7) * 1.0, Math.sin(a) * rad * 0.5);
    }
    const electrons = [];
    for (let i = 0; i < el.valence; i++) {
      const m = new THREE.Mesh(this.gElectron, this.mElectron); m.position.copy(pos); this.scene.add(m);
      electrons.push({ mesh: m, target: new THREE.Vector3().copy(pos) });
    }
    const v = { id: atom.id, atom, r, R, baseColor: color, group, body, shell, label, labelCanvas, charge, chargeCanvas, need, needCanvas, needN: -1,
      pos: pos.clone(), vel: new THREE.Vector3(), force: new THREE.Vector3(), dirs: [], electrons, q: 0, grow: 0, shake: 0, flash: 0, k: 0, recv: 0 };
    this.vis.set(atom.id, v); this._drawLabel(v);
    return v;
  }

  removeAtom(id) {
    const v = this.vis.get(id); if (!v) return;
    this.scene.remove(v.group, v.label, v.charge, v.need); v.need.material.map.dispose(); v.need.material.dispose(); v.electrons.forEach((e) => this.scene.remove(e.mesh));
    v.body.material.dispose(); v.shell.material.dispose();
    v.label.material.map.dispose(); v.label.material.dispose(); v.charge.material.map.dispose(); v.charge.material.dispose();
    this.vis.delete(id);
    if (this.selected === id) this.selected = null;
    if (this.hover === id) this.hover = null;
    this.sync();
  }

  clear() { [...this.vis.keys()].forEach((id) => this.removeAtom(id)); this.spawnCount = 0; this.sync(); }

  /** Kalles etter hver endring i bindingene. */
  sync() {
    const alive = new Set();
    for (const b of this.world.bonds) {
      const key = b.a + '-' + b.b; alive.add(key);
      let s = this.sticks.get(key);
      if (!s) {
        s = { a: b.a, b: b.b, group: new THREE.Group(), rods: [], hit: new THREE.Mesh(this.gStick, this.mHit) };
        for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(this.gStick, this.mStick); s.rods.push(m); s.group.add(m); }
        s.ion = new THREE.Mesh(this.gStick, this.mIon); s.group.add(s.ion);
        s.hit.userData.bond = s; s.group.add(s.hit); this.scene.add(s.group); this.sticks.set(key, s);
      }
      s.kind = b.kind; s.order = b.order;
    }
    for (const [key, s] of this.sticks) if (!alive.has(key)) { this.scene.remove(s.group); this.sticks.delete(key); }
    for (const v of this.vis.values()) {
      const q = this.world.charge(v.id); if (q !== v.q) this._drawCharge(v, q);
      const n = this.support && v.atom.el.role !== 'noble' && this.world.atoms.has(v.id) ? this.world.unpaired(v.id) : 0;
      v.need.visible = n > 0; if (n > 0 && n !== v.needN) this._drawNeed(v, n);
    }
  }

  /**
   * Byggemodus (kapittel 0): ett atom med ALLE skallene synlige. el = grunnstoffobjekt, eller null for å slå av.
   */
  setBuilder(el) {
    if (!el) { if (this.builder) { this.scene.remove(this.builder.group); this.builder = null; } return; }
    let b = this.builder;
    if (!b) {
      const group = new THREE.Group(); group.position.set(0, 0.7, 0); group.rotation.x = 0.42; group.scale.setScalar(0.92);
      const nucleus = new THREE.Mesh(this.gSphere, new THREE.MeshPhysicalMaterial({ roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.25, envMapIntensity: 0.45 }));
      nucleus.scale.setScalar(0.46); group.add(nucleus);
      const labelCanvas = document.createElement('canvas'); labelCanvas.width = labelCanvas.height = 128;
      const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(labelCanvas), transparent: true, depthWrite: false, depthTest: false }));
      label.scale.setScalar(0.72); label.renderOrder = 5; group.add(label);
      const rings = [0, 1, 2, 3].map((i) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1 + i * 0.72, 0.011, 8, 120),
          new THREE.MeshBasicMaterial({ color: SHELL.clone(), transparent: true, opacity: 0.5, depthWrite: false }));
        ring.rotation.x = Math.PI / 2; ring.visible = false; group.add(ring); return ring;
      });
      this.mInner = this.mInner || new THREE.MeshBasicMaterial({ color: new THREE.Color(0.95, 0.72, 0.22) });
      b = this.builder = { group, nucleus, label, labelCanvas, rings, shells: [[], [], [], []], flash: [0, 0, 0, 0], el: null };
      this.scene.add(group);
    }
    b.el = el; b.atom = { el, sym: el.sym };
    const col = new THREE.Color(el.color); b.nucleus.material.color.copy(col).multiplyScalar(0.82); b.nucleus.material.emissive = col; b.nucleus.material.emissiveIntensity = 0.06;
    this._drawLabel(b);
    const CAP = [2, 8, 8, 18];
    for (let s = 0; s < 4; s++) {
      const want = el.shells[s] || 0, list = b.shells[s];
      while (list.length < want) {
        const m = new THREE.Mesh(this.gElectron, this.mElectron); m.position.set(5.5, 2.5, 0); b.group.add(m); list.push(m);
        if (list.length === CAP[s]) b.flash[s] = 1;
      }
      while (list.length > want) b.group.remove(list.pop());
      b.rings[s].visible = want > 0;
    }
  }

  _builderFrame(dt, t) {
    const b = this.builder, CAP = [2, 8, 8, 18], last = b.el.shells.length - 1;
    const still = reducedMotion();
    for (let s = 0; s < 4; s++) {
      const list = b.shells[s], n = list.length, R = 1.1 + s * 0.72;
      const full = n === CAP[s]; b.flash[s] = Math.max(0, b.flash[s] - dt * 0.8);
      const mat = b.rings[s].material; mat.color.lerp(full ? GOOD : SHELL, Math.min(1, dt * 5)); mat.opacity = (s === last ? 0.7 : 0.4) + b.flash[s] * 0.3;
      const spin = still ? 0 : t * (0.32 / (s + 1)) * (s % 2 ? -1 : 1);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + spin, m = list[i];
        tmpA.set(Math.cos(a) * R, 0, Math.sin(a) * R); m.position.lerp(tmpA, 1 - Math.exp(-dt * 7));
        m.material = s === last ? this.mElectron : this.mInner; m.scale.setScalar(s === last ? 1.35 : 0.9);
      }
    }
  }

  /** Ekstra støtte: tall på hvert atom som viser hvor mange elektroner det mangler (ikke-metall) eller kan gi (metall). */
  setSupport(on) { this.support = !!on; for (const v of this.vis.values()) v.needN = -1; this.sync(); }

  _drawNeed(v, n) {
    const c = v.needCanvas, x = c.getContext('2d'); x.clearRect(0, 0, 128, 128);
    const metal = v.atom.el.role === 'metal';
    x.beginPath(); x.arc(64, 64, 52, 0, Math.PI * 2); x.fillStyle = metal ? '#2a1a14' : '#e6f3f2'; x.fill();
    x.lineWidth = 6; x.strokeStyle = metal ? '#ff8f6b' : '#6fe3a5'; if (metal) x.setLineDash([12, 9]); x.stroke(); x.setLineDash([]);
    x.font = '800 70px "JetBrains Mono", ui-monospace, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = metal ? '#ffd2c2' : '#06141b'; x.fillText(String(n), 64, 69);
    v.need.material.map.needsUpdate = true; v.needN = n;
  }

  shake(id) { const v = this.vis.get(id); if (v) { v.shake = 0.45; v.flash = -1; } }

  celebrate(ids) {
    const c = new THREE.Vector3(); let n = 0;
    for (const id of ids) { const v = this.vis.get(id); if (v) { c.add(v.pos); n++; v.flash = 1; } }
    if (!n || reducedMotion()) return;
    c.multiplyScalar(1 / n);
    const N = 90, pos = new Float32Array(N * 3), vel = [];
    for (let i = 0; i < N; i++) { pos.set([c.x, c.y, c.z], i * 3); vel.push(fibDir(i + 1).multiplyScalar(2.2 + Math.random() * 3.2)); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: ELECTRON.clone().multiplyScalar(2.2), size: 0.16, map: this.dot, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    pts.frustumCulled = false; this.scene.add(pts); this.bursts.push({ pts, vel, t: 0 });
    this.controls.autoRotate = true; clearTimeout(this._spin); this._spin = setTimeout(() => { this.controls.autoRotate = false; }, 5200);
  }

  // ---------- inndata ----------
  _setPointer(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.pointer, this.camera);
  }
  _pickAtom() {
    const shells = []; this.vis.forEach((v) => shells.push(v.shell));
    const hit = this.ray.intersectObjects(shells, false)[0];
    return hit ? hit.object.userData.atomId : null;
  }
  _pickBond() {
    const hits = []; this.sticks.forEach((s) => hits.push(s.hit));
    const hit = this.ray.intersectObjects(hits, false)[0];
    return hit ? hit.object.userData.bond : null;
  }

  _bindInput() {
    const el = this.renderer.domElement;
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault(); this._setPointer(e);
      const id = this._pickAtom(); if (id != null && this.cb.onRemove) this.cb.onRemove(id);
    });
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      this._setPointer(e); this.downAt = [e.clientX, e.clientY]; this.pointerMoved = false;
      const id = this._pickAtom();
      if (id != null) {
        this.drag = { from: id, over: null }; this.controls.enabled = false;
        try { el.setPointerCapture(e.pointerId); } catch (_) { /* ok */ }
      }
    });
    el.addEventListener('pointermove', (e) => {
      this._setPointer(e);
      if (this.downAt && Math.hypot(e.clientX - this.downAt[0], e.clientY - this.downAt[1]) > 6) this.pointerMoved = true;
      const id = this._pickAtom();
      if (this.drag) {
        this.drag.over = id != null && id !== this.drag.from ? id : null;
        const v = this.vis.get(this.drag.from);
        if (v && this.pointerMoved) {
          // punkt under pekeren, i planet gjennom atomet som vender mot kamera
          const n = this.camera.getWorldDirection(tmpA), plane = new THREE.Plane().setFromNormalAndCoplanarPoint(n, v.pos);
          const p = this.ray.ray.intersectPlane(plane, tmpB) || v.pos;
          const end = this.drag.over != null ? this.vis.get(this.drag.over).pos : p;
          const a = this.dragLine.geometry.attributes.position; a.setXYZ(0, v.pos.x, v.pos.y, v.pos.z); a.setXYZ(1, end.x, end.y, end.z); a.needsUpdate = true;
          this.dragLine.visible = true;
        }
      }
      if (id !== this.hover) { this.hover = id; if (this.cb.onHover) this.cb.onHover(id ?? this.selected); }
      el.style.cursor = id != null ? 'pointer' : (this._pickBond() ? 'pointer' : 'grab');
    });
    const up = (e) => {
      if (e.button !== 0) return;
      this._setPointer(e);
      const drag = this.drag; this.drag = null; this.dragLine.visible = false; this.controls.enabled = true; this.downAt = null;
      if (drag) {
        const over = this._pickAtom();
        if (this.pointerMoved && over != null && over !== drag.from) { this.selected = null; this.cb.onBond && this.cb.onBond(drag.from, over); }
        else if (!this.pointerMoved) {
          // klikk–klikk som alternativ til å dra (lettere på styreflate)
          if (this.selected != null && this.selected !== drag.from && this.vis.has(this.selected)) {
            const a = this.selected; this.selected = null; this.cb.onBond && this.cb.onBond(a, drag.from);
          } else this.selected = this.selected === drag.from ? null : drag.from;
          this.cb.onHover && this.cb.onHover(this.selected ?? this.hover);
        }
        return;
      }
      if (!this.pointerMoved) {
        const s = this._pickBond();
        if (s) this.cb.onUnbond && this.cb.onUnbond(s.a, s.b);
        else { this.selected = null; this.cb.onHover && this.cb.onHover(this.hover); }
      }
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', () => { this.drag = null; this.dragLine.visible = false; this.controls.enabled = true; });
  }

  // ---------- simulering ----------
  _physics(dt) {
    const W = this.world, list = [...this.vis.values()];
    const comp = new Map(); W.components().forEach((ids, i) => ids.forEach((id) => comp.set(id, i)));
    for (const v of list) v.force.set(0, 0, 0);
    // ytre krefter virker på hele molekylet (ellers bøyes bindingsvinklene)
    const cN = [], cF = [], cC = [];
    for (const v of list) { const c = comp.get(v.id); if (!cN[c]) { cN[c] = 0; cF[c] = new THREE.Vector3(); cC[c] = new THREE.Vector3(); } cN[c]++; cC[c].add(v.pos); }
    cC.forEach((c, i) => { c.multiplyScalar(1 / cN[i]); cF[i].set(-c.x * 0.5, -(c.y - 0.6) * 0.8, -c.z * 0.8).multiplyScalar(cN[i]); });

    // frastøting: atomer skal ikke ligge oppå hverandre; ioner med lik ladning skyver hverandre unna
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j]; const d = tmpA.subVectors(b.pos, a.pos); let len = d.length();
      if (len < 1e-4) { d.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5); len = d.length(); }
      d.multiplyScalar(1 / len);
      const same = comp.get(a.id) === comp.get(b.id);
      const D = same ? (a.R + b.R) * 0.92 : a.R + b.R + 2.1;
      let f = len < D ? (same ? 26 : 9) * (D - len) : 0;
      const qq = a.q * b.q; if (same && qq > 0) f += 2.4 * qq / (len * len);
      if (f && same) { a.force.addScaledVector(d, -f); b.force.addScaledVector(d, f); }
      else if (f) { cF[comp.get(a.id)].addScaledVector(d, -f); cF[comp.get(b.id)].addScaledVector(d, f); }
    }
    for (const v of list) { const c = comp.get(v.id); v.force.addScaledVector(cF[c], 1 / cN[c]); }
    // fjærer langs bindingene
    for (const bnd of W.bonds) {
      const a = this.vis.get(bnd.a), b = this.vis.get(bnd.b); if (!a || !b) continue;
      const L = bnd.kind === 'cov' ? Math.max((a.R + b.R) * (0.8 - 0.04 * (bnd.order - 1)), a.r + b.r + 0.5) : (a.R + b.R) * 0.98;
      const d = tmpA.subVectors(b.pos, a.pos), len = d.length() || 1e-4; d.multiplyScalar(1 / len);
      const f = 46 * (len - L); a.force.addScaledVector(d, f); b.force.addScaledVector(d, -f);
    }
    // VSEPR: elektronområdene rundt hvert atom skyver hverandre så langt unna som mulig
    for (const v of list) {
      const el = v.atom.el, id = v.id;
      const pairs = W.lonePairs(id), singles = W.unpaired(id), free = pairs + singles;
      while (v.dirs.length < free) v.dirs.push(fibDir(v.id * 7 + v.dirs.length + 1));
      v.dirs.length = free; v.pairs = pairs;
      const dom = []; // { dir, w, atom? }
      for (const bnd of W.bonds) {
        if (bnd.kind !== 'cov') continue;
        const o = bnd.a === id ? bnd.b : bnd.b === id ? bnd.a : null; if (o == null) continue;
        const ov = this.vis.get(o); if (!ov) continue;
        dom.push({ dir: new THREE.Vector3().subVectors(ov.pos, v.pos).normalize(), w: 1, atom: ov });
      }
      v.dirs.forEach((dir, i) => dom.push({ dir, w: i < pairs ? 1.22 : (el.role === 'metal' ? 1 : 0.95) }));
      for (let i = 0; i < dom.length; i++) {
        const acc = tmpB.set(0, 0, 0);
        for (let j = 0; j < dom.length; j++) {
          if (i === j) continue;
          const d = tmpC.subVectors(dom[i].dir, dom[j].dir); const l2 = Math.max(d.lengthSq(), 0.02);
          acc.addScaledVector(d, dom[j].w / (l2 * Math.sqrt(l2)));
        }
        // bare komponenten på tvers av retningen betyr noe
        acc.addScaledVector(dom[i].dir, -acc.dot(dom[i].dir));
        if (dom[i].atom) { dom[i].atom.force.addScaledVector(acc, 9); v.force.addScaledVector(acc, -9); }
        else dom[i].dir.addScaledVector(acc, Math.min(1, dt * 3.5)).normalize();
      }
    }
    const damp = Math.exp(-7 * dt);
    for (const v of list) {
      v.vel.addScaledVector(v.force, dt).multiplyScalar(damp);
      const sp = v.vel.length(); if (sp > 14) v.vel.multiplyScalar(14 / sp);
      v.pos.addScaledVector(v.vel, dt);
    }
  }

  _slot(v, i, side, out) { // plass nr. i blant de frie elektronområdene; side: -1/0/+1 innen et par
    const dir = v.dirs[i] || UP;
    out.copy(v.pos).addScaledVector(dir, v.R * 0.93);
    if (side) {
      const t = tmpD.crossVectors(dir, Math.abs(dir.y) > 0.9 ? tmpC.set(1, 0, 0) : UP).normalize();
      out.addScaledVector(t, side * 0.105);
    }
    return out;
  }

  _electrons(dt) {
    const W = this.world, view = this.camera.getWorldDirection(new THREE.Vector3());
    for (const v of this.vis.values()) { v.k = 0; v.recv = 0; }
    for (const b of W.bonds) {
      const a = this.vis.get(b.a), c = this.vis.get(b.b); if (!a || !c) continue;
      const axis = tmpA.subVectors(c.pos, a.pos); const len = axis.length() || 1e-4; axis.multiplyScalar(1 / len);
      if (b.kind === 'cov') {
        // det delte paret ligger der skallene overlapper
        const mid = tmpB.copy(a.pos).addScaledVector(axis, len * (a.R / (a.R + c.R)));
        const perp = tmpC.crossVectors(axis, view); if (perp.lengthSq() < 1e-4) perp.crossVectors(axis, UP); perp.normalize();
        for (let m = 0; m < b.order; m++) {
          const off = (m - (b.order - 1) / 2) * 0.21;
          const ea = a.electrons[a.k++], ec = c.electrons[c.k++];
          if (ea) ea.target.copy(mid).addScaledVector(perp, off).addScaledVector(axis, -0.085);
          if (ec) ec.target.copy(mid).addScaledVector(perp, off).addScaledVector(axis, 0.085);
        }
      } else {
        // metallets elektron flytter inn i et ledig par hos mottakeren
        const ownPairs = c.atom.el.role === 'nonmetal' ? (c.atom.el.valence - c.atom.el.bonds) / 2 : 0;
        for (let m = 0; m < b.order; m++) { const e = a.electrons[a.k++]; if (e) this._slot(c, ownPairs + c.recv++, 1, e.target); }
      }
    }
    for (const v of this.vis.values()) {
      const el = v.atom.el, got = W.got(v.id);
      const ownPairs = el.role === 'nonmetal' ? (el.valence - el.bonds) / 2 : el.role === 'noble' ? el.valence / 2 : 0;
      let slot = 0;
      for (let p = 0; p < ownPairs; p++, slot++) for (const s of [-1, 1]) { const e = v.electrons[v.k++]; if (e) this._slot(v, slot, s, e.target); }
      for (let p = 0; p < got; p++, slot++) { const e = v.electrons[v.k++]; if (e) this._slot(v, slot, -1, e.target); }
      while (v.k < v.electrons.length) { const e = v.electrons[v.k++]; this._slot(v, slot++, 0, e.target); }
      const a = 1 - Math.exp(-dt * 9);
      for (const e of v.electrons) e.mesh.position.lerp(e.target, a);
    }
  }

  _frame() {
    const raw = this.clock.getDelta(); const dt = Math.min(raw, 1 / 30); const t = this.clock.elapsedTime;
    // enkel kvalitetsvakt for svake maskiner
    this.frameAvg += (raw * 1000 - this.frameAvg) * 0.05;
    if (!this.lowQ && ++this.frames > 150 && this.frameAvg > 30) { this.lowQ = true; this.bloom.enabled = false; this.renderer.setPixelRatio(1); this._resize(); }

    this._physics(dt * 0.5); this._physics(dt * 0.5);
    this.controls.update();
    const camDir = this.camera.getWorldDirection(tmpA).clone();
    const camRight = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 0);
    const camUp = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 1);

    for (const v of this.vis.values()) {
      v.grow = Math.min(1, v.grow + dt * 3.5); const g = 1 - Math.pow(1 - v.grow, 3);
      let ox = 0; if (v.shake > 0) { v.shake -= dt; ox = Math.sin(v.shake * 60) * 0.07 * (v.shake / 0.45); }
      v.group.position.copy(v.pos).addScaledVector(camRight, ox);
      const full = this.world.unpaired(v.id) === 0, ion = full && v.atom.el.role === 'metal';
      const Rs = v.R * (ion ? 0.8 : 1) * g * (this.drag && this.drag.over === v.id ? 1.12 : 1);
      v.shell.scale.setScalar(v.shell.scale.x + (Rs - v.shell.scale.x) * Math.min(1, dt * 10));
      v.body.scale.setScalar(v.r * g);
      const u = v.shell.material.uniforms;
      const want = v.flash < 0 ? WARN : full ? GOOD : SHELL;
      u.uColor.value.lerp(want, Math.min(1, dt * 6));
      if (v.flash > 0) v.flash = Math.max(0, v.flash - dt * 0.7); else if (v.flash < 0) v.flash = Math.min(0, v.flash + dt * 2.2);
      const sel = this.selected === v.id || this.hover === v.id;
      const base = full ? 1.05 : 0.8 + Math.sin(t * 2.4 + v.id) * 0.22;
      u.uIntensity.value += ((base + (sel ? 0.7 : 0) + Math.abs(v.flash) * 1.6) - u.uIntensity.value) * Math.min(1, dt * 8);
      v.label.position.copy(v.group.position).addScaledVector(camDir, -(v.r + 0.03));
      v.need.position.copy(v.group.position).addScaledVector(camRight, -v.R * 0.78).addScaledVector(camUp, -v.R * 0.62).addScaledVector(camDir, -v.R);
      v.charge.position.copy(v.group.position).addScaledVector(camRight, v.R * 0.72).addScaledVector(camUp, v.R * 0.72).addScaledVector(camDir, -v.R);
    }
    this._electrons(dt);
    if (this.builder) this._builderFrame(dt, t);

    // bindingsstaver
    for (const s of this.sticks.values()) {
      const a = this.vis.get(s.a), b = this.vis.get(s.b); if (!a || !b) continue;
      const axis = tmpA.subVectors(b.pos, a.pos), len = axis.length() || 1e-4; axis.multiplyScalar(1 / len);
      s.group.position.copy(a.pos).addScaledVector(axis, len / 2);
      s.group.quaternion.setFromUnitVectors(UP, axis);
      const perp = tmpB.crossVectors(axis, camDir); if (perp.lengthSq() < 1e-4) perp.set(1, 0, 0); perp.normalize();
      const local = tmpC.copy(perp).applyQuaternion(s.group.quaternion.clone().invert());
      s.rods.forEach((rod, i) => {
        rod.visible = s.kind === 'cov' && i < s.order;
        if (rod.visible) { rod.scale.set(0.035, len, 0.035); rod.position.copy(local).multiplyScalar((i - (s.order - 1) / 2) * 0.21); }
      });
      s.ion.visible = s.kind === 'ion'; s.ion.scale.set(0.2, len, 0.2);
      s.hit.scale.set(0.3, Math.max(0.1, len - a.r - b.r), 0.3);
    }

    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i]; b.t += dt; const p = b.pts.geometry.attributes.position;
      for (let k = 0; k < b.vel.length; k++) { p.array[k * 3] += b.vel[k].x * dt; p.array[k * 3 + 1] += b.vel[k].y * dt; p.array[k * 3 + 2] += b.vel[k].z * dt; b.vel[k].multiplyScalar(0.985); }
      p.needsUpdate = true; b.pts.material.opacity = Math.max(0, 1 - b.t / 1.6);
      if (b.t > 1.6) { this.scene.remove(b.pts); b.pts.geometry.dispose(); b.pts.material.dispose(); this.bursts.splice(i, 1); }
    }
    if (!reducedMotion()) this.dust.rotation.y = t * 0.012;
    this.composer.render();
  }
}
