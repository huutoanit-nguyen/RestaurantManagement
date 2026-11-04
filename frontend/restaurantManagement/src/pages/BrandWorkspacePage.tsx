import { useState } from "react"
import { Link } from "react-router-dom"
import "../brand.css"
import "../marketing.css"

const markPath =
  "M27 23V43Q27 53 37 53V78M38 23V42M49 23V43Q49 53 39 53M56 26H62Q78 26 78 41Q78 55 60 55H56L79 78"

function Mark({
  className = "",
  tile = true,
}: {
  className?: string
  tile?: boolean
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 104 104"
      fill="none"
      aria-hidden="true"
    >
      {tile && <rect width="104" height="104" rx="28" fill="currentColor" />}
      <path
        d={markPath}
        stroke={tile ? "var(--mark-ink, #C7F4A4)" : "currentColor"}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface IconProps {
  name: string
  size?: number
}

function Icon({ name, size = 19 }: IconProps) {
  const paths: Record<string, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    shapes: (
      <>
        <path d="m8 3 5 8H3z" />
        <circle cx="17" cy="7" r="4" />
        <rect x="5" y="14" width="8" height="7" rx="1" />
        <path d="m18 14 4 7h-8z" />
      </>
    ),
    palette: (
      <>
        <path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.5-3.3 1.7 1.7 0 0 1 1.3-2.7H18c4 0 4-12-6-12Z" />
        <path d="M7 10h.01M10 6.5h.01M15 7h.01M18 11h.01" strokeWidth="3" />
      </>
    ),
    type: (
      <>
        <path d="M3 5h13M9.5 5v15M15 12h7M18.5 12v8" />
      </>
    ),
    box: (
      <>
        <path d="m12 3 9 5v9l-9 5-9-5V8zM3 8l9 5 9-5M12 13v9M7 5.5l10 5.5" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14m-5-5 5 5-5 5" />
      </>
    ),
    external: (
      <>
        <path d="M14 4h6v6M20 4l-9 9M10 4H4v16h16v-6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" />
      </>
    ),
    moon: <path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10v.1" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.grid}
    </svg>
  )
}

const palette = [
  {
    name: "Garden",
    hex: "#C7F4A4",
    description: "Our signature. Fresh, optimistic, and full of possibility.",
  },
  {
    name: "Midnight",
    hex: "#202923",
    description: "A grounded green-black that brings clarity and confidence.",
  },
  {
    name: "Porcelain",
    hex: "#F7F8F5",
    description: "A quiet, warm canvas that gives our brand room to breathe.",
  },
  {
    name: "Forest",
    hex: "#52735B",
    description: "A natural supporting tone for thoughtful details.",
  },
]
const nav = [
  { label: "Overview", icon: "grid" },
  { label: "Logo system", icon: "shapes" },
  { label: "Color palette", icon: "palette" },
  { label: "Typography", icon: "type" },
  { label: "Brand assets", icon: "box" },
]

export default function BrandWorkspace() {
  const [page, setPage] = useState("Overview")
  const [dark, setDark] = useState(false)
  const [toast, setToast] = useState("")

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(""), 3000)
  }

  function download(iconOnly = false) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${
      iconOnly ? 104 : 460
    }" height="104" viewBox="0 0 ${
      iconOnly ? 104 : 460
    } 104"><rect width="104" height="104" rx="28" fill="#202923"/><path d="${markPath}" fill="none" stroke="#C7F4A4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>${
      iconOnly
        ? ""
        : '<text x="126" y="74" font-family="Arial,sans-serif" font-size="67" font-weight="700" letter-spacing="-3" fill="#202923">ResMana</text>'
    }</svg>`
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))
    const a = document.createElement("a")
    a.href = url
    a.download = iconOnly ? "resmana-symbol.svg" : "resmana-logo.svg"
    a.click()
    URL.revokeObjectURL(url)
    notify("Your SVG is ready. Make it yours.")
  }

  return (
    <div className="brand-workspace-root">
      <Link to="/" className="brand-back-link">
        ← Back to ResMana
      </Link>
      <div className="app-shell">
      <aside className="sidebar">
        <a
          href="#"
          className="sidebar-brand"
          onClick={() => setPage("Overview")}
          aria-label="ResMana brand home"
        >
          <Mark />
          <span>
            ResMana<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="workspace-label">
          BRAND WORKSPACE <span>1.0</span>
        </div>
        <nav aria-label="Brand guidelines">
          {nav.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${page === item.label ? "active" : ""}`}
              onClick={() => setPage(item.label)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {page === item.label && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="brand-note">
            <svg
              className="little-spark"
              width="27"
              height="27"
              viewBox="0 0 30 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.7"
              aria-hidden="true"
            >
              <path d="M15 2v26M2 15h26M6 6l18 18M6 24 24 6" />
            </svg>
            <h3>
              A little consistency.
              <br />A lot of possibility.
            </h3>
            <p>
              Everything you need to bring
              <br />
              the ResMana brand to life.
            </p>
            <button onClick={() => download()}>
              Get the logo <Icon name="arrow" size={16} />
            </button>
          </div>
          <div className="workspace-person">
            <div className="avatar">R</div>
            <div>
              <strong>ResMana Brand</strong>
              <span>The official brand space</span>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            Brand workspace <span>/</span> <strong>{page}</strong>
          </div>
          <span className="official">
            <span /> Official brand guidelines
          </span>
        </header>
        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">THE RESMANA BRAND</div>
              <h1>
                {page === "Overview"
                  ? "Good food. Great management."
                  : page === "Logo system"
                    ? "One mark. Many possibilities."
                    : page === "Color palette"
                      ? "Rooted in freshness."
                      : page === "Typography"
                        ? "A clear voice. By design."
                        : "Ready for your next big thing."}
              </h1>
              <p>
                {page === "Overview"
                  ? "A fresh identity for the way restaurants run."
                  : page === "Logo system"
                    ? "Recognizable at every size. Consistent in every space."
                    : page === "Color palette"
                      ? "A considered palette that feels as fresh as our thinking."
                      : page === "Typography"
                        ? "Friendly, purposeful typography that gets straight to the point."
                        : "The essentials to put the ResMana brand to work."}
              </p>
            </div>
            <button className="primary-button" onClick={() => download()}>
              <Icon name="download" size={17} />
              Download logo<span className="file-tag">SVG</span>
            </button>
          </section>

          {(page === "Overview" || page === "Logo system") && (
            <>
              <div className="hero-grid">
                <section className={`logo-stage ${dark ? "dark" : ""}`}>
                  <div className="stage-top">
                    <span>PRIMARY LOGO</span>
                    <div className="theme-toggle" aria-label="Logo background">
                      <button
                        className={!dark ? "selected" : ""}
                        onClick={() => setDark(false)}
                        aria-label="Light background"
                        aria-pressed={!dark}
                      >
                        <Icon name="sun" size={15} />
                      </button>
                      <button
                        className={dark ? "selected" : ""}
                        onClick={() => setDark(true)}
                        aria-label="Dark background"
                        aria-pressed={dark}
                      >
                        <Icon name="moon" size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="hero-lockup">
                    <div className="main-logo">
                      <Mark />
                      <span>
                        ResMana<span className="wordmark-dot">.</span>
                      </span>
                    </div>
                    <p>Less managing. More serving.</p>
                  </div>
                  <div className="stage-bottom">
                    <span>Made for the business of good food.</span>
                    <span className="stage-mini">
                      EST. 2025 <span>↗</span>
                    </span>
                  </div>
                </section>
                <section className="idea-card">
                  <div className="eyebrow">THE IDEA BEHIND THE IDENTITY</div>
                  <h2>
                    A helping hand.
                    <br />A smarter restaurant.
                  </h2>
                  <p>
                    Hospitality at heart. Simplicity in mind.
                    <br />
                    ResMana brings the moving parts of your restaurant together,
                    so you can focus on what matters.
                  </p>
                  <div className="concept">
                    <div>
                      <svg
                        width="24"
                        height="29"
                        viewBox="0 0 30 35"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M7 3v10q0 6 6 6t6-6V3M13 3v29" />
                      </svg>
                    </div>
                    <span>A nod to hospitality</span>
                  </div>
                  <div className="concept">
                    <div className="letter-r">R</div>
                    <span>A mark of better management</span>
                  </div>
                  <div className="idea-footer">
                    <span className="small-dot" /> Thoughtful by design. Simple
                    by nature.
                  </div>
                </section>
              </div>
              <section className="variations-section">
                <div className="section-heading">
                  <h2>The right fit, everywhere.</h2>
                  <button
                    onClick={() =>
                      page === "Logo system"
                        ? download()
                        : setPage("Logo system")
                    }
                  >
                    {page === "Logo system"
                      ? "Download primary logo"
                      : "Explore the logo system"}
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
                <div className="variation-grid">
                  <button className="variant-card" onClick={() => download()}>
                    <div className="variant-art light-art">
                      <div className="small-lockup">
                        <Mark />
                        <span>ResMana.</span>
                      </div>
                    </div>
                    <div className="variant-caption">
                      <span>
                        Primary lockup<small>Our everyday signature</small>
                      </span>
                      <Icon name="download" size={17} />
                    </div>
                  </button>
                  <button
                    className="variant-card"
                    onClick={() => download(true)}
                  >
                    <div className="variant-art symbol-art">
                      <Mark />
                      <div className="orbit orbit-one" />
                      <div className="orbit orbit-two" />
                    </div>
                    <div className="variant-caption">
                      <span>
                        Brand symbol<small>Small size. Big personality.</small>
                      </span>
                      <Icon name="download" size={17} />
                    </div>
                  </button>
                  <button
                    className="variant-card"
                    onClick={() => download(true)}
                  >
                    <div className="variant-art app-art">
                      <div className="app-icon">
                        <Mark />
                      </div>
                      <span className="app-name">ResMana</span>
                    </div>
                    <div className="variant-caption">
                      <span>
                        App icon<small>A familiar face on every screen</small>
                      </span>
                      <Icon name="download" size={17} />
                    </div>
                  </button>
                </div>
              </section>
            </>
          )}

          {page === "Color palette" && (
            <section className="palette-detail">
              {palette.map((color) => (
                <button
                  key={color.name}
                  className="color-detail"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(color.hex)
                      notify(`${color.hex} copied to clipboard`)
                    } catch {
                      notify(`Color value: ${color.hex}`)
                    }
                  }}
                >
                  <div style={{ background: color.hex }} />
                  <h2>
                    {color.name}
                    <span>{color.hex}</span>
                  </h2>
                  <p>{color.description}</p>
                  <small>
                    Click to copy HEX <Icon name="external" size={13} />
                  </small>
                </button>
              ))}
            </section>
          )}
          {page === "Typography" && (
            <section className="type-panel">
              <div className="eyebrow">OUR BRAND TYPEFACE</div>
              <div className="type-specimen">
                Manrope<span>Aa</span>
              </div>
              <p>
                A contemporary sans serif with an approachable personality.
                <br />A little warmth, a lot of clarity — just like ResMana.
              </p>
              <div className="alphabet">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
                <br />
                abcdefghijklmnopqrstuvwxyz
                <br />
                0123456789 !@#$%&
              </div>
              <div className="type-weights">
                <span>Regular 400</span>
                <strong>Semibold 600</strong>
                <b>Bold 700</b>
              </div>
            </section>
          )}
          {page === "Brand assets" && (
            <section className="assets-grid">
              {[
                {
                  title: "Primary logo",
                  text: "The complete ResMana signature for your everyday brand moments.",
                  icon: false,
                },
                {
                  title: "Brand symbol",
                  text: "Our standalone symbol, ready for apps, avatars, and compact spaces.",
                  icon: true,
                },
              ].map((asset) => (
                <div className="asset-card" key={asset.title}>
                  <div className="asset-preview">
                    <Mark />
                    {!asset.icon && <strong>ResMana.</strong>}
                  </div>
                  <h2>{asset.title}</h2>
                  <p>{asset.text}</p>
                  <button
                    className="primary-button"
                    onClick={() => download(asset.icon)}
                  >
                    <Icon name="download" size={17} />
                    Download SVG
                  </button>
                </div>
              ))}
            </section>
          )}

          <section className="palette-strip">
            <div className="palette-intro">
              <span className="eyebrow">OUR TRUE COLORS</span>
              <p>Fresh. Grounded. Unmistakably us.</p>
            </div>
            <div className="swatches">
              {palette.map((color) => (
                <button
                  key={color.name}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(color.hex)
                      notify(`${color.hex} copied to clipboard`)
                    } catch {
                      notify(`Color value: ${color.hex}`)
                    }
                  }}
                  title={`Copy ${color.hex}`}
                >
                  <span
                    className="color-dot"
                    style={{ background: color.hex }}
                  />
                  <span>
                    {color.name}
                    <small>{color.hex}</small>
                  </span>
                </button>
              ))}
            </div>
            <button
              className="palette-link"
              onClick={() => setPage("Color palette")}
              aria-label="View color palette"
            >
              <Icon name="arrow" />
            </button>
          </section>
          <footer>
            <span>Built around hospitality. Designed for possibility.</span>
            <span>
              ResMana Brand Guidelines <span className="footer-divider">/</span>{" "}
              v1.0
            </span>
          </footer>
        </div>
      </main>
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={18} />
          {toast}
        </div>
      )}
      </div>
    </div>
  )
}
