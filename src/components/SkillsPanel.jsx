import { categoryName } from '../data/translations';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { skills, skillIcons } from '../data/portfolioData';
import { useMediaQuery } from '../hooks/useMediaQuery';

import { usePortfolioStore } from '../store/usePortfolioStore';

function SkillTile({ name, paused }) {
  const language = usePortfolioStore(state => state.language);
  const setHoveredItem = usePortfolioStore(state => state.setHoveredItem);
  const clearHoveredItem = usePortfolioStore(state => state.clearHoveredItem);
  const root = useRef(null);
  const animation = useRef(null);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (paused || reduced || !window.matchMedia('(min-width:1024px) and (pointer:fine)').matches) return;
      animation.current = gsap.timeline({ paused: true })
        .to('img', { rotation: -8, x: -2, duration: 0.07 })
        .to('img', { rotation: 6, x: 2, duration: 0.07 })
        .to('img', { rotation: 0, x: 0, duration: 0.18, ease: 'power2.out' });
    }, root);
    return () => { animation.current = null; ctx.revert(); };
  }, [paused, reduced]);
  const inspect = () => { setHoveredItem(name); animation.current?.restart(); };
  return <button ref={root} className="skill-tile" aria-label={`${name}. ${language === 'en' ? 'Proficiency level not specified.' : 'Proficiência não informada.'}`}
    onMouseEnter={inspect}
    onMouseLeave={clearHoveredItem}
    onBlur={clearHoveredItem}
    onFocus={inspect} onClick={inspect}>
    {/* Os SVGs mono têm contornos sem preenchimentos opacos: o filtro preserva os vazados. */}
    <img src={`${import.meta.env.BASE_URL}icons/mono/${skillIcons[name]}.svg`} alt="" width="36" height="36" style={{ filter: 'brightness(0) invert(1)', objectFit: 'contain' }} />
    <span className="skill-name" title={name}>{({ 'Django REST Framework': 'Django REST', 'Docker Compose': 'Compose', 'Mercado Pago': 'Mercado Pago' })[name] || name}</span>
  </button>;
}

export default function SkillsPanel({ paused = false, title = 'Conhecimentos' }) {
  const language = usePortfolioStore(state => state.language);
  const clear = usePortfolioStore(state => state.clearHoveredItem);
  const deck = useRef(null);
  const [layout, setLayout] = useState({ tile: 40, columns: 1 });
  useEffect(() => () => clear(), [clear]);
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      let best = { tile: 24, columns: 1 };
      // Fit every category, not a page of items. No measurements inside animation loops.
      for (let tile = 64; tile >= 24; tile -= 2) {
        let found = false;
        for (const columns of width >= 360 ? [2, 1] : [1]) {
          const sectionWidth = (width - (columns - 1) * 10) / columns;
          const perRow = Math.max(1, Math.floor((sectionWidth - 16 + 8) / (tile + 24)));
          const heights = skills.map(group => 38 + Math.ceil(group.items.length / perRow) * (tile + 30));
          let required = 0;
          for (let i = 0; i < heights.length; i += columns) required += Math.max(...heights.slice(i, i + columns)) + 10;
          if (required - 10 <= height) { best = { tile, columns }; found = true; break; }
        }
        if (found) break;
      }
      setLayout(old => old.tile === best.tile && old.columns === best.columns ? old : best);
    });
    observer.observe(deck.current);
    return () => observer.disconnect();
  }, []);
  return <section className="responsive-skills skills-overview">
    <header><p className="eyebrow">CAPABILITY INDEX / 03</p><h1>{title}</h1></header>
    <div ref={deck} className="skills-all" style={{ '--skill-size': `${layout.tile}px`, gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))` }}>
      {skills.map(group => <section key={group.id} className="skill-category">
        <h2>{categoryName(group, language)}<small>{group.items.length}</small></h2>
        <div className="skill-grid">{group.items.map(name => <SkillTile key={name} name={name} paused={paused} />)}</div>
      </section>)}
    </div>
  </section>;
}
