import { useCallback, useEffect, useRef, useState } from 'react';
import Planet3D from './components/Planet3D';
import SpaceBackground from './components/SpaceBackground';
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import Home from './pages/Home';
import Exploration from './pages/Exploration';
import { BODIES, DEFAULT_BODY, getBody, nextBody } from './data/planets';

// Route lives in the URL hash (#/earth) so the browser Back button works and the 3D scene
// is never unmounted when switching between screens.
const readRoute = () => getBody(window.location.hash.replace(/^#\/?/, '')) ?? null;

export default function App() {
  const [focus, setFocus] = useState(() => readRoute() ?? DEFAULT_BODY);
  const [mode, setMode] = useState(() => (readRoute() ? 'explore' : 'home'));
  const [shown, setShown] = useState(focus); // body whose info is on the panel
  const [panelOn, setPanelOn] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const panelOnRef = useRef(false);
  panelOnRef.current = panelOn;

  const sync = useCallback(() => {
    const routed = readRoute();
    if (routed) setFocus(routed);
    setMode(routed ? 'explore' : 'home');
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, [sync]);

  // From the home view: fly to a body and push a history entry so Back returns to space.
  const select = useCallback(
    (id) => {
      if (mode === 'explore') return;
      window.history.pushState({ explored: true }, '', `#/${id}`);
      sync();
    },
    [mode, sync],
  );

  // While exploring: move on to the next body without adding history entries.
  const next = useCallback(() => {
    if (mode !== 'explore') return;
    window.history.replaceState(window.history.state, '', `#/${nextBody(focus.id).id}`);
    sync();
  }, [mode, focus.id, sync]);

  const back = useCallback(() => {
    if (mode !== 'explore') return;
    if (window.history.state?.explored) {
      window.history.back();
    } else {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      sync();
    }
  }, [mode, sync]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && back();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [back]);

  // The info panel fades out while the camera travels and returns once it has arrived.
  useEffect(() => {
    if (!ready || mode !== 'explore') {
      setPanelOn(false);
      return undefined;
    }
    const hopping = panelOnRef.current;
    if (hopping) setPanelOn(false);
    else setShown(focus);
    const id = setTimeout(
      () => {
        setShown(focus);
        setPanelOn(true);
      },
      hopping ? 2200 : 1600,
    );
    return () => clearTimeout(id);
  }, [ready, mode, focus]);

  useEffect(() => {
    document.title = mode === 'explore' ? `${focus.name} | Planet Explorer` : 'Planet Explorer';
  }, [mode, focus.name]);

  return (
    <div className={`app app--${mode} ${ready ? 'is-ready' : ''}`}>
      <Planet3D
        bodies={BODIES}
        mode={mode}
        focusId={focus.id}
        onSelect={select}
        onNext={next}
        onProgress={setProgress}
        onReady={() => setReady(true)}
        onError={setError}
      />
      <SpaceBackground mode={mode} />
      <Navbar mode={mode} onBack={back} onSelect={select} />
      <main>
        <Home active={mode === 'home' && ready} onBegin={() => select('sun')} />
        <Exploration planet={shown} next={nextBody(shown.id)} active={panelOn} onNext={next} />
      </main>
      <Loader progress={progress} ready={ready} error={error} />
    </div>
  );
}
