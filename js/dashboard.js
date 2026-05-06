/* ============================================================
   DASHBOARD PAGE
   ============================================================ */
window.DashboardPage = (() => {
  const { ACCOUNTS, ANALYTICS, WEEKLY_STATS, GROWTH_HISTORY, getPlatform, formatNum } = window.BoosterXData;
  const Charts = window.BoosterXCharts;

  function animateCount(el, target, duration = 1200, suffix = '') {
    const start = Date.now();
    const startVal = 0;
    const update = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatNum(Math.round(startVal + (target - startVal) * ease)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  function render() {
    const topPlatformData = ACCOUNTS.sort((a, b) => b.followers - a.followers).slice(0, 3);

    return `
      <div class="page-enter">
        <!-- Page Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">Welcome back, ${window.BoosterXData.USER.name ? window.BoosterXData.USER.name.split(' ')[0] : 'Creator'} 👋</h1>
            <p class="page-subtitle">Here's how your social presence is performing today.</p>
          </div>
        </div>

        <!-- Top KPI Stats -->
        <div class="grid-4 stagger-children" style="margin-bottom:24px;" id="kpiGrid">
          <div class="stat-card glow-card animate-fadeInUp">
            <div class="stat-card-icon" style="background:linear-gradient(135deg,rgba(168,85,247,0.2),rgba(6,182,212,0.15));border:1px solid rgba(168,85,247,0.2);">
              👥
            </div>
            <div class="stat-card-value" id="kpiFollowers">0</div>
            <div class="stat-card-label">Total Followers</div>
            <div class="stat-card-trend up">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
              +${formatNum(ANALYTICS.weeklyGrowth)} this week
            </div>
            <div class="stat-card-glow" style="background:#a855f7;"></div>
          </div>

          <div class="stat-card glow-card animate-fadeInUp">
            <div class="stat-card-icon" style="background:linear-gradient(135deg,rgba(6,182,212,0.2),rgba(16,185,129,0.15));border:1px solid rgba(6,182,212,0.2);">
              📡
            </div>
            <div class="stat-card-value" id="kpiReach">0</div>
            <div class="stat-card-label">Total Monthly Reach</div>
            <div class="stat-card-trend up">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
              +8.3% vs last month
            </div>
            <div class="stat-card-glow" style="background:#06b6d4;"></div>
          </div>

          <div class="stat-card glow-card animate-fadeInUp">
            <div class="stat-card-icon" style="background:linear-gradient(135deg,rgba(236,72,153,0.2),rgba(245,158,11,0.1));border:1px solid rgba(236,72,153,0.2);">
              💬
            </div>
            <div class="stat-card-value" id="kpiEngagement">${ANALYTICS.avgEngagement}%</div>
            <div class="stat-card-label">Avg. Engagement Rate</div>
            <div class="stat-card-trend up">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
              +1.2% vs industry avg
            </div>
            <div class="stat-card-glow" style="background:#ec4899;"></div>
          </div>

          <div class="stat-card glow-card animate-fadeInUp">
            <div class="stat-card-icon" style="background:linear-gradient(135deg,rgba(245,158,11,0.2),rgba(244,63,94,0.1));border:1px solid rgba(245,158,11,0.2);">
              📝
            </div>
            <div class="stat-card-value" id="kpiPosts">${ANALYTICS.totalPosts}</div>
            <div class="stat-card-label">Total Posts Published</div>
            <div class="stat-card-trend up">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
              24 posts this month
            </div>
            <div class="stat-card-glow" style="background:#f59e0b;"></div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid-12" style="margin-bottom:24px;">
          <!-- Follower Growth Chart -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Follower Growth</div>
                <div class="card-subtitle">Last 30 days across all platforms</div>
              </div>
              <div style="display:flex;gap:8px;">
                <button class="filter-btn active" data-chart-filter="30d">30D</button>
                <button class="filter-btn" data-chart-filter="7d">7D</button>
              </div>
            </div>
            <div id="growthChartWrap" style="height:200px;"></div>
            <!-- Legend -->
            <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:16px;" id="growthLegend"></div>
          </div>

          <!-- Engagement Donut -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Platform Share</div>
                <div class="card-subtitle">By followers</div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:16px;">
              <div id="donutChart"></div>
              <div style="width:100%;display:flex;flex-direction:column;gap:8px;" id="donutLegend"></div>
            </div>
          </div>
        </div>

        <!-- Weekly Activity + Top Platforms -->
        <div class="grid-12" style="margin-bottom:24px;">
          <!-- Weekly Bar Chart -->
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Weekly Activity</div>
                <div class="card-subtitle">New followers per day (all platforms)</div>
              </div>
            </div>
            <div id="weeklyBarChart" style="height:180px;"></div>
          </div>

          <!-- Top Platforms Quickview -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Top Platforms</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:12px;" id="topPlatformsQuick"></div>
          </div>
        </div>

        <!-- Best Performing Post -->
        <div class="card" style="margin-bottom:24px;">
          <div class="card-header">
            <div>
              <div class="card-title">🏆 Best Performing Post This Month</div>
              <div class="card-subtitle">Highest engagement rate across all platforms</div>
            </div>
            <span class="badge badge-purple">Top Post</span>
          </div>
          <div id="bestPostWrap"></div>
        </div>

        <!-- Platform Cards Grid -->
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <h2 style="font-size:1rem;font-weight:700;">Connected Platforms</h2>
            <button class="btn btn-secondary btn-sm" onclick="window.BoosterXApp.navigate('accounts')">
              View All Accounts →
            </button>
          </div>
          <div class="grid-3 stagger-children" id="platformCardGrid"></div>
        </div>
      </div>
    `;
  }

  function init() {
    const { POSTS } = window.BoosterXData;

    // Animate KPIs
    setTimeout(() => {
      const kpiF = document.getElementById('kpiFollowers');
      const kpiR = document.getElementById('kpiReach');
      if (kpiF) animateCount(kpiF, ANALYTICS.totalFollowers);
      if (kpiR) animateCount(kpiR, ANALYTICS.totalReach);
    }, 300);

    // Growth Line Chart
    const growthWrap = document.getElementById('growthChartWrap');
    if (growthWrap) {
      const platformsToShow = ['instagram','tiktok','youtube'];
      const datasets = platformsToShow.map(pid => {
        const plat = getPlatform(pid);
        const hist = GROWTH_HISTORY[pid] || [];
        return { label: plat.name, color: plat.color, data: hist.map(h => h.value) };
      });
      const labels = (GROWTH_HISTORY['instagram'] || []).map(h => {
        const d = new Date(h.date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      Charts.renderLineChart(growthWrap, datasets, labels, { height: 200 });

      // Legend
      const legend = document.getElementById('growthLegend');
      if (legend) {
        platformsToShow.forEach(pid => {
          const plat = getPlatform(pid);
          const item = document.createElement('div');
          item.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:0.78rem;color:rgba(255,255,255,0.6);';
          item.innerHTML = `<span style="width:16px;height:3px;border-radius:2px;background:${plat.color};display:block;"></span>${plat.name}`;
          legend.append(item);
        });
      }
    }

    // Chart filter buttons
    document.querySelectorAll('[data-chart-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-chart-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Donut
    const donut = document.getElementById('donutChart');
    if (donut) {
      const slices = ACCOUNTS.slice(0, 4).map(a => ({
        value: a.followers,
        color: getPlatform(a.platform)?.color || '#888',
        label: a.platform
      }));
      Charts.renderDonut(donut, slices, {
        centerLabel: formatNum(ANALYTICS.totalFollowers),
        centerSub: 'followers', size: 160
      });

      // Donut legend
      const legend = document.getElementById('donutLegend');
      if (legend) {
        const total = slices.reduce((s, sl) => s + sl.value, 0);
        slices.forEach(sl => {
          const pct = (sl.value / total * 100).toFixed(1);
          const plat = getPlatform(sl.label);
          legend.innerHTML += `
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="display:flex;align-items:center;gap:6px;font-size:0.78rem;color:rgba(255,255,255,0.6);">
                <span style="width:10px;height:10px;border-radius:2px;background:${sl.color};display:block;"></span>
                ${plat?.name || sl.label}
              </span>
              <span style="font-size:0.8rem;font-weight:700;">${pct}%</span>
            </div>`;
        });
      }
    }

    // Weekly Bar Chart
    const weeklyBar = document.getElementById('weeklyBarChart');
    if (weeklyBar) {
      Charts.renderBarChart(weeklyBar, WEEKLY_STATS.map(d => ({
        label: d.label, value: d.followers, color: '#a855f7'
      })), { height: 180 });
    }

    // Top Platforms Quick
    const topGrid = document.getElementById('topPlatformsQuick');
    if (topGrid) {
      ACCOUNTS.slice(0, 4).forEach(acc => {
        const plat = getPlatform(acc.platform);
        const growthClass = acc.growth >= 0 ? 'up' : 'down';
        topGrid.innerHTML += `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <div style="width:36px;height:36px;border-radius:10px;background:${plat?.grad};display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">
              ${plat?.icon || '📱'}
            </div>
            <div style="flex:1;">
              <div style="font-size:0.82rem;font-weight:600;">${plat?.name}</div>
              <div style="font-size:0.72rem;color:rgba(255,255,255,0.4);">${acc.handle}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.9rem;font-weight:800;">${formatNum(acc.followers)}</div>
              <div class="trend ${growthClass}" style="font-size:0.7rem;">
                ${acc.growth >= 0 ? '↑' : '↓'} ${Math.abs(acc.growth)}%
              </div>
            </div>
          </div>`;
      });
    }

    // Best Post
    const bestPost = [...POSTS].sort((a, b) => b.engagement - a.engagement)[0];
    const bestWrap = document.getElementById('bestPostWrap');
    if (bestWrap && bestPost) {
      const plat = getPlatform(bestPost.platform);
      bestWrap.innerHTML = `
        <div style="display:flex;align-items:flex-start;gap:20px;flex-wrap:wrap;">
          <div style="width:80px;height:80px;border-radius:14px;background:${plat?.grad};
            display:flex;align-items:center;justify-content:center;font-size:2.2rem;flex-shrink:0;">
            ${bestPost.emoji}
          </div>
          <div style="flex:1;min-width:200px;">
            <div style="font-size:1.05rem;font-weight:700;margin-bottom:6px;">${bestPost.title}</div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
              <span class="platform-chip platform-${bestPost.platform}">
                <span class="chip-dot"></span>${plat?.name}
              </span>
              <span class="badge badge-emerald">${bestPost.engagement}% engagement</span>
              <span class="text-xs text-muted">${bestPost.date}</span>
            </div>
            <div style="display:flex;gap:24px;flex-wrap:wrap;">
              ${[
                ['❤️', formatNum(bestPost.likes), 'Likes'],
                ['💬', formatNum(bestPost.comments), 'Comments'],
                ['🔁', formatNum(bestPost.shares), 'Shares'],
                ['👁️', formatNum(bestPost.reach), 'Reach'],
              ].map(([icon, val, lbl]) => `
                <div>
                  <div style="font-size:1rem;font-weight:800;">${icon} ${val}</div>
                  <div class="text-xs text-muted">${lbl}</div>
                </div>`).join('')}
            </div>
          </div>
        </div>`;
    }

    // Platform Card Grid
    const platGrid = document.getElementById('platformCardGrid');
    if (platGrid) {
      ACCOUNTS.slice(0, 6).forEach((acc, i) => {
        const plat = getPlatform(acc.platform);
        const hist = GROWTH_HISTORY[acc.platform] || [];
        const growthClass = acc.growth >= 0 ? 'up' : 'down';
        const card = document.createElement('div');
        card.className = `account-card platform-${acc.platform} card-entrance`;
        card.style.animationDelay = `${i * 0.08}s`;
        card.onclick = () => window.BoosterXApp.navigate('analytics');
        card.innerHTML = `
          <div class="account-card-header">
            <div class="account-platform-icon">${plat?.icon || '📱'}</div>
            <div>
              <div style="font-weight:700;font-size:0.9rem;">${plat?.name}</div>
              <div class="account-handle">${acc.handle}</div>
            </div>
            <div class="account-status ${acc.connected ? 'connected' : 'disconnected'}" style="margin-left:auto;">
              <div class="account-status-dot"></div>
              ${acc.connected ? 'Live' : 'Off'}
            </div>
          </div>
          <div class="account-stats">
            <div class="account-stat-item">
              <div class="account-stat-value">${formatNum(acc.followers)}</div>
              <div class="account-stat-label">Followers</div>
            </div>
            <div class="account-stat-item">
              <div class="account-stat-value">${acc.engaged}%</div>
              <div class="account-stat-label">Engagement</div>
            </div>
            <div class="account-stat-item">
              <div class="account-stat-value trend ${growthClass}">${acc.growth >= 0 ? '+' : ''}${acc.growth}%</div>
              <div class="account-stat-label">Growth</div>
            </div>
          </div>
          <div class="sparkline-wrap" id="spark_${acc.id}"></div>
        `;
        platGrid.append(card);
        setTimeout(() => {
          const sparkEl = document.getElementById(`spark_${acc.id}`);
          if (sparkEl) Charts.renderSparkline(sparkEl, hist, plat?.color || '#a855f7');
        }, 200 + i * 60);
      });
    }

    // Removed export report button
  }

  return { render, init };
})();
