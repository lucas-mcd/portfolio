import { ExtrudeGeometry, EdgesGeometry, ShapePath } from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
const EXTRUSION = Object.freeze({
  depth: 0.2, bevelEnabled: true, bevelThickness: 0.02,
  bevelSize: 0.01, bevelSegments: 3, steps: 1, curveSegments: 12,
});

// Converte também strokes em contornos fechados. Necessário para rest.svg.
function strokeShapes(path, style) {
  const result = [];
  for (const subPath of path.subPaths) {
    const geometry = SVGLoader.pointsToStroke(subPath.getPoints(24), style, 12);
    if (!geometry) continue;
    try {
      const position = geometry.attributes.position;
      const edges = new Map();
      const key = (i) => `${Math.round(position.getX(i) * 1e5)},${Math.round(position.getY(i) * 1e5)}`;
      const vertex = (i) => [position.getX(i), position.getY(i)];
      const count = geometry.index?.count ?? position.count;
      for (let i = 0; i < count; i += 3) {
        const ids = [0, 1, 2].map((offset) => geometry.index ? geometry.index.getX(i + offset) : i + offset);
        for (let e = 0; e < 3; e++) {
          const a = ids[e], b = ids[(e + 1) % 3], ka = key(a), kb = key(b);
          if (ka === kb) continue;
          const edgeKey = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
          if (edges.has(edgeKey)) edges.delete(edgeKey);
          else edges.set(edgeKey, { a: ka, b: kb, start: vertex(a), end: vertex(b) });
        }
      }
      const outline = new ShapePath();
      const pending = [...edges.values()];
      while (pending.length) {
        const first = pending.pop();
        outline.moveTo(...first.start);
        outline.lineTo(...first.end);
        let end = first.b, safety = pending.length + 1;
        while (end !== first.a && safety-- > 0) {
          const index = pending.findIndex((edge) => edge.a === end || edge.b === end);
          if (index < 0) throw new Error('Contorno SVG aberto após conversão do stroke.');
          const edge = pending.splice(index, 1)[0];
          const forward = edge.a === end;
          outline.lineTo(...(forward ? edge.end : edge.start));
          end = forward ? edge.b : edge.a;
        }
        outline.currentPath.closePath();
      }
      // Contornos externos e internos retornam shapes com holes preservados.
      result.push(...SVGLoader.createShapes(outline));
    } finally {
      geometry.dispose(); // Buffer temporário CPU; nunca é anexado à cena.
    }
  }
  return result;
}
function parseLogo(svgText) {
  // Gradientes afetam cor, não o contorno. Neutralizamos a pintura para o noir.
  const document = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  if (document.getElementsByTagName('parsererror').length) throw new Error('XML SVG inválido.');
  for (const element of Array.from(document.getElementsByTagName('*'))) {
    for (const attribute of ['fill', 'stroke']) {
      if (element.getAttribute(attribute)?.trim().startsWith('url(')) element.setAttribute(attribute, '#ffffff');
    }
    const style = element.getAttribute('style');
    if (style) element.setAttribute('style', style.replace(/(fill|stroke)\s*:\s*url\([^)]*\)/g, '$1:#ffffff'));
  }
  const parsed = new SVGLoader().parse(new XMLSerializer().serializeToString(document));
  if (parsed.xml.nodeName.toLowerCase() !== 'svg') throw new Error('Arquivo inválido: SVG esperado.');
  const shapes = [];
  for (const path of parsed.paths) {
    const style = path.userData?.style ?? {};
    if (Number(style.opacity ?? 1) === 0 || style.visibility === 'hidden') continue;
    if (style.fill !== 'none' && Number(style.fillOpacity ?? 1) > 0) {
      shapes.push(...SVGLoader.createShapes(path));
    }
    if (style.stroke && style.stroke !== 'none' && Number(style.strokeOpacity ?? 1) > 0) {
      shapes.push(...strokeShapes(path, style));
    }
  }
  if (!shapes.length) throw new Error('SVG sem contornos preenchidos ou strokes suportados.');
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const shape of shapes) for (const point of shape.getPoints(32)) {
    minX = Math.min(minX, point.x); maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y); maxY = Math.max(maxY, point.y);
  }
  const extent = Math.max(maxX - minX, maxY - minY);
  if (!Number.isFinite(extent) || extent <= 0) throw new Error('Dimensões SVG inválidas.');
  const scale = 2.1 / extent;
  // Escala controles Bézier e elipses, mantendo as curvas (sem poligonizar o SVG).
  function scalePath(path) {
    path.currentPoint.multiplyScalar(scale);
    for (const curve of path.curves) {
      for (const field of ['v0', 'v1', 'v2', 'v3']) if (curve[field]?.isVector2) curve[field].multiplyScalar(scale);
      if (curve.type === 'EllipseCurve' || curve.type === 'ArcCurve') {
        curve.aX *= scale; curve.aY *= scale;
        curve.xRadius *= scale; curve.yRadius *= scale;
      }
      if (curve.points) for (const point of curve.points) point.multiplyScalar(scale);
      curve.needsUpdate = true;
    }
    for (const hole of path.holes ?? []) scalePath(hole);
    path.needsUpdate = true;
  }
  return shapes.map((shape) => { const copy = shape.clone(); scalePath(copy); return copy; });
}


export function compileLogo(svg) {
 const source = new ExtrudeGeometry(parseLogo(svg), EXTRUSION);
 const edges = new EdgesGeometry(source, 25);
 try { return Array.from(edges.attributes.position.array); }
 finally { edges.dispose(); source.dispose(); }
}
