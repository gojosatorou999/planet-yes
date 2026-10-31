import { useState } from 'react';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'physical', label: 'Physical' },
  { id: 'orbit', label: 'Orbit' },
  { id: 'environment', label: 'Environment' },
  { id: 'facts', label: 'Facts' },
];

function Ledger({ rows }) {
  return (
    <dl className="ledger">
      {rows.map((r) => (
        <div className="ledger__row" key={r.label}>
          <dt>{r.label}</dt>
          <dd>
            {r.value}
            {r.note && <span>{r.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Composition({ data }) {
  return (
    <div className="composition">
      <h3 className="eyebrow">{data.title ?? 'ATMOSPHERIC COMPOSITION'}</h3>
      <ul>
        {data.composition.map((g) => (
          <li key={g.label}>
            <div className="composition__head">
              <span>
                {g.label} <em>{g.symbol}</em>
              </span>
              <span>{g.percent < 0.1 ? g.percent.toFixed(3) : g.percent.toFixed(2)}%</span>
            </div>
            <div className="composition__bar">
              <i style={{ width: `max(${g.percent}%, 2px)` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="muted">{data.note}</p>
    </div>
  );
}

// Progressive disclosure: one concise tab at a time rather than every figure at once.
export default function PlanetInfo({ planet }) {
  const [tab, setTab] = useState('overview');
  const s = planet.sections;

  return (
    <div className="info">
      <div role="tablist" aria-label={`${planet.name} information`} className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="tabpanel"
            className={tab === t.id ? 'is-active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.id === 'environment' ? planet.envLabel ?? t.label : t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="tabpanel" aria-labelledby={`tab-${tab}`} className="tabpanel" key={tab}>
        {tab === 'overview' && (
          <>
            <p className="lede">{planet.intro}</p>
            <ul className="headline">
              {planet.headline.map((h) => (
                <li key={h.label}>
                  <strong>{h.value}</strong>
                  {h.unit && <small>{h.unit}</small>}
                  <span>{h.label}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        {tab === 'physical' && <Ledger rows={s.physical} />}
        {tab === 'orbit' && <Ledger rows={s.orbit} />}
        {tab === 'environment' && (
          <>
            <Composition data={s.atmosphere} />
            <h3 className="eyebrow eyebrow--spaced">{s.surfaceTitle ?? 'SURFACE CHARACTERISTICS'}</h3>
            <Ledger rows={s.surface} />
          </>
        )}
        {tab === 'facts' && (
          <ol className="facts">
            {planet.facts.map((f, i) => (
              <li key={f.title}>
                <span className="facts__n">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
