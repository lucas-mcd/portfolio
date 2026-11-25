import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cachedHologram, loadHologram } from '../../lib/hologramCache';
import { Vector2, Vector3 } from 'three';
import { skillIcons, projects, education, institutionIcons } from '../../data/portfolioData';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import OverdriveScene, { CaptureSurface } from './OverdriveScene';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useMediaQuery, usePageVisible } from '../../hooks/useMediaQuery';

function SceneFallback() {
  return <div className="scene-fallback" />;
}
class SceneErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidUpdate(previous) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }
  render() { return this.state.failed ? <SceneFallback /> : this.props.children; }
}

// Desktop: valores originais, sem fit automático por proporção.
function ResponsiveCamera() {
  const { camera, size, invalidate } = useThree();
  const mobile = useMediaQuery('(max-width: 1023px)');
  useLayoutEffect(() => {
    camera.fov = mobile ? 55 : 42;
    camera.position.set(0, 0, mobile ? 12 : 9);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, mobile, invalidate]);
  return null;
}

// AdaptiveDpr não mede FPS sozinho: este sinal usa janelas de 1 segundo.
// Regressão temporária é renovada somente quando o custo continua alto.
function FrameBudget({ enabled }) {
  const regress = useThree((s) => s.performance.regress);
  const sample = useRef({ elapsed: 0, frames: 0, slow: false });
  useEffect(() => { sample.current = { elapsed: 0, frames: 0, slow: false }; }, [enabled]);
  useFrame((_, delta) => {
    if (!enabled || delta > 0.25) return;
    const s = sample.current;
    s.elapsed += delta;
    s.frames += 1;
    if (s.elapsed < 1) return;
    const fps = s.frames / s.elapsed;
    if (fps < 50) s.slow = true;
    else if (fps > 58) s.slow = false;
    if (s.slow) regress();
    s.elapsed = 0;
    s.frames = 0;
  });
  return null;
}

// Gradiente Perlin 2D: deslocamento calculado na GPU, sem reescrever buffers.
const vertexShader = `
  uniform float uTime;
  uniform float uDpr;
  uniform float uScroll;
  uniform vec2 uPointer;
  uniform vec3 uPulse;
  varying float vEnergy;
  vec2 gradient(vec2 p) {
    float a = fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453) * 6.283185;
    return vec2(cos(a), sin(a));
  }
  float perlin(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*f*(f*(f*6.0-15.0)+10.0);
    return mix(mix(dot(gradient(i),f), dot(gradient(i+vec2(1,0)),f-vec2(1,0)),u.x),
      mix(dot(gradient(i+vec2(0,1)),f-vec2(0,1)),dot(gradient(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);
  }
  void main() {
    vec3 p = position;
    float noise = perlin(p.xy * 0.6 + uTime * 0.22);
    float wave = sin(p.x * 1.8 + uTime * 1.6) * cos(p.y * 1.1 - uTime);
    float age = uTime - uPulse.z;
    float radius = length(p.xy - uPulse.xy);
    float shock = exp(-pow((radius - age * 5.0) * 1.6, 2.0)) * exp(-age * 0.7);
    float influence = exp(-length(p.xy-uPointer) * 0.4);
    p.y += wave * 0.32 + noise * 0.65 + sin(p.x + uScroll * 6.0) * uScroll * 0.35;
    p.z += wave * 0.8 + noise * 1.5 + influence * (1.8 + smoothstep(-2.0, 6.0, p.x) * 2.5) + shock * 2.4 + sin(p.y * 2.0 + uScroll * 8.0) * uScroll;
    vEnergy = clamp(abs(wave) * 0.35 + influence * 0.35 + shock, 0.0, 1.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp((1.7 + vEnergy * 2.3) * uDpr * 5.0 / max(1.0,-mv.z), 1.0, 6.0);
  }
`;
const fragmentShader = `
  varying float vEnergy;
  void main() {
    if (length(gl_PointCoord - 0.5) > 0.5) discard;
    gl_FragColor = vec4(vec3(0.6 + vEnergy * 0.4),1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
function CyberGrid({ animate }) {
  const material = useRef(null);
  const points = useRef(null);
  const input = useRef({ x: 0, y: 0, pulseX: 0, pulseY: 0, hit: false, scroll: 0 });
  const narrow = useMediaQuery('(max-width: 767px)');
  const positions = useMemo(() => {
    const side = narrow ? 72 : 128;
    const buffer = new Float32Array(side * side * 3);
    for (let y = 0; y < side; y++) for (let x = 0; x < side; x++) {
      const i = (y * side + x) * 3;
      buffer[i] = (x / (side - 1) - 0.5) * 16;
      buffer[i + 1] = (y / (side - 1) - 0.5) * 10;
    }
    return buffer;
  }, [narrow]);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uScroll: { value: 0 }, uDpr: { value: 1 },
    uPointer: { value: new Vector2(0, 0) },
    uPulse: { value: new Vector3(0, 0, -100) },
  }), []);
  useEffect(() => {
    if (!animate) return;
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const move = (event) => {
      if (!media.matches || event.pointerType !== 'mouse') return;
      input.current.x = (event.clientX / innerWidth - 0.5) * 12;
      input.current.y = (0.5 - event.clientY / innerHeight) * 8;
    };
    // Capture recebe cliques inclusive sobre os painéis HTML. Touch gera click sem tracking.
    const click = (event) => {
      input.current.pulseX = event.detail === 0 ? 0 : (event.clientX / innerWidth - 0.5) * 12;
      input.current.pulseY = event.detail === 0 ? 0 : (0.5 - event.clientY / innerHeight) * 8;
      input.current.hit = true;
    };
    const scroll = () => {
      const panel = document.querySelector('[data-active-viewport]');
      const node = panel && panel.scrollHeight > panel.clientHeight + 1 ? panel : document.scrollingElement;
      if (node) input.current.scroll = Math.min(1, node.scrollTop / Math.max(1, node.scrollHeight - node.clientHeight));
    };
    scroll();
    document.addEventListener('scroll', scroll, { capture: true, passive: true });
    const reset = () => { input.current.x = 0; input.current.y = 0; };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('click', click, true);
    window.addEventListener('blur', reset);
    media.addEventListener('change', reset);
    return () => {
      document.removeEventListener('scroll', scroll, true);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('click', click, true);
      window.removeEventListener('blur', reset);
      media.removeEventListener('change', reset);
      input.current.hit = false;
    };
  }, [animate]);
  useFrame((state, delta) => {
    const u = material.current.uniforms;
    u.uDpr.value = state.gl.getPixelRatio();
    if (!animate) return;
    const dt = Math.min(delta, 0.05);
    u.uTime.value += dt;
    const ease = 1 - Math.exp(-5 * dt);
    u.uScroll.value += (input.current.scroll - u.uScroll.value) * ease;
    u.uPointer.value.x += (input.current.x - u.uPointer.value.x) * ease;
    u.uPointer.value.y += (input.current.y - u.uPointer.value.y) * ease;
    if (input.current.hit) {
      u.uPulse.value.set(input.current.pulseX, input.current.pulseY, u.uTime.value);
      input.current.hit = false;
    }
    points.current.rotation.y += (input.current.x * 0.035 - points.current.rotation.y) * ease;
    points.current.rotation.x += (-input.current.y * 0.035 - points.current.rotation.x) * ease;
  });
  return <points ref={points} frustumCulled={false}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
  </points>;
}
function ContextLossGuard() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    // R3F/Three fazem a restauração do contexto; escondemos a cena perdida via evento.
    const canvas = gl.domElement;
    const lost = () => { canvas.style.visibility = 'hidden'; };
    const restored = () => { canvas.style.visibility = ''; };
    canvas.addEventListener('webglcontextlost', lost);
    canvas.addEventListener('webglcontextrestored', restored);
    return () => {
      canvas.removeEventListener('webglcontextlost', lost);
      canvas.removeEventListener('webglcontextrestored', restored);
    };
  }, [gl]);
  return null;
}
export default function SceneContainer({ paused = false }) {
  const overdriveMode = usePortfolioStore((state) => state.overdriveMode);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const visible = usePageVisible();
  const mobile = useMediaQuery('(max-width: 1023px)');
  const animate = !reduced && visible && !paused;
  if (overdriveMode || mobile) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 opacity-80">
      <SceneFallback />
      <SceneErrorBoundary>
        <Canvas shadows={false} dpr={[1, 1.5]} frameloop={animate ? 'always' : 'demand'}
          camera={{ position: [0, 0, 6.5], fov: 42, near: 0.1, far: 30 }}
          gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
          performance={{ min: 0.65, max: 1, debounce: 1800 }} fallback={<SceneFallback />}>
          <Suspense fallback={null}>
            <ResponsiveCamera />
            <CyberGrid animate={animate} />
            <CaptureSurface /><AdaptiveDpr />
            <FrameBudget enabled={animate} />
            <ContextLossGuard />
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}

function ExtrudedLogo({ model, animate }) {
  const rotation = useRef(null);
  // Contornos pré-calculados: nenhuma triangulação/extrusão no navegador.

  const invalidate = useThree((s) => s.invalidate);
  useLayoutEffect(() => {
    rotation.current.scale.setScalar(animate ? 0.06 : 1);
    invalidate();
  }, [animate, invalidate]);
  useFrame((_, delta) => {
    if (!animate || !rotation.current) return;
    const dt = Math.min(delta, 0.05);
    rotation.current.rotation.y += 0.9 * dt;
    const value = rotation.current.scale.x;
    rotation.current.scale.setScalar(value + (1 - value) * (1 - Math.exp(-10 * dt)));
  });
  return <group ref={rotation}>
    <group position={model.offset}>
      <lineSegments geometry={model.geometry} scale={[1, -1, 1]}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.85} depthWrite={false} />
      </lineSegments>
    </group>
  </group>;
}

function SvgLogo({ icon, animate }) {
  const [, setLoaded] = useState(null);
  const model = cachedHologram(icon);
  useEffect(() => {
    if (model) return;
    let active = true;
    loadHologram(icon).then(result => {
      if (active) setLoaded(result);
    }).catch(() => {});
    return () => { active = false; };
  }, [icon, model]);
  return model ? <ExtrudedLogo model={model} animate={animate} /> : null;
}
function ResumeModel() {
  return <group>
    <mesh><boxGeometry args={[1.6, 2.2, 0.1]} /><meshBasicMaterial color="#fff" wireframe /></mesh>
    {[0.65, 0.3, -0.05, -0.4, -0.75].map((y, i) => <mesh key={y} position={[-0.1, y, 0.07]}>
      <boxGeometry args={[i === 0 ? 0.6 : 1.05, 0.035, 0.015]} /><meshBasicMaterial color="#fff" />
    </mesh>)}
  </group>;
}
function IdleModel({ animate, resume }) {
  const group = useRef(null);
  useFrame((_, delta) => { if (animate && group.current) group.current.rotation.y += Math.min(delta, 0.05) * 0.9; });
  return <group ref={group}>{resume ? <ResumeModel /> : <mesh><icosahedronGeometry args={[1.1, 1]} /><meshBasicMaterial color="#fff" wireframe /></mesh>}</group>;
}
// Four simultaneous logos per page keep each mark legible and GPU cost bounded.
function ProjectLogos({ icons, animate }) {
  const [page, setPage] = useState(0);
  useEffect(() => {
    if (!animate || icons.length <= 4) return;
    const timer = setInterval(() => setPage(value => (value + 1) % Math.ceil(icons.length / 4)), 4500);
    return () => clearInterval(timer);
  }, [icons, animate]);
  return <group>{icons.slice(page * 4, page * 4 + 4).map((icon, index) =>
    <group key={icon} position={[(index % 2 ? 1 : -1) * .7, (index < 2 ? 1 : -1) * .65, 0]} scale={.48}>
      <SvgLogo icon={icon} animate={animate} />
    </group>)}</group>;
}
function HologramModel({ animate, forceSkill = false }) {
  const activeTab = usePortfolioStore(state => state.activeTab);
  const hoveredItem = usePortfolioStore(state => state.hoveredItem);
  const project = activeTab === 'projects' && projects.find(item => item.title === hoveredItem);
  if (project?.holograms?.length) return <ProjectLogos key={project.id} icons={project.holograms} animate={animate} />;
  if (activeTab === 'education' && !forceSkill) {
    const course = education.find(item => item.id === hoveredItem) ?? education[0];
    const institution = institutionIcons[course.institution];
    if (!course.credential) return <SvgLogo key={institution} icon={institution} animate={animate} />;
    return <group>
      <group position={[-0.83, 0, 0]} rotation={[0, 0.12, 0]} scale={0.64}>
        <SvgLogo icon={institution} animate={animate} />
      </group>
      <group position={[0.83, 0, 0]} rotation={[0, -0.12, 0]} scale={0.68}>
        <SvgLogo key={course.id} icon={course.id} animate={animate} />
      </group>
    </group>;
  }
  const socialIcon = activeTab === 'home' && ['linkedin', 'github'].includes(hoveredItem) ? hoveredItem : null;
  const icon = forceSkill || activeTab === 'skills' ? skillIcons[hoveredItem]
    : socialIcon;
  return icon ? <SvgLogo key={icon} icon={icon} animate={animate} /> : <IdleModel animate={animate} resume={activeTab === 'home'} />;
}

export function HologramViewport({ paused = false }) {
  const overdriveMode = usePortfolioStore((state) => state.overdriveMode);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const visible = usePageVisible();
  const animate = !paused && !reduced && visible;
  return <div className="hologram-stage" aria-hidden="true">
    <SceneErrorBoundary resetKey={overdriveMode}><Canvas dpr={[1, 1.5]} shadows={false}
      camera={{ position: [0, 0, 5], fov: 40, near: 0.1, far: 20 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      frameloop={animate ? 'always' : 'demand'}
      performance={{ min: 0.65, max: 1, debounce: 1800 }} fallback={<SceneFallback />}>
      {overdriveMode ? <OverdriveScene animate={animate} hologram={<HologramModel animate={animate} forceSkill />} /> : <HologramModel animate={animate} />}
      <CaptureSurface /><AdaptiveDpr /><FrameBudget enabled={animate} /><ContextLossGuard />
    </Canvas></SceneErrorBoundary>
  </div>;
}
