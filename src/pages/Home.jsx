import ExploreButton from '../components/ExploreButton';

export default function Home({ active, onBegin }) {
  return (
    <section className={`page home ${active ? 'is-active' : ''}`} aria-hidden={!active} inert={active ? undefined : ''}>
      <p className="home__intro eyebrow">A JOURNEY THROUGH OUR SOLAR SYSTEM</p>

      <div className="home__label">
        <h1>SOLAR SYSTEM</h1>
        <p>ONE STAR. EIGHT WORLDS.</p>
        <ExploreButton onClick={onBegin}>BEGIN WITH THE SUN</ExploreButton>
      </div>

      <p className="home__hint eyebrow">
        <span className="hint-pointer">DRAG TO ORBIT &nbsp;/&nbsp; SCROLL TO ZOOM &nbsp;/&nbsp; SELECT A WORLD</span>
        <span className="hint-touch">DRAG TO ORBIT &nbsp;/&nbsp; PINCH TO ZOOM &nbsp;/&nbsp; TAP A WORLD</span>
      </p>
    </section>
  );
}
