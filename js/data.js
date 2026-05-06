/* ============================================================
   INFLUENCER BOOSTERX — DATA.JS
   Handles fetching data from Supabase + Fallback Mock Data
   ============================================================ */

window.BoosterXData = {
  ACTIVE_TIER: 'free',
  AGENCY_CLIENTS: [],
  currentClientId: null,
  PLATFORMS: [
    { id: 'instagram', name: 'Instagram', icon: '📸', color: '#E1306C', grad: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)' },
    { id: 'tiktok',    name: 'TikTok',    icon: '🎵', color: '#EE1D52', grad: 'linear-gradient(135deg,#010101,#EE1D52,#69C9D0)' },
    { id: 'youtube',   name: 'YouTube',   icon: '▶️', color: '#FF0000', grad: 'linear-gradient(135deg,#FF0000,#CC0000)' },
    { id: 'twitter',   name: 'Twitter/X', icon: '𝕏', color: '#1DA1F2', grad: 'linear-gradient(135deg,#1DA1F2,#0077b5)' },
    { id: 'facebook',  name: 'Facebook',  icon: '👥', color: '#1877F2', grad: 'linear-gradient(135deg,#1877F2,#0855c4)' },
    { id: 'linkedin',  name: 'LinkedIn',  icon: '💼', color: '#0A66C2', grad: 'linear-gradient(135deg,#0A66C2,#0848a5)' },
    { id: 'pinterest', name: 'Pinterest', icon: '📌', color: '#E60023', grad: 'linear-gradient(135deg,#E60023,#b0001b)' },
    { id: 'snapchat',  name: 'Snapchat',  icon: '👻', color: '#FFFC00', grad: 'linear-gradient(135deg,#FFFC00,#ffd000)' },
  ],
  ACCOUNTS: [],
  POSTS: [],
  ANALYTICS: {},
  GROWTH_HISTORY: {},
  HEATMAP: [],
  TIPS: [],
  HASHTAGS: {},
  USER: {},
  WEEKLY_STATS: [],

  initData: async function() {
    const sb = window.BoosterXSupabase;
    let session = null;
    try { session = await sb.getSession(); } catch(e) {}

    if (!session) {
      // If no session, redirect to landing
      if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
        window.location.href = 'landing.html';
        return;
      }
    } else {
      // Load from Supabase
      const profile = await sb.getProfile(session.user.id);
      this.ACTIVE_TIER = profile.tier || 'free';
      this.USER = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        tier: profile.tier,
        avatar: profile.name ? profile.name.charAt(0).toUpperCase() : 'A'
      };

      const clients = await sb.getClients();
      if (clients.length === 0) {
        // Seed first client
        const newClient = await sb.addClient({
          user_id: profile.id,
          name: profile.name,
          handle: '@' + profile.name.replace(/\s+/g, '').toLowerCase(),
          niche: 'Lifestyle'
        });
        this.AGENCY_CLIENTS = [newClient];
      } else {
        this.AGENCY_CLIENTS = clients;
      }

      const storedClient = localStorage.getItem('current_client_id');
      this.currentClientId = this.AGENCY_CLIENTS.find(c => c.id === storedClient) ? storedClient : this.AGENCY_CLIENTS[0].id;
      
      const allAccounts = await sb.getAccounts();
      const newAccounts = allAccounts.filter(a => a.client_id === this.currentClientId).map(a => ({
        ...a,
        connected: a.is_connected,
        avatar: this.PLATFORMS.find(p => p.id === a.platform)?.icon || '📱'
      }));
      this.ACCOUNTS.length = 0;
      this.ACCOUNTS.push(...newAccounts);
      
      const allPosts = await sb.getPosts();
      const newPosts = allPosts.filter(p => p.client_id === this.currentClientId).map(p => ({
        ...p,
        date: new Date(p.posted_at).toLocaleDateString(),
        engagement: p.engagement_rate
      }));
      this.POSTS.length = 0;
      this.POSTS.push(...newPosts);



      // Calculate Derived Analytics
      this.recalculateAnalytics();
      this.generateMockHistoryAndTips();
    }
  },

  recalculateAnalytics: function() {
    const newAnalytics = {
      totalFollowers: this.ACCOUNTS.reduce((s, a) => s + (a.followers||0), 0),
      totalReach: this.ACCOUNTS.reduce((s, a) => s + (a.reach||0), 0),
      avgEngagement: this.ACCOUNTS.length ? parseFloat((this.ACCOUNTS.reduce((s, a) => s + (a.engagement_rate||0), 0) / this.ACCOUNTS.length).toFixed(1)) : 0,
      totalPosts: this.ACCOUNTS.reduce((s, a) => s + (a.posts_count||0), 0),
      topPlatform: this.ACCOUNTS.sort((a,b) => b.followers - a.followers)[0]?.platform || 'instagram',
      weeklyGrowth: Math.round(this.ACCOUNTS.reduce((s, a) => s + (a.followers||0), 0) * 0.05),
      monthlyGrowth: Math.round(this.ACCOUNTS.reduce((s, a) => s + (a.followers||0), 0) * 0.15),
      bestPostingTime: { hour: 19, label: '7:00 PM' },
      platformBreakdown: this.ACCOUNTS.map(a => ({
        platform: a.platform,
        followers: a.followers,
        pct: parseFloat((a.followers / Math.max(1, this.ACCOUNTS.reduce((s, x) => s + x.followers, 0)) * 100).toFixed(1))
      }))
    };
    Object.keys(this.ANALYTICS).forEach(k => delete this.ANALYTICS[k]);
    Object.assign(this.ANALYTICS, newAnalytics);
  },

  generateMockHistoryAndTips: function() {
    // Keep the mock history and tips generators for UI filling since we don't store 30-day time series in DB yet
    function genGrowth(base) {
      const data = [];
      let val = base || 0;
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        val = Math.round(val + (Math.random() - 0.4) * (base*0.01) + (base*0.005));
        data.push({ date: d.toISOString().split('T')[0], value: Math.max(0, val) });
      }
      return data;
    }

    Object.keys(this.GROWTH_HISTORY).forEach(k => delete this.GROWTH_HISTORY[k]);
    this.ACCOUNTS.forEach(acc => {
      this.GROWTH_HISTORY[acc.platform] = genGrowth(acc.followers);
    });

    const newWeekly = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return {
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        followers: Math.floor(Math.random()*1000),
        posts: Math.floor(Math.random()*5),
        engagement: (Math.random()*5 + 2).toFixed(1),
      };
    });
    this.WEEKLY_STATS.length = 0;
    this.WEEKLY_STATS.push(...newWeekly);

    const newHeatmap = Array.from({ length: 7 }, (_, day) =>
      Array.from({ length: 24 }, (_, h) => Math.min(Math.floor(Math.random()*5 + (h>17?2:0)), 5))
    );
    this.HEATMAP.length = 0;
    this.HEATMAP.push(...newHeatmap);

    const newTips = [
      { id: 't1', platform: 'all', icon: '🎯', title: 'Post Consistently', body: 'Post consistently to improve your reach.', difficulty: 2, impact: 'High', tag: 'Scheduling', color: 'purple', actions: ['Set up calendar'] }
    ];
    this.TIPS.length = 0;
    this.TIPS.push(...newTips);
    
    Object.keys(this.HASHTAGS).forEach(k => delete this.HASHTAGS[k]);
    Object.assign(this.HASHTAGS, { instagram: ['#Viral','#Creator'] });
  },

  switchClient: function(id) {
    localStorage.setItem('current_client_id', id);
    window.location.reload();
  },

  getPlatform: function(id) { return window.BoosterXData.PLATFORMS.find(p => p.id === id); },
  getAccount: function(pid) { return window.BoosterXData.ACCOUNTS.find(a => a.platform === pid); },
  getGeography: function(platformId) {
    const raw = [
      { country: 'United States', flag: '🇺🇸', pct: 40 },
      { country: 'United Kingdom', flag: '🇬🇧', pct: 20 },
      { country: 'Canada', flag: '🇨🇦', pct: 15 },
      { country: 'Other', flag: '🌍', pct: 25 }
    ];
    const total = platformId === 'all' ? this.ANALYTICS.totalFollowers : (this.getAccount(platformId)?.followers || 0);
    return raw.map(g => ({ ...g, followers: Math.round(total * (g.pct / 100)) }));
  },
  formatNum: function(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return Number(n).toLocaleString();
  },
  formatPct: function(n) { return n + '%'; }
};
