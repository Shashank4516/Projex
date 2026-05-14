import './BannerFigma1003145.css'

/**
 * Figma node 100-3145 / 100:3145 (child frame 99:3097) — “Banner” from MCP.
 * Uses exported SVGs in /public/figma + local sparkle vector assets.
 */
const SPARKLE = [
  { l: 23.94, t: 7.18 },
  { l: 47.89, t: 19.16 },
  { l: 71.83, t: 11.17 },
  { l: 90.99, t: 23.15 },
  { l: 108.55, t: 11.17 },
  { l: 127.71, t: 19.16 },
  { l: 146.86, t: 7.18 },
]

export function BannerFigma1003145() {
  return (
    <div
      className="banner-1003145"
      data-node-id="100:3145"
      data-name="Banner"
      data-figma-frame="99:3097"
    >
      {/* 99:3098 — back strip (Figma: blur, above bottom glow) */}
      <div
        className="banner-1003145__layer banner-1003145__layer--a"
        aria-hidden
        data-node-id="99:3098"
      />
      {/* 99:3099 — main radial (pink at bottom) */}
      <div
        className="banner-1003145__layer banner-1003145__layer--b"
        aria-hidden
        data-node-id="99:3099"
      />
      {SPARKLE.map((p, i) => (
        <div
          key={i}
          className="banner-1003145__sparkle"
          style={{ left: `${p.l}px`, top: `${p.t}px` }}
        >
          <div className="banner-1003145__sparkle-flip" aria-hidden>
            <div className="banner-1003145__sparkle-clip" data-name="Frame">
              <div className="banner-1003145__sparkle-m">
                <img
                  className="banner-1003145__sparkle-img"
                  src="/figma/banner-sparkle-fill.svg"
                  alt=""
                  width={4}
                  height={4}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <p className="banner-1003145__copy" data-node-id="99:3142">
        <span className="banner-1003145__l1">Make your aura</span>
        <span className="banner-1003145__line2" aria-label="compete with others">
          <a className="banner-1003145__a" href="#compete">
            compete
          </a>
          with others
          <span className="banner-1003145__fire" aria-hidden>
            {' '}
            🔥
          </span>
        </span>
      </p>
    </div>
  )
}
