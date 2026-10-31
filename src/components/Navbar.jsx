import { BODIES } from '../data/planets';

export default function Navbar({ mode, onBack, onSelect }) {
  return (
    <header className="navbar">
      <button type="button" className="navbar__title" onClick={mode === 'explore' ? onBack : undefined} aria-label="Planet Explorer">
        PLANET EXPLORER
      </button>

      <nav className={`navbar__index ${mode === 'home' ? 'is-on' : ''}`} aria-label="Solar system bodies">
        <ol>
          {BODIES.map((b) => (
            <li key={b.id}>
              <button type="button" onClick={() => onSelect(b.id)} tabIndex={mode === 'home' ? 0 : -1}>
                {b.name}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <button
        type="button"
        className={`navbar__back ${mode === 'explore' ? 'is-on' : ''}`}
        onClick={onBack}
        tabIndex={mode === 'explore' ? 0 : -1}
      >
        <span className="navbar__back-line" aria-hidden="true" />
        BACK TO SPACE
      </button>
    </header>
  );
}
