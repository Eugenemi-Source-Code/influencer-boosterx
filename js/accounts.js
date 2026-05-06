/* ============================================================
   ACCOUNTS PAGE
   ============================================================ */
window.AccountsPage = (() => {
  const { PLATFORMS, getPlatform, formatNum } = window.BoosterXData;

  // We no longer track local state uniquely, we'll read direct from global ACCOUNTS array
  // but we can create a getter for convenience
  function getLocalAccounts() {
    return window.BoosterXData.ACCOUNTS || [];
  }

  function render() {
    const localAccounts = getLocalAccounts();
    return `
      <div class="page-enter">
        <div class="page-header">
          <div>
            <h1 class="page-title">Linked Accounts</h1>
            <p class="page-subtitle">Manage your social media profiles and connections.</p>
          </div>
          <button class="btn btn-primary float-action" id="btnAddAccount">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Account
          </button>
        </div>

        <!-- Connected Summary -->
        <div class="grid-4" style="margin-bottom:28px;" id="accountSummaryGrid">
          <div class="stat-card">
            <div class="stat-card-icon" style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.25);">🔗</div>
            <div class="stat-card-value" id="connectedCount">${localAccounts.filter(a=>a.connected).length}</div>
            <div class="stat-card-label">Connected Accounts</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.25);">👥</div>
            <div class="stat-card-value">${formatNum(localAccounts.reduce((s,a)=>s+a.followers,0))}</div>
            <div class="stat-card-label">Total Followers</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background:rgba(6,182,212,0.15);border:1px solid rgba(6,182,212,0.25);">📊</div>
            <div class="stat-card-value">${(localAccounts.reduce((s,a)=>s+a.engaged,0)/localAccounts.length).toFixed(1)}%</div>
            <div class="stat-card-label">Avg. Engagement</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.25);">🌐</div>
            <div class="stat-card-value">${PLATFORMS.length}</div>
            <div class="stat-card-label">Supported Platforms</div>
          </div>
        </div>

        <!-- Connected Accounts -->
        <div style="margin-bottom:24px;">
          <h2 style="font-size:0.95rem;font-weight:700;margin-bottom:16px;color:rgba(255,255,255,0.7);">
            Connected (${localAccounts.filter(a=>a.connected).length})
          </h2>
          <div class="grid-3 stagger-children" id="connectedAccountsGrid"></div>
        </div>

        <!-- Available Platforms -->
        <div>
          <h2 style="font-size:0.95rem;font-weight:700;margin-bottom:16px;color:rgba(255,255,255,0.7);">
            Add More Platforms
          </h2>
          <div class="grid-auto" id="availablePlatformsGrid"></div>
        </div>
      </div>
    `;
  }

  function renderAccountCard(acc, i) {
    const plat = getPlatform(acc.platform);
    const growthClass = acc.growth >= 0 ? 'up' : 'down';
    return `
      <div class="account-card platform-${acc.platform} card-entrance hover-lift" 
           style="animation-delay:${i * 0.07}s" data-account-id="${acc.id}">
        <div class="account-card-header">
          <div class="account-platform-icon">${plat?.icon || '📱'}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:0.9rem;">${plat?.name}</div>
            <div class="account-handle truncate">${acc.handle}</div>
          </div>
          <div class="account-status ${acc.connected ? 'connected' : 'disconnected'}">
            <div class="account-status-dot"></div>
            ${acc.connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        <div class="account-stats">
          <div class="account-stat-item">
            <div class="account-stat-value">${formatNum(acc.followers)}</div>
            <div class="account-stat-label">Followers</div>
          </div>
          <div class="account-stat-item">
            <div class="account-stat-value">${acc.posts}</div>
            <div class="account-stat-label">Posts</div>
          </div>
          <div class="account-stat-item">
            <div class="account-stat-value ${growthClass}" style="color:${acc.growth>=0?'var(--emerald-400)':'var(--rose-400)'}">
              ${acc.growth >= 0 ? '+' : ''}${acc.growth}%
            </div>
            <div class="account-stat-label">Growth</div>
          </div>
        </div>

        <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06);">
          <div class="metric-row" style="padding:6px 0;">
            <span class="metric-row-label">Engagement Rate</span>
            <span class="metric-row-value">${acc.engaged}%</span>
          </div>
          <div class="metric-row" style="padding:6px 0;">
            <span class="metric-row-label">Monthly Reach</span>
            <span class="metric-row-value">${formatNum(acc.reach)}</span>
          </div>
          <div class="metric-row" style="padding:6px 0;border-bottom:none;">
            <span class="metric-row-label">Following</span>
            <span class="metric-row-value">${formatNum(acc.following)}</span>
          </div>
        </div>

        <div class="account-card-actions">
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="window.AccountsPage.viewAccount('${acc.id}')">
            View Details
          </button>
          <button class="btn btn-ghost btn-sm btn-icon-sm" title="Disconnect" onclick="window.AccountsPage.toggleConnect('${acc.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>
            </svg>
          </button>
        </div>
      </div>`;
  }

  function renderAvailableCard(plat) {
    const localAccounts = getLocalAccounts();
    const already = localAccounts.find(a => a.platform === plat.id);
    if (already) return '';
    return `
      <div class="add-platform-card hover-lift" onclick="window.AccountsPage.connectPlatform('${plat.id}')">
        <div class="add-icon">${plat.icon}</div>
        <div style="font-weight:700;font-size:0.9rem;">${plat.name}</div>
        <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);">Click to connect</div>
      </div>`;
  }

  function init() {
    renderConnected();
    renderAvailable();
    document.getElementById('btnAddAccount')?.addEventListener('click', showAddModal);
  }

  function renderConnected() {
    const localAccounts = getLocalAccounts();
    const grid = document.getElementById('connectedAccountsGrid');
    if (!grid) return;
    grid.innerHTML = localAccounts
      .filter(a => a.connected)
      .map((acc, i) => renderAccountCard(acc, i))
      .join('');
    // Update count
    const cnt = document.getElementById('connectedCount');
    if (cnt) cnt.textContent = localAccounts.filter(a=>a.connected).length;
  }

  function renderAvailable() {
    const grid = document.getElementById('availablePlatformsGrid');
    if (!grid) return;
    const cards = PLATFORMS.map(p => renderAvailableCard(p)).filter(Boolean);
    grid.innerHTML = cards.length ? cards.join('') : '<p class="text-muted text-sm">All platforms are connected!</p>';
  }

  function viewAccount(id) {
    const localAccounts = getLocalAccounts();
    const acc = localAccounts.find(a => a.id === id);
    if (!acc) return;
    const plat = getPlatform(acc.platform);
    const content = `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px;">
        <div style="width:56px;height:56px;border-radius:14px;background:${plat?.grad};
          display:flex;align-items:center;justify-content:center;font-size:1.6rem;">${plat?.icon}</div>
        <div>
          <div style="font-size:1.2rem;font-weight:700;">${plat?.name}</div>
          <div style="color:rgba(255,255,255,0.5);font-size:0.85rem;">${acc.handle}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
        ${[
          ['Followers', formatNum(acc.followers)],
          ['Following', formatNum(acc.following)],
          ['Total Posts', acc.posts],
          ['Engagement', acc.engaged + '%'],
          ['Monthly Reach', formatNum(acc.reach)],
          ['Growth (30d)', (acc.growth >= 0 ? '+' : '') + acc.growth + '%'],
        ].map(([l,v]) => `
          <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px;">
            <div style="font-size:0.72rem;color:rgba(255,255,255,0.4);margin-bottom:4px;">${l}</div>
            <div style="font-size:1.1rem;font-weight:800;">${v}</div>
          </div>`).join('')}
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-primary" style="flex:1;" onclick="window.BoosterXApp.navigate('analytics')">View Analytics</button>
        <button class="btn btn-secondary" onclick="window.AccountsPage.toggleConnect('${id}');window.BoosterXApp.closeModal();">
          Disconnect
        </button>
      </div>`;
    window.BoosterXApp.openModal(content);
  }

  function toggleConnect(id) {
    const localAccounts = getLocalAccounts();
    const acc = localAccounts.find(a => a.id === id);
    if (!acc) return;
    acc.connected = !acc.connected;
    window.BoosterXApp.showToast(
      acc.connected ? `✅ ${getPlatform(acc.platform)?.name} reconnected!` : `⚠️ ${getPlatform(acc.platform)?.name} disconnected`,
      acc.connected ? 'success' : 'info'
    );
    renderConnected();
    renderAvailable();
  }

  function connectPlatform(pid) {
    const plat = getPlatform(pid);
    const content = `
      <div class="modal-title">Connect ${plat?.name}</div>
      <div class="modal-subtitle">Enter your ${plat?.name} account details to link it to BoosterX.</div>
      <div class="form-group">
        <label class="form-label">${plat?.name} Handle / Username</label>
        <input class="form-input" id="connectHandle" placeholder="@yourusername" />
      </div>
      <div class="form-group">
        <label class="form-label">Display Name</label>
        <input class="form-input" id="connectName" placeholder="Your Name" />
      </div>
      <div style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);border-radius:12px;padding:14px;margin-bottom:20px;">
        <p style="font-size:0.8rem;color:rgba(255,255,255,0.6);">
          🔒 In a real app, this would use OAuth to securely connect your account. Your credentials are never stored.
        </p>
      </div>
      <button class="btn btn-primary w-full" onclick="window.AccountsPage.confirmConnect('${pid}')">
        Connect ${plat?.name}
      </button>`;
    window.BoosterXApp.openModal(content);
  }

  async function confirmConnect(pid) {
    const localAccounts = getLocalAccounts();
    const tier = window.BoosterXData.ACTIVE_TIER;
    
    if (tier === 'free' && localAccounts.length >= 1) {
      window.BoosterXApp.showToast('Free tier allows a maximum of 1 connected account. Please upgrade to connect more.', 'error');
      window.BoosterXApp.closeModal();
      return;
    }

    const handle = document.getElementById('connectHandle')?.value || `@user_${pid}`;
    const plat = getPlatform(pid);
    
    // Create random mock metrics for testing the chart features
    const newAcc = {
      client_id: window.BoosterXData.currentClientId,
      platform: pid,
      handle: handle.startsWith('@') ? handle : '@' + handle,
      followers: Math.floor(Math.random() * 50000) + 1000,
      following: Math.floor(Math.random() * 1000),
      posts_count: Math.floor(Math.random() * 200) + 10,
      engagement_rate: (Math.random() * 5 + 1).toFixed(1) * 1,
      reach: Math.floor(Math.random() * 200000) + 10000,
      is_connected: true,
      growth: (Math.random() * 10 - 2).toFixed(1) * 1,
    };

    try {
      await window.BoosterXSupabase.addAccount(newAcc);
      window.BoosterXApp.closeModal();
      window.BoosterXApp.showToast(`🎉 ${plat?.name} connected successfully!`, 'success');
      
      // Reload Data from Supabase and Re-render Page
      await window.BoosterXData.initData();
      window.BoosterXApp.navigate('accounts');
    } catch (e) {
      window.BoosterXApp.showToast('Error connecting account: ' + e.message, 'error');
    }
  }

  function showAddModal() {
    const localAccounts = getLocalAccounts();
    const unlinked = PLATFORMS.filter(p => !localAccounts.find(a => a.platform === p.id));
    const content = `
      <div class="modal-title">Add a Platform</div>
      <div class="modal-subtitle">Choose a social platform to connect.</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px;">
        ${PLATFORMS.map(p => `
          <div onclick="window.AccountsPage.connectPlatform('${p.id}')"
            style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:12px;
              background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);
              cursor:pointer;transition:all 0.2s;" 
            onmouseenter="this.style.borderColor='rgba(168,85,247,0.4)'"
            onmouseleave="this.style.borderColor='rgba(255,255,255,0.08)'">
            <span style="font-size:1.4rem;">${p.icon}</span>
            <span style="font-size:0.85rem;font-weight:600;">${p.name}</span>
          </div>`).join('')}
      </div>`;
    window.BoosterXApp.openModal(content);
  }

  return { render, init, viewAccount, toggleConnect, connectPlatform, confirmConnect };
})();
