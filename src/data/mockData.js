// Mock data for the gallery sections
export const MOCK_IMAGES = [
  { id: 1, filename: 'hero_banner_summer.jpg', ratio: '16:9', type: 'Banner', size: '1.2 MB' },
  { id: 2, filename: 'product_square_01.jpg', ratio: '1:1', type: 'Interstitial', size: '840 KB' },
  { id: 3, filename: 'story_promo_launch.jpg', ratio: '9:16', type: 'Rewards', size: '2.1 MB' },
  { id: 4, filename: 'brand_cover_wide.jpg', ratio: '16:9', type: 'Banner', size: '980 KB' },
  { id: 5, filename: 'carousel_tile_03.jpg', ratio: '1:1', type: 'Interstitial', size: '560 KB' },
  { id: 6, filename: 'vertical_ad_sept.jpg', ratio: '9:16', type: 'Rewards', size: '1.7 MB' },
];

export const MOCK_VIDEOS = [
  { id: 1, filename: 'brand_intro_16x9.mp4', ratio: '16:9', type: 'Banner', size: '14.3 MB' },
  { id: 2, filename: 'product_loop_1x1.mp4', ratio: '1:1', type: 'Interstitial', size: '8.6 MB' },
  { id: 3, filename: 'story_ad_9x16.mp4', ratio: '9:16', type: 'Rewards', size: '22.1 MB' },
  { id: 4, filename: 'summer_reel_16x9.mp4', ratio: '16:9', type: 'Banner', size: '19.4 MB' },
];

export const RATIO_BADGE_VARIANTS = {
  'Banner': 'default',
  'Interstitial': 'secondary',
  'Rewards': 'outline',
};

export const NAV_ITEMS = [
  { id: 'upload-images', label: 'Upload Images', section: 'images' },
  { id: 'upload-videos', label: 'Upload Videos', section: 'videos' },
  { id: 'my-images', label: 'My Images', section: 'images' },
  { id: 'my-videos', label: 'My Videos', section: 'videos' },
];

// Dev dashboard mock data
export const MOCK_BRANDS = [
  { id: 1, name: 'Acme Corp', email: 'brand@acmecorp.com', created: '2025-12-14' },
  { id: 2, name: 'Globex Inc', email: 'admin@globex.io', created: '2025-11-28' },
  { id: 3, name: 'Initech LLC', email: 'media@initech.dev', created: '2025-10-05' },
  { id: 4, name: 'Umbrella Co', email: 'ads@umbrella.co', created: '2025-09-19' },
  { id: 5, name: 'Stark Industries', email: 'creative@stark.com', created: '2025-08-22' },
];

export const MOCK_BRAND_MEDIA = [
  { id: 1, filename: 'acme_hero.jpg', ratio: '16:9', type: 'Banner', brand: 'Acme Corp', size: '1.4 MB', format: 'image' },
  { id: 2, filename: 'globex_square.png', ratio: '1:1', type: 'Interstitial', brand: 'Globex Inc', size: '920 KB', format: 'image' },
  { id: 3, filename: 'initech_story.jpg', ratio: '9:16', type: 'Rewards', brand: 'Initech LLC', size: '1.8 MB', format: 'image' },
  { id: 4, filename: 'umbrella_wide.mp4', ratio: '16:9', type: 'Banner', brand: 'Umbrella Co', size: '18.2 MB', format: 'video' },
  { id: 5, filename: 'stark_carousel.jpg', ratio: '1:1', type: 'Interstitial', brand: 'Stark Industries', size: '650 KB', format: 'image' },
  { id: 6, filename: 'acme_vertical.jpg', ratio: '9:16', type: 'Rewards', brand: 'Acme Corp', size: '2.3 MB', format: 'image' },
  { id: 7, filename: 'globex_banner.jpg', ratio: '16:9', type: 'Banner', brand: 'Globex Inc', size: '1.1 MB', format: 'image' },
  { id: 8, filename: 'initech_video_16x9.mp4', ratio: '1:1', type: 'Interstitial', brand: 'Initech LLC', size: '12.4 MB', format: 'video' },
  { id: 9, filename: 'umbrella_story.mp4', ratio: '9:16', type: 'Rewards', brand: 'Umbrella Co', size: '24.1 MB', format: 'video' },
  { id: 10, filename: 'stark_reel.mp4', ratio: '16:9', type: 'Banner', brand: 'Stark Industries', size: '19.7 MB', format: 'video' },
];

export const MOCK_DEV_COLLECTIONS = [
  { id: 1, filename: 'acme_hero.jpg', ratio: '16:9', type: 'Banner', brand: 'Acme Corp', size: '1.4 MB' },
  { id: 2, filename: 'globex_square.png', ratio: '1:1', type: 'Interstitial', brand: 'Globex Inc', size: '920 KB' },
  { id: 3, filename: 'stark_carousel.jpg', ratio: '1:1', type: 'Interstitial', brand: 'Stark Industries', size: '650 KB' },
  { id: 4, filename: 'umbrella_wide.mp4', ratio: '16:9', type: 'Banner', brand: 'Umbrella Co', size: '18.2 MB' },
  { id: 5, filename: 'initech_story.jpg', ratio: '9:16', type: 'Rewards', brand: 'Initech LLC', size: '1.8 MB' },
];
