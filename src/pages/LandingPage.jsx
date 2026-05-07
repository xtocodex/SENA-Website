import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2, Building2, Zap, Trophy, Users,
  Star, DollarSign, Rocket, Menu, X, ArrowRight,
  ChevronRight,
} from 'lucide-react';

/* ─── Design Tokens ──────────────────────────────────────── */
const C = {
  gold:   '#FFD700',
  orange: '#FFA500',
  bg:     '#0a0a0a',
  bgAlt:  '#111111',
  card:   '#1a1a1a',
  muted:  '#a0a0a0',
};

/* ─── Injected Global CSS ────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', system-ui, sans-serif; margin: 0; }

  @keyframes pulseGlow {
    0%,100% { opacity:.20; transform:scale(1); }
    50%      { opacity:.50; transform:scale(1.07); }
  }
  @keyframes gridFade {
    0%,100% { opacity:.045; }
    50%      { opacity:.09; }
  }
  @keyframes floatUp {
    0%   { transform:translateY(0px); opacity:0; }
    10%  { opacity:.8; }
    90%  { opacity:.8; }
    100% { transform:translateY(-75vh); opacity:0; }
  }
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  .fade1 { animation: fadeSlideUp .65s .05s ease both; }
  .fade2 { animation: fadeSlideUp .65s .20s ease both; }
  .fade3 { animation: fadeSlideUp .65s .35s ease both; }
  .fade4 { animation: fadeSlideUp .65s .50s ease both; }

  .hero-grid {
    background-image:
      linear-gradient(rgba(255,215,0,.065) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,215,0,.065) 1px, transparent 1px);
    background-size: 54px 54px;
    animation: gridFade 6s ease-in-out infinite;
  }
  .hero-orb {
    background: radial-gradient(ellipse at center, rgba(255,215,0,.13) 0%, rgba(255,165,0,.06) 40%, transparent 70%);
    animation: pulseGlow 5s ease-in-out infinite;
  }
  .particle { animation: floatUp linear infinite; border-radius: 50%; }

  .nav-link  { transition: color .22s; }
  .nav-link:hover { color: #FFD700 !important; }

  .btn-outline { transition: background .22s, box-shadow .22s; }
  .btn-outline:hover { background: rgba(255,215,0,.12) !important; }

  .btn-play { transition: background .22s, color .22s; }
  .btn-play:hover { background: #FFD700 !important; color: #0a0a0a !important; }

  .game-card { transition: transform .3s, box-shadow .3s, border-color .3s; }
  .game-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 0 36px rgba(255,215,0,.18);
    border-color: #FFD700 !important;
  }
  .why-box { transition: background .3s, border-color .3s, transform .3s; }
  .why-box:hover {
    background: #222 !important;
    border-color: rgba(255,215,0,.5) !important;
    transform: translateY(-3px);
  }
  .stat-item { transition: color .25s; }
  .stat-item:hover { color: #FFA500 !important; }

  .shimmer-text {
    background: linear-gradient(90deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #fff 75%, #FFD700 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3.5s linear infinite;
  }
`;

/* ─── Data ───────────────────────────────────────────────── */
const NAV_LINKS = ['Home', 'About', 'Games', 'Services', 'Contact'];

const PARTICLES = [
  { l:'7%',  t:'68%', s:3, d:'0s',   dur:'8s'  },
  { l:'18%', t:'50%', s:2, d:'1.5s', dur:'10s' },
  { l:'33%', t:'75%', s:3, d:'2.8s', dur:'7s'  },
  { l:'48%', t:'60%', s:2, d:'0.6s', dur:'12s' },
  { l:'62%', t:'80%', s:3, d:'3.2s', dur:'9s'  },
  { l:'75%', t:'55%', s:2, d:'1.9s', dur:'11s' },
  { l:'87%', t:'72%', s:3, d:'0.3s', dur:'8s'  },
  { l:'41%', t:'38%', s:2, d:'2.1s', dur:'10s' },
];

const STATS = [
  { val: '#1',         label: 'in Odisha'              },
  { val: 'Top',        label: 'Gaming Studio in India' },
  { val: 'F2P',        label: 'Games Platform'         },
  { val: 'Enterprise', label: 'Solutions'              },
];

const HIGHLIGHTS = [
  { Icon: Trophy, title: 'Industry Leader',  desc: "Odisha's first and leading game studio."        },
  { Icon: Zap,    title: 'Innovative Tech',  desc: 'Cutting-edge gamification technology.'          },
  { Icon: Users,  title: 'Player First',     desc: 'Built for millions of players across India.'    },
  { Icon: Star,   title: 'Zero Cost Play',   desc: 'Earn real rewards at absolutely no cost.'       },
];

const GAMES = [
  {
    Icon: Gamepad2,  badge: 'FLAGSHIP',    title: 'SENA Mayaverse',
    desc: 'Our flagship gamified platform — earn while you play at zero cost. Reality meets imagination.',
  },
  {
    Icon: Building2, badge: 'ENTERPRISE',  title: 'Enterprise Gamification',
    desc: 'Custom gamification and simulation solutions for businesses. Engaging, scalable, innovative.',
  },
  {
    Icon: Zap,       badge: 'FREE TO PLAY', title: 'F2P Hyper-Casual',
    desc: 'Free-to-play casual games built for mass engagement and quality experience.',
  },
];

const WHY = [
  { Icon: Gamepad2,   title: "Odisha's First",   desc: "Pioneering the gaming industry in Odisha and setting benchmarks for the region."   },
  { Icon: DollarSign, title: 'Zero Cost Play',   desc: 'Our platform lets players earn real rewards without spending a single rupee.'        },
  { Icon: Trophy,     title: 'India Recognized', desc: 'Among the top gaming studios in India, recognized for innovation and quality.'       },
  { Icon: Rocket,     title: 'Innovation First', desc: 'Cutting-edge tech meets creative game design to deliver truly unique experiences.'    },
];

/* ─── Shared Atoms ───────────────────────────────────────── */
function Pill({ children }) {
  return (
    <span
      className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider"
      style={{ background: 'rgba(255,215,0,.10)', color: C.gold, border: '1px solid rgba(255,215,0,.28)' }}
    >
      {children}
    </span>
  );
}

function SectionHeading({ pill, children }) {
  return (
    <div className="text-center mb-14">
      <Pill>{pill}</Pill>
      <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">{children}</h2>
    </div>
  );
}

function Divider() {
  return (
    <div className="w-16 h-1 rounded-full mx-auto mt-4 mb-0"
      style={{ background: `linear-gradient(90deg, ${C.gold}, ${C.orange})` }} />
  );
}

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar({ scrolled }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const scrollTo = (id) => {
    if (id === 'login') { navigate('/login'); return; }
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: scrolled ? 'rgba(10,10,10,.96)' : 'rgba(10,10,10,.0)',
        borderBottom: scrolled ? '1px solid rgba(255,215,0,.18)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        transition: 'all .35s ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          className="flex items-center gap-2 bg-transparent border-0 cursor-pointer p-0"
          onClick={() => scrollTo('home')}
          aria-label="Go to home"
        >
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ background: C.gold, width: 34, height: 34 }}
          >
            <Gamepad2 size={18} color="#0a0a0a" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black text-white">
            GauravGo<span style={{ color: C.gold }}>Games</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(l => (
            <button
              key={l}
              className="nav-link text-sm font-medium bg-transparent border-0 cursor-pointer p-0"
              style={{ color: C.muted }}
              onClick={() => scrollTo(l.toLowerCase())}
            >
              {l}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          className="btn-play hidden md:block px-5 py-2 text-sm font-bold rounded-lg cursor-pointer"
          style={{ background: 'transparent', border: `1.5px solid ${C.gold}`, color: C.gold }}
          onClick={() => navigate('/login')}
        >
          SENA Login
        </button>

        {/* Hamburger */}
        <button
          className="md:hidden bg-transparent border-0 cursor-pointer text-white p-1"
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className="md:hidden overflow-hidden"
        style={{
          maxHeight: open ? '320px' : '0',
          transition: 'max-height .35s ease',
          background: '#0e0e0e',
          borderTop: open ? '1px solid rgba(255,215,0,.14)' : '1px solid transparent',
        }}
      >
        <div className="px-6 py-5 flex flex-col gap-4">
          {NAV_LINKS.map(l => (
            <button
              key={l}
              className="nav-link text-left text-base font-medium bg-transparent border-0 cursor-pointer py-1"
              style={{ color: C.muted }}
              onClick={() => scrollTo(l.toLowerCase())}
            >
              {l}
            </button>
          ))}
          <button
            className="btn-play mt-1 px-5 py-2.5 text-sm font-bold rounded-lg cursor-pointer"
            style={{ background: 'transparent', border: `1.5px solid ${C.gold}`, color: C.gold }}
            onClick={() => navigate('/login')}
          >
            SENA Login
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────── */
function Hero() {
  const navigate = useNavigate();
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative flex items-center justify-center min-h-screen overflow-hidden"
      style={{ background: C.bg }}>

      {/* Animated grid */}
      <div className="hero-grid absolute inset-0 pointer-events-none" />

      {/* Glow orb */}
      <div className="hero-orb absolute pointer-events-none"
        style={{ width: 700, height: 700, borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

      {/* Secondary smaller orb */}
      <div className="hero-orb absolute pointer-events-none"
        style={{ width: 280, height: 280, borderRadius: '50%', top: '20%', left: '15%', opacity: .5 }} />

      {/* Particles */}
      {PARTICLES.map((p, i) => (
        <div key={i} className="particle absolute pointer-events-none"
          style={{
            width: p.s, height: p.s,
            background: i % 2 === 0 ? C.gold : C.orange,
            left: p.l, top: p.t,
            animationDuration: p.dur,
            animationDelay: p.d,
            opacity: .75,
          }} />
      ))}

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

        <div className="fade1 inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full"
          style={{ background: 'rgba(255,215,0,.08)', border: '1px solid rgba(255,215,0,.28)' }}>
          <span style={{ color: C.gold }} className="text-xs font-semibold tracking-wide">
            🎮 Odisha's First Game Studio
          </span>
        </div>

        <h1
          className="fade2 font-black leading-none tracking-tighter mb-6 uppercase"
          style={{ fontSize: 'clamp(2.2rem, 6.5vw, 5rem)' }}
        >
          <span className="block text-white">Games That Connects</span>
          <span className="block text-white">
            Reality With{' '}
            <span className="shimmer-text">IMAGINATION</span>
          </span>
        </h1>

        <p className="fade3 text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: C.muted }}>
          Odisha's first game studio. Pioneering gaming innovation across India.
        </p>

        <div className="fade4 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => scrollTo('games')}
            className="flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold rounded-xl cursor-pointer border-0 transition-all duration-300"
            style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.orange})`, color: '#0a0a0a' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 14px 36px rgba(255,215,0,.30)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Explore Games <ArrowRight size={17} />
          </button>
          <button
            onClick={() => scrollTo('about')}
            className="btn-outline flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold rounded-xl cursor-pointer transition-all duration-300"
            style={{ background: 'transparent', border: `1.5px solid ${C.gold}`, color: C.gold }}
          >
            Learn More <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* Bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: `linear-gradient(transparent, ${C.bg})` }} />
    </section>
  );
}

/* ─── Stats Bar ──────────────────────────────────────────── */
function StatsBar() {
  return (
    <section
      className="py-10"
      style={{
        background: C.bgAlt,
        borderTop: '1px solid rgba(255,215,0,.14)',
        borderBottom: '1px solid rgba(255,215,0,.14)',
      }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {STATS.map((s, i) => (
            <div key={i} className="stat-item flex flex-col items-center cursor-default" style={{ color: C.gold }}>
              <span className="text-2xl md:text-3xl font-black">{s.val}</span>
              <span className="text-xs md:text-sm mt-1 font-medium" style={{ color: C.muted }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── About ──────────────────────────────────────────────── */
function About() {
  return (
    <section id="about" className="py-24 px-6" style={{ background: C.bg }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

        {/* Left */}
        <div>
          <Pill>About Us</Pill>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
            Pioneering Gaming
          </h2>
          <h2 className="text-3xl md:text-4xl font-black mb-6" style={{ color: C.gold }}>
            Innovation
          </h2>
          <p className="text-base leading-relaxed mb-5" style={{ color: C.muted }}>
            GauravGo Games Technologies is Odisha's first game studio and among the top gaming
            companies in India. We are pioneering gaming innovation with our flagship platform{' '}
            <strong className="text-white font-bold">SENA Mayaverse</strong> — a gamified world
            where players earn at no cost.
          </p>
          <p className="text-base leading-relaxed" style={{ color: C.muted }}>
            Our vision is to bridge the gap between reality and imagination through immersive
            experiences that are accessible, engaging, and rewarding for everyone.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <div className="h-1 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${C.gold}, ${C.orange})` }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: C.gold }}>
              Since 2024
            </span>
          </div>
        </div>

        {/* Right card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: C.card,
            border: `1px solid rgba(255,215,0,.24)`,
            boxShadow: '0 0 48px rgba(255,215,0,.06)',
          }}
        >
          <h3 className="text-lg font-black text-white mb-1">Why GauravGo?</h3>
          <Divider />
          <div className="flex flex-col gap-6 mt-6">
            {HIGHLIGHTS.map(({ Icon, title, desc }, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-xl"
                  style={{ width: 40, height: 40, background: 'rgba(255,215,0,.10)', color: C.gold }}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white mb-0.5">{title}</div>
                  <div className="text-xs leading-relaxed" style={{ color: C.muted }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Games ──────────────────────────────────────────────── */
function Games() {
  return (
    <section id="games" className="py-24 px-6" style={{ background: C.bgAlt }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeading pill="Our Products">
          Our Games &{' '}
          <span style={{ color: C.gold }}>Platforms</span>
        </SectionHeading>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GAMES.map(({ Icon, badge, title, desc }, i) => (
            <div
              key={i}
              className="game-card rounded-2xl p-8 flex flex-col gap-5 cursor-default"
              style={{
                background: C.card,
                border: `1px solid rgba(255,215,0,.14)`,
                borderTop: `3px solid ${C.gold}`,
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl self-start"
                style={{ width: 52, height: 52, background: 'rgba(255,215,0,.10)', color: C.gold }}
              >
                <Icon size={26} strokeWidth={1.8} />
              </div>
              <div>
                <span
                  className="inline-block text-xs font-black px-3 py-1 rounded-full mb-3 tracking-wider uppercase"
                  style={{ background: 'rgba(255,215,0,.10)', color: C.gold, border: '1px solid rgba(255,215,0,.28)' }}
                >
                  {badge}
                </span>
                <h3 className="text-xl font-black text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Why Us ─────────────────────────────────────────────── */
function WhyUs() {
  return (
    <section id="services" className="py-24 px-6" style={{ background: C.bg }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeading pill="Why Choose Us">
          What Sets Us{' '}
          <span style={{ color: C.gold }}>Apart</span>
        </SectionHeading>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {WHY.map(({ Icon, title, desc }, i) => (
            <div
              key={i}
              className="why-box rounded-2xl p-8 flex gap-5 items-start cursor-default"
              style={{ background: C.card, border: '1px solid rgba(255,215,0,.12)' }}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-xl"
                style={{ width: 52, height: 52, background: 'rgba(255,215,0,.10)', color: C.gold }}
              >
                <Icon size={24} strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      id="contact"
      className="py-14 px-6"
      style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,215,0,.14)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ background: C.gold, width: 34, height: 34 }}
          >
            <Gamepad2 size={18} color="#0a0a0a" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black text-white">
            GauravGo<span style={{ color: C.gold }}>Games</span>
          </span>
        </div>

        {/* Tagline */}
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: C.muted }}>
          Games That Connects Reality With Imagination
        </p>

        {/* Copyright */}
        <p className="text-xs" style={{ color: C.muted }}>
          © 2025 GauravGo Games Technologies.<br className="md:hidden" /> All rights reserved.
        </p>
      </div>
    </footer>
  );
}

/* ─── Root ───────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: C.bg, color: 'white' }} className="min-h-screen">
      <style>{CSS}</style>
      <Navbar scrolled={scrolled} />
      <Hero />
      <StatsBar />
      <About />
      <Games />
      <WhyUs />
      <Footer />
    </div>
  );
}
