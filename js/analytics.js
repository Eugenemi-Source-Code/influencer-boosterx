/* ============================================================
   ANALYTICS PAGE
   ============================================================ */
window.AnalyticsPage = (() => {
  const { ACCOUNTS, GROWTH_HISTORY, HEATMAP, ANALYTICS, getPlatform, formatNum } = window.BoosterXData;
  const Charts = window.BoosterXCharts;
  let activePlatform = 'all';

  function render() {
    return `
      <div class="page-enter">
        <div class="page-header">
          <div>
            <h1 class="page-title">Analytics</h1>
            <p class="page-subtitle">Deep dive into your performance metrics across all platforms.</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="filter-btn active" data-analytic-platform="all">All Platforms</button>
            ${ACCOUNTS.map(a => `
              <button class="filter-btn" data-analytic-platform="${a.platform}">
                ${getPlatform(a.platform)?.icon} ${getPlatform(a.platform)?.name}
              </button>`).join('')}
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="stat-card">
            <div class="stat-card-icon" style="background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.2);">📈</div>
            <div class="stat-card-value">${formatNum(ANALYTICS.monthlyGrowth)}</div>
            <div class="stat-card-label">Monthly Follower Gain</div>
            <div class="stat-card-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>+12.4% vs last month</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background:rgba(6,182,212,0.15);border:1px solid rgba(6,182,212,0.2);">👁️</div>
            <div class="stat-card-value">${formatNum(ANALYTICS.totalReach)}</div>
            <div class="stat-card-label">Total Monthly Reach</div>
            <div class="stat-card-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>+8.3%</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background:rgba(236,72,153,0.15);border:1px solid rgba(236,72,153,0.2);">💫</div>
            <div class="stat-card-value">${ANALYTICS.avgEngagement}%</div>
            <div class="stat-card-label">Avg Engagement Rate</div>
            <div class="stat-card-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>Industry: 3.1%</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.2);">⏰</div>
            <div class="stat-card-value">${ANALYTICS.bestPostingTime.label}</div>
            <div class="stat-card-label">Best Posting Time</div>
            <div class="stat-card-trend up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>Peak engagement window</div>
          </div>
        </div>

        <!-- Growth Chart Full Width -->
        <div class="card" style="margin-bottom:24px;">
          <div class="card-header">
            <div>
              <div class="card-title">Follower Growth Trend</div>
              <div class="card-subtitle" id="analyticsChartSubtitle">All platforms · Last 30 days</div>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="filter-btn active" data-range="30">30D</button>
              <button class="filter-btn" data-range="14">14D</button>
              <button class="filter-btn" data-range="7">7D</button>
            </div>
          </div>
          <div id="analyticsLineChart" style="height:220px;"></div>
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:16px;" id="analyticsLineLegend"></div>
        </div>

        <!-- Engagement Per Platform + Breakdown + Geo -->
        <div class="grid-3" style="margin-bottom:24px;">
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Engagement Rate</div>
                <div class="card-subtitle">% of audience interacting</div>
              </div>
            </div>
            <div id="engagementBarChart" style="height:220px;"></div>
          </div>
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Audience Distribution</div>
                <div class="card-subtitle">Followers by platform</div>
              </div>
            </div>
            <div id="platformBreakdownChart"></div>
          </div>
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Audience Geography</div>
                <div class="card-subtitle">Top countries by followers</div>
              </div>
            </div>
            <div id="geographyBreakdownChart"></div>
          </div>
        </div>

        <!-- Heatmap -->
        <div class="card" style="margin-bottom:24px;">
          <div class="card-header">
            <div>
              <div class="card-title">🔥 Best Time to Post — Engagement Heatmap</div>
              <div class="card-subtitle">Darker = higher engagement. Hover for details.</div>
            </div>
            <div style="display:flex;align-items:center;gap:6px;font-size:0.72rem;color:rgba(255,255,255,0.4);">
              <span>Low</span>
              ${[0.05,0.15,0.35,0.55,0.75,1].map(a=>`<span style="width:14px;height:14px;border-radius:3px;background:rgba(168,85,247,${a});display:inline-block;"></span>`).join('')}
              <span>Peak</span>
            </div>
          </div>
          <div id="heatmapChart"></div>
        </div>

        <!-- Per-Platform Detailed Stats -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Platform Performance Summary</div>
          </div>
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
              <thead>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                  ${['Platform','Followers','Growth','Engagement','Reach','Posts'].map(h=>
                    `<th style="text-align:left;padding:10px 14px;font-size:0.75rem;font-weight:600;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.05em;">${h}</th>`
                  ).join('')}
                </tr>
              </thead>
              <tbody id="analyticsTableBody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function init() {
    renderCharts('all');
    setupFilters();
    renderTable(ACCOUNTS);
  }

  function renderCharts(platformFilter) {
    activePlatform = platformFilter;
    const accounts = platformFilter === 'all' ? ACCOUNTS : ACCOUNTS.filter(a => a.platform === platformFilter);

    // Line Chart
    const lineWrap = document.getElementById('analyticsLineChart');
    if (lineWrap) {
      const datasets = accounts.slice(0, 4).map(acc => {
        const plat = getPlatform(acc.platform);
        const hist = GROWTH_HISTORY[acc.platform] || [];
        return { label: plat?.name, color: plat?.color, data: hist.map(h => h.value) };
      });
      const labels = (GROWTH_HISTORY['instagram'] || []).map(h => {
        const d = new Date(h.date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      Charts.renderLineChart(lineWrap, datasets, labels, { height: 220 });

      const legend = document.getElementById('analyticsLineLegend');
      if (legend) {
        legend.innerHTML = datasets.map(ds =>
          `<div style="display:flex;align-items:center;gap:6px;font-size:0.78rem;color:rgba(255,255,255,0.6);">
            <span style="width:16px;height:3px;border-radius:2px;background:${ds.color};display:block;"></span>${ds.label}
          </div>`
        ).join('');
      }
    }

    // Engagement Bar Chart
    const engBar = document.getElementById('engagementBarChart');
    if (engBar) {
      Charts.renderBarChart(engBar, accounts.map(acc => ({
        label: getPlatform(acc.platform)?.name?.split('/')[0] || acc.platform,
        value: acc.engaged,
        color: getPlatform(acc.platform)?.color || '#a855f7'
      })), { height: 220 });
    }

    // Platform Breakdown
    const breakdown = document.getElementById('platformBreakdownChart');
    if (breakdown) {
      Charts.renderPlatformBreakdown(
        breakdown, 
        ANALYTICS.platformBreakdown.filter(p => platformFilter === 'all' ? true : p.platform === platformFilter),
        {
          onRowClick: (platform) => {
            const btn = document.querySelector(`[data-analytic-platform="${platform}"]`);
            if (btn) btn.click();
          }
        }
      );
    }
    
    // Geography Breakdown
    const geo = document.getElementById('geographyBreakdownChart');
    if (geo) {
      Charts.renderGeographyBreakdown(geo, window.BoosterXData.getGeography(platformFilter));
    }

    // Heatmap
    const heatmap = document.getElementById('heatmapChart');
    if (heatmap) {
      if (window.BoosterXData.ACTIVE_TIER === 'free' || window.BoosterXData.ACTIVE_TIER === 'creator') {
        heatmap.innerHTML = `
          <div style="padding:40px 20px;text-align:center;background:rgba(255,255,255,0.02);border-radius:12px;">
            <div style="font-size:2rem;margin-bottom:12px;opacity:0.8;">🔒</div>
            <div style="font-weight:700;margin-bottom:6px;">Heatmap Locked</div>
            <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:16px;">Upgrade to Pro to see your audience's exact active times.</div>
            <a href="landing.html?v=2#upgrade" class="btn btn-primary btn-sm" style="text-decoration:none;">Upgrade to Pro</a>
          </div>`;
      } else {
        Charts.renderHeatmap(heatmap, HEATMAP);
      }
    }

    // Update subtitle
    const sub = document.getElementById('analyticsChartSubtitle');
    if (sub) {
      sub.textContent = platformFilter === 'all'
        ? 'All platforms · Last 30 days'
        : `${getPlatform(platformFilter)?.name} · Last 30 days`;
    }
  }

  function renderTable(accounts) {
    const tbody = document.getElementById('analyticsTableBody');
    if (!tbody) return;
    tbody.innerHTML = accounts.map((acc, i) => {
      const plat = getPlatform(acc.platform);
      const growthColor = acc.growth >= 0 ? 'var(--emerald-400)' : 'var(--rose-400)';
      return `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);transition:background 0.15s;" 
            onmouseenter="this.style.background='rgba(255,255,255,0.03)'"
            onmouseleave="this.style.background=''">
          <td style="padding:14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:1.2rem;">${plat?.icon}</span>
              <div>
                <div style="font-weight:600;">${plat?.name}</div>
                <div style="font-size:0.72rem;color:rgba(255,255,255,0.4);">${acc.handle}</div>
              </div>
            </div>
          </td>
          <td style="padding:14px;font-weight:700;">${formatNum(acc.followers)}</td>
          <td style="padding:14px;font-weight:700;color:${growthColor};">${acc.growth >= 0 ? '+' : ''}${acc.growth}%</td>
          <td style="padding:14px;"><span style="font-weight:700;">${acc.engaged}%</span></td>
          <td style="padding:14px;">${formatNum(acc.reach)}</td>
          <td style="padding:14px;">${acc.posts}</td>
        </tr>`;
    }).join('');
  }

  function setupFilters() {
    // Platform filter buttons
    document.querySelectorAll('[data-analytic-platform]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-analytic-platform]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const pid = btn.dataset.analyticPlatform;
        renderCharts(pid);
        renderTable(pid === 'all' ? ACCOUNTS : ACCOUNTS.filter(a => a.platform === pid));
      });
    });

    // Range filter buttons
    document.querySelectorAll('[data-range]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-range]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  return { render, init };
})();
