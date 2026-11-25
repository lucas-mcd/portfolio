import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useMediaQuery } from '../hooks/useMediaQuery';

const CODES = ['0xAF // DECODE', '0101 SYS_LINK', 'PY :: EXEC', '0xFF ACCESS'];
export default function PageTransition({ activeTab, children, paused = false }) {
  const root = useRef(null);
  const panel = useRef(null);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const mobile = useMediaQuery('(max-width: 1023px)');
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (reduced || paused || mobile) return;
      const vertical = gsap.utils.toArray('[data-curtain]');
      const cuts = gsap.utils.toArray('[data-cut]');
      const logs = gsap.utils.toArray('[data-log]');
      const tl = gsap.timeline();
      // Fechamento 0–0,7 s; reabertura 0,7–1,4 s. Stagger distribuído dentro da metade.
      tl.set(vertical, { scaleY: 0, opacity: 1 })
        .set(cuts, { scaleX: 0, opacity: 0.65 })
        .to(vertical, { scaleY: 1, duration: 0.6, stagger: { amount: 0.1 }, ease: 'power2.inOut' }, 0)
        .to(cuts, { scaleX: 1, duration: 0.65, stagger: { amount: 0.05 }, ease: 'power2.inOut' }, 0)
        .fromTo(panel.current, { opacity: 0.3, scale: 0.99, filter: 'blur(0px) contrast(1) hue-rotate(0deg)' },
          { opacity: 0.15, scale: 0.98, filter: mobile ? 'blur(0px) contrast(1.5) hue-rotate(0deg)' : 'blur(3px) contrast(1.7) hue-rotate(0deg)', duration: 0.7, ease: 'power2.inOut' }, 0)
        .to(vertical, { scaleY: 0, duration: 0.6, stagger: { amount: 0.1 }, ease: 'power3.inOut' }, 0.7)
        .to(cuts, { scaleX: 0, duration: 0.65, stagger: { amount: 0.05 }, ease: 'power3.inOut' }, 0.7)
        .to(panel.current, { opacity: 1, scale: 1, filter: 'blur(0px) contrast(1) hue-rotate(0deg)', duration: 0.7, ease: 'power2.out', clearProps: 'transform,filter,opacity' }, 0.7)
        .set([...vertical, ...cuts], { opacity: 0 }, 1.4);
      // Máscara decorativa: os dados reais continuam presentes e acessíveis.
      logs.forEach((log) => {
        const mask = log.querySelector('[data-decrypt]');
        if (!mask) return;
        gsap.fromTo(mask, { scaleX: 1, opacity: 1 }, {
          scaleX: 0, duration: 0.7, delay: 0.25, ease: 'steps(9)',
          scrollTrigger: { trigger: log, start: 'top 98%', once: true, scroller: window.matchMedia('(min-width: 1024px)').matches ? document.querySelector('[data-active-viewport]') : undefined },
        });
      });
    }, root);
    if (ScrollTrigger.getAll().length) ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [activeTab, reduced, paused, mobile]);
  return <div ref={root} className="transition-shell">
    <div aria-hidden="true" className="code-curtain">{Array.from({ length: 8 }, (_, i) =>
      <div key={i} data-curtain className="code-strip"><span>{CODES[i % 4]}<br />{CODES[(i + 1) % 4]}<br />{CODES[(i + 2) % 4]}</span></div>)}</div>
    <div aria-hidden="true" className="code-cuts">{CODES.map((code, i) => <div key={code} data-cut style={{ top: `${18 + i * 22}%` }}>{code}</div>)}</div>
    <div ref={panel}>{children}</div>
  </div>;
}
