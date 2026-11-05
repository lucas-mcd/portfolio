import { create } from 'zustand';

export const TABS = Object.freeze([
  { id: 'home', label: 'Home', command: '~' },
  { id: 'about', label: 'Sobre Mim', command: 'whoami' },
  { id: 'projects', label: 'Projetos', command: 'ls projects' },
  { id: 'skills', label: 'Conhecimentos', command: 'skills' },
  { id: 'education', label: 'Formação', command: 'education' },
]);
// Camada inicial: o currículo continua sendo a fonte de dados original.
export const UI_TEXT = {
  pt: {
    tabs: ['Home', 'Sobre Mim', 'Projetos', 'Conhecimentos', 'Formação'],
    role: 'Desenvolvedor Full Stack Python', about: 'Dossiê pessoal',
    projects: 'Arquivos de projeto', education: 'Formação', skills: 'Conhecimentos',
    openProjects: 'Abrir arquivos de projeto', pause: 'Pausar efeitos', resume: 'Retomar efeitos',
    navigation: 'Menu tático', sections: 'Seções', skip: 'Pular para conteúdo',
    boot: 'Inicializando portfólio', simulation: 'Simulação visual local — nenhuma varredura de rede',
    academic: 'REGISTRO EDUCACIONAL', sourceLanguage: 'Dados do currículo: português',
  },
  en: {
    tabs: ['Home', 'About Me', 'Projects', 'Skills', 'Education'],
    role: 'Python Full Stack Developer', about: 'Personal dossier',
    projects: 'Project files', education: 'Education', skills: 'Skills',
    openProjects: 'Open project files', pause: 'Pause effects', resume: 'Resume effects',
    navigation: 'Tactical menu', sections: 'Sections', skip: 'Skip to content',
    boot: 'Initializing portfolio', simulation: 'Local visual simulation — no network scanning',
    academic: 'EDUCATION RECORD', sourceLanguage: 'Résumé data: Portuguese',
  },
};
export const canUseOverdrive = () => typeof window !== 'undefined' && window.innerWidth >= 1024;
// Validação também para setState externo: nenhuma rota pode contornar o limite.
const guarded = config => (set, get, api) => {
  const safeSet = (update, replace) => set(state => {
    const next = typeof update === 'function' ? update(state) : update;
    return canUseOverdrive() ? next : { ...next, overdriveMode: false, showOverdriveWarning: false, isCapturing: false };
  }, replace);
  api.setState = safeSet;
  return config(safeSet, get, api);
};
export const usePortfolioStore = create(guarded((set, get) => ({
  activeTab: 'home', language: 'pt', hoveredItem: null,
  showOverdriveWarning: false, overdriveMode: false,
  isCapturing: false, setCapturing: (isCapturing) => set({ isCapturing }),
  setActiveTab: (activeTab) => {
    if (TABS.some((tab) => tab.id === activeTab) && get().activeTab !== activeTab)
      set({ activeTab, hoveredItem: null });
  },
  setLanguage: (language) => { if (['pt', 'en'].includes(language)) set({ language }); },
  setHoveredItem: (name) => { if (typeof name === 'string' && name.trim()) set({ hoveredItem: name }); },
  clearHoveredItem: () => set({ hoveredItem: null }),
  toggleOverdriveWarning: (value) => {
    if (!get().overdriveMode) set({ showOverdriveWarning: typeof value === 'boolean' ? value : !get().showOverdriveWarning });
  },
  toggleOverdriveMode: (value) => {
    const next = typeof value === 'boolean' ? value : !get().overdriveMode;
    // Entrar requer o prompt aberto; sair é permitido em qualquer momento.
    if (next && (!canUseOverdrive() || !get().showOverdriveWarning)) return;
    set({ overdriveMode: next, showOverdriveWarning: false });
  },
})));
