// =============================================================================
// SENA MINI — DEMO SHOWCASE DATA (100% mock, ported from the v2 prototype)
// =============================================================================
// HARD RULE: nothing in this file may ever be merged into a live section.
// A dashboard section is either fully live (lib/mini/players.js etc.) or fully
// mock (this file) — and every mock-backed section renders the DEMO treatment
// (see components/user/mini/Demo.jsx). When the game ships a real system
// (economy, missions, matchHistory…), delete the matching block here and wire
// the live subscription in its place.

export const DEMO_WALLET = {
  coins: 14250,
  rewardPoints: 550,
  transactions: [
    { id: 'T1', label: 'Mission reward — Coca-Cola Summer', amount: +150,  date: 'Today, 14:20', type: 'in' },
    { id: 'T2', label: 'Redeemed — Amazon Gift Card ₹500',  amount: -5000, date: '28 Jun',       type: 'out' },
    { id: 'T3', label: 'Billboard interaction bonus',        amount: +40,   date: '28 Jun',       type: 'in' },
    { id: 'T4', label: 'Ranked win streak',                  amount: +220,  date: '27 Jun',       type: 'in' },
    { id: 'T5', label: "Redeemed — Domino's Voucher",        amount: -2400, date: '21 Jun',       type: 'out' },
    { id: 'T6', label: 'Nike Challenge completion',          amount: +300,  date: '20 Jun',       type: 'in' },
  ],
};

export const DEMO_MISSIONS = [
  { id: 'M1', title: 'Interact with 3 branded billboards', reward: 150, unit: 'coins',  progress: 2, total: 3, tag: 'Daily',     brand: 'Coca-Cola' },
  { id: 'M2', title: 'Score 10 kills in Ranked',           reward: 40,  unit: 'points', progress: 7, total: 10, tag: 'Daily',    brand: null },
  { id: 'M3', title: 'Visit the Nike in-game store',       reward: 200, unit: 'coins',  progress: 1, total: 1, tag: 'Sponsored', brand: 'Nike' },
  { id: 'M4', title: 'Win 5 matches this week',            reward: 100, unit: 'points', progress: 3, total: 5, tag: 'Weekly',    brand: null },
  { id: 'M5', title: 'Grab a Red Bull power-up',           reward: 120, unit: 'coins',  progress: 0, total: 1, tag: 'Sponsored', brand: 'Red Bull' },
  { id: 'M6', title: 'Complete the Amazon delivery run',   reward: 300, unit: 'coins',  progress: 4, total: 6, tag: 'Event',     brand: 'Amazon' },
];

export const DEMO_INVENTORY = [
  { id: 'I1', name: 'Gold Dragon Skin',        type: 'Skin',       rarity: 'Legendary', equipped: true },
  { id: 'I2', name: 'Coca-Cola Victory Emote', type: 'Emote',      rarity: 'Sponsored', equipped: false },
  { id: 'I3', name: 'Nike Air Trail',          type: 'Trail',      rarity: 'Epic',      equipped: true },
  { id: 'I4', name: 'Golden AK Blueprint',     type: 'Weapon',     rarity: 'Legendary', equipped: false },
  { id: 'I5', name: 'Red Bull Wingsuit',       type: 'Cosmetic',   rarity: 'Sponsored', equipped: false },
  { id: 'I6', name: 'XP Booster (7d)',         type: 'Consumable', rarity: 'Rare',      equipped: false },
  { id: 'I7', name: 'Samsung Neon Banner',     type: 'Banner',     rarity: 'Epic',      equipped: true },
  { id: 'I8', name: 'Intel Frost Gloves',      type: 'Cosmetic',   rarity: 'Rare',      equipped: false },
];

export const DEMO_PRODUCTS = [
  { id: 'P01', name: 'Amazon Gift Card ₹500',        cat: 'Gift Cards',    cost: 5000,  brand: 'Amazon',    tag: 'Popular' },
  { id: 'P02', name: 'Nike 10% Off Coupon',          cat: 'Coupons',       cost: 1200,  brand: 'Nike',      tag: '' },
  { id: 'P03', name: 'Coca-Cola 2x Combo Voucher',   cat: 'Food Vouchers', cost: 900,   brand: 'Coca-Cola', tag: '' },
  { id: 'P04', name: 'SENA Pro Gaming Mouse',        cat: 'Accessories',   cost: 8800,  brand: 'SENA',      tag: 'Hot' },
  { id: 'P05', name: "Domino's Free Pizza Voucher",  cat: 'Food Vouchers', cost: 2400,  brand: "Domino's",  tag: 'Popular' },
  { id: 'P06', name: 'Red Bull 4-Pack Coupon',       cat: 'Coupons',       cost: 700,   brand: 'Red Bull',  tag: '' },
  { id: 'P07', name: 'Samsung Buds Discount 20%',    cat: 'Coupons',       cost: 3200,  brand: 'Samsung',   tag: '' },
  { id: 'P08', name: 'Intel Merch T-Shirt',          cat: 'Merch',         cost: 2600,  brand: 'Intel',     tag: '' },
  { id: 'P09', name: 'SENA Mechanical Keyboard',     cat: 'Accessories',   cost: 12500, brand: 'SENA',      tag: 'Hot' },
  { id: 'P10', name: 'Google Play ₹300 Card',        cat: 'Gift Cards',    cost: 3000,  brand: 'Google',    tag: '' },
  { id: 'P11', name: 'Steam Wallet ₹250',            cat: 'Gift Cards',    cost: 2500,  brand: 'Steam',     tag: 'Popular' },
  { id: 'P12', name: 'Nike Cap — Limited',           cat: 'Merch',         cost: 4200,  brand: 'Nike',      tag: '' },
  { id: 'P13', name: 'Amazon Prime 1-Month',         cat: 'Subscriptions', cost: 3500,  brand: 'Amazon',    tag: '' },
  { id: 'P14', name: 'SENA Gold Skin Bundle',        cat: 'Digital',       cost: 6000,  brand: 'SENA',      tag: 'Hot' },
  { id: 'P15', name: "Domino's 50% Off Coupon",      cat: 'Coupons',       cost: 1500,  brand: "Domino's",  tag: '' },
  { id: 'P16', name: 'Samsung Power Bank',           cat: 'Accessories',   cost: 9500,  brand: 'Samsung',   tag: '' },
  { id: 'P17', name: 'Coca-Cola Merch Bottle',       cat: 'Merch',         cost: 1800,  brand: 'Coca-Cola', tag: '' },
  { id: 'P18', name: 'Red Bull Racing Poster',       cat: 'Merch',         cost: 1100,  brand: 'Red Bull',  tag: '' },
  { id: 'P19', name: 'SENA XP Booster (7 days)',     cat: 'Digital',       cost: 2200,  brand: 'SENA',      tag: 'Popular' },
  { id: 'P20', name: 'Intel Sticker Pack',           cat: 'Merch',         cost: 400,   brand: 'Intel',     tag: '' },
  { id: 'P21', name: 'Spotify Premium 1-Month',      cat: 'Subscriptions', cost: 3300,  brand: 'Spotify',   tag: '' },
  { id: 'P22', name: 'SENA Hoodie — Black/Gold',     cat: 'Merch',         cost: 7800,  brand: 'SENA',      tag: 'Hot' },
];

export const DEMO_PRODUCT_CATEGORIES = [
  'All', 'Gift Cards', 'Coupons', 'Food Vouchers', 'Accessories', 'Merch', 'Digital', 'Subscriptions',
];

export const DEMO_NOTIFICATIONS = [
  { id: 'N1', icon: 'gift',   title: 'Reward claimed',        body: 'You earned 150 coins from Coca-Cola Summer.',      time: '2m ago', unread: true },
  { id: 'N2', icon: 'trophy', title: 'Mission complete',      body: 'Nike Challenge — Visit the in-game store.',        time: '1h ago', unread: true },
  { id: 'N3', icon: 'bell',   title: 'New sponsored mission', body: 'Red Bull power-up mission is now live.',           time: '3h ago', unread: true },
  { id: 'N4', icon: 'cart',   title: 'Order delivered',       body: 'Amazon Gift Card ₹500 delivered to inbox.',        time: '1d ago', unread: false },
  { id: 'N5', icon: 'star',   title: 'Rank up!',              body: 'You reached Gold II. Keep climbing.',              time: '2d ago', unread: false },
];

// -----------------------------------------------------------------------------
// Ported from the v2 prototype's remaining player pages (v2/Website/pages/player).
// Statistics and Profile are NOT here: they went live against the contract (see
// components/user/mini/MiniStatistics.jsx, MiniProfile.jsx), so per this file's
// rule their mock blocks were deleted rather than left to rot.
// -----------------------------------------------------------------------------

export const DEMO_REWARDS = {
  pointsAvailable: 550,
  daily: { day: 7, amount: 300, ready: true },
  wheel: { spinsLeft: 1 },
  referral: { code: 'SENA-SAUB-7X4P', bonus: 500 },
  streak: [
    { day: 1, reward: 20,  claimed: true },  { day: 2, reward: 40,  claimed: true },
    { day: 3, reward: 60,  claimed: true },  { day: 4, reward: 90,  claimed: true },
    { day: 5, reward: 130, claimed: true },  { day: 6, reward: 200, claimed: true },
    { day: 7, reward: 300, claimed: false },
  ],
  unlocks: [
    { id: 'U1', name: 'XP Booster (7d)',      cost: 200, unit: 'points' },
    { id: 'U2', name: 'Nike Trail Cosmetic',  cost: 350, unit: 'points' },
    { id: 'U3', name: 'Red Bull Emote Pack',  cost: 500, unit: 'points' },
  ],
};

export const DEMO_COUPONS = [
  { id: 'C1', brand: 'Amazon',    name: 'Gift Card ₹500',      code: 'AMZ-4K2P-9XQ1', expires: '31 Aug 2026', status: 'active' },
  { id: 'C2', brand: "Domino's",  name: 'Free Pizza Voucher',  code: 'DOM-7T3M-2LK8', expires: '12 Aug 2026', status: 'active' },
  { id: 'C3', brand: 'Nike',      name: '10% Off Coupon',      code: 'NKE-9B1Z-6RW4', expires: '05 Aug 2026', status: 'active' },
  { id: 'C4', brand: 'Red Bull',  name: '4-Pack Coupon',       code: 'RBL-2X8N-4VC7', expires: '20 Jul 2026', status: 'expiring' },
  { id: 'C5', brand: 'Coca-Cola', name: '2x Combo Voucher',    code: 'COK-5H6D-1PQ9', expires: '02 Jul 2026', status: 'used' },
  { id: 'C6', brand: 'Samsung',   name: 'Buds Discount 20%',   code: 'SMS-8W4J-3ZT5', expires: '18 Jun 2026', status: 'expired' },
];

export const DEMO_ORDERS = {
  stats: [
    { label: 'Total orders',  value: '18' },
    { label: 'Coins spent',   value: '42,300' },
    { label: 'Delivered',     value: '15' },
    { label: 'In progress',   value: '3' },
  ],
  filters: ['All', 'Delivered', 'Active'],
  rows: [
    { id: 'ORD-2481', item: 'Amazon Gift Card ₹500',   cost: 5000,  date: '28 Jun', status: 'Delivered' },
    { id: 'ORD-2477', item: "Domino's Free Pizza",     cost: 2400,  date: '21 Jun', status: 'Delivered' },
    { id: 'ORD-2470', item: 'SENA Pro Gaming Mouse',   cost: 8800,  date: '18 Jun', status: 'Shipped' },
    { id: 'ORD-2465', item: 'Nike Cap — Limited',      cost: 4200,  date: '11 Jun', status: 'Processing' },
    { id: 'ORD-2459', item: 'Steam Wallet ₹250',       cost: 2500,  date: '04 Jun', status: 'Delivered' },
    { id: 'ORD-2451', item: 'SENA Hoodie — Black/Gold', cost: 7800, date: '27 May', status: 'Delivered' },
  ],
};

export const DEMO_SETTINGS = {
  profile: { displayName: 'Saubhagya Rath', username: '@saubhagya', email: 'player@sena.gg', country: 'India' },
  countries: ['India', 'USA', 'UK', 'Japan'],
  prefs: [
    { id: 'P1', label: 'Push notifications', detail: 'New missions, rewards & orders',   on: true },
    { id: 'P2', label: 'Sponsored missions', detail: 'Show brand-sponsored missions',    on: true },
    { id: 'P3', label: 'Marketing emails',   detail: 'Occasional offers from partners',  on: false },
    { id: 'P4', label: 'Public profile',     detail: 'Appear on the global leaderboard', on: true },
    { id: 'P5', label: 'Dark theme',         detail: 'Always on for SENA',               on: true },
  ],
};
