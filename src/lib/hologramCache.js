import { BufferAttribute, BufferGeometry, Vector3 } from 'three';

// The keys come from the portfolio's finite catalog of bundled holograms.
const models = new Map();
const pending = new Map();
export const cachedHologram = icon => models.get(icon);

async function readModel(icon) {
  const response = await fetch(`${import.meta.env.BASE_URL}holograms/${icon}.bin`);
  if (!response.ok) throw new Error(`Hologram HTTP ${response.status}`);
  const buffer = await response.arrayBuffer();
  if (!buffer.byteLength || buffer.byteLength % 24) throw new Error('Invalid line buffer');
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(buffer), 3));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  const center = geometry.boundingBox.getCenter(new Vector3());
  // The SVG's Y axis is inverted by the line object before centering.
  const model = { geometry, offset: [-center.x, center.y, -center.z] };
  models.set(icon, model);
  return model;
}

export function loadHologram(icon) {
  if (models.has(icon)) return Promise.resolve(models.get(icon));
  if (!pending.has(icon)) {
    pending.set(icon, readModel(icon).finally(() => pending.delete(icon)));
  }
  return pending.get(icon);
}
