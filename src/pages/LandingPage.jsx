import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Gamepad2, Building2, Zap, Trophy, Users,
  Star, DollarSign, Rocket, Menu, X, ArrowRight,
  ChevronRight, ChevronDown, ChevronUp, Play,
  Globe, Shield, Gift, BarChart3,
  CheckCircle, Package, Send,
} from 'lucide-react';
/* Cinematic battlefield backdrops (self-hosted in public/bg) — full-bleed,
   PUBG-style scenes layered under the dark gradients/grid/scanlines/grain. */
const HERO_BG = '/bg/hero-battlefield.jpg';
const TACTICAL_BG = '/bg/tactical-scene.jpg';

/* ─── Design Tokens ──────────────────────────────────────────
   The reference's single-orange accent is recolored to OUR theme:
   gold #FFD700 → orange #FFA500 on our dark base. The reference
   visual + interactive system is cloned; only color + content ours. */
const C = {
  gold:      '#FFD700',
  orange:    '#FFA500',
  grad:      'linear-gradient(135deg,#FFD700,#FFA500)',
  bg:        '#0a0a0a',
  bgAlt:     '#111111',
  bg2:       '#050507',
  card:      '#1a1a1a',
  ink:       '#f2f0ed',
  body:      '#e8e8f0',
  muted:     '#a0a0a0',
  mut:       'rgba(242,240,237,.55)',
  mutLabel:  'rgba(255,215,0,.6)',
  cardFill:  'rgba(255,255,255,.024)',
  cardBorder:'rgba(255,255,255,.07)',
  hairline:  'rgba(255,215,0,.18)',
};

/* ─── Injected Global CSS ────────────────────────────────────
   Fonts via @import (no npm dep). Background-layer stack, film grain,
   custom cursor, scroll-reveal, marquee, pulse, scroll-cue, hover
   lifts/glows — every keyframe disabled under prefers-reduced-motion. */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Barlow+Condensed:wght@500;600;700;800;900&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Barlow', 'Inter', system-ui, sans-serif;
    margin: 0;
    background: #0a0a0a;
    color: #e8e8f0;
  }

  .font-disp { font-family: 'Barlow Condensed', sans-serif; }
  .font-body { font-family: 'Barlow', 'Inter', sans-serif; }
  .font-mono { font-family: 'DM Mono', monospace; }

  /* ── Background layer stack (each major section repeats locally) ── */
  .bg-vgrad {
    background: linear-gradient(rgba(5,5,7,.5) 0%, rgba(5,5,7,.2) 40%, rgba(5,5,7,.75) 80%, #050507 100%);
  }
  .bg-radials {
    background:
      radial-gradient(80% 60% at 50% 60%, rgba(255,215,0,.07) 0%, transparent 70%),
      radial-gradient(70% 50% at 50% 30%, rgba(255,165,0,.08) 0%, transparent 100%);
  }
  .bg-techgrid {
    background-image:
      linear-gradient(rgba(255,215,0,.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,215,0,.04) 1px, transparent 1px);
    background-size: 80px 80px;
  }
  .bg-vignette {
    background: linear-gradient(#050507 0%, transparent 15%, transparent 85%, #050507 100%);
  }
  .bg-scanlines {
    background: repeating-linear-gradient(0deg, rgba(0,0,0,.08) 0px, rgba(0,0,0,.08) 1px, transparent 1px, transparent 3px);
  }

  /* ── Film grain (global, mounted once at root) ── */
  .film-grain {
    position: fixed;
    inset: 0;
    z-index: 9990;
    pointer-events: none;
    opacity: .032;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  }

  /* ── Custom cursor (global, mounted once at root) ── */
  .cursor-dot {
    position: fixed;
    top: 0; left: 0;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #FFD700;
    z-index: 9999;
    pointer-events: none;
    will-change: transform;
  }
  .cursor-ring {
    position: fixed;
    top: 0; left: 0;
    width: 36px; height: 36px;
    border: 1px solid rgba(255,215,0,.5);
    border-radius: 50%;
    background: transparent;
    z-index: 9998;
    pointer-events: none;
    will-change: transform;
    transition: width .2s ease, height .2s ease, border-color .2s ease, opacity .2s ease;
  }
  .cursor-ring.is-hover {
    border-color: rgba(255,215,0,.9);
    box-shadow: 0 0 14px rgba(255,215,0,.3);
  }

  /* ── Keyframes ── */
  @keyframes marquee      { 0% { transform: translateX(0); }    100% { transform: translateX(-50%); } }
  @keyframes marqueeRev   { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
  @keyframes pulseDot     { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: .55; } }
  @keyframes scrollBob    { 0% { transform: translateY(-6px); opacity: .3; } 50% { opacity: 1; } 100% { transform: translateY(10px); opacity: .3; } }
  @keyframes shimmer      { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes kenburns     { 0% { transform: scale(1.04) translateY(0); } 100% { transform: scale(1.16) translateY(-1.5%); } }

  /* ── Cinematic full-bleed battlefield backdrop (slow live zoom) ── */
  .bg-scene { position: absolute; inset: 0; background-size: cover; background-position: center; will-change: transform; animation: kenburns 24s ease-in-out infinite alternate; }

  /* ── Scroll-reveal ── */
  .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .7s ease; }
  .reveal.in { opacity: 1; transform: none; }

  /* ── Marquee ── */
  .marquee-track    { animation: marquee 55s linear infinite;    will-change: transform; }
  .marquee-track-rev{ animation: marqueeRev 55s linear infinite; will-change: transform; }
  .marquee-wrap:hover .marquee-track,
  .marquee-wrap:hover .marquee-track-rev { animation-play-state: paused; }

  /* ── Pulse status dot ── */
  .pulse-dot { animation: pulseDot 1.8s ease-in-out infinite; }

  /* ── Scroll cue ── */
  .scroll-cue-line { animation: scrollBob 1.8s ease-in-out infinite; }

  /* ── Shimmer accent word ── */
  .shimmer-text {
    background: linear-gradient(90deg, #FFD700 0%, #FFA500 25%, #FFD700 50%, #fff7d6 75%, #FFD700 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 4s linear infinite;
  }

  /* ── Nav links ── */
  .nav-link { transition: color .22s; }
  .nav-link:hover { color: #FFD700 !important; }

  /* ── Buttons ── */
  .btn-solid {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #0a0a0a;
    border-radius: 4px;
    border: 0;
    transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
  }
  .btn-solid:hover { transform: translateY(-1px); filter: brightness(1.06); box-shadow: 0 10px 30px rgba(255,215,0,.28); }
  .btn-outline {
    background: transparent;
    color: #FFD700;
    border: 1px solid rgba(255,215,0,.35);
    border-radius: 4px;
    transition: background .22s ease, border-color .22s ease;
  }
  .btn-outline:hover { background: rgba(255,215,0,.1); border-color: rgba(255,215,0,.6); }

  /* ── Cards ── */
  .card-base {
    background: rgba(255,255,255,.024);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 16px;
    transition: transform .3s ease, border-color .3s ease, box-shadow .3s ease, background .3s ease;
  }
  .card-base:hover {
    transform: translateY(-4px);
    border-color: rgba(255,215,0,.4);
    box-shadow: 0 14px 40px rgba(255,215,0,.12);
  }

  /* ── Chip cards (brand marquee) ── */
  .chip-card {
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 10px;
    transition: border-color .3s ease, background .3s ease;
  }
  .chip-card:hover { border-color: rgba(255,215,0,.5); background: rgba(255,215,0,.05); }

  /* ── List rows (esports) ── */
  .list-row { transition: background .25s ease, border-color .25s ease; }
  .list-row:hover { background: rgba(255,215,0,.05); }

  /* ── Video cards ── */
  .video-card { transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease; }
  .video-card:hover { transform: translateY(-5px); box-shadow: 0 0 36px rgba(255,215,0,.2); border-color: rgba(255,215,0,.5) !important; }

  /* ── FAQ ── */
  .faq-item { transition: border-color .25s; }
  .faq-item:hover { border-color: rgba(255,215,0,.35) !important; }

  *:focus-visible { outline: 2px solid #FFD700; outline-offset: 3px; border-radius: 4px; }

  @media (hover: none), (pointer: coarse) {
    .cursor-dot, .cursor-ring { display: none !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .marquee-track, .marquee-track-rev,
    .pulse-dot, .scroll-cue-line, .shimmer-text, .bg-scene { animation: none !important; }
    .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
    .card-base, .chip-card, .list-row, .video-card, .nav-link,
    .btn-solid, .btn-outline, .faq-item, .cursor-ring { transition: none !important; }
    .shimmer-text {
      background: #FFD700; -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: #FFD700;
    }
    .cursor-dot, .cursor-ring { display: none !important; }
  }
`;

/* ─── Data ───────────────────────────────────────────────── */
const NAV_LINKS = ['Home', 'About', 'Games', 'Services', 'Brand Partners', 'Esports & Community', 'Influencer Partners'];

const STATS_BAR = [

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
    quote: "SENA has been a fantastic addition to our gaming experience. The platform is engaging, easy to use, and has been well received by our community. We're excited to see how it continues to grow.",
    name: 'Arjun Mehta',
    role: 'Studio Lead',
    initial: 'A',
  },
  {
    quote: "Working with SENA has been a great experience. The platform offers a unique way to connect with a highly engaged audience, and the overall experience has exceeded our expectations.",
    name: 'Priya Sharma',
    role: 'Marketing Professional',
    initial: 'P',
  },
  {
    quote: "What stands out about SENA is its player-first approach. The team is passionate, responsive, and focused on creating a fair and enjoyable environment for everyone involved.",
    name: 'Rohan Das',
    role: 'Founder & Gaming Enthusiast',
    initial: 'R',
  },
];

const FAQS = [
  {
    q: 'What is SENA: Mayaverse?',
    a: 'SENA: Mayaverse is our metaverse-based battle royale and story-driven action game. It brings together battle royale gameplay, virtual exploration, social interaction, and a gamified economy inside a living virtual world inspired by real-life locations.',
  },
  {
    q: 'Who developed SENA?',
    a: 'SENA is developed by GauravGo Games, an Odisha-based game studio founded by Dipesh Gaurav. We focus on creating Indian-made games, simulations, AR/VR experiences, and gamification platforms.',
  },
  {
    q: 'What does SENA stand for?',
    a: 'The original SENA title stood for "Strike & Encounter For Nation By Abhinandan". Our storyline was inspired by the Indian Air Force\'s Balakot airstrike operations and the story of Wing Commander Abhinandan Varthaman.',
  },
  {
    q: 'What makes SENA different from PUBG or Free Fire?',
    a: 'We built SENA to go beyond traditional battle royale gameplay. It blends Indian-themed environments and stories, metaverse features, social interaction, brand engagement, and play-to-earn reward mechanisms — an Indian alternative that combines gaming, earning, and virtual experiences.',
  },
  {
    q: 'Can players earn rewards in SENA?',
    a: 'Yes. We designed SENA: Mayaverse as a platform where players can take part in activities, challenges, and brand-sponsored experiences to earn rewards — with no upfront investment required. It\'s a key feature of the Mayaverse ecosystem.',
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

/* ─── Scroll-reveal hook (IntersectionObserver, staggered) ─── */
function useReveal() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = Array.from(document.querySelectorAll('.reveal'));
    if (reduce) { els.forEach(el => el.classList.add('in')); return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = Number(el.dataset.delay || 0);
          window.setTimeout(() => el.classList.add('in'), delay);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── Custom cursor (dot + lagging ring) ─────────────────── */
function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (reduce || touch) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let hovering = false;
    let raf = 0;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    };

    const interactiveSel = 'a, button, [role="button"], input, select, textarea, .cursor-target';
    const onOver = (e) => {
      if (e.target.closest && e.target.closest(interactiveSel)) {
        if (!hovering) { hovering = true; ring.classList.add('is-hover'); }
      }
    };
    const onOut = (e) => {
      if (e.target.closest && e.target.closest(interactiveSel)) {
        const to = e.relatedTarget;
        if (!to || !(to.closest && to.closest(interactiveSel))) {
          hovering = false; ring.classList.remove('is-hover');
        }
      }
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      const scale = hovering ? 1.8 : 1;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mouseout', onOut, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mouseout', onOut);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}

/* ─── Shared background-layer stack (scoped per section) ──── */
function SectionLayers({ glow = true }) {
  return (
    <>
      <div className="absolute inset-0 bg-vgrad pointer-events-none" />
      {glow && <div className="absolute inset-0 bg-radials pointer-events-none" />}
      <div className="absolute inset-0 bg-techgrid pointer-events-none" />
      <div className="absolute inset-0 bg-vignette pointer-events-none" />
      <div className="absolute inset-0 bg-scanlines pointer-events-none" style={{ zIndex: 1 }} />
    </>
  );
}

/* ─── Shared Atoms ───────────────────────────────────────── */
function SectionHeader({ num, label, children, lead }) {
  return (
    <div className="reveal" style={{ marginBottom: 56 }}>
      <div className={lead ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-end' : ''}>
        <div className={lead ? 'lg:col-span-7' : ''}>
          {/* Eyebrow row: gold rule + mono NN — LABEL */}
          <div className="flex items-center gap-3 mb-5">
            <span style={{ display: 'inline-block', width: 40, height: 2, background: C.grad }} />
            <span className="font-mono uppercase" style={{ color: C.gold, fontSize: 11, letterSpacing: '.18em' }}>
              {num} — {label}
            </span>
          </div>
          <h2
            className="font-disp uppercase"
            style={{
              fontSize: 'clamp(2.6rem, 6.5vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: .95,
              letterSpacing: '.02em',
              color: C.ink,
              margin: 0,
            }}
          >
            {children}
          </h2>
        </div>
        {lead && (
          <div className="lg:col-span-5">
            <p className="font-body" style={{ color: C.mut, fontSize: 16, lineHeight: 1.8, margin: 0 }}>
              {lead}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Navbar ─────────────────────────────────────────────── */
const SECTION_MAP = {
  Home: 'home', About: 'about', Games: 'games', Services: 'services',
  'Brand Partners': 'brand-partners',
  'Esports & Community': 'esports-community',
  'Influencer Partners': 'influencer-partners',
};

function Navbar({ scrolled }) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();
  const panelRef = useRef(null);

  // Close the mobile menu on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const ids = ['home', 'about', 'games', 'services', 'brand-partners', 'esports-community', 'influencer-partners'];
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
        height: 68,
        background: scrolled ? 'rgba(10,10,10,.85)' : 'rgba(10,10,10,0)',
        borderBottom: scrolled ? '1px solid rgba(255,215,0,.12)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all .35s ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <button
          className="flex items-center gap-2 bg-transparent border-0 cursor-pointer p-0"
          onClick={() => scrollTo('home')}
          aria-label="Go to home"
        >
          <div
            className="flex items-center justify-center"
            style={{ background: C.grad, width: 34, height: 34, borderRadius: 6 }}
          >
            <Gamepad2 size={18} color="#0a0a0a" strokeWidth={2.5} />
          </div>
          <span className="font-disp uppercase" style={{ fontSize: 22, fontWeight: 900, letterSpacing: '.02em', color: C.ink }}>
            GauravGo<span style={{ color: C.gold }}>Games</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(l => (
            <button
              key={l}
              className="nav-link font-body bg-transparent border-0 cursor-pointer p-0"
              style={{
                fontSize: 13.6,
                fontWeight: 600,
                letterSpacing: '.07em',
                color: SECTION_MAP[l] === activeSection ? C.gold : 'rgba(242,240,237,.6)',
              }}
              onClick={() => scrollTo(SECTION_MAP[l])}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Desktop CTA — ONE solid login button */}
        <div className="hidden md:flex items-center gap-3">
          <button
            className="btn-solid font-body uppercase cursor-pointer"
            style={{ padding: '10px 24px', fontSize: 13, fontWeight: 700, letterSpacing: '.05em' }}
            onClick={() => navigate('/login')}
          >
            SENA Login
          </button>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 bg-transparent border-0 cursor-pointer"
          style={{ color: C.ink }}
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile backdrop — tap outside to close */}
      <div
        className="md:hidden fixed inset-0 -z-10"
        onClick={() => setOpen(false)}
        aria-hidden="true"
        style={{
          background: 'rgba(0,0,0,.5)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .35s ease',
        }}
      />

      {/* Mobile drawer */}
      <div
        className="md:hidden overflow-y-auto"
        style={{
          maxHeight: open
            ? `min(${panelRef.current?.scrollHeight ?? 9999}px, calc(100dvh - 4.5rem))`
            : '0',
          transition: 'max-height .35s ease',
          background: '#0e0e0e',
          borderTop: open ? '1px solid rgba(255,215,0,.14)' : '1px solid transparent',
        }}
      >
        <div ref={panelRef} className="px-6 py-5 flex flex-col gap-4">
          {NAV_LINKS.map(l => (
            <button
              key={l}
              className="nav-link font-body text-left bg-transparent border-0 cursor-pointer py-1"
              style={{ fontSize: 16, fontWeight: 600, letterSpacing: '.04em', color: 'rgba(242,240,237,.7)' }}
              onClick={() => scrollTo(SECTION_MAP[l])}
            >
              {l}
            </button>
          ))}
          <button
            className="btn-solid font-body uppercase mt-1 cursor-pointer"
            style={{ padding: '11px 20px', fontSize: 13, fontWeight: 700, letterSpacing: '.05em' }}
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
    <section
      id="home"
      className="relative flex flex-col justify-end overflow-hidden"
      style={{ minHeight: '100vh', background: C.bg2 }}
    >
      {/* Layer 1: cinematic battlefield image with slow live zoom */}
      <div
        className="bg-scene pointer-events-none"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundPosition: 'center 35%',
          filter: 'brightness(.55) contrast(1.05) saturate(1.05)',
          zIndex: 0,
        }}
      />
      {/* Layers 2–6 */}
      <SectionLayers />

      {/* Content */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6" style={{ paddingTop: 120, paddingBottom: 48 }}>
        {/* Eyebrow chip */}
        <div
          className="reveal inline-flex items-center gap-3 mb-8"
          style={{
            background: 'rgba(255,215,0,.06)',
            border: '1px solid rgba(255,215,0,.22)',
            borderRadius: 9999,
            padding: '8px 16px',
          }}
        >
          <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: C.gold, display: 'inline-block' }} />
          <span className="font-mono uppercase" style={{ color: C.gold, fontSize: 10.5, letterSpacing: '.16em' }}>
            Odisha's First Game Studio — Now Open to Studios & Brands
          </span>
        </div>

        {/* H1 — two lines, line2 gold */}
        <h1
          className="reveal font-disp uppercase"
          data-delay="80"
          style={{
            fontSize: 'clamp(3.5rem, 12vw, 9rem)',
            fontWeight: 900,
            lineHeight: .9,
            letterSpacing: '.02em',
            margin: 0,
          }}
        >
          <span style={{ display: 'block', color: C.ink }}>Turn Gameplay Into</span>
          <span style={{ display: 'block' }}>
            <span className="shimmer-text">Revenue</span>
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="reveal font-body"
          data-delay="160"
          style={{ color: C.mut, fontSize: 18, fontWeight: 500, lineHeight: 1.8, maxWidth: 640, marginTop: 26, marginBottom: 0 }}
        >
          SENA Mayaverse connects game studios with top brands so players earn real rewards —
          without spending a single rupee. Ethical monetisation. Genuine engagement.
        </p>

        {/* ONE solid CTA */}
        <div className="reveal" data-delay="240" style={{ marginTop: 34 }}>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="btn-solid font-body uppercase inline-flex items-center gap-2 cursor-pointer"
            style={{ padding: '14px 40px', fontSize: 15, fontWeight: 700, letterSpacing: '.05em' }}
          >
            See How It Works <ChevronRight size={18} />
          </button>
        </div>

        {/* Stat row — our 2 real stats, live-01 style */}
        <div
          className="reveal"
          data-delay="320"
          style={{
            marginTop: 56,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'stretch',
            gap: 0,
            borderTop: '1px solid rgba(255,215,0,.14)',
            paddingTop: 28,
          }}
        >
          {STATS_BAR.map((s, i) => (
            <div
              key={i}
              style={{
                paddingRight: 48,
                marginRight: 48,
                borderRight: i < STATS_BAR.length - 1 ? '1px solid rgba(255,215,0,.14)' : 'none',
              }}
            >
              <div className="font-disp" style={{ fontSize: 'clamp(1.6rem,3vw,2.25rem)', fontWeight: 900, color: C.ink, lineHeight: 1 }}>
                {s.val}
              </div>
              <div className="font-mono uppercase" style={{ color: C.mutLabel, fontSize: 10, letterSpacing: '.14em', marginTop: 8 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="hidden md:flex flex-col items-center gap-3"
        style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
      >
        <span className="font-mono uppercase" style={{ color: C.mutLabel, fontSize: 9, letterSpacing: '.24em' }}>Scroll</span>
        <span className="scroll-cue-line" style={{ width: 1, height: 50, background: `linear-gradient(${C.gold}, transparent)`, display: 'block' }} />
      </div>
    </section>
  );
}

/* ─── Industry Insight (cinematic secondary hero) ────────── */
function IndustryInsight() {
  return (
    <section id="about" className="relative overflow-hidden" style={{ background: C.bg2, paddingTop: 110, paddingBottom: 110 }}>
      <div
        className="bg-scene pointer-events-none"
        style={{
          backgroundImage: `url(${TACTICAL_BG})`, backgroundPosition: 'center 35%',
          filter: 'brightness(.4) contrast(1.05) saturate(1.05)', zIndex: 0,
        }}
      />
      <SectionLayers />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Eyebrow + two-tone heading */}
        <div className="reveal" style={{ marginBottom: 44 }}>
          <div className="flex items-center gap-3 mb-5">
            <span style={{ display: 'inline-block', width: 40, height: 2, background: C.grad }} />
            <span className="font-mono uppercase" style={{ color: C.gold, fontSize: 11, letterSpacing: '.18em' }}>01 — INDUSTRY INSIGHT</span>
          </div>
          <h2
            className="font-disp uppercase"
            style={{ fontSize: 'clamp(2.6rem, 7vw, 5rem)', fontWeight: 900, lineHeight: .95, letterSpacing: '.02em', color: C.ink, margin: 0, maxWidth: 900 }}
          >
            The Monetisation Crisis <span style={{ color: C.gold }}>in Gaming</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="reveal" data-delay="80">
            <p className="font-body" style={{ color: C.mut, fontSize: 16.5, lineHeight: 1.85, marginBottom: 22 }}>
              India's gaming market is booming — but most studios face a brutal paradox.
              The only proven monetisation playbooks rely on pay-to-win mechanics, loot boxes,
              and aggressive push notifications. Players resent it. Churn spikes. Reviews tank.
              Yet the alternative — pure free-to-play — leaves studios starved for revenue.
            </p>
            <p className="font-body" style={{ color: C.mut, fontSize: 16.5, lineHeight: 1.85, margin: 0 }}>
              Meanwhile, brands are desperate to reach India's 500 million+ gamers in meaningful,
              non-skippable ways. They're pouring money into banner ads that get ignored and
              influencer deals that are forgotten in 48 hours.
            </p>
          </div>

          {/* Demo video — accent-framed */}
          <div
            className="reveal"
            data-delay="160"
            style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,215,0,.3)', boxShadow: '0 0 60px rgba(255,215,0,.12)' }}
          >
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src="https://www.youtube.com/embed/Mwd15bFsqLE"
                title="SENA Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', display: 'block' }}
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
    <section id="how-it-works" className="relative overflow-hidden" style={{ background: C.bg, paddingTop: 110, paddingBottom: 110 }}>
      <SectionLayers glow={false} />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <SectionHeader
          num="02" label="THE PROCESS"
          lead="From the first match to real-world rewards — here is how players, studios, and brands all come out ahead inside SENA Mayaverse."
        >
          How It <span style={{ color: C.gold }}>Works</span>
        </SectionHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_STEPS.map(({ num, Icon, title, desc }, i) => (
            <div
              key={i}
              className="reveal card-base"
              data-delay={i * 80}
              style={{ padding: 28, position: 'relative', overflow: 'hidden' }}
            >
              {/* Ghost number */}
              <span
                className="font-disp"
                style={{ position: 'absolute', top: 8, right: 16, fontSize: 76, fontWeight: 900, lineHeight: 1, color: 'rgba(255,215,0,.07)' }}
                aria-hidden="true"
              >
                {num}
              </span>
              <div
                className="flex items-center justify-center"
                style={{ width: 52, height: 52, borderRadius: 10, background: 'rgba(255,215,0,.1)', color: C.gold, marginBottom: 22 }}
              >
                <Icon size={24} strokeWidth={1.8} />
              </div>
              <div className="font-mono" style={{ color: C.mutLabel, fontSize: 11, letterSpacing: '.14em', marginBottom: 10 }}>{num}</div>
              <h3 className="font-disp uppercase" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '.02em', color: C.ink, marginBottom: 10 }}>{title}</h3>
              <p className="font-body" style={{ fontSize: 14.5, lineHeight: 1.7, color: C.mut, margin: 0 }}>{desc}</p>
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
    <section id="games" className="relative overflow-hidden" style={{ background: C.bg2, paddingTop: 110, paddingBottom: 110 }}>
      <SectionLayers glow={false} />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <SectionHeader
          num="03" label="OUR EDGE"
          lead="What makes SENA fundamentally different from every pay-to-win playbook in the market today."
        >
          The GauravGo <span style={{ color: C.gold }}>Difference</span>
        </SectionHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {GAURAVGO_DIFF.map(({ Icon, title, desc }, i) => (
            <div
              key={i}
              className="reveal card-base flex gap-5 items-start"
              data-delay={i * 80}
              style={{ padding: 30 }}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center"
                style={{ width: 54, height: 54, borderRadius: 10, background: 'rgba(255,215,0,.1)', color: C.gold }}
              >
                <Icon size={24} strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="font-disp uppercase" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '.02em', color: C.ink, marginBottom: 10 }}>{title}</h3>
                <p className="font-body" style={{ fontSize: 14.5, lineHeight: 1.7, color: C.mut, margin: 0 }}>{desc}</p>
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
    <section id="services" className="relative overflow-hidden" style={{ background: C.bg, paddingTop: 110, paddingBottom: 110 }}>
      <SectionLayers glow={false} />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <SectionHeader
          num="04" label="WHY CHOOSE US"
          lead="Six reasons studios and brands choose SENA to build fair, rewarding, habit-forming gaming experiences."
        >
          What Sets Us <span style={{ color: C.gold }}>Apart</span>
        </SectionHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE.map(({ Icon, title, desc }, i) => (
            <div
              key={i}
              className="reveal card-base flex gap-5 items-start"
              data-delay={(i % 3) * 80}
              style={{ padding: 28 }}
            >
              <div
                className="flex-shrink-0 flex items-center justify-center"
                style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(255,215,0,.1)', color: C.gold }}
              >
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="font-disp uppercase" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '.02em', color: C.ink, marginBottom: 8 }}>{title}</h3>
                <p className="font-body" style={{ fontSize: 14, lineHeight: 1.7, color: C.mut, margin: 0 }}>{desc}</p>
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
    <section className="relative overflow-hidden" style={{ background: C.bg2, paddingTop: 110, paddingBottom: 110 }}>
      <SectionLayers glow={false} />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <SectionHeader
          num="05" label="SOCIAL PROOF"
          lead="Real words from the studios and brands building with SENA every day."
        >
          What Studios & <span style={{ color: C.gold }}>Brands Say</span>
        </SectionHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ quote, name, role, initial }, i) => (
            <div
              key={i}
              className="reveal card-base flex flex-col gap-5"
              data-delay={i * 80}
              style={{ padding: 30 }}
            >
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={15} color={C.gold} fill={C.gold} strokeWidth={0} />
                ))}
              </div>
              <p className="font-body flex-1" style={{ fontSize: 15, lineHeight: 1.75, color: C.body, fontStyle: 'italic', margin: 0 }}>
                "{quote}"
              </p>
              <div className="flex items-center gap-3" style={{ paddingTop: 16, borderTop: '1px solid rgba(255,215,0,.12)' }}>
                <div
                  className="font-disp flex items-center justify-center flex-shrink-0"
                  style={{ width: 42, height: 42, borderRadius: '50%', background: C.grad, color: '#0a0a0a', fontWeight: 900, fontSize: 18 }}
                >
                  {initial}
                </div>
                <div>
                  <p className="font-body" style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>{name}</p>
                  <p className="font-mono uppercase" style={{ fontSize: 9.5, letterSpacing: '.12em', color: C.mutLabel, margin: 0, marginTop: 3 }}>{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Brand Partners (two-row marquee chip-cards) ────────── */
function BrandRow({ items, reverse }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="marquee-wrap relative overflow-hidden"
      style={{
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <div className={`flex ${reverse ? 'marquee-track-rev' : 'marquee-track'}`} style={{ gap: 14, width: 'max-content' }}>
        {doubled.map(({ name, logo }, i) => (
          <div
            key={i}
            className="chip-card flex items-center flex-shrink-0"
            style={{ gap: 10, padding: '10px 18px' }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.gold, flexShrink: 0 }} />
            <span
              className="flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255,255,255,.92)' }}
            >
              <img src={logo} alt={name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
            </span>
            <span className="font-body uppercase" style={{ color: C.body, fontSize: 12.5, fontWeight: 600, letterSpacing: '.04em', whiteSpace: 'nowrap' }}>
              {name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandPartners() {
  const half = Math.ceil(BRAND_PARTNER_SLOTS.length / 2);
  const rowA = BRAND_PARTNER_SLOTS.slice(0, half);
  const rowB = BRAND_PARTNER_SLOTS.slice(half);

  return (
    <section id="brand-partners" className="relative overflow-hidden" style={{ background: C.bg, paddingTop: 110, paddingBottom: 110 }}>
      <SectionLayers glow={false} />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <SectionHeader
          num="06" label="BRAND PARTNERS"
          lead="A growing roster of leading brands and media partners trust SENA to reach a new generation of engaged gamers."
        >
          Our <span style={{ color: C.gold }}>Brand Partners</span>
        </SectionHeader>

        {/* 100+ badge */}
        <div className="reveal flex items-center mb-9" style={{ marginTop: -24 }}>
          <div
            className="flex items-center gap-2"
            style={{ background: 'rgba(255,215,0,.08)', border: '1px solid rgba(255,215,0,.22)', borderRadius: 9999, padding: '8px 18px' }}
          >
            <span className="font-disp" style={{ fontSize: 20, fontWeight: 900, color: C.gold }}>100+</span>
            <span className="font-body" style={{ fontSize: 14, fontWeight: 600, color: C.mut }}>Brands &amp; Growing</span>
          </div>
        </div>

        <div className="reveal flex flex-col gap-4">
          <BrandRow items={rowA} reverse={false} />
          <BrandRow items={rowB} reverse={true} />
        </div>
      </div>
    </section>
  );
}

/* ─── Esports & Community (list rows) ────────────────────── */
function EsportsPartners() {
  return (
    <section id="esports-community" className="relative overflow-hidden" style={{ background: C.bg2, paddingTop: 110, paddingBottom: 110 }}>
      <SectionLayers glow={false} />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <SectionHeader
          num="07" label="ESPORTS & COMMUNITY"
          lead="We bring top universities into competitive gaming through scholarships, tournaments, and campus community alliances."
        >
          Esports Community <span style={{ color: C.gold }}>& Partners</span>
        </SectionHeader>

        <div
          className="reveal"
          style={{ borderTop: '1px solid rgba(255,215,0,.14)' }}
        >
          {ESPORTS_PARTNER_SLOTS.map(({ label, logo }, i) => {
            // Split existing label "Title, Subtitle" — derived from our own data.
            const ci = label.indexOf(',');
            const title = ci >= 0 ? label.slice(0, ci).trim() : label;
            const sub = ci >= 0 ? label.slice(ci + 1).trim() : '';
            return (
              <div
                key={i}
                className="list-row flex items-center"
                style={{ gap: 20, padding: '22px 8px', borderBottom: '1px solid rgba(255,215,0,.14)' }}
              >
                <span className="font-mono" style={{ color: C.mutLabel, fontSize: 13, letterSpacing: '.1em', width: 34, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)' }}
                >
                  <img src={logo} alt={label} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 5 }} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-disp uppercase" style={{ fontSize: 'clamp(1.1rem,2.4vw,1.5rem)', fontWeight: 800, letterSpacing: '.02em', color: C.ink, lineHeight: 1.1 }}>
                    {title}
                  </div>
                  {sub && (
                    <div className="font-body" style={{ fontSize: 13.5, color: C.mut, marginTop: 2 }}>{sub}</div>
                  )}
                </div>
                <span className="font-mono uppercase hidden sm:block" style={{ color: C.mutLabel, fontSize: 9.5, letterSpacing: '.14em', flexShrink: 0 }}>
                  Esports Alliance
                </span>
                <span className="flex items-center justify-center flex-shrink-0" style={{ color: C.gold }}>
                  <ArrowRight size={18} strokeWidth={2} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Influencer Partners (dark video cards) ─────────────── */
function InfluencerPartners() {
  return (
    <section id="influencer-partners" className="relative overflow-hidden" style={{ background: C.bg, paddingTop: 110, paddingBottom: 110 }}>
      <SectionLayers glow={false} />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <SectionHeader
          num="08" label="INFLUENCER PARTNERS"
          lead="Creators across the gaming community spotlight SENA to their audiences in their own voice."
        >
          Our <span style={{ color: C.gold }}>Influencer</span>
        </SectionHeader>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
          {INFLUENCER_VIDEOS.map((src, i) => (
            <div
              key={i}
              className="reveal video-card"
              data-delay={(i % 4) * 60}
              style={{ background: C.cardFill, border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, overflow: 'hidden' }}
            >
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                {/* Gold play badge accent chrome */}
                <span
                  className="flex items-center justify-center"
                  style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, width: 30, height: 30, borderRadius: '50%', background: C.grad, color: '#0a0a0a', pointerEvents: 'none', boxShadow: '0 4px 14px rgba(0,0,0,.4)' }}
                  aria-hidden="true"
                >
                  <Play size={14} fill="#0a0a0a" strokeWidth={0} />
                </span>
                <iframe
                  src={src}
                  title={`Influencer video ${i + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', display: 'block' }}
                />
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
    <section className="relative overflow-hidden" style={{ background: C.bg2, paddingTop: 110, paddingBottom: 110 }}>
      <SectionLayers glow={false} />
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <SectionHeader num="09" label="GOT QUESTIONS?">
          Frequently Asked <span style={{ color: C.gold }}>Questions</span>
        </SectionHeader>

        <div className="reveal flex flex-col gap-3">
          {FAQS.map(({ q, a }, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="faq-item cursor-pointer"
                style={{
                  background: C.cardFill,
                  border: isOpen ? '1px solid rgba(255,215,0,.35)' : '1px solid rgba(255,255,255,.07)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  transition: 'border-color .25s',
                }}
                onClick={() => toggle(i)}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); } }}
              >
                <div className="flex items-center justify-between" style={{ padding: '20px 24px', gap: 16 }}>
                  <span className="font-disp uppercase" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '.02em', color: C.ink, lineHeight: 1.3 }}>{q}</span>
                  <span className="flex-shrink-0" style={{ color: C.gold }}>
                    {isOpen ? <ChevronUp size={18} strokeWidth={2.5} /> : <ChevronDown size={18} strokeWidth={2.5} />}
                  </span>
                </div>
                <div style={{ maxHeight: isOpen ? 320 : 0, overflow: 'hidden', transition: 'max-height .35s ease' }}>
                  <p className="font-body" style={{ fontSize: 14.5, lineHeight: 1.75, color: C.mut, padding: '0 24px 22px', margin: 0 }}>{a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer CTA (DEFINED but NOT rendered) ──────────────── */
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
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600, height: 300, borderRadius: '50%',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(ellipse at center, rgba(255,215,0,.07) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
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

/* ─── Demo / Contact Form (DEFINED but NOT rendered) ─────── */
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

/* ─── Footer (multi-column) ──────────────────────────────── */
const FOOTER_NAV = [
  { label: 'Home',                id: 'home'                },
  { label: 'About',               id: 'about'               },
  { label: 'Games',               id: 'games'               },
  { label: 'Services',            id: 'services'            },
  { label: 'Brand Partners',      id: 'brand-partners'      },
  { label: 'Esports & Community', id: 'esports-community'   },
  { label: 'Influencer Partners', id: 'influencer-partners' },
];

function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative overflow-hidden" style={{ background: C.bg2, paddingTop: 64, paddingBottom: 40 }}>
      <SectionLayers glow={false} />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center"
                style={{ background: C.grad, width: 34, height: 34, borderRadius: 6 }}
              >
                <Gamepad2 size={18} color="#0a0a0a" strokeWidth={2.5} />
              </div>
              <span className="font-disp uppercase" style={{ fontSize: 22, fontWeight: 900, letterSpacing: '.02em', color: C.ink }}>
                GauravGo<span style={{ color: C.gold }}>Games</span>
              </span>
            </div>
            <p className="font-body" style={{ color: C.mut, fontSize: 14.5, lineHeight: 1.7, maxWidth: 320, margin: 0 }}>
              Games That Connects Reality With Imagination
            </p>
            {/* Decorative social icons — NO links/handles */}
            <div className="flex items-center gap-3" aria-hidden="true">
              {[Globe, Users, Trophy, Gamepad2].map((Ic, k) => (
                <span
                  key={k}
                  className="flex items-center justify-center"
                  style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: C.mutLabel }}
                >
                  <Ic size={16} strokeWidth={1.8} />
                </span>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <div className="lg:col-span-7 lg:flex lg:justify-end">
            <div>
              <div className="font-mono uppercase" style={{ color: C.mutLabel, fontSize: 10.5, letterSpacing: '.18em', marginBottom: 18 }}>
                Navigate
              </div>
              <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-12 gap-y-3">
                {FOOTER_NAV.map(({ label, id }) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className="nav-link font-body text-left bg-transparent border-0 cursor-pointer p-0"
                    style={{ color: C.mut, fontSize: 14, fontWeight: 500 }}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Divider + copyright */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 24 }}>
          <p className="font-mono uppercase" style={{ color: 'rgba(160,160,160,.6)', fontSize: 10.5, letterSpacing: '.1em', textAlign: 'center', margin: 0 }}>
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
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center cursor-pointer border-0"
      style={{
        width: 44, height: 44,
        borderRadius: 4,
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

  useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: C.bg2, color: C.body }} className="min-h-screen">
      <style>{CSS}</style>
      <CustomCursor />
      <div className="film-grain" aria-hidden="true" />
      <Navbar scrolled={scrolled} />
      <Hero />
      <IndustryInsight />
      <HowItWorks />
      <GauravGoDifference />
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
