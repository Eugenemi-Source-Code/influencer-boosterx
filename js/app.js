/* ============================================================
   INFLUENCER BOOSTERX — APP.JS
   Router, state, navigation, theme, modals, toasts, settings
   ============================================================ */

window.BoosterXApp = (() => {
  /* ---- State ---- */
  const state = {
    currentPage: 'dashboard',
    sidebarCollapsed: false,
    darkMode: true,
  };

  let TIER = 'free';
  const RESTRICTIONS = {
    free: ['analytics', 'posts', 'tips', 'ai-studio'],
    creator: [], // Pages open, but features restricted inside
    pro: [],
    agency: []
  };

  function renderPaywall(pageObj) {
    return `
      <div class="empty-state" style="padding-top:120px;">
        <div class="empty-state-icon" style="opacity:1; font-size:4rem; margin-bottom:16px;">🔒</div>
        <h2 class="empty-state-title" style="font-size:1.8rem; margin-bottom:12px;">${pageObj.label} is Locked</h2>
        <p class="empty-state-subtitle" style="margin-bottom:24px; max-width:400px; line-height:1.5;">This feature is not available on your current plan. Upgrade your subscription to unlock powerful new capabilities.</p>
        <a href="landing.html?v=2#upgrade" class="btn btn-primary btn-lg" style="text-decoration:none;">Upgrade Plan</a>
      </div>
    `;
  }

  /* ---- Page Registry ---- */
  const PAGES = {
    dashboard: { module: window.DashboardPage,  label: 'Dashboard',       icon: '🏠' },
    accounts:  { module: window.AccountsPage,   label: 'Linked Accounts', icon: '🔗' },
    analytics: { module: window.AnalyticsPage,  label: 'Analytics',       icon: '📊' },
    posts:     { module: window.PostsPage,       label: 'Posts Tracker',   icon: '📝' },
    tips:      { module: window.TipsPage,        label: 'Growth Tips',     icon: '🚀' },
    'ai-studio': { module: window.AIStudioPage, label: 'AI Studio', icon: '✨' },
    clients:   { module: window.ClientsPage,     label: 'Manage Clients',  icon: '👥' },
    settings:  { module: null,                   label: 'Settings',        icon: '⚙️' },
  };

  /* ---- Init ---- */
  function init() {
    TIER = window.BoosterXData.ACTIVE_TIER;
    setupDate();
    setupSidebar();
    setupTheme();
    setupModal();
    setupMobileMenu();
    loadUserProfile();

    // Populate Agency UI if applicable
    if (TIER === 'agency') {
      const selector = document.getElementById('agencyClientSelector');
      const selectObj = document.getElementById('topbarClientSelect');
      const sectionLabel = document.getElementById('agencySectionLabel');
      const navItem = document.getElementById('nav-clients');
      
      if (selector && selectObj) {
        selector.style.display = 'flex';
        selectObj.innerHTML = window.BoosterXData.AGENCY_CLIENTS.map(c => 
          `<option value="${c.id}" ${c.id === window.BoosterXData.currentClientId ? 'selected' : ''}>${c.name}</option>`
        ).join('');
      }
      if (sectionLabel) sectionLabel.style.display = 'block';
      if (navItem) navItem.style.display = 'flex';
    }

    // Hash-based routing
    const hash = location.hash.replace('#', '') || 'dashboard';
    navigate(hash in PAGES ? hash : 'dashboard');

    window.addEventListener('hashchange', () => {
      const p = location.hash.replace('#', '');
      if (p in PAGES && p !== state.currentPage) navigate(p, false);
    });

    // Global Export PDF
    const btnExport = document.getElementById('btnGlobalExport');
    if (btnExport) {
      btnExport.addEventListener('click', exportToPDF);
    }
  }

  /* ---- Export PDF ---- */
  function exportToPDF() {
    if (typeof html2pdf === 'undefined') {
      showToast('PDF Engine is loading. Please try again in a moment.', 'error');
      return;
    }

    const element = document.getElementById('mainContent');
    const btn = document.getElementById('btnGlobalExport');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<span style="margin-right:6px;">⌛</span> Exporting...';
    btn.disabled = true;

    const topbar = document.querySelector('.topbar');
    if (topbar) topbar.style.display = 'none';

    // To prevent the scrollbar from messing up the export, we can set overflow hidden
    const origOverflow = element.style.overflowY;
    element.style.overflowY = 'visible';

    const clientName = window.BoosterXData.currentClientId 
      ? window.BoosterXData.AGENCY_CLIENTS?.find(c => c.id === window.BoosterXData.currentClientId)?.name || 'Report'
      : window.BoosterXData.USER.name;

    const bgColor = state.darkMode ? '#080810' : '#f0f0f8';

    const opt = {
      margin:       10,
      filename:     `${clientName.replace(/\s+/g, '_')}_BoosterX_Report.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, windowWidth: 1200, backgroundColor: bgColor },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      if (topbar) topbar.style.display = '';
      element.style.overflowY = origOverflow;
      btn.innerHTML = originalText;
      btn.disabled = false;
      showToast('PDF Exported Successfully!', 'success');
    }).catch(err => {
      if (topbar) topbar.style.display = '';
      element.style.overflowY = origOverflow;
      btn.innerHTML = originalText;
      btn.disabled = false;
      showToast('Error exporting PDF.', 'error');
      console.error(err);
    });
  }

  /* ---- Navigation ---- */
  function navigate(page, pushHash = true) {
    if (!(page in PAGES)) page = 'dashboard';
    state.currentPage = page;
    if (pushHash) location.hash = page;

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Breadcrumb
    const bc = document.getElementById('breadcrumbPage');
    if (bc) bc.textContent = PAGES[page]?.label || page;

    // Render page
    const container = document.getElementById('pageContainer');
    if (!container) return;

    const pageObj = PAGES[page];
    const isRestricted = RESTRICTIONS[TIER]?.includes(page);

    if (isRestricted) {
      container.innerHTML = renderPaywall(pageObj);
    } else if (page === 'settings') {
      container.innerHTML = renderSettings();
      initSettings();
    } else if (pageObj?.module) {
      container.innerHTML = pageObj.module.render();
      setTimeout(() => pageObj.module.init(), 50);
    }

    // Scroll to top
    container.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile sidebar
    document.getElementById('sidebar')?.classList.remove('mobile-open');
  }

  /* ---- Settings Page (inline) ---- */
  function renderSettings() {
    return `
      <div class="page-enter">
        <div class="page-header">
          <div>
            <h1 class="page-title">Settings</h1>
            <p class="page-subtitle">Manage your profile, preferences, and account settings.</p>
          </div>
        </div>

        <!-- Profile -->
        <div class="settings-section" style="margin-bottom:20px;">
          <div class="settings-section-header">
            <div class="settings-section-title">Profile</div>
            <div class="settings-section-subtitle">Your public influencer profile</div>
          </div>
          <div style="padding:24px;display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
            <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#a855f7,#06b6d4);
              display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:800;color:white;
              box-shadow:0 0 24px rgba(168,85,247,0.4);flex-shrink:0;" id="settingsAvatarDisplay">
              ${window.BoosterXData.USER.avatar || 'A'}
            </div>
            <div style="flex:1;min-width:200px;">
              <div style="font-size:1.2rem;font-weight:800;" id="settingsNameDisplay">${window.BoosterXData.USER.name || 'User'}</div>
              <div style="font-size:0.85rem;color:rgba(255,255,255,0.5);">${window.BoosterXData.USER.email || ''}</div>
              <div style="display:flex;gap:8px;margin-top:10px;">
                <span class="badge badge-purple">${window.BoosterXData.ACTIVE_TIER.toUpperCase()}</span>
                <span class="badge badge-emerald">✓ Verified</span>
              </div>
            </div>
            <button class="btn btn-secondary" onclick="window.BoosterXApp.showEditProfile()">Edit Profile</button>
          </div>
          <div style="padding:0 24px 24px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
            ${[
              ['Total Followers', window.BoosterXData.formatNum(window.BoosterXData.ANALYTICS.totalFollowers || 0)],
              ['Platforms', window.BoosterXData.ACCOUNTS.length],
              ['Total Posts', window.BoosterXData.ANALYTICS.totalPosts || 0],
            ].map(([l,v]) => `
              <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:14px;text-align:center;">
                <div style="font-size:1.3rem;font-weight:800;">${v}</div>
                <div style="font-size:0.72rem;color:rgba(255,255,255,0.4);margin-top:3px;">${l}</div>
              </div>`).join('')}
          </div>
        </div>

        <!-- Appearance -->
        <div class="settings-section" style="margin-bottom:20px;">
          <div class="settings-section-header">
            <div class="settings-section-title">Appearance</div>
            <div class="settings-section-subtitle">Customize your interface</div>
          </div>
          <div class="settings-row">
            <div class="settings-row-info">
              <div class="settings-row-label">Dark Mode</div>
              <div class="settings-row-desc">Use the dark theme (recommended for creators)</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="toggleDark" ${state.darkMode ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="settings-row">
            <div class="settings-row-info">
              <div class="settings-row-label">Compact Sidebar</div>
              <div class="settings-row-desc">Show icon-only sidebar navigation</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="toggleCompact" ${state.sidebarCollapsed ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Notifications -->
        <div class="settings-section" style="margin-bottom:20px;">
          <div class="settings-section-header">
            <div class="settings-section-title">Notifications</div>
            <div class="settings-section-subtitle">Control when and how you receive alerts</div>
          </div>
          ${[
            ['Push Notifications', 'Get notified about post performance milestones', true],
            ['Weekly Digest Email', 'Receive a weekly summary of your analytics', true],
            ['Follower Milestone Alerts', 'Alert when you hit a new follower milestone', true],
            ['New Tip Alerts', 'Get notified when new growth tips are available', false],
            ['Brand Deal Opportunities', 'Receive notifications about brand collaborations', false],
          ].map(([l,d,checked], i) => `
            <div class="settings-row">
              <div class="settings-row-info">
                <div class="settings-row-label">${l}</div>
                <div class="settings-row-desc">${d}</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${checked ? 'checked' : ''} class="notif-toggle" />
                <span class="toggle-slider"></span>
              </label>
            </div>`).join('')}
        </div>

        <!-- Connected Apps -->
        <div class="settings-section" style="margin-bottom:20px;">
          <div class="settings-section-header">
            <div class="settings-section-title">Connected Platforms</div>
            <div class="settings-section-subtitle">Manage your social media connections</div>
          </div>
          ${window.BoosterXData.ACCOUNTS.map(acc => {
            const plat = window.BoosterXData.getPlatform(acc.platform);
            return `
              <div class="settings-row">
                <div style="display:flex;align-items:center;gap:12px;flex:1;">
                  <span style="font-size:1.3rem;">${plat?.icon}</span>
                  <div>
                    <div class="settings-row-label">${plat?.name}</div>
                    <div class="settings-row-desc">${acc.handle}</div>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="font-size:0.72rem;color:var(--emerald-400);font-weight:600;">● Connected</span>
                  <button class="btn btn-ghost btn-sm" onclick="window.BoosterXApp.navigate('accounts')">Manage</button>
                </div>
              </div>`;
          }).join('')}
        </div>

        <!-- Danger Zone -->
        <div class="settings-section">
          <div class="settings-section-header">
            <div class="settings-section-title" style="color:var(--rose-400);">Danger Zone</div>
          </div>
          <div class="settings-row">
            <div class="settings-row-info">
              <div class="settings-row-label">Clear All Analytics Data</div>
              <div class="settings-row-desc">This will permanently delete all your tracked data.</div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="window.BoosterXApp.showToast('This action is disabled in demo mode.','error')">
              Clear Data
            </button>
          </div>
          <div class="settings-row">
            <div class="settings-row-info">
              <div class="settings-row-label">Delete Account</div>
              <div class="settings-row-desc">Permanently delete your BoosterX account and data.</div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="window.BoosterXApp.showToast('This action is disabled in demo mode.','error')">
              Delete Account
            </button>
          </div>
        </div>
      </div>`;
  }

  function initSettings() {
    const toggleDark = document.getElementById('toggleDark');
    if (toggleDark) {
      toggleDark.addEventListener('change', (e) => {
        state.darkMode = e.target.checked;
        applyTheme();
        showToast(state.darkMode ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'info');
      });
    }
    const toggleCompact = document.getElementById('toggleCompact');
    if (toggleCompact) {
      toggleCompact.addEventListener('change', (e) => {
        toggleSidebar(e.target.checked);
      });
    }
    document.querySelectorAll('.notif-toggle').forEach(t => {
      t.addEventListener('change', () => showToast('Notification preference saved.', 'success'));
    });
  }

  function showEditProfile() {
    const content = `
      <div class="modal-title">Edit Profile</div>
      <div class="modal-subtitle">Update your influencer profile details.</div>
      <div class="form-group">
        <label class="form-label">Display Name</label>
        <input class="form-input" id="editName" value="${window.BoosterXData.USER.name || ''}" />
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" id="editEmail" value="${window.BoosterXData.USER.email || ''}" disabled />
      </div>
      <div class="form-group">
        <label class="form-label">Bio</label>
        <textarea class="form-textarea" id="editBio" placeholder="Tell brands and followers about yourself…" style="min-height:80px;"></textarea>
      </div>
      <button class="btn btn-primary w-full" onclick="window.BoosterXApp.saveProfile()">
        Save Changes
      </button>`;
    openModal(content);
  }

  function saveProfile() {
    const name = document.getElementById('editName')?.value || state.user.name;
    const handle = document.getElementById('editHandle')?.value || state.user.handle;
    const niche = document.getElementById('editNiche')?.value || state.user.niche;
    state.user.name = name;
    state.user.handle = handle;
    state.user.niche = niche;
    state.user.avatar = name.charAt(0).toUpperCase();
    loadUserProfile();
    closeModal();
    showToast('✅ Profile updated successfully!', 'success');
    // Re-render settings if on that page
    if (state.currentPage === 'settings') navigate('settings');
  }

  /* ---- Sidebar ---- */
  function setupSidebar() {
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => toggleSidebar());
    }
    // Nav item clicks
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(item.dataset.page);
      });
    });
  }

  function toggleSidebar(forceCollapsed) {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('mainContent');
    if (!sidebar || !main) return;
    state.sidebarCollapsed = forceCollapsed !== undefined ? forceCollapsed : !state.sidebarCollapsed;
    sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
    main.classList.toggle('expanded', state.sidebarCollapsed);
  }

  /* ---- Mobile Menu ---- */
  function setupMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target)) {
          sidebar.classList.remove('mobile-open');
        }
      });
    }
  }

  /* ---- Theme ---- */
  function setupTheme() {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.addEventListener('click', () => {
      state.darkMode = !state.darkMode;
      applyTheme();
      showToast(state.darkMode ? '🌙 Dark mode' : '☀️ Light mode', 'info');
    });
    applyTheme();
  }

  function applyTheme() {
    document.body.classList.toggle('light-theme', !state.darkMode);
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.innerHTML = state.darkMode
        ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    }
  }

  /* ---- Date ---- */
  function setupDate() {
    const el = document.getElementById('topbarDate');
    if (el) {
      const now = new Date();
      el.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  }

  /* ---- User Profile ---- */
  function loadUserProfile() {
    const u = window.BoosterXData.USER || {};
    const initial = u.avatar || (u.name ? u.name.charAt(0).toUpperCase() : 'A');
    ['sidebarAvatar', 'topbarAvatar'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = initial;
    });
    const nameEl = document.getElementById('sidebarName');
    if (nameEl) nameEl.textContent = u.name || 'User';
  }

  /* ---- Modal ---- */
  function setupModal() {
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('modalClose');
    if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  function openModal(htmlContent) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    if (!overlay || !content) return;
    content.innerHTML = htmlContent;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---- Toasts ---- */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
      error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-message">${message}</div>`;
    container.append(toast);
    toast.addEventListener('click', () => removeToast(toast));

    setTimeout(() => removeToast(toast), 3500);
  }

  function removeToast(toast) {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }

  /* ---- Public API ---- */
  return {
    init, navigate, openModal, closeModal, showToast,
    showEditProfile, saveProfile, toggleSidebar, exportToPDF,
    getState: () => state,
  };
})();

/* ---- Bootstrap ---- */
document.addEventListener('DOMContentLoaded', async () => {
  // If not on landing page, wait for data
  if (!window.location.pathname.includes('landing.html')) {
    await window.BoosterXData.initData();
  }
  window.BoosterXApp.init();
});
