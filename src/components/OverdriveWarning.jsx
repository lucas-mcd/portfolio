import { useEffect, useRef, useState } from 'react';
import { canUseOverdrive, usePortfolioStore } from '../store/usePortfolioStore';

export default function OverdriveWarning({ returnFocusRef }) {
  const showOverdriveWarning = usePortfolioStore(state => state.showOverdriveWarning);
  const { toggleOverdriveWarning, toggleOverdriveMode } = usePortfolioStore.getState();
  const language = usePortfolioStore(state => state.language);
  const en = language === 'en';
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState('');
  const request = useRef(0);
  const busy = useRef(false);
  const preparation = useRef(null);
  const dimensions = useRef('');
  function prepare(id) {
    dimensions.current = `${window.innerWidth}x${window.innerHeight}`;
    setError(''); setCapturing(true);
    const valid = () => request.current === id && usePortfolioStore.getState().showOverdriveWarning;
    const task = (async () => {
      // Let the dialog paint before DOM serialization starts.
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (!valid()) return false;
      const module = await import('./canvas/OverdriveScene');
      if (!valid()) return false;
      usePortfolioStore.getState().setCapturing(true);
      await module.captureScreenRip(document.querySelector('.tactical-app'), valid);
      return valid();
    })().catch(error => {
      if (valid()) { setError(true); console.error('[SCREEN_RIP]', error); }
      return false;
    }).finally(() => {
      if (request.current === id) {
        usePortfolioStore.getState().setCapturing(false); setCapturing(false);
      }
    });
    preparation.current = task;
    return task;
  }
  async function approve() {
    if (busy.current || !canUseOverdrive() || !usePortfolioStore.getState().showOverdriveWarning) return;
    busy.current = true;
    const id = request.current;
    try {
      let success = await (preparation.current || prepare(id));
      if (request.current !== id) return;
      if (!success || dimensions.current !== `${window.innerWidth}x${window.innerHeight}`) success = await prepare(id);
      if (success && request.current === id) toggleOverdriveMode(true);
    } finally { busy.current = false; }
  }
  const dialog = useRef(null);
  const abort = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    if (!showOverdriveWarning) return;
    const id = ++request.current;
    element.showModal();
    prepare(id);
    abort.current?.focus();
    return () => {
      const closedId = ++request.current;
      if (!usePortfolioStore.getState().overdriveMode) import('./canvas/OverdriveScene').then(module => {
        if (request.current === closedId && !usePortfolioStore.getState().showOverdriveWarning && !usePortfolioStore.getState().overdriveMode) module.clearScreenRipSnapshot();
      });
      preparation.current = null;
      usePortfolioStore.getState().setCapturing(false);
      element.close();
      // Aprovação transfere foco para a saída; cancelamento volta ao comando.
      if (!usePortfolioStore.getState().overdriveMode) returnFocusRef.current?.focus({ preventScroll: true });
    };
  }, [showOverdriveWarning, returnFocusRef]);
  return <dialog ref={dialog} className="overdrive-dialog" aria-labelledby="overdrive-warning-title"
    onCancel={(event) => { event.preventDefault(); toggleOverdriveWarning(false); }}
    onKeyDown={(event) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.toLowerCase() === 'y') { event.preventDefault(); approve(); }
      if (event.key.toLowerCase() === 'n') { event.preventDefault(); toggleOverdriveWarning(false); }
    }}>
    <p className="eyebrow">CRITICAL PROMPT / EXPERIMENTAL</p>
    <h2 id="overdrive-warning-title" className="overdrive-alert">WARNING: EXTREME GPU LOAD DETECTED. ENABLING EXPERIMENTAL 3D MATRIX. PROCEED WITH CAUTION?</h2>
    <p className="muted text-xs leading-6 mt-5">{en ? 'Experimental visual simulation. This message is not a GPU measurement. Exit at any time using the return button or Escape.' : 'Simulação visual experimental. Esta mensagem não é uma medição da GPU. Saia a qualquer momento pelo botão de retorno ou pela tecla Esc.'}</p>
    <p role="status" className="text-xs mt-4">{capturing ? (en ? '[CAPTURE] Preparing layout snapshot…' : '[CAPTURE] Preparando imagem do layout…') : error ? (en ? 'Unable to capture the interface. Please try again.' : 'Não foi possível capturar a interface. Tente novamente.') : ''}</p>
    <div className="flex flex-wrap gap-3 mt-8">
      <button onClick={approve}>{en ? '[Y] APPROVE_ACCESS' : '[Y] APROVAR_ACESSO'}</button>
      <button ref={abort} onClick={() => toggleOverdriveWarning(false)}>{en ? '[N] ABORT_COMMAND' : '[N] ABORTAR_COMANDO'}</button>
    </div>
  </dialog>;
}
