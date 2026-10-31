import PlanetInfo from '../components/PlanetInfo';

export default function Exploration({ planet, next, active, onNext }) {
  return (
    <section className={`page exploration ${active ? 'is-active' : ''}`} aria-hidden={!active} inert={active ? undefined : ''}>
      <aside className="panel">
        <p className="eyebrow panel__index">
          {String(planet.order).padStart(2, '0')} / 08 &nbsp;&middot;&nbsp; {planet.classification.toUpperCase()}
        </p>
        <h2 className="panel__name">{planet.name.toUpperCase()}</h2>
        <p className="panel__sub">{planet.subtitle}</p>
        <div className="panel__rule" />
        <PlanetInfo key={planet.id} planet={planet} />
        <button type="button" className="panel__next" onClick={onNext}>
          <span>
            <small>NEXT</small>
            {next.name.toUpperCase()}
          </span>
          <svg viewBox="0 0 40 8" aria-hidden="true">
            <path d="M0 4h38M34 1l4 3-4 3" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </aside>

      <p className="exploration__hint eyebrow">CLICK THE {planet.id === 'sun' ? 'SUN' : 'PLANET'} TO CONTINUE TO {next.name.toUpperCase()}</p>
    </section>
  );
}
