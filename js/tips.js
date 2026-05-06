/* ============================================================
   GROWTH TIPS PAGE
   ============================================================ */
window.TipsPage = (() => {
  const { TIPS, HASHTAGS, getPlatform } = window.BoosterXData;
  let activeFilter = 'all';

  const COLOR_MAP = {
    purple: { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)', text: 'var(--purple-400)' },
    cyan:   { bg: 'rgba(6,182,212,0.12)',  border: 'rgba(6,182,212,0.25)',  text: 'var(--cyan-400)' },
    pink:   { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)', text: 'var(--pink-400)' },
    emerald:{ bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: 'var(--emerald-400)' },
    amber:  { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: 'var(--amber-400)' },
  };

  const IMPACT_BADGE = {
    'Very High': 'badge-rose', 'High': 'badge-purple', 'Medium': 'badge-cyan', 'Low': 'badge-subtle'
  };

  function render() {
    return `
      <div class="page-enter">
        <div class="page-header">
          <div>
            <h1 class="page-title">Growth Tips 🚀</h1>
            <p class="page-subtitle">Personalized strategies to grow your audience on every platform.</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <span class="badge badge-purple">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              ${TIPS.length} Tips Available
            </span>
          </div>
        </div>

        <!-- Insight Banner -->
        <div style="background:linear-gradient(135deg,rgba(168,85,247,0.15),rgba(6,182,212,0.1));
          border:1px solid rgba(168,85,247,0.25);border-radius:20px;padding:24px;margin-bottom:28px;
          display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
          <div style="font-size:2.5rem;">🎯</div>
          <div style="flex:1;min-width:200px;">
            <div style="font-size:1.05rem;font-weight:700;margin-bottom:6px;">
              Your #1 Growth Opportunity Right Now
            </div>
            <div style="font-size:0.875rem;color:rgba(255,255,255,0.65);line-height:1.6;">
              Based on your analytics, <strong style="color:var(--purple-400);">TikTok</strong> has your highest engagement rate (7.4%) 
              but you're posting less frequently than optimal. <strong>Increase to 14+ posts/week</strong> to maximize the algorithm's reach boost.
            </div>
          </div>
          <button class="btn btn-primary" onclick="window.BoosterXApp.navigate('analytics')">
            View Analytics →
          </button>
        </div>

        <!-- Platform Filter -->
        <div class="filter-bar" style="margin-bottom:24px;">
          <button class="filter-btn active" data-tip-filter="all">🌐 All Tips</button>
          <button class="filter-btn" data-tip-filter="instagram">📸 Instagram</button>
          <button class="filter-btn" data-tip-filter="tiktok">🎵 TikTok</button>
          <button class="filter-btn" data-tip-filter="youtube">▶️ YouTube</button>
          <button class="filter-btn" data-tip-filter="twitter">𝕏 Twitter</button>
          <button class="filter-btn" data-tip-filter="general">🌟 General</button>
        </div>

        <!-- Tips Grid -->
        <div class="grid-2 stagger-children" id="tipsGrid" style="margin-bottom:32px;"></div>

        <!-- Trending Hashtags -->
        <div class="card" style="margin-bottom:24px;">
          <div class="card-header">
            <div>
              <div class="card-title"># Trending Hashtags</div>
              <div class="card-subtitle">Top performing hashtags for each platform right now</div>
            </div>
            <span class="badge badge-emerald">Live Trends</span>
          </div>
          <div id="hashtagSection"></div>
        </div>

        <!-- Posting Schedule Recommendation -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">📅 Optimal Posting Schedule</div>
            <div class="card-subtitle">Recommended frequency based on your audience activity</div>
          </div>
          <div id="scheduleGrid" class="grid-3"></div>
        </div>
      </div>
    `;
  }

  function renderTips(filter) {
    activeFilter = filter;
    const filtered = TIPS.filter(t => {
      if (filter === 'all') return true;
      if (filter === 'general') return t.platform === 'all';
      return t.platform === filter || t.platform === 'all';
    });

    const grid = document.getElementById('tipsGrid');
    if (!grid) return;

    if (!filtered.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state-icon">💡</div>
        <div class="empty-state-title">No tips for this filter yet</div>
      </div>`;
      return;
    }

    grid.innerHTML = filtered.map((tip, i) => {
      const c = COLOR_MAP[tip.color] || COLOR_MAP.purple;
      const stars = tip.difficulty;
      return `
        <div class="tip-card card-entrance" style="animation-delay:${i*0.07}s;">
          <div class="tip-card-accent" style="background:${c.text};"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;">
            <div class="tip-card-icon">${tip.icon}</div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
              <span class="badge ${IMPACT_BADGE[tip.impact] || 'badge-subtle'}">
                ⚡ ${tip.impact} Impact
              </span>
              <span style="font-size:0.7rem;padding:3px 8px;border-radius:999px;
                background:${c.bg};color:${c.text};border:1px solid ${c.border};">
                ${tip.tag}
              </span>
            </div>
          </div>
          <div class="tip-card-title">${tip.title}</div>
          <div class="tip-card-body">${tip.body}</div>

          ${tip.actions?.length ? `
            <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06);">
              <div style="font-size:0.72rem;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;
                letter-spacing:0.06em;margin-bottom:8px;">Action Steps</div>
              ${tip.actions.map(a => `
                <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;">
                  <span style="width:18px;height:18px;border-radius:50%;background:${c.bg};
                    border:1px solid ${c.border};display:flex;align-items:center;justify-content:center;
                    flex-shrink:0;margin-top:1px;">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${c.text}" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  <span style="font-size:0.8rem;color:rgba(255,255,255,0.65);">${a}</span>
                </div>`).join('')}
            </div>` : ''}

          <div class="tip-card-meta">
            <div>
              <div style="font-size:0.65rem;color:rgba(255,255,255,0.3);margin-bottom:4px;">DIFFICULTY</div>
              <div class="tip-difficulty">
                ${[1,2,3].map(n => `<span class="${n <= stars ? 'filled' : ''}"></span>`).join('')}
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.TipsPage.saveTip('${tip.id}')">
              🔖 Save Tip
            </button>
          </div>
        </div>`;
    }).join('');
  }

  function renderHashtags() {
    const section = document.getElementById('hashtagSection');
    if (!section) return;

    const platforms = Object.keys(HASHTAGS);
    section.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:16px;">
        ${platforms.map(pid => {
          const plat = getPlatform(pid);
          return `
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                <span style="font-size:1.1rem;">${plat?.icon || '📱'}</span>
                <span style="font-size:0.85rem;font-weight:700;">${plat?.name || pid}</span>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${HASHTAGS[pid].map(tag => `
                  <button class="filter-btn" onclick="window.TipsPage.copyHashtag('${tag}')" title="Click to copy">
                    ${tag}
                  </button>`).join('')}
              </div>
            </div>`;
        }).join('<div class="divider" style="margin:4px 0;"></div>')}
      </div>`;
  }

  function renderSchedule() {
    const grid = document.getElementById('scheduleGrid');
    if (!grid) return;
    const schedule = [
      { platform: 'instagram', freq: '4–5× / week', best: 'Mon, Wed, Fri at 7PM', icon: '📸', color: '#E1306C' },
      { platform: 'tiktok',    freq: '1–3× / day',  best: 'Daily 7–9AM & 7–9PM', icon: '🎵', color: '#EE1D52' },
      { platform: 'youtube',   freq: '2–3× / week',  best: 'Tue, Thu, Sat at 3PM', icon: '▶️', color: '#FF0000' },
      { platform: 'twitter',   freq: '3–5× / day',   best: 'Weekdays 8AM & 12PM', icon: '𝕏', color: '#1DA1F2' },
      { platform: 'facebook',  freq: '1–2× / day',   best: 'Wed & Fri at 1PM',    icon: '👥', color: '#1877F2' },
      { platform: 'linkedin',  freq: '3–4× / week',  best: 'Tue, Wed, Thu at 9AM',icon: '💼', color: '#0A66C2' },
    ];
    grid.innerHTML = schedule.map(s => `
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);
        border-radius:16px;padding:18px;transition:all 0.2s;" 
        onmouseenter="this.style.borderColor='rgba(255,255,255,0.15)'"
        onmouseleave="this.style.borderColor='rgba(255,255,255,0.07)'">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="font-size:1.2rem;">${s.icon}</span>
          <span style="font-weight:700;font-size:0.9rem;">${getPlatform(s.platform)?.name || s.platform}</span>
        </div>
        <div style="margin-bottom:8px;">
          <div style="font-size:0.7rem;color:rgba(255,255,255,0.35);margin-bottom:3px;text-transform:uppercase;letter-spacing:0.05em;">Frequency</div>
          <div style="font-size:0.95rem;font-weight:800;color:${s.color};">${s.freq}</div>
        </div>
        <div>
          <div style="font-size:0.7rem;color:rgba(255,255,255,0.35);margin-bottom:3px;text-transform:uppercase;letter-spacing:0.05em;">Best Times</div>
          <div style="font-size:0.8rem;color:rgba(255,255,255,0.65);">${s.best}</div>
        </div>
      </div>`).join('');
  }

  function saveTip(id) {
    window.BoosterXApp.showToast('💾 Tip saved to your collection!', 'success');
  }

  function copyHashtag(tag) {
    navigator.clipboard?.writeText(tag).catch(() => {});
    window.BoosterXApp.showToast(`📋 Copied ${tag}`, 'info');
  }

  function init() {
    renderTips('all');
    renderHashtags();
    renderSchedule();

    document.querySelectorAll('[data-tip-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-tip-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTips(btn.dataset.tipFilter);
      });
    });
  }

  return { render, init, saveTip, copyHashtag };
})();
