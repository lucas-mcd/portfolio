import { startTransition, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TABS, UI_TEXT, usePortfolioStore } from './store/usePortfolioStore';
import { about, education, institutionIcons, projects, resume, socialLinks } from './data/portfolioData';
import { useMediaQuery } from './hooks/useMediaQuery';
import PageTransition from './components/PageTransition';
import { gsap } from './lib/gsap';
import { CertificateCaption, complementarySelection, ComplementaryPanel } from './components/ComplementaryPanel';
import SkillsPanel from './components/SkillsPanel';
import OverdriveWarning from './components/OverdriveWarning';
import OverdriveJourney from './components/OverdriveJourney';
import { getPortfolioContent } from './data/translations';
import AssetDiagnostic from './components/AssetDiagnostic';
const SceneContainer = lazy(() => import('./components/canvas/SceneContainer'));
const HologramViewport = lazy(() => import('./components/canvas/SceneContainer').then((module) => ({ default: module.HologramViewport })));


const BOOT_LOGS = [
  '0x00 :: KERNEL MAP / DECODE', '0x01 :: MEMORY BLOCK / VERIFIED',
  '0x02 :: PORT MAP / SIMULATED', '0x03 :: SECURITY GATE / VISUAL BYPASS',
  '0x04 :: DATA INDEX / DECRYPT', '0x05 :: PYTHON MODULE / READY',
  '0x06 :: GPU PIPELINE / REQUESTED', '0x07 :: IDENTITY / LUCAS MACEDO',
  '0x08 :: UI SHELL / READY', '0x09 :: SESSION / START',
];
function BootScreen({ onComplete, text }) {
  const root = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Duração lógica total de 2 s, incluindo os 0,35 s de saída.
      // Nenhuma espera por assets: esta é uma introdução, não progresso real.
      const tl = gsap.timeline({ onComplete });
      if (reduced) {
        tl.to(root.current, { duration: 2, opacity: 1 });
      } else {
        tl.fromTo('[data-boot-log]', { opacity: 0, x: -6 },
          { opacity: 1, x: 0, duration: 0.06, stagger: 0.13, ease: 'steps(2)' }, 0)
          .fromTo('[data-boot-progress]', { scaleX: 0 }, { scaleX: 1, duration: 1.65, ease: 'steps(24)' }, 0)
          .to('[data-boot-shell]', { scaleX: 1.08, x: 6, duration: 0.1, ease: 'steps(2)' }, 1.65)
          .to(root.current, { opacity: 0, scaleX: 1.15, duration: 0.25, ease: 'power3.in' }, 1.75);
      }
    }, root);
    return () => ctx.revert();
  }, [onComplete]);
  return <div ref={root} className="boot-screen" role="status" aria-label={text.boot}>
    <div data-boot-shell className="boot-shell"><p className="critical text-xs mb-8">LMC / SYSTEM BOOT</p>
      <div aria-hidden="true" className="boot-logs">{BOOT_LOGS.map((log) => <p key={log} data-boot-log>{log}</p>)}</div>
      <div aria-hidden="true" className="boot-track"><div data-boot-progress /></div>
      <p className="muted text-xs mt-6">{text.simulation}</p>
    </div>
  </div>;
}

function DigitalClock({ language, paused = false }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [paused]);
  return <time className="digital-clock" dateTime={now.toISOString()}>{now.toLocaleTimeString(language === 'pt' ? 'pt-BR' : 'en-GB', { hour12: false })}</time>;
}
function HologramPanel({ paused, text, desktop, complementary, onOpenCertificate }) {
  const activeTab = usePortfolioStore(state => state.activeTab);
  const hoveredItem = usePortfolioStore(state => state.hoveredItem);
  const language = usePortfolioStore(state => state.language);
  const content = getPortfolioContent(language);
  const course = activeTab === 'education' && (content.education.find(item => item.id === hoveredItem) ?? content.education[0]);
  const translatedProject = content.projects.find(item => item.hoverKey === hoveredItem);
  const label = translatedProject?.title || hoveredItem || (activeTab === 'home' ? 'CURRICULUM / ABSTRACT' : text.tabs[TABS.findIndex((tab) => tab.id === activeTab)]);
  const selection = complementary ? complementarySelection(hoveredItem) : null;
  const panelClass = complementary ? 'education-hologram complementary-hologram' : activeTab === 'skills' ? 'skills-hologram' : course ? 'education-hologram' : '';
  return <aside className={`hologram-panel ${panelClass}`} id={complementary ? 'certificate-preview' : undefined}
    aria-label={complementary ? (language === 'en' ? 'Course certificate' : 'Certificado do curso') : 'Hologram'}>
    <header className="viewport-header"><span>HOLOGRAM / {selection?.course?.issuer.toUpperCase() ?? 'LIVE VIEW'}</span><span aria-hidden="true">◈</span></header>
    <Suspense fallback={<div className="hologram-stage" />}><HologramViewport paused={paused} desktop={desktop} icon={selection?.group?.id} /></Suspense>
    {complementary ? <CertificateCaption {...selection} desktop={desktop} language={language} onOpenCertificate={onOpenCertificate} /> : <>
    <AssetDiagnostic paused={paused} />
    {course ? <section className="hologram-caption course-caption" id="course-caption">
      <h2>{course.course}</h2>
      <div className="course-badges"><span>{course.institution}{course.credential && ` / ${course.credential}`}</span><span>{course.status}</span></div>
      {!desktop && course.certificate && <button type="button" className="action justify-self-start" aria-haspopup="dialog"
        onClick={() => onOpenCertificate({ file: course.certificate, label: `${course.institution} — ${course.course}` })}>
        {language === 'pt' ? 'Ver certificado' : 'View certificate'}
      </button>}
      <p className="course-summary" key={course.id} tabIndex={0}>{course.summary}</p>
    </section> : <div className="hologram-caption"><span>OBJECT_ID</span><strong>{label}</strong></div>}
    <p className="muted text-xs p-5">{activeTab === 'skills' ? 'HOVER / FOCUS / TAP → SCAN' : 'MONOCHROME / GEOMETRIC STUDY'}</p>
    </>}
  </aside>;
}

function EducationList({ language }) {
  const { education } = getPortfolioContent(language);
  return <ol className="education-list">{education.filter(item => ['estacio', 'ebac', 'senai'].includes(item.id)).map((item) => <li key={item.id}>
    <p className="critical text-xs">{item.institution} / {item.status}</p>
    <h3>{item.course}</h3>{item.detail && <p className="muted text-xs">{item.detail}</p>}{item.grade && <p className="academic-grade">{item.grade}</p>}
  </li>)}</ol>;
}
function ProjectsPanel({ text, language }) {
  const { setHoveredItem, clearHoveredItem } = usePortfolioStore.getState();
  const [selected, setSelected] = useState(null);
  const localized = getPortfolioContent(language).projects;
  const selectedKey = projects.find(item => item.id === selected)?.title;
  const restoreSelected = () => selectedKey ? setHoveredItem(selectedKey) : clearHoveredItem();
  useEffect(() => { if (selectedKey) setHoveredItem(selectedKey); else clearHoveredItem(); }, [selectedKey, setHoveredItem, clearHoveredItem]);
  useEffect(() => () => usePortfolioStore.getState().clearHoveredItem(), []);
  const en = language === 'en';
  return <section className="projects-panel">
    <p className="eyebrow">FILE SYSTEM / 02</p><h1>{text.projects}</h1>
    <div className="project-accordion border-panel min-w-0">
      <div className="section-label px-4 py-3"><span>/home/lucas/projects</span><span>{localized.length} {en ? 'files' : 'arquivos'}</span></div>
      <ul>{localized.map((item, index) => <li key={item.id}>
        <button id={`project-trigger-${item.id}`} onPointerEnter={() => setHoveredItem(item.hoverKey)} onPointerLeave={restoreSelected} onFocus={() => setHoveredItem(item.hoverKey)} onBlur={restoreSelected} className="file-row" aria-expanded={selected === item.id} aria-controls={`project-detail-${item.id}`} onClick={() => setSelected(selected === item.id ? null : item.id)}>
          <span className="file-number">{String(index + 1).padStart(2, '0')}</span>
          <span className="min-w-0"><strong>{item.title}</strong><small>{item.technologies.join(' / ')}</small></span>
          <span aria-hidden="true" className="critical">{selected === item.id ? '−' : '+'}</span>
        </button>
        <section id={`project-detail-${item.id}`} hidden={selected !== item.id} aria-labelledby={`project-trigger-${item.id}`} className="project-detail p-5" onPointerEnter={restoreSelected} onFocusCapture={restoreSelected}>
          {selected === item.id && <>
            <p className="muted text-xs mb-3">{en ? 'TECHNOLOGY STACK' : 'STACK DECLARADA'}</p>
            <ul className="stack-list">{item.technologies.map(tech => <li key={tech}>{tech}</li>)}</ul>
            <div className="project-description space-y-4 mt-5 text-sm leading-relaxed">{item.description.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              {item.repositoryUrl && <a href={item.repositoryUrl} target="_blank" rel="noopener noreferrer">{en ? 'Open repository' : 'Abrir repositório'} ↗</a>}
              {item.liveUrl ? <a href={item.liveUrl} target="_blank" rel="noopener noreferrer">{en ? 'Open live site' : 'Abrir demonstração'} ↗</a> : <p className="muted">{en ? 'Live demo not provided.' : 'Demonstração não informada.'}</p>}
            </div>
          </>}
        </section>
      </li>)}</ul>
    </div>
  </section>;
}
function SocialConnections({ paused, language }) {
  const setHoveredItem = usePortfolioStore(state => state.setHoveredItem);
  const clearHoveredItem = usePortfolioStore(state => state.clearHoveredItem);
  useEffect(() => () => {
    if (['linkedin', 'github'].includes(usePortfolioStore.getState().hoveredItem))
      usePortfolioStore.getState().clearHoveredItem();
  }, []);
  const root = useRef(null);
  const animations = useRef(new Map());
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (paused || reduced) return;
      gsap.utils.toArray('[data-social-label]').forEach((label) => {
        const timeline = gsap.timeline({ paused: true })
          .to(label, { x: -2, skewX: 7, duration: 0.045 })
          .to(label, { x: 2, skewX: -7, duration: 0.045 })
          .to(label, { x: -1, skewX: 3, duration: 0.045 })
          .to(label, { x: 0, skewX: 0, duration: 0.09 });
        animations.current.set(label.dataset.socialLabel, timeline);
      });
    }, root);
    return () => { animations.current.clear(); ctx.revert(); };
  }, [paused, reduced]);
  const glitch = (id) => animations.current.get(id)?.restart();
  return <nav ref={root} aria-label={language === 'pt' ? 'Conexões externas' : 'External connections'} className="mt-6 flex flex-wrap gap-3">
    {socialLinks.map((link) => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center border border-white bg-black px-4 py-3 font-mono text-xs !text-white hover:bg-white hover:!text-black focus-visible:bg-white focus-visible:!text-black"
      onMouseEnter={() => { setHoveredItem(link.id); glitch(link.id); }}
      onMouseLeave={clearHoveredItem}
      onFocus={() => { setHoveredItem(link.id); glitch(link.id); }}
      onBlur={clearHoveredItem}>
      <span data-social-label={link.id} className="inline-block">{link.label}</span>
    </a>)}
  </nav>;
}

function Content({ desktop, activeTab, navigate, paused, text, language, onOpenCertificate }) {
  const { about, education } = getPortfolioContent(language);
  const hoveredItem = usePortfolioStore(state => activeTab === 'education' ? state.hoveredItem : null);
  const { setHoveredItem } = usePortfolioStore.getState();
  switch (activeTab) {
    case 'home': return <section className="home-layout cohesive-home focused-home flex flex-col justify-start py-12 px-6 text-center max-w-xl mx-auto h-full">
      <header className="home-intro"><h1 className="identity-title brand-glitch" data-text={about.name}>{about.name}</h1>
        <p className="mt-6 text-lg">{text.role}</p></header>
      <p className="home-summary muted leading-relaxed">{about.summary}</p>
      <footer className="home-actions">
        <SocialConnections paused={paused} language={language} />
        <div className="mt-8 flex flex-wrap gap-4">
          {resume.path ? <a className="download-cv" href={`${import.meta.env.BASE_URL}${resume.path}`} download>DOWNLOAD_CV.BAK <span>↓</span></a> : <button className="download-cv" disabled aria-describedby="cv-missing">DOWNLOAD_CV.BAK <span>↓</span></button>}
          <button className="action" onClick={() => navigate('projects')}>{text.openProjects} ↗</button>
        </div>{!resume.path && <p id="cv-missing" className="muted text-xs mt-3">{language === 'pt' ? 'Arquivo do currículo ainda não vinculado.' : 'Résumé file not linked yet.'}</p>}</footer>
    </section>;
    case 'about': return <section className="about-panel"><p className="eyebrow">IDENTITY / 01</p><h1>{text.about}</h1><div className="dossier-grid">
      <div className="dossier-text"><h2 className="text-xl mb-4">{about.name}</h2><div lang={language === 'en' ? 'en' : 'pt-BR'}>{about.paragraphs.map((paragraph, index) => <p key={index} className="muted text-sm leading-relaxed">{paragraph}</p>)}</div></div>
      <div className="dossier-credentials">
        <div className="border-panel p-4"><h2 className="section-label">{text.academic}</h2><EducationList language={language} /></div>
        <dl className="mt-3">{about.languages.map((item) => <div key={item.name} className="border-panel p-4"><dt>{item.name} / {item.level}</dt><dd className="muted mt-2 text-sm">{item.institution}</dd></div>)}</dl>
      </div>
    </div></section>;
    case 'projects': return <ProjectsPanel text={text} language={language} />;
    case 'complementary': return <ComplementaryPanel desktop={desktop} language={language} onOpenCertificate={onOpenCertificate} />;
    case 'education': return <section className="education-panel"><p className="eyebrow">ACADEMIC RECORD / 04</p><h1>{text.education}</h1><ol className="education-files border-panel">{education.map((item, index) => <li key={item.id}><button type="button" className="education-row group border-b border-white/10 py-3 flex justify-between items-center w-full text-left" aria-pressed={(hoveredItem ?? education[0].id) === item.id} aria-controls="course-caption" aria-haspopup={desktop && item.certificate ? "dialog" : undefined}
      onPointerEnter={event => {
        if (event.pointerType === 'mouse' && window.matchMedia('(min-width: 1024px)').matches) setHoveredItem(item.id);
      }} onFocus={() => setHoveredItem(item.id)} onClick={() => {
        setHoveredItem(item.id);
        if (desktop && item.certificate) {
          onOpenCertificate({ file: item.certificate, label: `${item.institution} — ${item.course}` });
          return;
        }
        if (!desktop) document.querySelector('.education-hologram')?.scrollIntoView({ block: 'start' });
      }}>
      <span className="file-number">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0 flex-1"><h2 className="text-sm">{item.course}{item.credential && ` (${item.credential})`}</h2>{item.detail && <p className="muted text-xs mt-2">{item.detail}</p>}{item.grade && <p className="academic-grade">{item.grade}</p>}</div>
      <div className="education-meta text-right"><p className="text-xs">{item.institution}</p><p className="muted text-xs mt-2">{item.status}</p></div>
    </button></li>)}</ol></section>;
    default: return null;
  }
}
function CertificateDialog({ certificate, language, onClose }) {
  const dialog = useRef(null);
  useLayoutEffect(() => { dialog.current.showModal(); }, []);
  return <dialog ref={dialog} className="certificate-dialog" aria-label={certificate.label}
    onClose={onClose} onClick={event => {
      if (event.target === event.currentTarget) event.currentTarget.close();
    }}>
    <button type="button" aria-label={language === 'en' ? 'Close certificate' : 'Fechar certificado'}
      onClick={() => dialog.current.close()}>×</button>
    <img src={`${import.meta.env.BASE_URL}certificados/${certificate.file}`} decoding="async" alt={certificate.label} />
  </dialog>;
}
export default function App() {
  const activeTab = usePortfolioStore(state => state.activeTab);
  const language = usePortfolioStore(state => state.language);
  const overdriveMode = usePortfolioStore(state => state.overdriveMode);
  const { setActiveTab, setLanguage, toggleOverdriveMode, toggleOverdriveWarning } = usePortfolioStore.getState();
  const text = UI_TEXT[language];
  const [isBooting, setIsBooting] = useState(true);
  const [skillsReady, setSkillsReady] = useState(false);
  const finishBoot = useCallback(() => setIsBooting(false), []);
  const [certificate, setCertificate] = useState(null);
  const [paused, setPaused] = useState(false);
  const capturing = usePortfolioStore(s => s.isCapturing);
  const effectsPaused = paused || capturing;
  
  const appRoot = useRef(null);
  const commandRef = useRef(null);
  const exitRef = useRef(null);
  const previouslyActive = useRef(false);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const tabRefs = useRef({});
  const viewport = useRef(null);
  const desktop = useMediaQuery('(min-width: 1024px)');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuButton = useRef(null);
  useEffect(() => {
    if (isBooting || navigator.connection?.saveData) return;
    const warm = () => {
      startTransition(() => setSkillsReady(true));
      import('./lib/hologramCache').then(({ loadHologram }) =>
        loadHologram(institutionIcons[education[0].institution])).catch(() => {});
    };
    if (window.requestIdleCallback) {
      const handle = window.requestIdleCallback(warm);
      return () => window.cancelIdleCallback(handle);
    }
    const timer = window.setTimeout(warm, 250);
    return () => window.clearTimeout(timer);
  }, [isBooting]);
  useEffect(() => { if (desktop) setMobileMenuOpen(false); }, [desktop]);
  useEffect(() => {
    if (!mobileMenuOpen || desktop) return;
    tabRefs.current[activeTab]?.focus({ preventScroll: true });
    const close = event => {
      if (event.key === 'Escape') { setMobileMenuOpen(false); mobileMenuButton.current?.focus({ preventScroll: true }); }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [mobileMenuOpen, desktop]);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const enforce = () => {
      if (!media.matches) usePortfolioStore.setState({ overdriveMode: false, showOverdriveWarning: false, isCapturing: false });
    };
    enforce(); media.addEventListener('change', enforce);
    return () => media.removeEventListener('change', enforce);
  }, []);
  const current = TABS.find((tab) => tab.id === activeTab);
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en';
    return () => { document.documentElement.lang = previous; };
  }, [language]);
  useEffect(() => {
    if (overdriveMode) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      exitRef.current?.focus({ preventScroll: true });
      const escape = (event) => {
        if (event.key === 'Escape' || event.key.toLowerCase() === 'x') toggleOverdriveMode(false);
        if (event.code === 'Space' && event.target === document.body) { event.preventDefault(); setPaused(value => !value); }
      };
      window.addEventListener('keydown', escape);
      previouslyActive.current = true;
      return () => { document.body.style.overflow = originalOverflow; window.removeEventListener('keydown', escape); };
    }
    if (previouslyActive.current) import('./components/canvas/OverdriveScene').then(module => {
      if (!usePortfolioStore.getState().overdriveMode && !usePortfolioStore.getState().showOverdriveWarning) module.clearScreenRipSnapshot();
    });
    if (previouslyActive.current) {
      commandRef.current?.focus({ preventScroll: true });
      previouslyActive.current = false;
    }
  }, [overdriveMode, toggleOverdriveMode]);
  function navigate(id) {
    if (activeTab !== id) {
      if (id === 'skills') setSkillsReady(true);
      setActiveTab(id);

    }
    if (desktop) tabRefs.current[id]?.focus({ preventScroll: true });
    else { setMobileMenuOpen(false); mobileMenuButton.current?.focus({ preventScroll: true }); }
    viewport.current?.scrollTo({ top: 0, behavior: 'instant' });
    if (!desktop) viewport.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  function onKeyDown(event, index) {
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? TABS.length - 1 :
      event.key === 'ArrowDown' ? (index + 1) % TABS.length :
      event.key === 'ArrowUp' ? (index - 1 + TABS.length) % TABS.length : undefined;
    if (next === undefined) return;
    event.preventDefault();
    if (desktop) navigate(TABS[next].id);
    else tabRefs.current[TABS[next].id]?.focus({ preventScroll: true });
  }
  if (isBooting) return <BootScreen onComplete={finishBoot} text={text} />;
  return <div ref={appRoot} className={`tactical-app ${overdriveMode ? 'overdrive-active' : ''}`} data-paused={effectsPaused}>
    <style>{`
      .home-viewport .focused-home { justify-content:flex-start; gap:32px; padding:48px 24px; }
      .home-viewport .focused-home .home-summary { font-size:19px; line-height:1.65; margin:0; }
      .focused-monitor .tactical-tabs button { font-size:14px; line-height:1.5; }
      .home-viewport .focused-home { max-width:40rem; }
      .home-viewport .focused-home .home-intro > p { font-size:20px; }
      .home-viewport .focused-home .home-actions a,.home-viewport .focused-home .home-actions button { font-size:12px; }
      .focused-monitor .system-metrics { font-size:9px; line-height:1.8; opacity:.65; overflow-wrap:anywhere; }
      .system-metrics h2 { font-size:10px; margin-bottom:8px; }
      .metrics-note { font-size:8px; margin-bottom:8px; }
      .focused-monitor .system-controls { margin-top:auto; }
      @media(min-width:1024px) {
        .focused-monitor { display:flex; flex-direction:column; justify-content:flex-start; gap:24px; padding:16px; font-size:12px; }
        .focused-monitor > nav { margin:0; flex:none; }
      }
      @media(min-width:1024px) and (max-height:900px) {
        .focused-monitor { gap:10px; padding:12px; }
        .focused-monitor .monitor-header { display:grid; gap:6px; padding-bottom:8px; }
        .focused-monitor .monitor-header > * { margin-block:0; }
        .focused-monitor .tactical-tabs button { padding-block:6px; }
        .home-viewport .focused-home { padding:20px 8px; gap:20px; }
        .home-viewport .focused-home .home-summary { font-size:16px; line-height:1.6; }
      }
      @media(min-width:1024px) and (max-height:650px) {
        .focused-monitor { gap:6px; }
        .focused-monitor .monitor-header .text-xl { font-size:14px; }
        .focused-monitor .monitor-header .digital-clock { font-size:20px; }
        .focused-monitor .tactical-tabs button { padding-block:4px; }
        .focused-monitor .system-metrics { line-height:1.5; }
        .focused-monitor .system-controls { padding-top:8px; }
        .focused-monitor .overdrive-command { padding-block:6px; }
      }
      @media(max-width:639px) { .home-viewport .focused-home { padding:24px 0; gap:24px; } }
    `}</style>
    <a href="#active-viewport" className="skip-link">{text.skip}</a>
    {desktop && <Suspense fallback={null}><SceneContainer paused={effectsPaused} /></Suspense>}
    <div className="tactical-grid noir-layout relative z-10 gap-4 p-4">
      <aside inert={overdriveMode} aria-hidden={overdriveMode} className="monitor-panel tactical-monitor focused-monitor overflow-hidden" aria-label={language === 'en' ? 'Local monitoring terminal' : 'Terminal de monitoramento local'}>
        <header className="monitor-header space-y-4"><p className="critical text-xs">LMC / TERMINAL</p><p className="text-xl brand-glitch" data-text={about.name}>{about.name}</p><DigitalClock language={language} paused={effectsPaused} /><p className="muted text-xs mt-2">FULL STACK PYTHON</p></header>
        <div aria-hidden="true" className="mx-4 border-t border-white/10" />
        {!desktop && <button ref={mobileMenuButton} className="mobile-menu-toggle" aria-expanded={mobileMenuOpen} aria-controls="portfolio-navigation" aria-label={language === 'en' ? 'Toggle navigation menu' : 'Abrir ou fechar menu de navegação'} onClick={() => setMobileMenuOpen(value => !value)}><span aria-hidden="true">{mobileMenuOpen ? '×' : '☰'}</span><span>{mobileMenuOpen ? (language === 'en' ? 'CLOSE' : 'FECHAR') : 'MENU'}</span></button>}
        <nav id="portfolio-navigation" className={!desktop ? 'mobile-navigation' : undefined} hidden={!desktop && !mobileMenuOpen} aria-label={text.navigation}><div role="tablist" aria-label={text.sections} aria-orientation="vertical" className="tactical-tabs">{TABS.map((tab, index) => <button key={tab.id} ref={(node) => { tabRefs.current[tab.id] = node; }} role="tab" id={`tab-${tab.id}`} aria-controls={`panel-${tab.id}`} aria-selected={activeTab === tab.id} tabIndex={activeTab === tab.id ? 0 : -1} onKeyDown={(event) => onKeyDown(event, index)} onClick={() => navigate(tab.id)}><span className="tab-number">0{index}</span><span>{text.tabs[index]}</span><span aria-hidden="true">{activeTab === tab.id ? '◂' : '/'}</span></button>)}</div></nav>

        {desktop && <section className="system-metrics" aria-label={language === 'en' ? 'Simulated visual telemetry' : 'Telemetria visual simulada'}>
          <h2>[SYSTEM_METRICS]</h2>
          <p className="metrics-note">{language === 'pt' ? 'SIMULAÇÃO VISUAL' : 'VISUAL SIMULATION'}</p>
          <ul>{['SECURE_SESSION: ACTIVE', 'BYPASS_PROTECTION: SHIELD_ON', 'KERNEL_INTEGRITY: 100%', 'VRAM_ALLOCATION: OPTIMIZED'].map(line => <li key={line}>{line}</li>)}</ul>
        </section>}
        {desktop && <button ref={commandRef} className="overdrive-command hidden lg:block" onClick={() => toggleOverdriveWarning(true)}>[CMD://OVERDRIVE_BREACH]</button>}
        <footer className="system-controls"><div className="hud-controls">
          {desktop && <button className="effects-toggle" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>{paused ? text.resume : text.pause}</button>}
          <div className="language-toggle" role="group" aria-label={language === 'pt' ? 'Idioma da interface' : 'Interface language'}>
            <button lang="pt-BR" aria-pressed={language === 'pt'} onClick={() => setLanguage('pt')}>PT-BR</button>
            <button lang="en" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
          </div>
        </div></footer>
      </aside>
      <main inert={overdriveMode} aria-hidden={overdriveMode} id="active-viewport" ref={viewport} tabIndex={-1} data-active-viewport className={`active-viewport dense-viewport ${activeTab === 'home' ? 'home-viewport overflow-hidden' : activeTab === 'skills' ? 'skills-viewport' : ''}`}>
        {activeTab !== 'home' && <header className="viewport-header"><span>VIEWPORT / {current.command}</span><span className="critical">0{TABS.indexOf(current)} / {String(TABS.length - 1).padStart(2, '0')}</span></header>}
        <div className="viewport-content">{TABS.map((tab) => <section key={tab.id} id={`panel-${tab.id}`} role="tabpanel" aria-labelledby={`tab-${tab.id}`} hidden={activeTab !== tab.id} tabIndex={0}>
          {tab.id === 'skills' ? ((skillsReady || activeTab === 'skills') &&
            <PageTransition activeTab="skills" paused={effectsPaused || activeTab !== 'skills'}>
              <SkillsPanel paused={effectsPaused} title={text.skills} />
            </PageTransition>) : activeTab === tab.id && <PageTransition activeTab={activeTab} paused={effectsPaused}><Content desktop={desktop} onOpenCertificate={setCertificate} activeTab={activeTab} navigate={navigate} paused={effectsPaused} text={text} language={language} /></PageTransition>}
        </section>)}</div>
      </main>
      {(desktop || activeTab === 'education' || activeTab === 'complementary') &&
        <HologramPanel complementary={activeTab === 'complementary' && !overdriveMode} desktop={desktop}
          onOpenCertificate={setCertificate} paused={effectsPaused} text={text} />}
    </div>
    {certificate && <CertificateDialog certificate={certificate} language={language} onClose={() => setCertificate(null)} />}
    <OverdriveWarning returnFocusRef={commandRef} />
    {overdriveMode && <OverdriveJourney />}
    {overdriveMode && <div className="overdrive-controls">
      <button ref={exitRef} title={language === 'en' ? 'Esc / X: return. Space on background: pause effects.' : 'Esc / X: retornar. Espaço no fundo: pausar efeitos.'} onClick={() => toggleOverdriveMode(false)}>[X] TERMINATE_OVERDRIVE // RETURN_TO_TERMINAL</button>
    </div>}
  </div>;
}
