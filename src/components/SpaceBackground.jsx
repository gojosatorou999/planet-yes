// Static atmosphere layered over the WebGL canvas: a soft vignette that deepens the
// edges of space and keeps interface text legible. The stars themselves live in the
// 3D scene (src/three/starfield.js) so they can have real depth and parallax.
export default function SpaceBackground({ mode }) {
  return (
    <div className={`space-bg space-bg--${mode}`} aria-hidden="true">
      <div className="space-bg__vignette" />
      <div className="space-bg__shade" />
    </div>
  );
}
