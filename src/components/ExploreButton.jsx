export default function ExploreButton({ onClick, children = 'EXPLORE' }) {
  return (
    <button type="button" className="explore-btn" onClick={onClick}>
      <span>{children}</span>
      <svg viewBox="0 0 40 8" aria-hidden="true">
        <path d="M0 4h38M34 1l4 3-4 3" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
    </button>
  );
}
