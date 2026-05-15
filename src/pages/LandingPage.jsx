import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Gamepad2, Building2, Zap, Trophy, Users,
  Star, DollarSign, Rocket, Menu, X, ArrowRight,
  ChevronRight, ChevronDown, ChevronUp, Play,
  Code, Globe, Shield, Gift, BarChart3,
  CheckCircle, Package, Layers, Send,
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

  .step-card { transition: transform .3s, box-shadow .3s, border-color .3s; }
  .step-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 0 32px rgba(255,215,0,.15);
    border-color: #FFD700 !important;
  }

  .faq-item { transition: border-color .25s; }
  .faq-item:hover { border-color: rgba(255,215,0,.35) !important; }

  .feature-card { transition: transform .3s, box-shadow .3s, border-color .3s; }
  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 0 28px rgba(255,215,0,.14);
    border-color: rgba(255,215,0,.5) !important;
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

const STATS_BAR = [
  { val: '10+',  label: 'Studios'       },
  { val: '100+', label: 'Brands'        },
  { val: '₹5L+', label: 'Monthly GMV'  },
];

const HOW_STEPS = [
  { num: '01', Icon: Gamepad2,   title: 'Players Engage',       desc: 'Players join SENA Mayaverse and participate in games, quests, and challenges at zero cost.' },
  { num: '02', Icon: Gift,       title: 'Earn Coins',           desc: 'Every action, win, and milestone earns SENA Coins — a real in-platform currency with actual value.' },
  { num: '03', Icon: Package,    title: 'Browse Rewards',       desc: 'Players redeem coins for real brand rewards, vouchers, merchandise, and exclusive offers.' },
  { num: '04', Icon: BarChart3,  title: 'Studio & Brand Win',   desc: 'Studios gain loyal players while brands reach a highly engaged gaming audience. Everyone wins.' },
];

const GAURAVGO_DIFF = [
  { Icon: Shield,     title: 'Zero Pay-to-Win',    desc: 'Our platform is built on a promise — no player needs to spend money to win or earn rewards. Fair play, always.' },
  { Icon: Gift,       title: 'Real Rewards',        desc: 'SENA Coins convert to real-world rewards from top brands — not fictional points that expire worthlessly.' },
  { Icon: Globe,      title: 'Multi-Platform',      desc: 'SENA works across mobile, web, and desktop. Players can engage anywhere, anytime, on any device.' },
  { Icon: Building2,  title: 'Brand Partnerships',  desc: 'We connect studios with 100+ brands eager to reach India\'s growing gaming audience through meaningful integrations.' },
];

const INTEGRATION = [
  {
    Icon: Code,
    title: 'Easy SDK Integration',
    badge: 'DEVELOPER READY',
    desc: 'Drop our lightweight SDK into your game in under an hour. Full documentation, sample projects, and dedicated developer support included.',
    points: ['Under 1 hour setup', 'Full API documentation', 'Sample projects included'],
  },
  {
    Icon: Zap,
    title: 'Zero Friction Setup',
    badge: 'PLUG & PLAY',
    desc: 'No backend changes required. SENA handles all the coin logic, reward fulfilment, and brand dashboards so you can focus on building great games.',
    points: ['No backend changes', 'Managed coin ledger', 'Automated reward fulfilment'],
  },
  {
    Icon: Layers,
    title: 'Works Across Platforms',
    badge: 'CROSS-PLATFORM',
    desc: 'Unity, Unreal, React Native, or native Android/iOS — our SDK is platform-agnostic and integrates seamlessly with your existing tech stack.',
    points: ['Unity & Unreal plugins', 'React Native support', 'Native Android & iOS'],
  },
];

const WHY_CHOOSE = [
  { Icon: Gamepad2,   title: "Odisha's First",    desc: "Pioneering the gaming industry in Odisha and setting benchmarks for the entire region." },
  { Icon: DollarSign, title: 'Zero Cost Play',    desc: 'Players earn real rewards without spending a single rupee — ethical monetisation at its core.' },
  { Icon: Trophy,     title: 'India Recognized',  desc: 'Among the top gaming studios in India, recognized for innovation, quality, and player trust.' },
  { Icon: Rocket,     title: 'Innovation First',  desc: 'Cutting-edge tech meets creative game design to deliver truly unique player experiences.' },
  { Icon: Building2,  title: 'Brand Network',     desc: 'Access our curated network of 100+ brands across FMCG, e-commerce, ed-tech, and lifestyle.' },
  { Icon: Users,      title: 'Player Retention',  desc: 'SENA Coins create habit-forming reward loops that dramatically improve D7, D14, and D30 retention.' },
];

const TESTIMONIALS = [
  {
    quote: "Integrating SENA into our casual game was the best decision we made. Our Day-30 retention jumped by 40% and players love earning real rewards. The SDK was live in under a day.",
    name: 'Arjun Mehta',
    role: 'Studio Lead at PixelForge Games',
    initial: 'A',
  },
  {
    quote: "As a brand, SENA gave us access to an incredibly engaged gaming audience in India. Our coupon redemption rate was 3x higher than our standard digital campaigns. Truly impressive reach.",
    name: 'Priya Sharma',
    role: 'Marketing Head at UrbanCart India',
    initial: 'P',
  },
  {
    quote: "GauravGo Games understood our needs as an indie studio perfectly. Zero pay-to-win is not just a tagline — their whole platform is built around it. Our community trusts us more now.",
    name: 'Rohan Das',
    role: 'Founder at NeonByte Studios',
    initial: 'R',
  },
];

const FAQS = [
  {
    q: 'What is SENA Mayaverse?',
    a: 'SENA Mayaverse is GauravGo Games\'s flagship gamified platform where players earn real SENA Coins by playing games, completing quests, and engaging with challenges — all at absolutely zero cost. It\'s where gaming meets real-world rewards.',
  },
  {
    q: 'How do SENA Coins work?',
    a: 'SENA Coins are earned through in-game actions: winning matches, completing daily missions, achieving milestones, and participating in brand challenges. Coins accumulate in your wallet and can be redeemed for real rewards from our brand partners including vouchers, merchandise, and exclusive offers.',
  },
  {
    q: 'How does brand integration work?',
    a: 'Brands partner with SENA to fund reward pools in exchange for exposure to our engaged gaming audience. Brands can run sponsored challenges, offer branded rewards, and reach players through contextual in-game placements — all without disrupting gameplay.',
  },
  {
    q: 'How do I integrate the SENA SDK into my game?',
    a: 'Integration takes under an hour for most studios. You download our SDK, add your API credentials, and call our events API when players complete actions. We handle all coin logic, wallet management, and reward fulfilment. Full documentation and sample projects are available in our developer portal.',
  },
  {
    q: 'What is the pricing model for studios?',
    a: 'SENA is free for studios to integrate. We operate on a revenue-share model where studios earn a percentage of every brand deal that flows through their games. There are no upfront fees, no monthly subscriptions, and no hidden charges.',
  },
  {
    q: 'Which platforms does SENA support?',
    a: 'SENA currently supports Android, iOS, web (React/HTML5), Unity, and Unreal Engine. We also offer a React Native SDK for cross-platform mobile games. Additional platform support is on our roadmap — reach out to discuss your stack.',
  },
  {
    q: 'How is player data handled?',
    a: 'We take data privacy seriously. All player data is processed in compliance with India\'s Digital Personal Data Protection Act (DPDPA). We never sell player data to third parties. Brand analytics are always aggregated and anonymised. Players can request data deletion at any time.',
  },
  {
    q: 'How do I get started?',
    a: 'Click "Book a Demo" to schedule a 30-minute call with our partnerships team. We\'ll walk you through the platform, discuss your game\'s integration, and set up your developer account. Most studios are live within a week of their first call.',
  },
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

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <button
            className="btn-play px-5 py-2 text-sm font-bold rounded-lg cursor-pointer"
            style={{ background: 'transparent', border: `1.5px solid ${C.gold}`, color: C.gold }}
            onClick={() => navigate('/login')}
          >
            SENA Login
          </button>
          <button
            className="px-5 py-2 text-sm font-bold rounded-lg cursor-pointer border-0"
            style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.orange})`, color: '#0a0a0a' }}
            onClick={() => scrollTo('contact')}
            onMouseEnter={e => { e.currentTarget.style.opacity = '.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Book a Demo
          </button>
        </div>

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
          maxHeight: open ? '380px' : '0',
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
          <button
            className="px-5 py-2.5 text-sm font-bold rounded-lg cursor-pointer border-0"
            style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.orange})`, color: '#0a0a0a' }}
            onClick={() => { setOpen(false); scrollTo('contact'); }}
          >
            Book a Demo
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────── */
function Hero() {
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
            Odisha's First Game Studio — Now Open to Studios & Brands
          </span>
        </div>

        <h1
          className="fade2 font-black leading-none tracking-tighter mb-6 uppercase"
          style={{ fontSize: 'clamp(2.2rem, 6.5vw, 5rem)' }}
        >
          <span className="block text-white">Turn Gameplay Into</span>
          <span className="block text-white">
            <span className="shimmer-text">Revenue</span>
          </span>
        </h1>

        <p className="fade3 text-lg mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: C.muted }}>
          SENA Mayaverse connects game studios with top brands so players earn real rewards —
          without spending a single rupee. Ethical monetisation. Genuine engagement.
        </p>

        <div className="fade4 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => scrollTo('contact')}
            className="flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold rounded-xl cursor-pointer border-0 transition-all duration-300"
            style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.orange})`, color: '#0a0a0a' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 14px 36px rgba(255,215,0,.30)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Book a Demo <ArrowRight size={17} />
          </button>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="btn-outline flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold rounded-xl cursor-pointer transition-all duration-300"
            style={{ background: 'transparent', border: `1.5px solid ${C.gold}`, color: C.gold }}
          >
            See How It Works <ChevronRight size={17} />
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
        <div className="flex flex-wrap justify-center gap-8 md:gap-24">
          {STATS_BAR.map((s, i) => (
            <div key={i} className="stat-item flex flex-col items-center cursor-default" style={{ color: C.gold }}>
              <span className="text-3xl md:text-4xl font-black">{s.val}</span>
              <span className="text-xs md:text-sm mt-1 font-medium" style={{ color: C.muted }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Industry Insight ───────────────────────────────────── */
function IndustryInsight() {
  return (
    <section id="about" className="py-24 px-6" style={{ background: C.bg }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Pill>Industry Insight</Pill>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
            The Monetisation Crisis{' '}
            <span style={{ color: C.gold }}>in Gaming</span>
          </h2>
          <Divider />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <p className="text-base leading-relaxed mb-5" style={{ color: C.muted }}>
              India's gaming market is booming — but most studios face a brutal paradox.
              The only proven monetisation playbooks rely on pay-to-win mechanics, loot boxes,
              and aggressive push notifications. Players resent it. Churn spikes. Reviews tank.
              Yet the alternative — pure free-to-play — leaves studios starved for revenue.
            </p>
            <p className="text-base leading-relaxed mb-5" style={{ color: C.muted }}>
              Meanwhile, brands are desperate to reach India's 500 million+ gamers in meaningful,
              non-skippable ways. They're pouring money into banner ads that get ignored and
              influencer deals that are forgotten in 48 hours.
            </p>
            <p className="text-base leading-relaxed" style={{ color: C.muted }}>
              <strong className="text-white font-semibold">SENA bridges this gap.</strong>{' '}
              We connect studios and brands through a real-rewards economy — so players win,
              studios earn, and brands build genuine affinity with a captive audience.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-1 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${C.gold}, ${C.orange})` }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: C.gold }}>
                The SENA Solution
              </span>
            </div>
          </div>

          {/* Video placeholder */}
          <div
            className="rounded-2xl flex flex-col items-center justify-center cursor-pointer group"
            style={{
              background: '#0d0d0d',
              border: `2px solid rgba(255,215,0,.22)`,
              minHeight: 280,
              boxShadow: '0 0 60px rgba(255,215,0,.06)',
              transition: 'border-color .3s, box-shadow .3s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,215,0,.5)';
              e.currentTarget.style.boxShadow = '0 0 60px rgba(255,215,0,.14)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,215,0,.22)';
              e.currentTarget.style.boxShadow = '0 0 60px rgba(255,215,0,.06)';
            }}
          >
            <div
              className="flex items-center justify-center rounded-full mb-4"
              style={{
                width: 72, height: 72,
                background: 'rgba(255,215,0,.12)',
                border: `2px solid rgba(255,215,0,.35)`,
                transition: 'background .3s',
              }}
            >
              <Play size={32} color={C.gold} strokeWidth={2} fill={C.gold} />
            </div>
            <p className="text-sm font-semibold" style={{ color: C.gold }}>Watch how SENA helps</p>
            <p className="text-xs mt-1" style={{ color: C.muted }}>90 seconds</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ───────────────────────────────────────── */
function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6" style={{ background: C.bgAlt }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeading pill="The Process">
          How It{' '}
          <span style={{ color: C.gold }}>Works</span>
        </SectionHeading>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_STEPS.map(({ num, Icon, title, desc }, i) => (
            <div key={i} className="relative">
              {/* Connector line (hidden on last) */}
              {i < HOW_STEPS.length - 1 && (
                <div
                  className="hidden lg:block absolute top-10 left-full w-full h-px z-0"
                  style={{ background: `linear-gradient(90deg, rgba(255,215,0,.4), transparent)`, width: 'calc(100% - 52px)', left: '52px' }}
                />
              )}
              <div
                className="step-card rounded-2xl p-7 flex flex-col gap-4 cursor-default relative z-10"
                style={{
                  background: C.card,
                  border: `1px solid rgba(255,215,0,.14)`,
                  borderTop: `3px solid ${C.gold}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{ width: 48, height: 48, background: 'rgba(255,215,0,.10)', color: C.gold }}
                  >
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <span
                    className="text-3xl font-black leading-none"
                    style={{ color: 'rgba(255,215,0,.18)' }}
                  >
                    {num}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black text-white mb-2">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── GauravGo Difference ────────────────────────────────── */
function GauravGoDifference() {
  return (
    <section id="games" className="py-24 px-6" style={{ background: C.bg }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeading pill="Our Edge">
          The GauravGo{' '}
          <span style={{ color: C.gold }}>Difference</span>
        </SectionHeading>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {GAURAVGO_DIFF.map(({ Icon, title, desc }, i) => (
            <div
              key={i}
              className="game-card rounded-2xl p-8 flex gap-5 items-start cursor-default"
              style={{
                background: C.card,
                border: `1px solid rgba(255,215,0,.14)`,
                borderTop: `3px solid ${C.gold}`,
              }}
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

/* ─── Integration Details ────────────────────────────────── */
function IntegrationDetails() {
  return (
    <section className="py-24 px-6" style={{ background: C.bgAlt }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeading pill="For Developers">
          Built for{' '}
          <span style={{ color: C.gold }}>Developers</span>
        </SectionHeading>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INTEGRATION.map(({ Icon, title, badge, desc, points }, i) => (
            <div
              key={i}
              className="feature-card rounded-2xl p-8 flex flex-col gap-5 cursor-default"
              style={{
                background: C.card,
                border: `1px solid rgba(255,215,0,.14)`,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ width: 52, height: 52, background: 'rgba(255,215,0,.10)', color: C.gold }}
                >
                  <Icon size={24} strokeWidth={1.8} />
                </div>
                <span
                  className="text-xs font-black px-2.5 py-1 rounded-full tracking-wider uppercase"
                  style={{ background: 'rgba(255,215,0,.10)', color: C.gold, border: '1px solid rgba(255,215,0,.28)' }}
                >
                  {badge}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: C.muted }}>{desc}</p>
                <ul className="flex flex-col gap-2">
                  {points.map((pt, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm" style={{ color: C.muted }}>
                      <CheckCircle size={14} color={C.gold} strokeWidth={2.5} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Why Choose Us ──────────────────────────────────────── */
function WhyChooseUs() {
  return (
    <section id="services" className="py-24 px-6" style={{ background: C.bg }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeading pill="Why Choose Us">
          What Sets Us{' '}
          <span style={{ color: C.gold }}>Apart</span>
        </SectionHeading>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE.map(({ Icon, title, desc }, i) => (
            <div
              key={i}
              className="why-box rounded-2xl p-7 flex gap-5 items-start cursor-default"
              style={{ background: C.card, border: '1px solid rgba(255,215,0,.12)' }}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-xl"
                style={{ width: 48, height: 48, background: 'rgba(255,215,0,.10)', color: C.gold }}
              >
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="text-base font-black text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.muted }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────────────────── */
function Testimonials() {
  return (
    <section className="py-24 px-6" style={{ background: C.bgAlt }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeading pill="Social Proof">
          What Studios &{' '}
          <span style={{ color: C.gold }}>Brands Say</span>
        </SectionHeading>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, name, role, initial }, i) => (
            <div
              key={i}
              className="feature-card rounded-2xl p-8 flex flex-col gap-5 cursor-default"
              style={{
                background: C.card,
                border: `1px solid rgba(255,215,0,.14)`,
              }}
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} color={C.gold} fill={C.gold} strokeWidth={0} />
                ))}
              </div>

              <p className="text-sm leading-relaxed italic flex-1" style={{ color: C.muted }}>
                "{quote}"
              </p>

              <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid rgba(255,215,0,.10)' }}>
                <div
                  className="flex items-center justify-center rounded-full text-sm font-black flex-shrink-0"
                  style={{ width: 40, height: 40, background: `linear-gradient(135deg, ${C.gold}, ${C.orange})`, color: '#0a0a0a' }}
                >
                  {initial}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{name}</p>
                  <p className="text-xs" style={{ color: C.muted }}>{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ────────────────────────────────────────────────── */
function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx(prev => (prev === i ? null : i));

  return (
    <section className="py-24 px-6" style={{ background: C.bg }}>
      <div className="max-w-3xl mx-auto">
        <SectionHeading pill="Got Questions?">
          Frequently Asked{' '}
          <span style={{ color: C.gold }}>Questions</span>
        </SectionHeading>

        <div className="flex flex-col gap-3">
          {FAQS.map(({ q, a }, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="faq-item rounded-xl overflow-hidden cursor-pointer"
                style={{
                  background: C.card,
                  border: isOpen ? `1px solid rgba(255,215,0,.35)` : `1px solid rgba(255,215,0,.12)`,
                  transition: 'border-color .25s',
                }}
                onClick={() => toggle(i)}
              >
                {/* Question row */}
                <div className="flex items-center justify-between px-6 py-5 gap-4">
                  <span className="text-sm font-bold text-white leading-snug">{q}</span>
                  <span className="flex-shrink-0" style={{ color: C.gold }}>
                    {isOpen
                      ? <ChevronUp size={18} strokeWidth={2.5} />
                      : <ChevronDown size={18} strokeWidth={2.5} />
                    }
                  </span>
                </div>

                {/* Answer */}
                <div
                  style={{
                    maxHeight: isOpen ? '300px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height .35s ease',
                  }}
                >
                  <p
                    className="text-sm leading-relaxed px-6 pb-5"
                    style={{ color: C.muted }}
                  >
                    {a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer CTA ─────────────────────────────────────────── */
function FooterCTA() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="py-24 px-6 text-center relative overflow-hidden"
      style={{ background: C.bgAlt, borderTop: '1px solid rgba(255,215,0,.14)' }}
    >
      {/* Glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600, height: 300, borderRadius: '50%',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(ellipse at center, rgba(255,215,0,.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        <Pill>Get Started</Pill>
        <h2
          className="text-3xl md:text-5xl font-black text-white leading-tight mb-4"
        >
          Ready to Transform<br />
          <span style={{ color: C.gold }}>Your Game?</span>
        </h2>
        <p className="text-base leading-relaxed mb-10" style={{ color: C.muted }}>
          Join studios and brands already growing with SENA. Schedule a free 30-minute
          demo and see exactly how SENA can monetise your game — without pay-to-win.
        </p>
        <button
          onClick={() => scrollTo('contact')}
          className="inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-black rounded-xl cursor-pointer border-0"
          style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.orange})`, color: '#0a0a0a' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 16px 40px rgba(255,215,0,.30)`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          Schedule a Demo <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}

/* ─── Demo / Contact Form ────────────────────────────────── */
const EMPTY = { name: '', email: '', phone: '', company: '', role: '', message: '' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function DemoForm() {
  const [fields, setFields]   = useState(EMPTY);
  const [errors, setErrors]   = useState({ email: '', phone: '' });
  const [status, setStatus]   = useState('idle'); // idle | loading | success | error
  const [errMsg, setErrMsg]   = useState('');

  const set = (key) => (e) => setFields(f => ({ ...f, [key]: e.target.value }));

  const setPhone = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFields(f => ({ ...f, phone: digits }));
    if (errors.phone) setErrors(er => ({ ...er, phone: digits.length === 10 ? '' : 'Enter a 10-digit number' }));
  };

  const validateEmail = (val) => EMAIL_RE.test(val.trim()) ? '' : 'Enter a valid email address';
  const validatePhone = (val) => val.length === 10 ? '' : 'Enter a 10-digit number';

  const onEmailBlur  = () => setErrors(er => ({ ...er, email: validateEmail(fields.email) }));
  const onPhoneBlur  = () => setErrors(er => ({ ...er, phone: validatePhone(fields.phone) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(fields.email);
    const phoneErr = validatePhone(fields.phone);
    if (emailErr || phoneErr) {
      setErrors({ email: emailErr, phone: phoneErr });
      return;
    }
    setStatus('loading');
    try {
      await addDoc(collection(db, 'demoRequests'), {
        ...fields,
        phone: `+91${fields.phone}`,
        submittedAt: serverTimestamp(),
      });
      setStatus('success');
      setFields(EMPTY);
    } catch (err) {
      setErrMsg(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const inputStyle = {
    width: '100%',
    background: '#111',
    border: '1px solid rgba(255,215,0,.18)',
    borderRadius: 10,
    padding: '12px 16px',
    color: 'white',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color .2s',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    color: '#a0a0a0',
    marginBottom: 6,
    letterSpacing: '.03em',
  };

  const onFocus = (e) => { e.target.style.borderColor = 'rgba(255,215,0,.55)'; };
  const onBlur  = (e) => { e.target.style.borderColor = 'rgba(255,215,0,.18)'; };

  if (status === 'success') {
    return (
      <section id="contact" className="py-24 px-6 text-center" style={{ background: '#0d0d0d', borderTop: '1px solid rgba(255,215,0,.14)' }}>
        <div className="max-w-lg mx-auto">
          <div
            className="flex items-center justify-center rounded-full mx-auto mb-6"
            style={{ width: 72, height: 72, background: 'rgba(255,215,0,.10)', border: '2px solid rgba(255,215,0,.35)' }}
          >
            <CheckCircle size={32} color={C.gold} strokeWidth={2} />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">We'll be in touch!</h3>
          <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
            Thanks for reaching out. The GauravGo Games team will contact you within 24 hours.
          </p>
          <button
            className="mt-8 text-sm font-semibold"
            style={{ background: 'transparent', border: 'none', color: C.gold, cursor: 'pointer' }}
            onClick={() => setStatus('idle')}
          >
            Submit another request
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="contact"
      className="py-24 px-6"
      style={{ background: '#0d0d0d', borderTop: '1px solid rgba(255,215,0,.14)' }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <Pill>Get In Touch</Pill>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
            Book a <span style={{ color: C.gold }}>Demo</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: C.muted }}>
            Fill in the form and our team will reach out within 24 hours.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: '#1a1a1a',
            border: '1px solid rgba(255,215,0,.14)',
            borderRadius: 20,
            padding: '40px 36px',
          }}
        >
          {/* Row 1 — Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input
                type="text"
                placeholder="Your Name"
                value={fields.name}
                onChange={set('name')}
                onFocus={onFocus}
                onBlur={onBlur}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address *</label>
              <input
                type="email"
                placeholder="hello@studio.com"
                value={fields.email}
                onChange={set('email')}
                onFocus={onFocus}
                onBlur={onEmailBlur}
                required
                style={{ ...inputStyle, borderColor: errors.email ? '#ff6b6b' : undefined }}
              />
              {errors.email && <p style={{ color: '#ff6b6b', fontSize: 11, marginTop: 4 }}>{errors.email}</p>}
            </div>
          </div>

          {/* Row 2 — Phone + Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label style={labelStyle}>Phone / WhatsApp *</label>
              <div style={{ display: 'flex', borderRadius: 10, border: `1px solid ${errors.phone ? '#ff6b6b' : 'rgba(255,215,0,.18)'}`, overflow: 'hidden', transition: 'border-color .2s' }}
                onFocus={() => {}} >
                <span style={{ background: 'rgba(255,215,0,.10)', color: C.gold, fontWeight: 700, fontSize: 14, padding: '12px 14px', borderRight: '1px solid rgba(255,215,0,.18)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', fontFamily: 'inherit' }}>
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  value={fields.phone}
                  onChange={setPhone}
                  onFocus={(e) => { e.currentTarget.parentElement.style.borderColor = 'rgba(255,215,0,.55)'; }}
                  onBlur={(e) => { e.currentTarget.parentElement.style.borderColor = errors.phone ? '#ff6b6b' : 'rgba(255,215,0,.18)'; onPhoneBlur(); }}
                  required
                  maxLength={10}
                  style={{ ...inputStyle, border: 'none', borderRadius: 0, flex: 1, width: 'auto' }}
                />
              </div>
              {errors.phone && <p style={{ color: '#ff6b6b', fontSize: 11, marginTop: 4 }}>{errors.phone}</p>}
            </div>
            <div>
              <label style={labelStyle}>Company / Studio Name</label>
              <input
                type="text"
                placeholder="PixelForge Games"
                value={fields.company}
                onChange={set('company')}
                onFocus={onFocus}
                onBlur={onBlur}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Row 3 — Role */}
          <div className="mb-5">
            <label style={labelStyle}>I am a…</label>
            <select
              value={fields.role}
              onChange={set('role')}
              onFocus={onFocus}
              onBlur={onBlur}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="" disabled>Select your role</option>
              <option value="Game Studio / Developer">Game Studio / Developer</option>
              <option value="Brand / Marketing Team">Brand / Marketing Team</option>
              <option value="Investor">Investor</option>
              <option value="Player / Community">Player / Community</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Row 4 — Message */}
          <div className="mb-8">
            <label style={labelStyle}>Message</label>
            <textarea
              rows={4}
              placeholder="Tell us about your game, brand, or what you're looking for…"
              value={fields.message}
              onChange={set('message')}
              onFocus={onFocus}
              onBlur={onBlur}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {/* Error */}
          {status === 'error' && (
            <p className="text-sm mb-5" style={{ color: '#ff6b6b' }}>{errMsg}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex items-center justify-center gap-2 py-4 text-base font-black rounded-xl cursor-pointer border-0"
            style={{
              background: status === 'loading'
                ? 'rgba(255,215,0,.4)'
                : `linear-gradient(135deg, ${C.gold}, ${C.orange})`,
              color: '#0a0a0a',
              transition: 'opacity .2s',
            }}
            onMouseEnter={e => { if (status !== 'loading') e.currentTarget.style.opacity = '.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {status === 'loading' ? 'Sending…' : <><Send size={16} /> Send Request</>}
          </button>
        </form>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────── */
function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const FOOTER_LINKS = [
    { label: 'Home',           id: 'home'    },
    { label: 'About',          id: 'about'   },
    { label: 'Games',          id: 'games'   },
    { label: 'Contact',        id: 'contact' },
    { label: 'Privacy Policy', id: null      },
    { label: 'Terms',          id: null      },
  ];

  return (
    <footer
      className="py-14 px-6"
      style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,215,0,.14)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-3 mb-10">
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
          <p className="text-xs font-medium max-w-xs" style={{ color: C.muted }}>
            Games That Connects Reality With Imagination
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 24 }}>
          <p className="text-xs text-center" style={{ color: 'rgba(160,160,160,.6)' }}>
            © 2025 GauravGo Games Technologies. All rights reserved. | Odisha, India
          </p>
        </div>
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
      <IndustryInsight />
      <HowItWorks />
      <GauravGoDifference />
      <IntegrationDetails />
      <WhyChooseUs />
      <Testimonials />
      <FAQ />
      <FooterCTA />
      <DemoForm />
      <Footer />
    </div>
  );
}
