import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { getTechnologyDiagnostic } from '../data/portfolioData';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function AssetDiagnostic({ paused = false }) {
  const { activeTab, hoveredItem, language } = usePortfolioStore();
  const root = useRef(null);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const diagnostic = activeTab === 'skills' ? getTechnologyDiagnostic(hoveredItem, language) : null;
  useLayoutEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      if (paused || reduced || !diagnostic) return;
      gsap.timeline()
        .fromTo('[data-diagnostic-body]', { opacity: 0.55, y: 5 },
          { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out', clearProps: 'opacity,transform' });
    }, root);
    return () => ctx.revert();
  }, [activeTab, hoveredItem, language, paused, reduced]);
  if (activeTab !== 'skills') return null;
  return <section ref={root} className="border-t border-white/20 p-5" aria-label={language === 'en' ? 'Technology diagnostic' : 'Diagnóstico da tecnologia'}>
    <h2 className="mb-5 font-mono text-[10px] tracking-widest text-white/60">[ASSET_DIAGNOSTIC]</h2>
    <div data-diagnostic-body role="status" aria-live="polite" aria-atomic="true" className="min-w-0 break-words">
      {diagnostic ? <>
        <h3 className="text-lg text-white">{diagnostic.name}</h3>
        <p className="mt-2 text-xs text-white/60">{diagnostic.type}</p>
        <p className="mt-4 text-sm leading-7 text-white/85">{diagnostic.desc}</p>
      </> : <p className="text-xs leading-6 text-white/60">{language === 'en'
        ? 'Hover, focus or tap a technology to inspect its technical summary.'
        : 'Passe o mouse, use o foco ou toque em uma tecnologia para consultar seu resumo técnico.'}</p>}
    </div>
  </section>;
}
