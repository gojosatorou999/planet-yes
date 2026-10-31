export default function Loader({ progress, ready, error }) {
  const pct = Math.round(Math.min(Math.max(progress, 0), 1) * 100);
  return (
    <div className={`loader ${ready || error ? 'is-done' : ''} ${error ? 'is-error' : ''}`} role="status" aria-live="polite">
      {error ? (
        <div className="loader__error">
          <p className="eyebrow">UNABLE TO RENDER</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="loader__inner">
          <p className="eyebrow">ESTABLISHING ORBIT</p>
          <div className="loader__bar">
            <span style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
          <p className="loader__pct">{String(pct).padStart(3, '0')}</p>
        </div>
      )}
    </div>
  );
}
