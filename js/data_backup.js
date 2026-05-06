/* ============================================================
   INFLUENCER BOOSTERX — DATA.JS
   Realistic mock data for all platforms, posts, analytics
   ============================================================ */

window.BoosterXData = (() => {

  /* ---- Subscription Tier Logic ---- */
  const activeTier = localStorage.getItem('boosterx_tier') || 'free';
  const tierLabels = { free: 'Free Tier', creator: 'Creator', pro: 'Pro Influencer', agency: 'Agency' };
  const tierLimits = { free: 1, creator: 3, pro: 10, agency: 99 };
  const maxAccounts = tierLimits[activeTier] || 1;

  /* ---- Agency Clients Logic ---- */
  let AGENCY_CLIENTS = JSON.parse(localStorage.getItem('agency_clients')) || [
    { id: 'client_alex', name: 'Alex Rivera', handle: '@alexrivera', niche: 'Lifestyle & Tech' },
    { id: 'client_sarah', name: 'Sarah Jenkins', handle: '@sarahbeauty', niche: 'Beauty & Fashion' },
    { id: 'client_mark', name: 'Mark Fitness', handle: '@markfit', niche: 'Health & Fitness' }
  ];

  let currentClientId = activeTier === 'agency' 
    ? (localStorage.getItem('current_client_id') || 'client_alex')
    : 'client_alex';

  if (!AGENCY_CLIENTS.find(c => c.id === currentClientId)) {
    currentClientId = AGENCY_CLIENTS[0].id;
  }
  const currentClient = AGENCY_CLIENTS.find(c => c.id === currentClientId) || AGENCY_CLIENTS[0];

  /* ---- Platform Definitions ---- */
  const PLATFORMS = [
    { id: 'instagram', name: 'Instagram', icon: '📸', color: '#E1306C',
      grad: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', className: 'platform-instagram' },
    { id: 'tiktok',    name: 'TikTok',    icon: '🎵', color: '#EE1D52',
      grad: 'linear-gradient(135deg,#010101,#EE1D52,#69C9D0)', className: 'platform-tiktok' },
    { id: 'youtube',   name: 'YouTube',   icon: '▶️', color: '#FF0000',
      grad: 'linear-gradient(135deg,#FF0000,#CC0000)',           className: 'platform-youtube' },
    { id: 'twitter',   name: 'Twitter/X', icon: '𝕏', color: '#1DA1F2',
      grad: 'linear-gradient(135deg,#1DA1F2,#0077b5)',           className: 'platform-twitter' },
    { id: 'facebook',  name: 'Facebook',  icon: '👥', color: '#1877F2',
      grad: 'linear-gradient(135deg,#1877F2,#0855c4)',           className: 'platform-facebook' },
    { id: 'linkedin',  name: 'LinkedIn',  icon: '💼', color: '#0A66C2',
      grad: 'linear-gradient(135deg,#0A66C2,#0848a5)',           className: 'platform-linkedin' },
    { id: 'pinterest', name: 'Pinterest', icon: '📌', color: '#E60023',
      grad: 'linear-gradient(135deg,#E60023,#b0001b)',           className: 'platform-pinterest' },
    { id: 'snapchat',  name: 'Snapchat',  icon: '👻', color: '#FFFC00',
      grad: 'linear-gradient(135deg,#FFFC00,#ffd000)',           className: 'platform-snapchat' },
  ];

  /* ---- Linked Accounts ---- */
  const ACCOUNTS = [
    { id: 'acc_ig',  platform: 'instagram', handle: '@alexrivera_life',  username: 'Alex Rivera',
      followers: 248700, following: 1204, posts: 387, engaged: 4.8, reach: 1240000,
      connected: true,  growth: 3.2, avatar: '📸' },
    { id: 'acc_tt',  platform: 'tiktok',    handle: currentClient.handle,       username: currentClient.name,
      followers: 892300 + Math.floor(Math.random()*500000), following: 312, posts: 214, engaged: 7.4, reach: 4500000,
      connected: true,  growth: 12.1, avatar: '🎵' },
    { id: 'acc_yt',  platform: 'youtube',   handle: currentClient.name + ' Vlogs', username: currentClient.name,
      followers: 143000 + Math.floor(Math.random()*100000), following: 0,   posts: 98,  engaged: 5.2, reach: 870000,
      connected: true,  growth: 2.8, avatar: '▶️' },
    { id: 'acc_tw',  platform: 'twitter',   handle: currentClient.handle,       username: currentClient.name,
      followers: 61400 + Math.floor(Math.random()*50000),  following: 892, posts: 1204,engaged: 2.1, reach: 310000,
      connected: true,  growth: 1.4, avatar: '𝕏' },
    { id: 'acc_fb',  platform: 'facebook',  handle: currentClient.name + ' Page',  username: currentClient.name,
      followers: 34200 + Math.floor(Math.random()*20000),  following: 0,   posts: 562, engaged: 1.8, reach: 195000,
      connected: true,  growth: -0.3, avatar: '👥' },
    { id: 'acc_li',  platform: 'linkedin',  handle: currentClient.name,       username: currentClient.name,
      followers: 18900 + Math.floor(Math.random()*10000),  following: 743, posts: 89,  engaged: 3.6, reach: 98000,
      connected: true,  growth: 5.1, avatar: '💼' },
  ].slice(0, maxAccounts);

  /* ---- Generate growth history (30 days) ---- */
  function genGrowth(base, volatility, trend) {
    const data = [];
    let val = base;
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      val = Math.round(val + (Math.random() - 0.42) * volatility + trend);
      data.push({ date: d.toISOString().split('T')[0], value: Math.max(0, val) });
    }
    return data;
  }

  const GROWTH_HISTORY = {
    instagram: genGrowth(232000, 1200, 580),
    tiktok:    genGrowth(800000, 5000, 3100),
    youtube:   genGrowth(138000, 600,  165),
    twitter:   genGrowth(59800,  400,  57),
    facebook:  genGrowth(34800,  200, -11),
    linkedin:  genGrowth(16200,  150,  88),
  };

  /* ---- Posts Data ---- */
  const POST_TYPES = ['photo', 'video', 'reel', 'story', 'carousel', 'live'];
  const EMOJIS = ['🌅','🎬','🏋️','🍕','✈️','🎶','💡','🔥','🎉','🌿','📱','🎮','👗','🚀','🌊'];

  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function randFloat(min, max, dp = 1) { return parseFloat((Math.random() * (max - min) + min).toFixed(dp)); }
  function timeAgo(daysAgo) {
    const d = new Date(); d.setDate(d.getDate() - daysAgo);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const POST_TITLES = [
    'Morning routine that changed my life ✨', 'Travel vlog: Hidden gems in Bali 🌴',
    'My honest skincare review (results shocked me!)', '5 productivity hacks for 2024 🚀',
    'Behind the scenes of my photoshoot 📸', 'Q&A — answering all your questions!',
    'Day in the life of a full-time creator 🎬', 'Recipe I\'ve been obsessed with lately 🍜',
    'How I grew to 1M followers (real talk)', 'Workout routine for busy people 💪',
    'New collab announcement! 🎉', 'Story time: What happened last week...',
    'My tech setup for creating content 💻', 'Trying viral trends so you don\'t have to',
    'Monthly income report — full transparency', 'Top 10 tools every creator needs',
    'The truth about brand deals 💰', 'Mindset shift that changed everything',
    'City guide: 48 hours in Tokyo 🗼', 'Closet tour + styling tips 👗',
    'Healthy meal prep Sunday 🥗', 'My camera gear explained 📷',
    'Reacting to my old content 😂', 'Announcing my online course! 🎓',
  ];

  const POSTS = [];
  const platforms = ['instagram','tiktok','youtube','twitter','facebook','linkedin'];
  for (let i = 0; i < 24; i++) {
    const plat = platforms[i % platforms.length];
    const daysAgo = randInt(0, 28);
    const isVideo = ['tiktok','youtube'].includes(plat);
    const likes = isVideo ? randInt(8000, 180000) : randInt(1200, 45000);
    const comments = Math.round(likes * randFloat(0.02, 0.12));
    const shares = Math.round(likes * randFloat(0.01, 0.08));
    const reach = Math.round(likes * randFloat(3, 18));
    const engagement = parseFloat(((likes + comments + shares) / reach * 100).toFixed(1));
    POSTS.push({
      id: `post_${i}`,
      platform: plat,
      title: POST_TITLES[i % POST_TITLES.length],
      emoji: EMOJIS[i % EMOJIS.length],
      type: POST_TYPES[randInt(0, POST_TYPES.length - 1)],
      date: timeAgo(daysAgo), daysAgo,
      likes, comments, shares, reach,
      engagement,
      impressions: Math.round(reach * randFloat(1.1, 1.8)),
      saves: Math.round(likes * randFloat(0.05, 0.2)),
      status: daysAgo === 0 ? 'published' : daysAgo < 0 ? 'scheduled' : 'published',
    });
  }
  // Sort newest first
  POSTS.sort((a, b) => a.daysAgo - b.daysAgo);

  /* ---- Geography Data Generator ---- */
  function getGeography(platformId) {
    const isAll = platformId === 'all';
    const followers = isAll 
      ? ACCOUNTS.reduce((s, a) => s + a.followers, 0)
      : (ACCOUNTS.find(a => a.platform === platformId)?.followers || 0);

    // Provide some variance based on platform
    let pcts = [];
    if (platformId === 'tiktok') {
      pcts = [35.5, 20.2, 12.0, 8.5, 6.1, 17.7]; // Younger, diverse
    } else if (platformId === 'linkedin') {
      pcts = [52.1, 12.4, 8.2, 6.5, 8.1, 12.7]; // Professional
    } else if (platformId === 'youtube') {
      pcts = [40.2, 14.1, 9.8, 8.2, 4.4, 23.3]; // Global
    } else {
      pcts = [42.5, 15.2, 10.8, 7.4, 5.1, 19.0]; // Default / All
    }

    const raw = [
      { country: 'United States', flag: '🇺🇸', pct: pcts[0] },
      { country: 'United Kingdom', flag: '🇬🇧', pct: pcts[1] },
      { country: 'Canada', flag: '🇨🇦', pct: pcts[2] },
      { country: 'Australia', flag: '🇦🇺', pct: pcts[3] },
      { country: 'Germany', flag: '🇩🇪', pct: pcts[4] },
      { country: 'Other', flag: '🌍', pct: pcts[5] }
    ];

    return raw.map(g => ({ ...g, followers: Math.round(followers * (g.pct / 100)) }));
  }

  const ANALYTICS = {
    totalFollowers: ACCOUNTS.reduce((s, a) => s + a.followers, 0),
    totalReach: ACCOUNTS.reduce((s, a) => s + a.reach, 0),
    avgEngagement: parseFloat((ACCOUNTS.reduce((s, a) => s + a.engaged, 0) / ACCOUNTS.length).toFixed(1)),
    totalPosts: ACCOUNTS.reduce((s, a) => s + a.posts, 0),
    topPlatform: 'tiktok',
    weeklyGrowth: 24830,
    monthlyGrowth: 91400,
    bestPostingTime: { hour: 19, label: '7:00 PM' },
    platformBreakdown: ACCOUNTS.map(a => ({
      platform: a.platform,
      followers: a.followers,
      pct: parseFloat((a.followers / ACCOUNTS.reduce((s, x) => s + x.followers, 0) * 100).toFixed(1))
    }))
  };

  /* ---- Hourly Engagement Heatmap (7 days × 24 hours) ---- */
  const HEATMAP = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, h) => {
      const isPeakHour = (h >= 7 && h <= 9) || (h >= 12 && h <= 14) || (h >= 18 && h <= 22);
      const isWeekend = day === 0 || day === 6;
      let heat = randInt(0, 2);
      if (isPeakHour) heat += randInt(1, 2);
      if (isWeekend && isPeakHour) heat += 1;
      return Math.min(heat, 5);
    })
  );

  /* ---- Growth Tips ---- */
  const TIPS = [
    {
      id: 't1', platform: 'all', icon: '🎯',
      title: 'Post Consistently at Peak Hours',
      body: 'Your audience is most active between 7–9 AM and 7–10 PM. Schedule posts during these windows to maximize organic reach. Consistency signals trust to platform algorithms.',
      difficulty: 2, impact: 'High', tag: 'Scheduling', color: 'purple',
      actions: ['Set up a content calendar', 'Use scheduling tools', 'Analyze best times per platform'],
    },
    {
      id: 't2', platform: 'tiktok', icon: '🎵',
      title: 'Ride Trending Sounds on TikTok',
      body: 'TikTok\'s algorithm heavily promotes content using trending audio. Check the Discover tab weekly and create content that fits your niche + trending sounds. Videos using viral audio get 3× more views.',
      difficulty: 1, impact: 'Very High', tag: 'TikTok Growth', color: 'cyan',
      actions: ['Check trending sounds weekly', 'Adapt trends to your niche', 'Post within first 24h of trend'],
    },
    {
      id: 't3', platform: 'instagram', icon: '📸',
      title: 'Optimize Your Instagram Reels',
      body: 'Reels get 22% more interaction than standard video posts. Keep them under 30 seconds, add captions, use 3–5 relevant hashtags, and post 4–5 Reels per week for maximum algorithm boost.',
      difficulty: 2, impact: 'High', tag: 'Instagram Growth', color: 'pink',
      actions: ['Create 30s Reels', 'Add auto-captions', 'Use niche hashtags (10K–500K range)'],
    },
    {
      id: 't4', platform: 'youtube', icon: '▶️',
      title: 'Nail Your YouTube Thumbnail & Title',
      body: 'CTR (click-through rate) is the #1 factor YouTube uses to suggest your video. High-contrast thumbnails with faces perform 38% better. Pair with curiosity-gap titles that tease but don\'t reveal.',
      difficulty: 3, impact: 'Very High', tag: 'YouTube SEO', color: 'amber',
      actions: ['Design high-contrast thumbnails', 'A/B test titles', 'Use YouTube Search to find keywords'],
    },
    {
      id: 't5', platform: 'all', icon: '🤝',
      title: 'Collaborate with Micro-Influencers',
      body: 'Cross-promotion with creators in your niche (10K–100K followers) yields better engagement than mega-influencer collabs. Their audiences trust them deeply. Propose mutual shoutouts or co-created content.',
      difficulty: 2, impact: 'High', tag: 'Collaboration', color: 'emerald',
      actions: ['List 10 complementary creators', 'DM with a clear value prop', 'Plan a joint live or collab post'],
    },
    {
      id: 't6', platform: 'twitter', icon: '🧵',
      title: 'Thread Strategy for Twitter/X Growth',
      body: 'Threads generate 5× more impressions than single tweets. Structure threads as: Hook tweet → Problem → Story/Data → Solution → CTA. Post at 8 AM for maximum reach on weekday mornings.',
      difficulty: 2, impact: 'Medium', tag: 'Twitter Growth', color: 'cyan',
      actions: ['Write 1 thread per week', 'Always start with a bold hook', 'End with a follow CTA'],
    },
    {
      id: 't7', platform: 'all', icon: '📊',
      title: 'Analyze & Double Down on Winners',
      body: 'Review your top 5 performing posts every month. Identify the format, topic, and tone they share — then create 3 variations of each. Most creators ignore their analytics and keep experimenting randomly.',
      difficulty: 1, impact: 'Very High', tag: 'Analytics', color: 'purple',
      actions: ['Review top posts monthly', 'Identify 3 winning formats', 'Create 3 variations each'],
    },
    {
      id: 't8', platform: 'instagram', icon: '💬',
      title: 'Boost Engagement with Story Polls',
      body: 'Instagram Stories with interactive elements (polls, quizzes, sliders) get seen by 40% more accounts due to the engagement signal. Post 5–7 Stories per day with at least 1 interactive element.',
      difficulty: 1, impact: 'Medium', tag: 'Instagram Stories', color: 'pink',
      actions: ['Add polls to every Story set', 'Use quizzes about your niche', 'Reply to every DM from Stories'],
    },
  ];

  /* ---- Trending Hashtags by Platform ---- */
  const HASHTAGS = {
    instagram: ['#ContentCreator','#InfluencerLife','#InstagramGrowth','#Aesthetic','#ViralReels','#CreatorEconomy','#PersonalBrand','#LifestyleCreator'],
    tiktok:    ['#TikTokGrowth','#FYP','#ForYouPage','#ViralTikTok','#CreatorTips','#TikTokMadeMeBuyIt','#ContentTok','#POV'],
    youtube:   ['#YouTubeGrowth','#Vlog','#YouTubeTips','#Subscribe','#ContentCreator','#TechReview','#HowTo','#YouTube2024'],
    twitter:   ['#CreatorEconomy','#GrowthHacking','#BuildInPublic','#SocialMedia','#Marketing','#DigitalNomad','#Entrepreneur','#Threads'],
    linkedin:  ['#PersonalBranding','#ContentMarketing','#LinkedInGrowth','#B2B','#Leadership','#Entrepreneurship','#CreatorEconomy','#Growth'],
    facebook:  ['#FacebookMarketing','#ContentCreator','#FacebookLive','#SocialMediaMarketing','#ViralContent','#DigitalMarketing'],
  };

  /* ---- User Profile ---- */
  const USER = {
    name: currentClient.name,
    handle: currentClient.handle,
    niche: currentClient.niche,
    tier: tierLabels[activeTier] || 'Free Tier',
    joinDate: '2022-03-15',
    avatar: 'A',
    totalFollowers: ANALYTICS.totalFollowers,
    notifications: true,
    emailDigest: true,
    darkMode: true,
    currency: 'USD',
    timezone: 'America/New_York',
  };

  /* ---- Weekly Stats (last 7 days bars) ---- */
  const WEEKLY_STATS = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      followers: randInt(800, 3200),
      posts: randInt(2, 8),
      engagement: randFloat(2.5, 8.5),
    };
  });

  /* ---- Public API ---- */
  return {
    ACTIVE_TIER: activeTier,
    AGENCY_CLIENTS,
    currentClientId,
    switchClient: (id) => {
      localStorage.setItem('current_client_id', id);
      window.location.reload();
    },
    addClient: (client) => {
      AGENCY_CLIENTS.push(client);
      localStorage.setItem('agency_clients', JSON.stringify(AGENCY_CLIENTS));
    },
    PLATFORMS, ACCOUNTS, POSTS, ANALYTICS, GROWTH_HISTORY,
    HEATMAP, TIPS, HASHTAGS, USER, WEEKLY_STATS,
    getPlatform: (id) => PLATFORMS.find(p => p.id === id),
    getAccount:  (pid) => ACCOUNTS.find(a => a.platform === pid),
    getGeography,
    formatNum: (n) => {
      if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
      if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
      return n.toLocaleString();
    },
    formatPct: (n) => n + '%'
  };
})();
