import { getPortfolioContent } from '../../data/translations';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Edges, PerspectiveCamera, RenderTexture } from '@react-three/drei';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useFrame, useThree } from '@react-three/fiber';
import { CanvasTexture, LinearFilter, SRGBColorSpace, Vector2, Object3D, MathUtils, Raycaster } from 'three';
import { gsap } from '../../lib/gsap';
import { journey } from '../OverdriveJourney';
import OverdriveFinale from './OverdriveFinale';
import { makeBootTexture, diagnosticShader } from './OverdriveDiagnostics';

// A textura é uma captura DOM pontual anterior à entrada, não um stream de tela.
let pendingSnapshot = null;
const surfaces = new Map();
export function clearScreenRipSnapshot() { pendingSnapshot = null; }

// Montar em cada Canvas existente para preservar seus pixels na captura DOM.
export function CaptureSurface() {
  const { gl, scene, camera } = useThree();
  useLayoutEffect(() => {
    const capture = () => { gl.render(scene, camera); return gl.domElement.toDataURL('image/png'); };
    surfaces.set(gl.domElement, capture);
    return () => { surfaces.delete(gl.domElement); };
  }, [gl, scene, camera]);
  return null;
}

export async function captureScreenRip(root, isCurrent = () => true) {
  if (!root) throw new Error('Layout indisponível para captura.');
  const { toCanvas } = await import('html-to-image');
  await document.fonts.ready;
  const restorations = [];
  try {
    // O backbuffer WebGL normal não persiste. Renderiza e copia uma única vez,
    // sem habilitar preserveDrawingBuffer no loop normal do portfólio.
    for (const canvas of root.querySelectorAll('canvas')) {
      const capture = surfaces.get(canvas);
      if (!capture || canvas.closest('.hologram-stage')) continue;
      const original = Object.getOwnPropertyDescriptor(canvas, 'toDataURL');
      const image = capture();
      Object.defineProperty(canvas, 'toDataURL', { configurable: true, value: () => image });
      restorations.push(() => {
        if (original) Object.defineProperty(canvas, 'toDataURL', original);
        else delete canvas.toDataURL;
      });
    }
    const result = await toCanvas(root, {
      backgroundColor: '#000', width: window.innerWidth, height: window.innerHeight,
      pixelRatio: Math.min(1, window.devicePixelRatio, 1600 / window.innerWidth),
      skipFonts: true, // The portfolio uses local system/monospace fonts.
      filter: node => !(node instanceof Element && (node.matches('dialog,.overdrive-controls,.skip-link') || (node.tagName === 'CANVAS' && node.closest('.hologram-stage')))),
      style: { transform: `translateY(${-window.scrollY}px)`, transformOrigin: 'top left' },
    });
    if (isCurrent()) pendingSnapshot = result;
  } finally { restorations.forEach(restore => restore()); }
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uClickPulse;
  uniform vec2 uClickPosition;
  uniform vec2 uResolution;
  void main() {
    vUv = uv;
    vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
    vec2 radial = (uv - uClickPosition) * aspect;
    float distanceToClick = length(radial);
    float radius = (1.0 - uClickPulse) * 1.3;
    float ring = exp(-pow((distanceToClick - radius) / 0.11, 2.0));
    // Bordas fixas: o plano continua cobrindo a viewport durante o impacto.
    float border = smoothstep(0.0, 0.08, min(min(uv.x,uv.y),min(1.0-uv.x,1.0-uv.y)));
    vec2 push = radial / max(distanceToClick, 0.001) / aspect;
    vec2 displaced = position.xy + push * ring * uClickPulse * border * 0.13;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, position.z, 1.0);
  }
`;
const fragmentShader = /* glsl */ `
  uniform float uFinale;
  uniform sampler2D uScreen;
  uniform sampler2D uLogs;
  uniform sampler2D uBoot;
  uniform sampler2D uHologram;
  uniform float uTime;
  uniform float uBreachIntensity;
  uniform float uActive;
  uniform vec2 uPointer;
  uniform vec2 uResolution;
  uniform float uSourceAspect;
  varying vec2 vUv;
  float hash(float x) { return fract(sin(x * 127.1 + 311.7) * 43758.5453); }
  vec2 fitScreen(vec2 uv) {
    float targetAspect = uResolution.x / max(1.0, uResolution.y);
    vec2 q = uv - 0.5;
    if (targetAspect > uSourceAspect) q.x *= targetAspect / uSourceAspect;
    else q.y *= uSourceAspect / targetAspect;
    return q + 0.5;
  }
  vec3 screen(vec2 uv) {
    uv = fitScreen(uv);
    if (min(uv.x, uv.y) < 0.0 || max(uv.x, uv.y) > 1.0) return vec3(0.0);
    return texture2D(uScreen, uv).rgb;
  }
  ${diagnosticShader}
  vec3 reboot(vec2 uv) {
    float t=uFinale;

    vec3 clean=screen(uv);
    vec2 huv=(uv-vec2(.70,.40))/vec2(.27,.40);
    if(min(huv.x,huv.y)>=0. && max(huv.x,huv.y)<=1.) clean+=texture2D(uHologram,huv).rgb;
    // Digital horizontal tearing starts on contact. No angular UV transforms.
    if(t<1.65) {
      float row=floor(uv.y*115.);
      float tick=floor(t*47.);
      float seed=hash(row+tick*19.);
      float side=step(.5,hash(row*3.1))*2.-1.;
      float shift=side*(.035+seed*.55)*(.55+.45*smoothstep(0.,.9,t));
      float split=.006+seed*.028;
      float collapse=smoothstep(1.47,1.65,t);
      float band=max(.001,1.-collapse);
      if(abs(uv.y-.5)>band*.5) return vec3(0.);
      vec2 displaced=vec2(uv.x,(uv.y-.5)/band+.5)+vec2(shift,0.);
      vec3 broken=vec3(screen(displaced+vec2(split,0.)).r,screen(displaced).g,screen(displaced-vec2(split,0.)).b);
      float staticBits=step(.87,hash(floor(uv.x*320.)+row*91.+tick));
      return broken+vec3(staticBits*.28);
    }
    // One full second of pure black after the horizontal failure.
    if(t<2.65) return vec3(0.);
    if(t<3.5) {
      float beamY=1.-(t-2.65)/.85;
      float pixel=1./max(uResolution.y,1.);
      float laser=1.-smoothstep(pixel*.45,pixel*1.25,abs(uv.y-beamY));
      float halo=exp(-abs(uv.y-beamY)/max(pixel*2.,.0001))*.13;
      return vec3(.05,.8,1.)*(laser*1.8+halo);
    }
    if(t<11.5) return diagnostics(uv,t-3.5);
    // One dry loss of sync, then two video fields snap into place; no fade.
    if(t<11.56) return vec3(0.);
    if(t<11.84) {
      float progress=clamp((t-11.56)/.28,0.,1.);
      float parity=mod(floor(uv.y*uResolution.y),2.);
      float offset=(1.-progress)*.035*(parity*2.-1.);
      vec2 aligned=uv+vec2(0.,offset);
      vec3 hud=screen(aligned);
      vec2 h=(aligned-vec2(.70,.40))/vec2(.27,.40);
      if(min(h.x,h.y)>=0. && max(h.x,h.y)<=1.)hud+=texture2D(uHologram,h).rgb;
      return hud*(progress>.52 ? 1. : 1.-parity);
    }
    // Status acknowledgement is held before controls are released.
    if(t<12.35 && mod(t*5.,1.)<.72 && uv.x>.61 && uv.y>.27 && uv.y<.32)
      return texture2D(uBoot,uv).rgb;
    return clean;
  }

  void main() {
    if(uFinale>=0.) {
      gl_FragColor=vec4(reboot(vUv),1.);
      #include <colorspace_fragment>
      return;
    }
    float slices = 46.0 + 17.5 * sin(uTime * 0.73) + 8.25 * sin(uTime * 1.31);
    float band = floor(vUv.y * slices);
    // Relógio independente dos ciclos de logos; pulsos esparsos e localizados.
    float microTick = floor(uTime * 23.7);
    float micro = step(0.94, hash(microTick + 73.0))
      * step(0.77, hash(band + microTick * 3.7));
    float impact = uBreachIntensity + micro * 0.16;
    float strength = 0.65 + impact;
    float tick = floor(uTime * 11.0);
    float noise = hash(band + tick * 19.0);
    float dy = abs(vUv.y - uPointer.y);
    float blade = uActive * (1.0 - smoothstep(0.025, 0.075, dy));
    float cut = uActive * (1.0 - smoothstep(0.026, 0.032, dy));
    // Grandes deslocamentos por faixa, sem ruído caro nem loops de pixels na CPU.
    float displacement = (noise - 0.5) * (0.045 + step(0.76, noise) * 0.22);
    displacement *= strength;
    displacement += blade * (vUv.x < uPointer.x ? -0.18 : 0.18);
    float seam = 1.0 - smoothstep(0.0, 0.065, fract(vUv.y * slices));
    float chroma = (seam * 0.012 + blade * 0.022) * (0.5 + noise) * (1.0 + impact * 2.5);
    vec2 shifted = vUv + vec2(displacement, (0.0015 + impact * 0.006) * sin(uTime * 31.0 + band));
    vec3 broken = vec3(screen(shifted + vec2(chroma,0.0)).r,
      screen(shifted).g, screen(shifted - vec2(chroma,0.0)).b);
    // Ecos analíticos de movimento: sem buffers históricos de tela inteira.
    // Duas amostras atrasadas simulam persistência branca do fósforo.
    for (int i = 1; i <= 2; i++) {
      float age = float(i) * 0.037;
      float past = max(0.0, uTime - age);
      float oldNoise = hash(band + floor(past * 11.0) * 19.0);
      float oldShift = (oldNoise - 0.5) * (0.045 + step(0.76,oldNoise)*0.22) * strength;
      oldShift += blade * (vUv.x < uPointer.x ? -0.18 : 0.18);
      vec3 echo = screen(vUv + vec2(oldShift, 0.003 * sin(past*31.0+band)));
      float white = dot(echo, vec3(0.2126,0.7152,0.0722));
      broken += vec3(white) * (0.12 / float(i)) * smoothstep(0.002,0.03,abs(oldShift-displacement));
    }
    vec2 logUv = vec2(vUv.x * min(1.0, uResolution.x / 1000.0), fract(vUv.y + uTime * 0.045));
    vec2 parallax = (uPointer - 0.5) * uActive * 0.018;
    vec3 nearLogs = texture2D(uLogs, vec2(logUv.x, fract(logUv.y + parallax.y))).rgb;
    vec2 farUv = vec2(logUv.x * 1.35 + 0.1 + parallax.x, fract(vUv.y * 1.15 + uTime * 0.023));
    vec3 farLogs = texture2D(uLogs, farUv).rgb * 0.17;
    float row = floor(vUv.y * 64.0);
    float sparkle = 0.85 + 0.35 * hash(row + floor(uTime * 13.0));
    float scan = 1.0 - smoothstep(0.0, 0.06, abs(fract(vUv.y + uTime * 0.16) - 0.5));
    vec3 logs = nearLogs * sparkle + farLogs + nearLogs * scan * 0.6;
    float automaticSlit = step(0.96, noise) * (1.0 - smoothstep(0.0, 0.16, fract(vUv.y * slices)));
    float opening = max(cut, automaticSlit);
    vec3 color = mix(broken, logs, opening);
    float edge = uActive * (1.0 - smoothstep(0.0008,0.0025,abs(dy-0.03)));
    color += vec3(edge * 0.5);
    vec2 paneOrigin = vec2(0.70, 0.40);
    vec2 paneSize = vec2(0.27, 0.40);
    if (uResolution.x < uResolution.y) { paneOrigin = vec2(0.50,0.52); paneSize = vec2(0.47,0.30); }
    vec2 huv = (vUv - paneOrigin) / paneSize;
    if (min(huv.x,huv.y) >= 0.0 && max(huv.x,huv.y) <= 1.0) {
      // Mesmo ruído temporal e mesma intensidade para a página e a logo.
      float shift = (noise - 0.5) * impact * 0.12;
      vec2 lookup = huv + vec2(shift, 0.0);
      float rgb = impact * 0.025;
      vec4 red = texture2D(uHologram, clamp(lookup + vec2(rgb,0.0),0.0,1.0));
      vec4 green = texture2D(uHologram, clamp(lookup,0.0,1.0));
      vec4 blue = texture2D(uHologram, clamp(lookup - vec2(rgb,0.0),0.0,1.0));
      float coverage = max(red.a,max(green.a,blue.a));
      vec3 live = vec3(red.r, green.g, blue.b);
      // O render target fornece RGB já coberto pelo alpha nas bordas.
      // Composição preserva o conteúdo sob os texels transparentes.
      color = color * (1.0 - coverage) + live;
      for (int i = 1; i <= 2; i++) {
        float past = max(0.0,uTime-float(i)*0.037);
        float oldShift = (hash(band+floor(past*11.0)*19.0)-0.5)*impact*0.12;
        vec2 echoUv = huv + vec2(oldShift - float(i)*0.009,0.0);
        vec3 echo = texture2D(uHologram,clamp(echoUv,0.0,1.0)).rgb;
        color += vec3(max(echo.r,max(echo.g,echo.b))) * (0.20/float(i));
      }
    }
    float staticNoise = step(0.985, hash(floor(vUv.x*450.0)+floor(vUv.y*260.0)*19.0+tick));
    color += vec3(staticNoise * (impact * 0.18 + micro * 0.12));
    // Preto do snapshot não vira uma superfície opaca diante da cena.
    float luminosity = max(color.r, max(color.g, color.b));
    if (luminosity < 0.002) discard;
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

function makeLogTexture() {
  const { about, projects, education, skills } = getPortfolioContent(usePortfolioStore.getState().language);
  const canvas = document.createElement('canvas');
  canvas.width = 1536; canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D indisponível para telemetria.');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = '17px monospace'; ctx.fillStyle = '#fff';
  const lines = [
    '[KERNEL] SCREEN BUFFER DETACHED // LOCAL VISUAL SIMULATION',
    `[IDENTITY] ${about.name} // ${about.role}`,
    ...projects.map(p => `[PROJECT] ${p.title} :: ${p.technologies.join(' / ')}`),
    ...education.map(e => `[EDUCATION] ${e.institution} :: ${e.course} :: ${e.status}`),
    ...skills.map(s => `[STACK] ${s.category} :: ${s.items.join(' / ')}`),
    '[CONTROL] ESC / X -> RESTORE TERMINAL // NO REMOTE MEMORY ACCESS',
  ];
  for (let row = 0; row < 32; row++) {
    const line = lines[row % lines.length];
    ctx.fillStyle = '#fff';
    ctx.fillText(`0x${(row * 4096).toString(16).toUpperCase().padStart(8, '0')}  ${line}`, 24, 20 + row * 32);
    ctx.font = '10px monospace'; ctx.fillStyle = '#aaa';
    const bytes = Array.from(line.slice(0, 65), c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    ctx.fillText(bytes, 24, 31 + row * 32);
    ctx.font = '17px monospace';
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace; texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter; texture.generateMipmaps = false;
  return texture;
}


export default function OverdriveScene({ animate = true, hologram = null }) {
  const materialRef = useRef();
  const cinema = useRef({ time: -1, reach: 0, done: false, lastTick: 0, unlocked: false });
  const ambient = useRef();
  const keyLight = useRef();
  const glow = useRef();
  const hoveredItem = usePortfolioStore(s => s.hoveredItem);
  const previousItem = useRef(usePortfolioStore.getState().hoveredItem);
  useEffect(() => () => {
    const store = usePortfolioStore.getState();
    if (previousItem.current) store.setHoveredItem(previousItem.current);
    else store.clearHoveredItem();
  }, []);
  useEffect(() => {
    if (!animate) return;
    const options = ['Python', 'React', 'Docker', 'FastAPI', 'Django', 'TypeScript'];
    const cycle = () => {
      const store = usePortfolioStore.getState();
      const choices = options.filter(item => item !== store.hoveredItem);
      store.setHoveredItem(choices[Math.floor(Math.random()*choices.length)]);
    };
    cycle();
    const timer = setInterval(cycle, 1500);
    return () => clearInterval(timer);
  }, [animate]);
  const meshRef = useRef();
  const { gl, invalidate, camera, size } = useThree();
  const [textures, setTextures] = useState(null);
  const elapsed = useRef(0);
  const progress = useRef(0);

  const ready = useRef(false);

  const screenAspect = pendingSnapshot ? pendingSnapshot.width / pendingSnapshot.height : 16 / 9;
  const screenWidth = 4.5 * screenAspect;
  // All camera edits are scoped to Overdrive; restore the approved camera on exit.
  useLayoutEffect(() => {
    const saved = { position: camera.position.clone(), quaternion: camera.quaternion.clone(), fov: camera.fov, near: camera.near, far: camera.far };
    journey.scroll = 0; journey.setLocked(false); journey.setReady(false);
    const resync = () => { cinema.current.lastTick=performance.now(); };
    document.addEventListener('visibilitychange', resync);
    window.addEventListener('overdrive-scroll', invalidate);
    camera.fov = 40; camera.near = 0.05; camera.far = 100;
    camera.updateProjectionMatrix();
    return () => {
      document.removeEventListener('visibilitychange', resync);
      window.removeEventListener('overdrive-scroll', invalidate);
      journey.scroll = 0; journey.setLocked(false); journey.setReady(false);
      camera.position.copy(saved.position); camera.quaternion.copy(saved.quaternion);
      camera.fov = saved.fov; camera.near = saved.near; camera.far = saved.far;
      camera.updateProjectionMatrix();
    };
  }, [camera, invalidate]);
  const uniformsRef = useRef(null);
  const breach = useRef(null);
  useLayoutEffect(() => {
    // Exigir a captura evita apresentar uma falsa imagem do site como "exata".
    if (!pendingSnapshot) throw new Error('Screen-Rip precisa da captura anterior à entrada.');
    const screen = new CanvasTexture(pendingSnapshot);
    screen.colorSpace = SRGBColorSpace; screen.minFilter = LinearFilter;
    screen.magFilter = LinearFilter; screen.generateMipmaps = false;
    const logs = makeLogTexture();
    const boot = makeBootTexture();
    uniformsRef.current = {
      uFinale: { value: -1 }, uScreen: { value: screen }, uLogs: { value: logs }, uBoot: { value: boot }, uTime: { value: 0 },
      uHologram: { value: null }, uBreachIntensity: { value: 2 }, uActive: { value: 0 }, uPointer: { value: new Vector2(0.5, 0.5) },
      uResolution: { value: new Vector2(1, 1) },
      uClickPulse: { value: 0 }, uClickPosition: { value: new Vector2(0.5, 0.5) },
      uSourceAspect: { value: pendingSnapshot.width / pendingSnapshot.height },
    };
    setTextures({ screen, logs, boot }); invalidate();
    return () => { screen.dispose(); logs.dispose(); boot.dispose(); };
  }, [invalidate]);
  useLayoutEffect(() => {
    if (!textures) return;
    const geometry = meshRef.current.geometry, material = materialRef.current;
    return () => { geometry.dispose(); material.dispose(); };
  }, [textures]);
  useLayoutEffect(() => {
    const previousAlpha = gl.getClearAlpha();
    gl.setClearAlpha(0);
    return () => gl.setClearAlpha(previousAlpha);
  }, [gl]);
  useLayoutEffect(() => {
    if (!textures || !materialRef.current) return;
    const ctx = gsap.context(() => {
      breach.current = gsap.fromTo(materialRef.current.uniforms.uBreachIntensity,
        { value: 2 }, { value: 0.12, duration: 0.65, ease: 'expo.out', paused: true, onUpdate: invalidate });
    });
    return () => { ctx.revert(); breach.current = null; };
  }, [textures, hoveredItem, invalidate]);
  useLayoutEffect(() => {
    if (!breach.current) return;
    if (animate) breach.current.play(); else breach.current.pause();
  }, [animate, hoveredItem, textures]);
  useEffect(() => {
    if (!textures || !animate) return;
    const ray = new Raycaster();
    const ndc = new Vector2();
    const pulse = materialRef.current.uniforms.uClickPulse;
    const tween = gsap.fromTo(pulse, { value: 1 }, {
      value: 0, duration: 0.55, ease: 'none', paused: true, immediateRender: false,
      onUpdate: invalidate,
    });
    const click = event => {
      if (journey.locked) return;
      if (event.target !== gl.domElement && !event.target.closest?.('[data-overdrive-scroll]')) return;
      const rect = gl.domElement.getBoundingClientRect();
      ndc.set((event.clientX - rect.left) / rect.width * 2 - 1,
        1 - (event.clientY - rect.top) / rect.height * 2);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObject(meshRef.current, false)[0];
      if (!hit?.uv) return;
      materialRef.current.uniforms.uClickPosition.value.copy(hit.uv);
      tween.restart();
    };
    window.addEventListener('click', click);
    return () => { window.removeEventListener('click', click); tween.kill(); pulse.value = 0; };
  }, [textures, animate, gl, camera, invalidate]);
  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const dt = Math.min(delta, 0.05);
    const u = material.uniforms;
    u.uResolution.value.set(textures.screen.image.width, textures.screen.image.height);
    // Reduced motion / paused effects skip the cinematic intro, keeping navigation usable.
    if (animate) { elapsed.current += dt; u.uTime.value += dt; }
    else elapsed.current = Math.max(elapsed.current, 6);
    u.uPointer.value.set(0.5, (u.uTime.value * 0.23) % 1);
    u.uActive.value = 1;
    const intro = MathUtils.smoothstep(elapsed.current, 3.2, 6);
    if (intro >= 1 && !ready.current) {
      ready.current = true;
      journey.setReady(true); // One transition, never a per-frame React update.
    }
    const target = journey.scroll;
    progress.current = animate ? MathUtils.damp(progress.current, target, 6, dt) : target;
    const t = Math.min(progress.current / 0.5, 1);
    const reach = MathUtils.smoothstep(progress.current, 0.52, 0.985);
    cinema.current.reach = reach;
    if (reach >= 0.999 && cinema.current.time < 0) {
      cinema.current.time = 0;
      cinema.current.lastTick = performance.now();
      journey.setLocked(true);
    }
    if (cinema.current.time >= 0 && !cinema.current.done) {
      // One continuous clock; hidden tabs do not jump ahead through the story.
      const before = cinema.current.time;
      const now = performance.now();
      if (document.visibilityState === 'visible') cinema.current.time += animate ? Math.max(0,(now-cinema.current.lastTick)/1000) : 12.65;
      // Start black on an actually rendered frame, then hold for one visible second.
      if(animate && before<1.65 && cinema.current.time>=1.65) cinema.current.time=1.65;
      cinema.current.lastTick=now;
      if(cinema.current.time>=12.35 && !cinema.current.unlocked) {
        cinema.current.unlocked=true; journey.setLocked(false);
      }
      if (cinema.current.time >= 12.65) {
        cinema.current.done = true;
        usePortfolioStore.getState().toggleOverdriveMode(false);
        return;
      }
    }
    const time = cinema.current.time;
    u.uFinale.value = time;
    const dark = time < 0 ? 0 : (time>=1.65 && time<11.56 ? 1 : 0);
    ambient.current.intensity = 0.8 * (1-dark) + 0.012*dark;
    keyLight.current.intensity = 2.4*(1-dark);
    glow.current.intensity = time>=2.65 && time<11.5 ? .4 : 0;
    glow.current.color.set('#8cddff');
    const fitDistance = 2.25 / Math.tan(MathUtils.degToRad(camera.fov / 2));
    const initial = fitDistance * Math.max(1, screenAspect / (size.width / size.height));
    const roomDistance = Math.max(12, Math.max(15, screenWidth + 7) / (2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * (size.width / size.height)) * 1.15 - initial - 1.7);
    camera.position.set(t * 3.4, 3.5 + intro * 0.22 + t * 4.2, initial + intro * 1.7 + t * roomDistance);
    // The second half of scroll approaches the power button, keeping the monitor in view.
    const angle = reach * 0.7;
    camera.position.x += angle * (screenWidth/2 + 1);
    camera.position.z -= angle * 5;
    camera.lookAt(reach*(screenWidth/2+1.85)*0.35, 3.5-t*1.9+reach*0.8, -t*0.3);
    if(time>=10.5) {
      const restore=MathUtils.smoothstep(time,10.5,12.58);
      camera.position.x*=1-restore;
      camera.position.y=MathUtils.lerp(camera.position.y,3.5,restore);
      camera.position.z=MathUtils.lerp(camera.position.z,initial,restore);
      camera.lookAt((1-restore)*reach*(screenWidth/2+1.85)*0.35,MathUtils.lerp(3.5-t*1.9+reach*0.8,3.5,restore),-t*.3*(1-restore));
    }
    if (state.frameloop === 'demand' && (animate || Math.abs(progress.current - target) > 0.001)) invalidate();
  });
  return textures && <>
    <ambientLight ref={ambient} intensity={0.8} />
    <directionalLight ref={keyLight} position={[3, 9, 5]} intensity={2.4} color="#ffffff" />
    <pointLight ref={glow} position={[0,3.5,1.5]} intensity={0} distance={25} decay={2} />
    <Workstation width={screenWidth} cinema={cinema} />
    <OverdriveFinale cinema={cinema} towerX={screenWidth/2+1.85} />
    <mesh ref={meshRef} position={[0, 3.5, 0.085]} scale={[screenWidth / 2, 2.25, 1]} frustumCulled={false} dispose={null}>
      <planeGeometry args={[2, 2, 96, 64]} />
      <shaderMaterial ref={materialRef} uniforms={uniformsRef.current}
        vertexShader={vertexShader} fragmentShader={fragmentShader}
        depthTest depthWrite toneMapped={false}>
        <RenderTexture attach="uniforms-uHologram-value" width={512} height={512} samples={0} frames={animate ? Infinity : 1}>
          <PerspectiveCamera makeDefault position={[0,0,4.5]} fov={42} />
          {hologram}
        </RenderTexture>
      </shaderMaterial>
    </mesh>

  </>;
}

// Dark solid surfaces + restrained contour lines: no lights/shadows per key.
function Chassis({ position, dimensions, color = '#090909', edges = '#666666', rotation }) {
  return <mesh position={position} rotation={rotation}>
    <boxGeometry args={dimensions} />
    <meshStandardMaterial color={color} roughness={0.72} metalness={0.32} />
    <Edges threshold={30} color={edges} />
  </mesh>;
}

function Keyboard() {
  const keys = useRef();
  useLayoutEffect(() => {
    const transform = new Object3D();
    for (let row = 0; row < 5; row++) for (let col = 0; col < 14; col++) {
      transform.position.set((col - 6.5) * 0.25, 0.19, (row - 2) * 0.27);
      transform.updateMatrix(); keys.current.setMatrixAt(row * 14 + col, transform.matrix);
    }
    keys.current.instanceMatrix.needsUpdate = true;
    keys.current.computeBoundingSphere();
  }, []);
  return <group position={[-0.65, 0.12, 2.2]}>
    <Chassis dimensions={[3.8, 0.16, 1.65]} color="#111111" edges="#aaaaaa" />
    <instancedMesh ref={keys} args={[null, null, 70]}>
      <boxGeometry args={[0.20, 0.15, 0.21]} />
      <meshStandardMaterial color="#777777" roughness={0.7} metalness={0.15} />
    </instancedMesh>
    <Chassis position={[0, 0.19, 0.67]} dimensions={[1.5, 0.15, 0.20]} color="#777777" />
  </group>;
}

// Repeated small details share one geometry/material and one draw call.
function Details({ positions, dimensions, color = '#555555' }) {
  const ref = useRef();
  useLayoutEffect(() => {
    const transform = new Object3D();
    positions.forEach((position, index) => {
      transform.position.set(...position); transform.updateMatrix();
      ref.current.setMatrixAt(index, transform.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [positions]);
  return <instancedMesh ref={ref} args={[null, null, positions.length]}>
    <boxGeometry args={dimensions} /><meshStandardMaterial color={color} roughness={0.65} metalness={0.35} />
  </instancedMesh>;
}

function ArmLink({ from, to, thickness = 0.24 }) {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  return <group position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2]} rotation={[0,0,angle]}>
    <Chassis dimensions={[length, thickness, 0.32]} color="#151515" edges="#bbbbbb" />
    <Chassis position={[0, thickness * 0.58, 0]} dimensions={[length * 0.75, 0.045, 0.18]} color="#555555" edges="#777777" />
  </group>;
}
function Joint({ position }) {
  return <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[0.19,0.19,0.4,16]} />
    <meshStandardMaterial color="#555555" metalness={0.7} roughness={0.4} />
    <Edges color="#aaaaaa" />
  </mesh>;
}
function MonitorArm() {
  return <group>
    <Chassis position={[-2.8, 0.02, -0.7]} dimensions={[0.9, 0.12, 0.85]} edges="#bbbbbb" />
    <Chassis position={[-2.8,-0.31,-0.7]} dimensions={[0.24,0.6,0.3]} />
    <Chassis position={[-2.8,0.35,-0.7]} dimensions={[0.24,0.6,0.3]} />
    <ArmLink from={[-2.8,0.6,-0.7]} to={[-1.3,0.95,-0.7]} thickness={0.28} />
    <ArmLink from={[-1.3,0.95,-0.7]} to={[0,3.5,-0.5]} />
    <Joint position={[-2.8,0.6,-0.7]} /><Joint position={[-1.3,0.95,-0.7]} /><Joint position={[0,3.5,-0.5]} />
    <Chassis position={[0,3.5,-0.32]} dimensions={[0.85,0.85,0.12]} edges="#888888" />
    <Details positions={[[-0.32,3.18,-0.39],[0.32,3.18,-0.39],[-0.32,3.82,-0.39],[0.32,3.82,-0.39]]} dimensions={[0.07,0.07,0.04]} color="#cccccc" />
  </group>;
}
function Mouse() {
  return <group position={[2.4,0.14,2.3]}>
    <mesh scale={[0.34,0.18,0.53]}>
      <sphereGeometry args={[1,24,12]} /><meshStandardMaterial color="#202020" metalness={0.25} roughness={0.45} />
    </mesh>
    {[-1,1].map(side => <mesh key={side} position={[side*0.15,0.07,-0.23]} scale={[0.14,0.06,0.28]}>
      <sphereGeometry args={[1,16,8]} /><meshStandardMaterial color="#555555" roughness={0.5} />
    </mesh>)}
    <mesh position={[0,0.2,-0.21]} rotation={[0,0,Math.PI/2]}>
      <cylinderGeometry args={[0.085,0.085,0.075,12]} /><meshStandardMaterial color="#dddddd" roughness={0.7} />
    </mesh>
    <Details positions={[[-0.32,0.03,-0.05],[-0.32,0.03,0.12]]} dimensions={[0.04,0.055,0.11]} color="#aaaaaa" />
    <Chassis position={[0,0.17,0.2]} dimensions={[0.025,0.012,0.16]} color="#ffffff" edges="#ffffff" />
  </group>;
}
function FanBlades({ cinema }) {
  const ref = useRef();
  const matrix = useRef(new Object3D());
  const angle = useRef(0);
  useLayoutEffect(() => {
    const matrix = new Object3D();
    let index = 0;
    for (const y of [-1,0,1]) for (let blade = 0; blade < 5; blade++) {
      matrix.position.set(0,y,1.44); matrix.rotation.z = blade * Math.PI * 2 / 5;
      matrix.updateMatrix(); ref.current.setMatrixAt(index++, matrix.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true; ref.current.computeBoundingSphere();
  }, []);
  useFrame((_,delta)=>{
    const t=cinema.current.time;
    const speed=t>=1.65 && t<3.5?0:t>=3.5 && t<11.56?.7:7;
    angle.current+=Math.min(delta,.05)*speed;
    for(let i=0;i<15;i++) {
      matrix.current.position.set(0,Math.floor(i/5)-1,1.44);
      matrix.current.rotation.z=(i%5)*Math.PI*2/5+angle.current;
      matrix.current.updateMatrix();ref.current.setMatrixAt(i,matrix.current.matrix);
    }
    ref.current.instanceMatrix.needsUpdate=true;
  });
  return <instancedMesh ref={ref} args={[null,null,15]}>
    <planeGeometry args={[0.055,0.57]} /><meshBasicMaterial color="#777777" />
  </instancedMesh>;
}
function Tower({ x, cinema }) {
  const lights=useRef([]), side=useRef(), power=useRef(), disk=useRef();
  useFrame(()=>{
    const t=cinema.current.time;
    const overload=t>=0 && t<1.65;
    for(const light of lights.current) {
      if(!light)continue;
      if(overload) light.color.setRGB(1,.28,.015);
      else if(t>=3.5 && t<11.56) {
        const pulse=.5+.5*Math.sin(t*2.);
        light.color.setRGB(.28+.08*pulse,.10+.10*pulse,.33-.29*pulse);
      }
      else light.color.set(t>=11.56 ? '#cceeff' : t>=1.65 ? '#000000' : '#cccccc');
      const noise=Math.sin(Math.floor(t*39)*127.1+lights.current.indexOf(light)*17.3)*43758.5453;
      light.opacity=overload ? ((noise-Math.floor(noise))>.48 ? 1 : 0) : 1;
    }
    const reading=t>=3.5 && t<11.5;
    const stutter=Math.sin(Math.floor(t*27)*91.7)*43758.5453;
    disk.current.color.setRGB(reading && (stutter-Math.floor(stutter))>.36 ? 1 : .008,0,0);
    side.current.position.x=t>=0 && t<.8 ? Math.sin(t*Math.PI/.8)*0.18 : 0;
    power.current.position.y=t>=0 ? -MathUtils.smoothstep(t,0,.14)*.035*(1-MathUtils.smoothstep(t,11.3,11.56)) : 0;
  });
  return <group position={[x,1.77,-0.3]}>
    <Chassis dimensions={[1.9,3.5,2.8]} color="#111111" edges="#cccccc" />
    <Chassis position={[0,0,1.415]} dimensions={[1.65,3.18,0.035]} color="#030303" edges="#555555" />
    {[-1,0,1].map(y => <group key={y} position={[0,y,1.46]}>
      <mesh><torusGeometry args={[0.37,0.022,6,32]} /><meshBasicMaterial ref={material=>{lights.current[y+1]=material;if(material)material.userData.shortCircuit=true;}} color="#cccccc" transparent /></mesh>
      <mesh><torusGeometry args={[0.28,0.012,5,24]} /><meshBasicMaterial color="#555555" /></mesh>
      <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.085,0.085,0.035,12]} /><meshBasicMaterial color="#aaaaaa" /></mesh>

    </group>)}
    <FanBlades cinema={cinema} />
    <Details positions={Array.from({length:12},(_,i)=>[0,1.76,-1.1+i*0.18])} dimensions={[1.35,0.018,0.025]} color="#777777" />
    <Details positions={[[-0.6,-1.8,-0.9],[0.6,-1.8,-0.9],[-0.6,-1.8,0.9],[0.6,-1.8,0.9]]} dimensions={[0.24,0.1,0.35]} color="#555555" />
    <group ref={side}><Chassis position={[0.96,0,0]} dimensions={[0.02,2.95,2.25]} color="#080808" edges="#444444" /></group>
    <mesh position={[-.22,1.79,.9]} rotation={[-Math.PI/2,0,0]}>
      <planeGeometry args={[.065,.035]} />
      <meshBasicMaterial ref={material=>{disk.current=material;if(material)material.userData.shortCircuit=true;}} color="#000000" toneMapped={false} />
    </mesh>
    <group ref={power}><Chassis position={[-0.5,1.77,0.9]} dimensions={[0.17,0.025,0.17]} color="#cccccc" /></group>
    <Details positions={[[0.05,1.77,0.9],[0.35,1.77,0.9]]} dimensions={[0.19,0.025,0.075]} color="#777777" />
  </group>;
}
function Workstation({ width, cinema }) {
  const root = useRef();
  const outlines = useRef([]);
  useLayoutEffect(() => {
    const materials = new Set();
    root.current.traverse(node => {
      if((node.material?.isLineBasicMaterial || node.material?.isLineMaterial || node.material?.isMeshBasicMaterial) && !node.material.userData.shortCircuit) { node.material.transparent=true; materials.add(node.material); }
    });
    outlines.current=Array.from(materials);
    return () => { outlines.current=[]; };
  }, []);
  useFrame(()=>{
    const t=cinema.current.time;
    const darkness=t<0?0:(t>=1.65 && t<11.56 ? 1 : 0);
    for(const material of outlines.current) material.opacity=1-darkness*(t>=3.5?.88:.98);
  });
  // Explicit clearance, independent of capture aspect ratio: no monitor/case overlap.
  const towerX = width / 2 + 1.85;
  const deskWidth = Math.max(15, width + 7);
  return <group ref={root}>
    <Chassis position={[0,3.5,-0.10]} dimensions={[width+0.32,4.82,0.34]} edges="#dddddd" />
    <Chassis position={[0,1.12,0.08]} dimensions={[0.3,0.025,0.02]} color="#aaaaaa" />
    <MonitorArm />
    <Chassis position={[0,-0.15,1]} dimensions={[deskWidth,0.28,7.2]} color="#101010" edges="#bbbbbb" />
    <Chassis position={[-deskWidth/2+0.7,-1.8,1]} dimensions={[0.24,3.2,5.6]} />
    <Chassis position={[deskWidth/2-0.7,-1.8,1]} dimensions={[0.24,3.2,5.6]} />
    <Chassis position={[0,-1.1,-1.3]} dimensions={[deskWidth-1.4,0.18,0.18]} edges="#444444" />
    <Chassis position={[0.4,0.005,2.3]} dimensions={[6.7,0.025,2.2]} color="#020202" edges="#555555" />
    <Keyboard /><Mouse /><Tower x={towerX} cinema={cinema} />
    <gridHelper args={[42,42,'#333333','#111111']} position={[0,-3.42,0]} />
  </group>;
}
