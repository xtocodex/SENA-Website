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
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; margin: 0; }

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

  *:focus-visible {
    outline: 2px solid #FFD700;
    outline-offset: 3px;
    border-radius: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    .fade1, .fade2, .fade3, .fade4 { animation: none; opacity: 1; transform: none; }
    .hero-grid { animation: none; opacity: .06; }
    .hero-orb { animation: none; opacity: .12; }
    .particle { display: none; }
    .shimmer-text {
      animation: none;
      background: #FFD700;
      -webkit-background-clip: text;
      -webkit-text-fill-color: #FFD700;
      background-clip: text;
    }
    .game-card, .step-card, .why-box, .feature-card, .nav-link, .btn-outline, .btn-play {
      transition: none;
    }
  }

  /* ─── Partner & Influencer Sections ─────────────────────── */
  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .marquee-track { animation: marquee 40s linear infinite; will-change: transform; }
  .marquee-wrap:hover .marquee-track { animation-play-state: paused; }

  .partner-logo-card { transition: transform .3s, border-color .3s, box-shadow .3s; }
  .partner-logo-card:hover {
    transform: translateY(-3px) scale(1.03);
    border-color: rgba(255,215,0,.55) !important;
    box-shadow: 0 8px 28px rgba(255,215,0,.14);
  }
  .video-card { transition: transform .3s, box-shadow .3s, border-color .3s; }
  .video-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 0 36px rgba(255,215,0,.2);
    border-color: rgba(255,215,0,.5) !important;
  }
  @media (prefers-reduced-motion: reduce) {
    .marquee-track { animation: none; }
    .partner-logo-card, .video-card { transition: none; }
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

/* ─── Partner & Influencer Data ──────────────────────────── */
const BRAND_PARTNER_SLOTS = [
  { name: 'AFW',             logo: '/logos/brand/Afw.jpeg'             },
  { name: 'Amazon',          logo: '/logos/brand/amazon.jpeg'          },
  { name: 'Astory',          logo: '/logos/brand/Astory.jpeg'          },
  { name: 'Avethi',          logo: '/logos/brand/Avethi.jpeg'          },
  { name: 'Belora',          logo: '/logos/brand/Belora.jpeg'          },
  { name: 'Bira',            logo: '/logos/brand/bira.jpeg'            },
  { name: "Cai's",           logo: "/logos/brand/Cai's.jpeg"           },
  { name: 'CivilGuruji',     logo: '/logos/brand/CivilGuruji.jpeg'     },
  { name: 'Colors',          logo: '/logos/brand/colors.jpeg'          },
  { name: 'Coolberg',        logo: '/logos/brand/Coolberg.jpeg'        },
  { name: 'Craftsman',       logo: '/logos/brand/Craftsman.jpeg'       },
  { name: 'CrumbO',          logo: '/logos/brand/CrumbO.jpeg'          },
  { name: 'Filling',         logo: '/logos/brand/Filling.jpeg'         },
  { name: 'FlexifyMe',       logo: '/logos/brand/flexifyme.jpeg'       },
  { name: 'Fydo',            logo: '/logos/brand/fydo.jpeg'            },
  { name: 'Herbelle',        logo: '/logos/brand/herbelle.jpeg'        },
  { name: 'KalaKart',        logo: '/logos/brand/KalaKart.jpeg'        },
  { name: 'Kavya',           logo: '/logos/brand/Kavya.jpeg'           },
  { name: 'LokalApp',        logo: '/logos/brand/LokalApp.jpeg'        },
  { name: 'Necafe',          logo: '/logos/brand/necafe.jpeg'          },
  { name: 'Online Shop',     logo: '/logos/brand/Online-shop.jpeg'     },
  { name: 'Rain',            logo: '/logos/brand/rain.jpeg'            },
  { name: 'Shadowfox',       logo: '/logos/brand/Shadowfox.jpeg'       },
  { name: 'SR Creations',    logo: '/logos/brand/SR-creations.jpeg'    },
  { name: 'Startup Concept', logo: '/logos/brand/StartupConcept.jpeg'  },
  { name: 'StepOne',         logo: '/logos/brand/stepone.jpeg'         },
  { name: 'Suidhaga',        logo: '/logos/brand/Suidhaga.jpeg'        },
  { name: 'Swaay',           logo: '/logos/brand/Swaay.jpeg'           },
  { name: 'Technook',        logo: '/logos/brand/Technook.jpeg'        },
  { name: 'TRP',             logo: '/logos/brand/trp.jpeg'             },
  { name: 'Urban',           logo: '/logos/brand/Urban.jpeg'           },
  { name: 'Urbanwood',       logo: '/logos/brand/urbanwood.jpeg'       },
  { name: 'Vedic Science',   logo: '/logos/brand/vedic-sceince.jpeg'   },
  { name: 'WOW',             logo: '/logos/brand/wow.jpeg'             },
  { name: 'Zaocare',         logo: '/logos/brand/zaocare.jpeg'         },
];

const ESPORTS_PARTNER_SLOTS = [
  { label: 'JSS University, Noida',        logo: '/logos/esports/jss-university.png' },
  { label: 'NSU, Jamshedpur',              logo: '/logos/esports/nsu.png'            },
  { label: 'RIT, Berhampur',               logo: '/logos/esports/rit.png'            },
  { label: 'BIT, Gorakhpur',               logo: '/logos/esports/bit.png'            },
  { label: 'EATM, Bhubaneswar',            logo: '/logos/esports/eatm.jpeg'          },
  { label: 'DRIEMS University, Cuttack',   logo: '/logos/esports/driems.jpeg'        },
  { label: 'SITAM, Vizianagaram',          logo: '/logos/esports/sitam.png'          },
  { label: 'CGU, Bhubaneswar',             logo: '/logos/esports/cgu.jpg'            },
];

const INFLUENCER_VIDEOS = [
  'https://www.youtube.com/embed/CZmWJHI1D1E',
  'https://www.youtube.com/embed/JyTpGVunwd8',
  'https://www.youtube.com/embed/-L21_fUI63w',
  'https://www.youtube.com/embed/R-sYWJZFxeQ',
  'https://www.youtube.com/embed/1CfXSix-2rs',
  'https://www.youtube.com/embed/X_PVPtJp0qw',
  'https://www.youtube.com/embed/rTj67Olz8Yc',
  'https://www.youtube.com/embed/kY1qX-j577Q',
  'https://www.youtube.com/embed/8aouiF_US2Q',
  'https://www.youtube.com/embed/5TfJ6iX1M48',
  'https://www.youtube.com/embed/Q1icCkKoMYM',
  'https://www.youtube.com/embed/Dns3n-B3g6k',
  'https://www.youtube.com/embed/7wMvbPLp_tI',
  'https://www.youtube.com/embed/2YEN2Ij9bWk',
  'https://www.youtube.com/embed/SnQ9aNtkLWA',
  'https://www.youtube.com/embed/r5-OHwboGb8',
  'https://www.youtube.com/embed/BuceFNbecDM',
  'https://www.youtube.com/embed/qioF-mr7YU4?si=hkxcLENpU31WiM9m',
  'https://www.youtube.com/embed/RT8-OIKIqck?si=yGE-vA9NsixWuOjh',
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
const SECTION_MAP = { Home: 'home', About: 'about', Games: 'games', Services: 'services', Contact: 'contact' };

function Navbar({ scrolled }) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();

  useEffect(() => {
    const ids = ['home', 'about', 'games', 'services', 'contact'];
    const observers = ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.25, rootMargin: '-80px 0px 0px 0px' }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

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
              style={{ color: SECTION_MAP[l] === activeSection ? C.gold : C.muted }}
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
          </div>

          {/* Demo video */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: `2px solid rgba(255,215,0,.22)`,
              boxShadow: '0 0 60px rgba(255,215,0,.08)',
            }}
          >
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src="https://www.youtube.com/embed/Mwd15bFsqLE"
                title="SENA Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '100%', height: '100%',
                  border: 'none',
                  display: 'block',
                }}
              />
            </div>
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
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); } }}
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

/* ─── Brand Partners ─────────────────────────────────────── */
function BrandPartners() {
  const doubled = [...BRAND_PARTNER_SLOTS, ...BRAND_PARTNER_SLOTS];
  const duration = `${Math.round(BRAND_PARTNER_SLOTS.length * 2.8)}s`;

  return (
    <section className="py-24 px-6" style={{ background: C.bg }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeading pill="Brand Partners">
          Our <span style={{ color: C.gold }}>Brand Partners</span>
        </SectionHeading>

        {/* 100+ badge */}
        <div className="flex items-center justify-center gap-3 mb-10 -mt-6">
          <div
            className="flex items-center gap-2 px-5 py-2 rounded-full"
            style={{ background: 'rgba(255,215,0,.08)', border: '1px solid rgba(255,215,0,.22)' }}
          >
            <span className="text-xl font-black" style={{ color: C.gold }}>100+</span>
            <span className="text-sm font-semibold" style={{ color: C.muted }}>Brands & Growing</span>
          </div>
        </div>

        <div
          className="marquee-wrap relative overflow-hidden"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          }}
        >
          <div
            className="marquee-track flex"
            style={{ gap: 20, width: 'max-content', animationDuration: duration }}
          >
            {doubled.map(({ name, logo }, i) => (
              <div
                key={i}
                className="partner-logo-card flex-shrink-0 flex flex-col items-center justify-center gap-2 rounded-2xl cursor-default"
                style={{
                  width: 148,
                  height: 110,
                  background: C.card,
                  border: '1px solid rgba(255,215,0,.16)',
                  padding: '12px 10px 10px',
                }}
              >
                <div
                  className="flex items-center justify-center rounded-lg overflow-hidden flex-shrink-0"
                  style={{ width: 58, height: 58, background: 'rgba(255,255,255,.92)' }}
                >
                  <img
                    src={logo}
                    alt={name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 5 }}
                  />
                </div>
                <span
                  style={{
                    color: C.muted,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '.05em',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    maxWidth: 124,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Esports & Community Partners ──────────────────────── */
function EsportsPartners() {
  return (
    <section className="py-24 px-6" style={{ background: C.bgAlt }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeading pill="Esports & Community">
          Esports Community{' '}
          <span style={{ color: C.gold }}>& Partners</span>
        </SectionHeading>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {ESPORTS_PARTNER_SLOTS.map(({ label, logo }, i) => (
            <div
              key={i}
              className="partner-logo-card flex flex-col items-center justify-center gap-3 rounded-2xl cursor-default py-6 px-4"
              style={{
                background: C.card,
                border: '1px solid rgba(255,215,0,.18)',
                minHeight: 130,
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl overflow-hidden"
                style={{ width: 64, height: 64, background: 'rgba(255,255,255,.06)', flexShrink: 0 }}
              >
                <img
                  src={logo}
                  alt={label}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }}
                />
              </div>
              <span
                style={{
                  color: C.muted,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '.04em',
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Influencer Partners ────────────────────────────────── */
function InfluencerPartners() {
  return (
    <section className="py-24 px-6" style={{ background: C.bg }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeading pill="Influencer Partners">
          Our {' '}
          <span style={{ color: C.gold }}>Influencer</span>
        </SectionHeading>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 20,
          }}
        >
          {INFLUENCER_VIDEOS.map((src, i) => (
            <div
              key={i}
              className="video-card rounded-2xl overflow-hidden"
              style={{
                background: C.card,
                border: '1px solid rgba(255,215,0,.14)',
              }}
            >
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={src}
                  title={`Influencer video ${i + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          ))}
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
              <label htmlFor="f-name" style={labelStyle}>Full Name *</label>
              <input
                id="f-name"
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
              <label htmlFor="f-email" style={labelStyle}>Email Address *</label>
              <input
                id="f-email"
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
              <label htmlFor="f-phone" style={labelStyle}>Phone / WhatsApp *</label>
              <div style={{ display: 'flex', borderRadius: 10, border: `1px solid ${errors.phone ? '#ff6b6b' : 'rgba(255,215,0,.18)'}`, overflow: 'hidden', transition: 'border-color .2s' }}>
                <span style={{ background: 'rgba(255,215,0,.10)', color: C.gold, fontWeight: 700, fontSize: 14, padding: '12px 14px', borderRight: '1px solid rgba(255,215,0,.18)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', fontFamily: 'inherit' }}>
                  +91
                </span>
                <input
                  id="f-phone"
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
              <label htmlFor="f-company" style={labelStyle}>Company / Studio Name</label>
              <input
                id="f-company"
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
            <label htmlFor="f-role" style={labelStyle}>I am a…</label>
            <select
              id="f-role"
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
            <label htmlFor="f-message" style={labelStyle}>Message</label>
            <textarea
              id="f-message"
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
const FOOTER_NAV = [
  { label: 'Home',     id: 'home'    },
  { label: 'About',    id: 'about'   },
  { label: 'Games',    id: 'games'   },
  { label: 'Services', id: 'services'},
  { label: 'Contact',  id: 'contact' },
];

function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer
      className="py-14 px-6"
      style={{ background: '#0a0a0a', borderTop: '1px solid rgba(255,215,0,.14)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-3">
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

          {/* Nav links */}
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-8 gap-y-3">
            {FOOTER_NAV.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="nav-link text-sm font-medium bg-transparent border-0 cursor-pointer p-0"
                style={{ color: C.muted }}
              >
                {label}
              </button>
            ))}
          </nav>
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

/* ─── Scroll To Top ──────────────────────────────────────── */
function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full cursor-pointer border-0"
      style={{
        width: 44, height: 44,
        background: `linear-gradient(135deg, ${C.gold}, ${C.orange})`,
        color: '#0a0a0a',
        boxShadow: '0 4px 20px rgba(255,215,0,.30)',
        transition: 'transform .2s ease, box-shadow .2s ease',
      }}
      aria-label="Scroll to top"
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(255,215,0,.45)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,215,0,.30)'; }}
    >
      <ChevronUp size={20} strokeWidth={2.5} />
    </button>
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
      <BrandPartners />
      <EsportsPartners />
      <InfluencerPartners />
      <FAQ />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
