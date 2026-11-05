import { useEffect, useSyncExternalStore } from 'react';
import { usePortfolioStore } from '../store/usePortfolioStore';

const listeners = new Set();
export const journey = {
  ready: false, scroll: 0, locked: false,
  setLocked(value) { if(this.locked === value) return; this.locked=value; listeners.forEach(notify=>notify()); },
  setReady(value) {
    if (this.ready === value) return;
    this.ready = value;
    listeners.forEach(notify => notify());
  },
};
const subscribe = notify => { listeners.add(notify); return () => listeners.delete(notify); };
const getSnapshot = () => `${journey.ready}:${journey.locked}`;

export default function OverdriveJourney() {
  const status = useSyncExternalStore(subscribe, getSnapshot, () => 'false:false');
  const ready = status.startsWith('true:');
  const locked = status.endsWith(':true');
  const language = usePortfolioStore(s => s.language);
  useEffect(() => () => { journey.scroll = 0; journey.setLocked(false); journey.setReady(false); }, []);
  return ready && <div data-overdrive-scroll data-sequence={locked ? 'automatic' : 'scroll'} tabIndex={0}
    aria-label={language === 'en' ? 'Scroll to explore the 3D workstation. Escape to exit.' : 'Role para explorar o setup 3D. Escape para sair.'}
    onScroll={event => {
      if (journey.locked) return;
      const el = event.currentTarget;
      journey.scroll = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
      window.dispatchEvent(new Event('overdrive-scroll'));
    }}
    style={{ position: 'fixed', inset: 0, zIndex: 120, overflowY: locked ? 'hidden' : 'auto', overscrollBehavior: 'contain', scrollbarWidth: 'thin', scrollbarColor: '#666 #000', outlineOffset: '-3px' }}>
    <div style={{ height: '640vh', pointerEvents: 'none' }} />
  </div>;
}
