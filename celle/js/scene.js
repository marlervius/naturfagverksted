// Celleverkstedet – 3D-scenen: renderer, kamera, bakgrunn, etterglød, kvalitetsvakt og felles byggeklosser.
// Selve innholdet ligger i «visninger» (celle3d.js, membran3d.js, energi3d.js) som byttes per oppdrag.
// En visning er { root: Group, update(dt, t), dispose(), radius, target?, view?, pickables? }.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export { THREE, mergeGeometries };
export const reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
export const ENERGY = new THREE.Color(1.75, 1.2, 0.2); // ATP/energi: samme gule som elektronene, lys nok til å gløde

const FRESNEL_VERT = `
varying vec3 vN; varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const FRESNEL_FRAG = `
uniform vec3 uColor; uniform float uIntensity; uniform float uPow;
varying vec3 vN; varying vec3 vV;
void main() {
  float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPow);
  gl_FragColor = vec4(uColor * (f * uIntensity * 0.62 + 0.03 * uIntensity), 1.0);
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

/** Gjennomskinnelig «hinne» som lyser i kantene (membraner, skall). Additiv – fungerer uten sortering. */
export function fresnelMat(color, intensity = 1, pow = 2.2) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uIntensity: { value: intensity }, uPow: { value: pow } },
    vertexShader: FRESNEL_VERT, fragmentShader: FRESNEL_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
}
export const glassMat = (color, opacity = 0.35, extra = {}) => new THREE.MeshStandardMaterial({
  color, roughness: 0.35, metalness: 0, transparent: true, opacity, depthWrite: false, envMapIntensity: 0.5, ...extra,
});
export const solidMat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0, envMapIntensity: 0.55, ...extra });

/** Gi en geometri én farge per hjørne (så flere deler kan slås sammen til én mesh med flere farger). */
export function paint(geo, color) {
  const c = new THREE.Color(color), n = geo.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return geo;
}
export const at = (geo, x = 0, y = 0, z = 0) => geo.translate(x, y, z);

/** Avrundet boks: halvstørrelser hx, hy, hz og hjørneradius r. */
export function roundedBox(hx, hy, hz, r, seg = 18) {
  const g = new THREE.BoxGeometry(2, 2, 2, seg, seg, seg), p = g.attributes.position, v = new THREE.Vector3(), c = new THREE.Vector3();
  const ix = hx - r, iy = hy - r, iz = hz - r;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).multiply(new THREE.Vector3(hx, hy, hz));
    c.set(THREE.MathUtils.clamp(v.x, -ix, ix), THREE.MathUtils.clamp(v.y, -iy, iy), THREE.MathUtils.clamp(v.z, -iz, iz));
    v.sub(c); if (v.lengthSq() < 1e-8) v.set(0, 1, 0); v.normalize().multiplyScalar(r).add(c);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/** Myk klatt: kule med rolig støy i overflaten. */
export function blob(r, amp = 0.06, seed = 1, w = 32, h = 24) {
  const g = new THREE.SphereGeometry(r, w, h), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const n = v.clone().normalize();
    const k = 1 + amp * (Math.sin(n.x * 3.1 + seed) * Math.sin(n.y * 2.7 + seed * 1.7) + 0.6 * Math.sin(n.z * 4.3 + seed * 0.6));
    p.setXYZ(i, v.x * k, v.y * k, v.z * k);
  }
  g.computeVertexNormals();
  return g;
}

// ---------- tekst ----------
const SUBS = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
/** 'C6H12O6' → 'C₆H₁₂O₆', 'Na+' → 'Na⁺'. Ord som 'ATP' og 'protein' står urørt. */
export function pretty(f) {
  const s = String(f || '');
  if (!/^[A-Z][A-Za-z0-9+\-]*$/.test(s) || /^[A-Z]{2,}$/.test(s) || /^[a-z]/.test(s)) return s;
  return s.replace(/(\d+)/g, (d) => d.split('').map((x) => SUBS[x]).join('')).replace(/\+$/, '⁺').replace(/-$/, '⁻');
}

/** Merkelapp som alltid vender mot kamera. opts: { color, size, bg, fg, bold } */
export function makeLabel(text, opts = {}) {
  const c = document.createElement('canvas'), x = c.getContext('2d');
  const px = 64, font = `${opts.bold === false ? 600 : 700} ${px}px "Bricolage Grotesque", "Trebuchet MS", system-ui, sans-serif`;
  x.font = font;
  const w = Math.ceil(x.measureText(text).width) + 56, h = 96;
  c.width = w; c.height = h;
  x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
  if (opts.bg !== false) {
    const r = 30; x.beginPath(); x.moveTo(r + 3, 3); x.arcTo(w - 3, 3, w - 3, h - 3, r); x.arcTo(w - 3, h - 3, 3, h - 3, r); x.arcTo(3, h - 3, 3, 3, r); x.arcTo(3, 3, w - 3, 3, r); x.closePath();
    x.fillStyle = opts.bgColor || 'rgba(6,20,27,0.82)'; x.fill(); x.lineWidth = 5; x.strokeStyle = opts.color || 'rgba(160,220,230,0.55)'; x.stroke();
  }
  x.fillStyle = opts.fg || '#e6f3f2'; x.fillText(text, w / 2, h / 2 + 3);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: opts.depthTest ?? true });
  const s = new THREE.Sprite(mat); const size = opts.size || 0.42;
  s.scale.set(size * w / h, size, 1); s.renderOrder = opts.order ?? 4;
  s.userData.aspect = w / h;
  return s;
}

// ---------- partikler for stoffene: form + farge (og merkelapp i visningene) ----------
const PCOL = { o2: '#ff8a80', co2: '#9aa9b0', h2o: '#7cc8ff', glukose: '#ffc59a', na: '#b49cff', k: '#ff9ad5', protein: '#6fd6b0', atp: '#ffffff' };
export const subColor = (id) => PCOL[id] || '#cfe3e6';
const pcache = new Map();
/** Delt geometri + materiale for ett stoff (lagres for hele økta; deles av alle visninger). */
export function particleKit(id) {
  if (pcache.has(id)) return pcache.get(id);
  const S = (r, w = 16, h = 12) => new THREE.SphereGeometry(r, w, h);
  let parts;
  switch (id) {
    case 'o2': parts = [paint(at(S(0.17), -0.12), PCOL.o2), paint(at(S(0.17), 0.12), PCOL.o2)]; break;
    case 'co2': parts = [paint(S(0.17), '#56636a'), paint(at(S(0.14), -0.25), PCOL.o2), paint(at(S(0.14), 0.25), PCOL.o2)]; break;
    case 'h2o': parts = [paint(S(0.17), '#4fa8ff'), paint(at(S(0.1), -0.16, -0.11), '#f2fbff'), paint(at(S(0.1), 0.16, -0.11), '#f2fbff')]; break;
    case 'glukose': parts = [paint(new THREE.TorusGeometry(0.2, 0.065, 6, 6).rotateX(Math.PI / 2), PCOL.glukose), paint(at(S(0.06), 0.27, 0.02), '#ff8a80')]; break;
    case 'na': parts = [paint(new THREE.IcosahedronGeometry(0.15, 0).toNonIndexed(), PCOL.na)]; break;
    case 'k': parts = [paint(new THREE.OctahedronGeometry(0.22, 0).toNonIndexed(), PCOL.k)]; break;
    case 'protein': parts = [paint(blob(0.36, 0.22, 3, 12, 9).toNonIndexed(), PCOL.protein)]; break;
    case 'atp': parts = [paint(S(0.13), '#ffffff'), paint(at(S(0.075), 0.2), '#ffffff'), paint(at(S(0.075), 0.33), '#ffffff'), paint(at(S(0.075), 0.46), '#ffffff')]; break;
    default: parts = [paint(S(0.16), subColor(id))];
  }
  // alle deler må ha samme indeksering før sammenslåing
  const flat = parts.map((g) => (g.index ? g.toNonIndexed() : g));
  flat.forEach((g) => { if (!g.attributes.normal) g.computeVertexNormals(); g.deleteAttribute('uv'); });
  const geo = mergeGeometries(flat); geo.computeBoundingSphere();
  const mat = id === 'atp'
    ? new THREE.MeshBasicMaterial({ color: ENERGY.clone(), toneMapped: false })
    : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, metalness: 0, emissive: new THREE.Color(subColor(id)), emissiveIntensity: 0.12, envMapIntensity: 0.6 });
  const kit = { geo, mat, color: subColor(id) };
  pcache.set(id, kit);
  return kit;
}
const lcache = new Map();
/** Delt merkelapp-materiale per tekst (mange partikler kan dele samme). */
export function labelMat(text, color) {
  const k = text + '|' + color;
  if (!lcache.has(k)) { const s = makeLabel(text, { color, size: 1 }); lcache.set(k, { mat: s.material, aspect: s.userData.aspect }); }
  return lcache.get(k);
}

/** Rydd bort alt under et objekt, unntatt det som er merket delt (userData.shared). */
export function disposeTree(obj) {
  obj.traverse((o) => {
    if (o.userData && o.userData.shared) return;
    if (o.geometry && !o.geometry.userData?.shared) o.geometry.dispose();
    const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of ms) { if (m.userData?.shared) continue; if (m.map) m.map.dispose(); m.dispose(); }
  });
}

// =====================================================================

export class Stage {
  constructor(container, cb = {}) {
    this.container = container; this.cb = cb; this.view = null;
    this.clock = new THREE.Clock(); this.frameAvg = 16; this.frames = 0; this.lowQ = false;
    this.shiftX = 0; this.shiftY = 0; this.t = 0;
    this.lowQ = (navigator.hardwareConcurrency || 8) <= 2;

    const renderer = this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.lowQ ? 1 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
    renderer.domElement.setAttribute('aria-hidden', 'true'); // illustrasjon; alt kan gjøres med knappene

    const scene = this.scene = new THREE.Scene();
    scene.background = new THREE.Color('#06141b');
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    camera.position.set(0, 1.5, 13);
    const controls = this.controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; controls.enableDamping = true; controls.dampingFactor = 0.08; controls.autoRotateSpeed = 0.8;
    this.key = new THREE.DirectionalLight('#eaffff', 1.15); this.key.position.set(4, 7, 6); scene.add(this.key);
    const rim = new THREE.DirectionalLight('#3fd0d8', 0.9); rim.position.set(-6, 2, -5); scene.add(rim);
    scene.add(new THREE.AmbientLight('#8fb0b3', 0.25));

    { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); const g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); this.dot = new THREE.CanvasTexture(c); }
    this._backdrop();

    const composer = this.composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.4, 1.1);
    this.bloom.enabled = !this.lowQ;
    composer.addPass(this.bloom); composer.addPass(new OutputPass());

    this.ray = new THREE.Raycaster(); this.pointer = new THREE.Vector2();
    this._input();
    this._ro = new ResizeObserver(() => this.resize()); this._ro.observe(container); this.resize();
    renderer.setAnimationLoop(() => this._loop());
  }

  _backdrop() {
    const sky = new THREE.Mesh(new THREE.SphereGeometry(90, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fragmentShader: SKY_FRAG,
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    }));
    this.scene.add(sky);
    const n = 220, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 40; pos[i * 3 + 1] = (Math.random() - 0.5) * 22; pos[i * 3 + 2] = (Math.random() - 0.5) * 40; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.dust = new THREE.Points(g, new THREE.PointsMaterial({ color: '#9fe6ea', size: 0.09, map: this.dot, transparent: true, opacity: 0.35, depthWrite: false }));
    this.scene.add(this.dust);
  }

  /** Bytt visning. Den gamle ryddes helt bort (geometrier, materialer, teksturer). */
  setView(view) {
    if (this.view) { this.scene.remove(this.view.root); this.view.dispose && this.view.dispose(); disposeTree(this.view.root); }
    this.view = view; this.hover = null;
    if (!view) return;
    this.scene.add(view.root);
    const v = view.view || {};
    this.controls.minPolarAngle = v.minPolar ?? 0; this.controls.maxPolarAngle = v.maxPolar ?? Math.PI;
    this.controls.minAzimuthAngle = v.minAz ?? -Infinity; this.controls.maxAzimuthAngle = v.maxAz ?? Infinity;
    this.controls.enableRotate = v.rotate !== false;
    this.controls.target.copy(view.target || new THREE.Vector3());
    const dir = (v.dir ? new THREE.Vector3(...v.dir) : new THREE.Vector3(0, 0.12, 1)).normalize();
    this.camera.position.copy(this.controls.target).addScaledVector(dir, this.fitDistance());
    this.controls.update();
  }

  /** Avstand som får visningens radius til å passe i det ledige feltet (utenfor paneler). */
  fitDistance() {
    const r = (this.view && this.view.radius) || 5;
    const w = Math.max(2, this.container.clientWidth), h = Math.max(2, this.container.clientHeight);
    const fw = Math.max(0.35, (w - 2 * Math.abs(this.shiftX)) / w), fh = Math.max(0.3, (h - 2 * Math.abs(this.shiftY)) / h);
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const d = (r / (tan * Math.min(fh, (w / h) * fw))) * 1.08;
    this.controls.minDistance = d * 0.45; this.controls.maxDistance = d * 1.8;
    return d;
  }
  /** Flytt scenen ut fra paneler: x = piksler mot høyre, y = piksler opp. Kameraet zoomer så alt får plass. */
  setShift(x, y) {
    x = Math.round(x); y = Math.round(y);
    if (x === this.shiftX && y === this.shiftY) return;
    const before = this.view ? this.fitDistance() : 0;
    this.shiftX = x; this.shiftY = y; this.resize();
    if (this.view && before) {
      const after = this.fitDistance(), off = this.camera.position.clone().sub(this.controls.target);
      this.camera.position.copy(this.controls.target).addScaledVector(off, after / before);
    }
  }
  refit() { if (!this.view) return; const off = this.camera.position.clone().sub(this.controls.target).normalize(); this.camera.position.copy(this.controls.target).addScaledVector(off, this.fitDistance()); }

  resize() {
    const w = Math.max(2, this.container.clientWidth), h = Math.max(2, this.container.clientHeight);
    this.renderer.setSize(w, h, false); this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.setViewOffset(w, h, -this.shiftX, this.shiftY, w, h); // kaller også updateProjectionMatrix
  }

  _setPointer(e) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(this.pointer, this.camera);
  }
  /** Hva ligger under pekeren? Skall (membran/vegg) har lav prioritet, så organellene inni kan velges. */
  pick() {
    const list = this.view && this.view.pickables; if (!list || !list.length) return null;
    const hits = this.ray.intersectObjects(list, true);
    const idOf = (o) => { while (o && !(o.userData && o.userData.pickId)) o = o.parent; return o ? o.userData : null; };
    let low = null;
    for (const hit of hits) { const u = idOf(hit.object); if (!u) continue; if (!u.pickLow) return u.pickId; if (!low) low = u.pickId; }
    return low;
  }
  _input() {
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', (e) => { this.downAt = [e.clientX, e.clientY]; });
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      this._setPointer(e); const id = this.pick();
      el.style.cursor = id ? 'pointer' : 'grab';
      if (id !== this.hover) { this.hover = id; this.cb.onHover && this.cb.onHover(id); }
    });
    el.addEventListener('pointerup', (e) => {
      if (!this.downAt || Math.hypot(e.clientX - this.downAt[0], e.clientY - this.downAt[1]) > 6) { this.downAt = null; return; }
      this.downAt = null; this._setPointer(e);
      this.cb.onPick && this.cb.onPick(this.pick());
    });
    el.addEventListener('pointerleave', () => { if (this.hover) { this.hover = null; this.cb.onHover && this.cb.onHover(null); } });
  }

  /** Ett bilde. Kalles av animasjonsløkka – og direkte i tester når fanen er skjult. */
  step(dt) {
    dt = Math.min(Math.max(dt, 0), 1 / 20); this.t += dt;
    if (this.onStep) this.onStep(dt);
    this.controls.update();
    if (this.view) this.view.update(dt, this.t);
    if (!reducedMotion()) this.dust.rotation.y = this.t * 0.01;
    this.composer.render();
  }
  _loop() {
    const raw = this.clock.getDelta();
    // enkel kvalitetsvakt for svake maskiner (som i Molekylverkstedet)
    this.frameAvg += (raw * 1000 - this.frameAvg) * 0.05;
    if (!this.lowQ && ++this.frames > 150 && this.frameAvg > 30) { this.lowQ = true; this.bloom.enabled = false; this.renderer.setPixelRatio(1); this.resize(); }
    this.step(raw);
  }
}
