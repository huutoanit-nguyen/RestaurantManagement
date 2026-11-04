import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { session } from '../api/auth';
import '../marketing.css';

const restaurantPhoto = `${import.meta.env.BASE_URL}images/restaurant.jpg`;

export function Logo() {
  return (
    <span className="rm-logo">
      <svg viewBox="0 0 104 104" fill="none" aria-hidden="true">
        <rect width="104" height="104" rx="28" fill="currentColor" />
        <path
          d="M27 23V43Q27 53 37 53V78M38 23V42M49 23V43Q49 53 39 53M56 26H62Q78 26 78 41Q78 55 60 55H56L79 78"
          stroke="var(--logo-ink, #C7F4A4)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        ResMana
      </span>
    </span>
  );
}

export interface GlyphProps {
  name?: string;
  size?: number;
}

export function Glyph({ name = 'arrow', size = 20 }: GlyphProps) {
  const paths: Record<string, React.ReactNode> = {
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    play: <path d="m9 5 11 7-11 7V5Z" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v17h17M8 14l4-5 4 2 5-7" />
      </>
    ),
    team: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v2" />
      </>
    ),
    order: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V2m6 2V2M9 10h6m-6 4h6m-6 4h3" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 3C9 2 2 6 5 15c9 4 15-3 15-12ZM4 21 16 8" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.arrow}
    </svg>
  );
}

export function Dashboard({
  compact = false,
  restaurant = 'The Green Table',
  active = 'Overview',
}: {
  compact?: boolean;
  restaurant?: string;
  active?: string;
}) {
  return (
    <div className={`rm-dashboard ${compact ? 'compact' : ''}`}>
      <div className="dash-sidebar">
        <Logo />
        <div className="dash-restaurant">
          <span className="restaurant-initial">{restaurant[0] || 'R'}</span>
          <span>
            {restaurant}
            <small>Restaurant workspace</small>
          </span>
          <Glyph name="chevron" size={12} />
        </div>
        <span className="dash-nav-label">WORKSPACE</span>
        {['Overview', 'Orders', 'Menu', 'Team', 'Reports'].map((item, i) => (
          <div
            key={item}
            className={`dash-nav-item ${active === item ? 'selected' : ''}`}
          >
            <Glyph
              name={['grid', 'order', 'leaf', 'team', 'chart'][i]}
              size={15}
            />
            {item}
            {item === 'Orders' && <b>12</b>}
          </div>
        ))}
        <div className="dash-help">
          <Glyph name="leaf" size={18} />
          <strong>A little more growing.</strong>
          <span>Your restaurant, at its best.</span>
        </div>
        <div className="dash-profile">
          <span>JD</span>
          <div>
            Jamie Davis<small>Restaurant owner</small>
          </div>
        </div>
      </div>
      <div className="dash-body">
        <div className="dash-top">
          <span>Your restaurant, at a glance.</span>
          <span className="dash-status">
            <i />
            Live overview
          </span>
        </div>
        <div className="dash-greeting">
          <div>
            <h3>
              {active === 'Orders'
                ? 'Every order. In harmony.'
                : active === 'Team'
                  ? 'Good people. Great service.'
                  : 'Looking good, Jamie.'}
            </h3>
            <p>
              {active === 'Orders'
                ? 'From the first ticket to the final plate.'
                : active === 'Team'
                  ? 'Your team is ready for a great shift.'
                  : "Here's what's happening at your restaurant today."}
            </p>
          </div>
          <span>
            Today <Glyph name="chevron" size={11} />
          </span>
        </div>
        <div className="dash-stats">
          {(active === 'Team'
            ? [
                ['On shift', '8', 'All set for service'],
                ['Team members', '16', 'Your dream team'],
                ['Hours this week', '124', 'Right on track'],
              ]
            : [
                ['Total revenue', '$2,846.50', '12.8% vs yesterday'],
                ['Orders served', '86', '8.2% vs yesterday'],
                ['Average order', '$33.10', '4.3% vs yesterday'],
              ]
          ).map((stat, i) => (
            <div key={stat[0]}>
              <span>
                {stat[0]}
                <Glyph
                  name={i === 0 ? 'chart' : i === 1 ? 'order' : 'clock'}
                  size={13}
                />
              </span>
              <strong>{stat[1]}</strong>
              <small>↗ {stat[2]}</small>
            </div>
          ))}
        </div>
        <div className="dash-chart-card">
          <div className="dash-card-title">
            <strong>
              {active === 'Team' ? 'Team hours' : 'Revenue overview'}
            </strong>
            <span>
              This week <Glyph name="chevron" size={10} />
            </span>
          </div>
          <div className="chart-content">
            <div className="chart-labels">
              <span>$3k</span>
              <span>$2k</span>
              <span>$1k</span>
              <span>$0</span>
            </div>
            <div className="chart-bars">
              {[43, 62, 51, 75, 59, 94, 78].map((height, i) => (
                <div key={i}>
                  <div
                    className={i === 5 ? 'highlight' : ''}
                    style={{ height: `${height}%` }}
                  />
                  <span>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="dash-orders">
          <div className="dash-card-title">
            <strong>
              {active === 'Team' ? 'Today’s team' : 'Recent orders'}
            </strong>
            <span>
              View all <Glyph size={11} />
            </span>
          </div>
          {(active === 'Team'
            ? [
                ['Jamie Davis', 'Floor manager', 'On shift'],
                ['Alex Morgan', 'Head chef', 'On shift'],
              ]
            : [
                ['#ORD-0086', 'Table 04 · Dine-in', 'Preparing'],
                ['#ORD-0085', 'Table 12 · Dine-in', 'Completed'],
              ]
          ).map((row, i) => (
            <div className="dash-order-row" key={row[0]}>
              <span className="order-symbol">
                <Glyph name={active === 'Team' ? 'team' : 'order'} size={14} />
              </span>
              <strong>
                {row[0]}
                <small>{row[1]}</small>
              </strong>
              <span className={i ? 'status-complete' : 'status-preparing'}>
                {row[2]}
              </span>
              <b>{active === 'Team' ? 'Today' : i ? '$42.50' : '$68.00'}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const featureData = [
  {
    icon: 'order',
    title: 'Every order, in harmony.',
    text: 'From the first ticket to the last table, keep orders flowing and your kitchen in sync.',
    tag: 'ORDER MANAGEMENT',
  },
  {
    icon: 'team',
    title: 'Good people. Great shifts.',
    text: 'Bring your team together with clear schedules, shared tasks, and less back-and-forth.',
    tag: 'TEAM & OPERATIONS',
  },
  {
    icon: 'chart',
    title: 'Know more. Grow better.',
    text: 'Turn everyday numbers into a clearer picture of what’s working for your restaurant.',
    tag: 'INSIGHTS & REPORTS',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const isLoggedIn = !!session.token;

  const [mobileMenu, setMobileMenu] = useState(false);
  const [demo, setDemo] = useState(false);
  const [demoTab, setDemoTab] = useState('Overview');
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (!demo) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDemo(false);
    };
    document.addEventListener('keydown', escape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', escape);
    };
  }, [demo]);

  const handleStart = () => {
    navigate('/onboarding');
  };

  return (
    <div className="rm-site">
      {/* Announcement Bar */}
      <div className="rm-announcement">
        <span className="announcement-dot" /> A fresh way to run your restaurant.{' '}
        <a href="#features">
          Meet your new helping hand <Glyph size={13} />
        </a>
      </div>

      {/* Header */}
      <header className="rm-header">
        <Link to="/" aria-label="ResMana home">
          <Logo />
        </Link>
        <nav
          className={mobileMenu ? 'rm-navigation open' : 'rm-navigation'}
          aria-label="Main navigation"
        >
          <a href="#features" onClick={() => setMobileMenu(false)}>
            Why ResMana <Glyph name="chevron" size={13} />
          </a>
          <a href="#how-it-works" onClick={() => setMobileMenu(false)}>
            How it works
          </a>
          <a href="#pricing" onClick={() => setMobileMenu(false)}>
            Pricing
          </a>
          <a href="#faq" onClick={() => setMobileMenu(false)}>
            FAQs
          </a>
          {isLoggedIn && (
            <Link to="/app" onClick={() => setMobileMenu(false)}>
              Workspace
            </Link>
          )}
        </nav>
        <div className="rm-header-actions">
          <button className="rm-text-button" onClick={() => setDemo(true)}>
            Explore the app <Glyph size={15} />
          </button>

          {isLoggedIn ? (
            <button
              className="rm-button small"
              onClick={() => navigate('/app')}
            >
              Go to Workspace <Glyph size={15} />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="rm-text-button"
                style={{ textDecoration: 'none' }}
              >
                Sign in
              </Link>
              <button className="rm-button small" onClick={handleStart}>
                Get started <Glyph size={15} />
              </button>
            </>
          )}

          <button
            className="rm-menu-button"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenu}
          >
            <Glyph name={mobileMenu ? 'close' : 'menu'} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="rm-main">
        {/* Hero Section */}
        <section className="rm-hero">
          <div className="hero-copy">
            <div className="rm-pill">
              <Glyph name="leaf" size={13} /> A LITTLE LESS CHAOS. A LOT MORE
              POSSIBLE.
            </div>
            <h1>
              Good food.
              <br />
              Great service.
              <br />
              <span>Less busywork.</span>
              <svg
                className="hero-underline"
                viewBox="0 0 380 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 11C95-1 260-2 375 7M31 15c104-8 225-9 316-4"
                  stroke="#C7F4A4"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </h1>
            <p>
              Your restaurant has a lot of moving parts. Bring them all together
              with one simple platform — and get back to the hospitality you
              love.
            </p>
            <div className="hero-ctas">
              <button className="rm-button" onClick={handleStart}>
                Let’s grow your restaurant <Glyph size={17} />
              </button>
              <button className="rm-video-button" onClick={() => setDemo(true)}>
                <span>
                  <Glyph name="play" size={13} />
                </span>
                Take a quick tour
              </button>
            </div>
            <div className="hero-reassurance">
              <span>
                <Glyph name="check" size={13} />
                Explore at your own pace
              </span>
              <span>
                <Glyph name="check" size={13} />
                No credit card needed
              </span>
            </div>
            <div className="hero-social">
              <div className="social-avatars">
                <span>JL</span>
                <span>AM</span>
                <span>SK</span>
                <span>RD</span>
              </div>
              <div>
                <div className="social-stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Glyph key={i} name="star" size={11} />
                  ))}
                  <strong>Built for people who care.</strong>
                </div>
                <p>From neighborhood cafés to the next big thing.</p>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-grid" />
            <div className="visual-sun">
              <Glyph name="leaf" size={32} />
            </div>
            <div className="hero-dash-wrap">
              <Dashboard compact />
            </div>
            <div className="floating-order">
              <span className="floating-check">
                <Glyph name="check" size={19} />
              </span>
              <div>
                <strong>Another smooth service.</strong>
                <span>Kitchen happy. Guests happier.</span>
              </div>
              <span className="floating-dot" />
            </div>
            <div className="floating-growth">
              <div>
                <span>A little progress, every day</span>
                <Glyph name="chart" size={17} />
              </div>
              <strong>
                More room to grow<span>↗</span>
              </strong>
              <div className="growth-mini-bars">
                {[20, 35, 29, 49, 43, 62, 72, 65, 88, 100].map((height, i) => (
                  <span key={i} style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
            <div className="visual-caption">
              <span />
              YOUR WHOLE RESTAURANT. ONE HAPPY PLACE.
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="rm-trust">
          <p>
            FOR THE EARLY RISERS, THE LATE CLOSERS, AND EVERYONE IN BETWEEN.
          </p>
          <div>
            <span className="partner-serif">
              the green table<span className="partner-leaf">↗</span>
            </span>
            <span className="partner-serif italic">
              Sunday
              <br />
              <small>coffee & company</small>
            </span>
            <span className="partner-mono">FORK & FIELD</span>
            <span className="partner-serif">
              Gather<span className="partner-small">KITCHEN & BAR</span>
            </span>
            <span className="partner-serif italic">
              little olive
              <span className="partner-small">GOOD FOOD. GOOD COMPANY.</span>
            </span>
          </div>
          <small>Imagined restaurants. Real possibilities.</small>
        </section>

        {/* Features */}
        <section className="rm-features rm-section" id="features">
          <div className="rm-section-heading">
            <span className="rm-eyebrow">LESS JUGGLING. MORE JOY.</span>
            <h2>
              A full plate is good.
              <br />
              An overflowing to-do list? Not so much.
            </h2>
            <p>
              Meet the helping hand that connects your front of house,
              <br className="desktop-break" /> back of house, and everything in
              between.
            </p>
          </div>
          <div className="rm-feature-grid">
            {featureData.map((feature, i) => (
              <article className="rm-feature-card" key={feature.title}>
                <span className="feature-icon">
                  <Glyph name={feature.icon} size={24} />
                </span>
                <span className="feature-number">0{i + 1}</span>
                <div className="rm-eyebrow">{feature.tag}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <button
                  onClick={() => {
                    setDemoTab(['Orders', 'Team', 'Overview'][i]);
                    setDemo(true);
                  }}
                >
                  Take a closer look <Glyph size={15} />
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Story / How it works */}
        <section className="rm-story rm-section" id="how-it-works">
          <div className="story-image">
            <img
              src={restaurantPhoto}
              alt="A lively neighborhood restaurant filled with guests and warm natural light"
              loading="lazy"
            />
            <div className="story-photo-label">
              <Glyph name="leaf" size={17} />
              More moments like this.
            </div>
            <a
              className="photo-credit"
              href="https://unsplash.com/@kayleighharrington"
              target="_blank"
              rel="noreferrer"
            >
              Photo: Kayleigh Harrington / Unsplash
            </a>
          </div>
          <div className="story-copy">
            <span className="rm-eyebrow">BUILT AROUND YOUR WORLD</span>
            <h2>
              Less time behind
              <br />a screen.
              <br />
              <span>More time on the floor.</span>
            </h2>
            <p>
              You didn’t open a restaurant to manage spreadsheets. ResMana helps
              make the everyday easier, one small thing at a time.
            </p>
            <ol>
              {[
                [
                  'Make yourself at home',
                  'Tell us a little about your restaurant.',
                ],
                [
                  'Find your rhythm',
                  'Choose the tools that fit the way you work.',
                ],
                [
                  'Make room for the good stuff',
                  'Spend less time juggling, more time serving.',
                ],
              ].map((step, i) => (
                <li key={step[0]}>
                  <span>0{i + 1}</span>
                  <div>
                    <strong>{step[0]}</strong>
                    <p>{step[1]}</p>
                  </div>
                </li>
              ))}
            </ol>
            <button className="rm-text-button" onClick={handleStart}>
              Let’s make it yours <Glyph size={17} />
            </button>
          </div>
        </section>

        {/* Pricing */}
        <section className="rm-pricing rm-section" id="pricing">
          <div className="rm-section-heading">
            <span className="rm-eyebrow">SIMPLE PLANS. ROOM TO GROW.</span>
            <h2>A good fit for your next chapter.</h2>
            <p>
              Transparent example pricing, built around the size of your
              ambition.
            </p>
            <div className="billing-toggle">
              <button
                className={!annual ? 'active' : ''}
                onClick={() => setAnnual(false)}
                aria-pressed={!annual}
              >
                Monthly
              </button>
              <button
                className={annual ? 'active' : ''}
                onClick={() => setAnnual(true)}
                aria-pressed={annual}
              >
                Yearly <span>Save 20%</span>
              </button>
            </div>
          </div>
          <div className="pricing-grid">
            {[
              {
                name: 'Essentials',
                price: annual ? 39 : 49,
                text: 'A fresh start for independent restaurants.',
                features: [
                  'Orders & menu management',
                  'Daily performance insights',
                  'Up to 5 team members',
                  'One restaurant location',
                ],
              },
              {
                name: 'Growth',
                price: annual ? 79 : 99,
                text: 'A little more power. A lot more possibility.',
                features: [
                  'Everything in Essentials',
                  'Advanced reports & insights',
                  'Unlimited team members',
                  'Team scheduling & operations',
                ],
              },
            ].map((plan, i) => (
              <article
                className={`pricing-card ${i ? 'featured' : ''}`}
                key={plan.name}
              >
                {i === 1 && (
                  <div className="popular-label">
                    <Glyph name="leaf" size={13} />
                    MADE FOR YOUR NEXT CHAPTER
                  </div>
                )}
                <h3>{plan.name}</h3>
                <p>{plan.text}</p>
                <div className="plan-price">
                  ${plan.price}
                  <span>/ month</span>
                </div>
                <small>
                  {annual
                    ? `Billed yearly · $${plan.price * 12}/year`
                    : 'Billed monthly · No annual commitment'}
                </small>
                <button
                  className={`rm-button ${i ? '' : 'outline'}`}
                  onClick={handleStart}
                >
                  Explore {plan.name}
                  <Glyph size={16} />
                </button>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Glyph name="check" size={15} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="pricing-note">
            Preview plans only. Full access is unlocked for your restaurant workspace.
          </p>
        </section>

        {/* FAQs */}
        <section className="rm-faq rm-section" id="faq">
          <div>
            <span className="rm-eyebrow">
              A FEW THINGS YOU MIGHT BE WONDERING
            </span>
            <h2>
              Good questions.
              <br />
              Straight answers.
            </h2>
            <p>Getting to know your next helping hand.</p>
          </div>
          <div>
            {[
              [
                'What is ResMana?',
                'ResMana is a modern restaurant management platform designed with hospitality at heart. It connects tables, orders, kitchen workflows, team scheduling, and revenue analytics into one calm, unified workspace.',
              ],
              [
                'Can I try it before setting up?',
                'Absolutely! Click "Explore the app" or "Take a quick tour" to view the live interactive preview, or start right away through the guided onboarding.',
              ],
              [
                'Is it suitable for my restaurant type?',
                'Yes. ResMana is tailored for independent diners, cafés, bistros, bakeries, lounges, and multi-station restaurants. You can customize table grids, categories, and roles seamlessly.',
              ],
              [
                'Does it support real-time kitchen updates?',
                'Yes! ResMana is integrated with WebSocket real-time push notifications. When orders or tables update, your kitchen and front-of-house staff see status changes instantaneously.',
              ],
            ].map(([question, answer], i) => (
              <div className="faq-item" key={question}>
                <button
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {question}
                  <span>{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p id={`faq-${i}`}>{answer}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="rm-bottom-cta">
          <div className="cta-decoration">
            <Glyph name="leaf" size={110} />
          </div>
          <span className="rm-eyebrow">MORE HOSPITALITY. LESS HASSLE.</span>
          <h2>
            Make room for
            <br />
            what you love.
          </h2>
          <p>
            A smoother service. A happier team. A little more breathing room.
          </p>
          <button className="rm-button" onClick={handleStart}>
            Your next chapter starts here <Glyph size={18} />
          </button>
          <span className="cta-footnote">
            No credit card. No pressure. Just possibilities.
          </span>
        </section>
      </main>

      {/* Footer */}
      <footer className="rm-footer">
        <div>
          <Link to="/" aria-label="ResMana home">
            <Logo />
          </Link>
          <p>Less managing. More serving.</p>
        </div>
        <div className="footer-links">
          <a href="#features">Why ResMana</a>
          <a href="#pricing">Pricing</a>
          <Link to="/brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Brand guidelines <Glyph size={12} />
          </Link>
        </div>
        <div className="footer-end">
          <span>© {new Date().getFullYear()} ResMana. Thoughtfully made.</span>
          <span>
            <span className="announcement-dot" />
            Hospitality at heart.
          </span>
        </div>
      </footer>

      {/* Product Tour Modal */}
      {demo && (
        <div
          className="demo-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDemo(false);
          }}
        >
          <section
            className="demo-dialog"
            role="dialog"
            aria-modal="true"
            onKeyDown={(event) => {
              if (event.key !== 'Tab') return;
              const controls =
                event.currentTarget.querySelectorAll<HTMLButtonElement>(
                  'button',
                );
              const first = controls[0];
              const last = controls[controls.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }}
            aria-labelledby="demo-title"
          >
            <div className="demo-dialog-header">
              <div>
                <span className="rm-eyebrow">A LITTLE LOOK AROUND</span>
                <h2 id="demo-title">Your restaurant, all together.</h2>
              </div>
              <button
                onClick={() => setDemo(false)}
                autoFocus
                aria-label="Close product tour"
              >
                <Glyph name="close" />
              </button>
            </div>
            <div className="demo-tabs" role="tablist" aria-label="Product tour">
              {['Overview', 'Orders', 'Team'].map((tab) => (
                <button
                  role="tab"
                  aria-selected={demoTab === tab}
                  key={tab}
                  onClick={() => setDemoTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Dashboard active={demoTab} />
            <div className="demo-bottom">
              <span>Sample dashboard · Illustrative data</span>
              <button className="rm-button small" onClick={handleStart}>
                Make it yours <Glyph size={15} />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
