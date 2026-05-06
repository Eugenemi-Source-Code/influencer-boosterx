/* ============================================================
   POSTS TRACKER PAGE
   ============================================================ */
window.PostsPage = (() => {
  const { POSTS, getPlatform, formatNum } = window.BoosterXData;
  let filtered = [...POSTS];
  let activePlatform = 'all';
  let activeSort = 'date';
  let searchQuery = '';

  function render() {
    return `
      <div class="page-enter">
        <div class="page-header">
          <div>
            <h1 class="page-title">Posts Tracker</h1>
            <p class="page-subtitle">Track every post across all your platforms in one unified feed.</p>
          </div>
          <button class="btn btn-primary float-action" id="btnNewPost">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Post
          </button>
        </div>

        <!-- Stats Row -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="stat-card">
            <div class="stat-card-icon" style="background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.2);">📝</div>
            <div class="stat-card-value">${POSTS.length}</div>
            <div class="stat-card-label">Total Posts Tracked</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.2);">❤️</div>
            <div class="stat-card-value">${formatNum(POSTS.reduce((s,p)=>s+p.likes,0))}</div>
            <div class="stat-card-label">Total Likes</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background:rgba(6,182,212,0.15);border:1px solid rgba(6,182,212,0.2);">👁️</div>
            <div class="stat-card-value">${formatNum(POSTS.reduce((s,p)=>s+p.reach,0))}</div>
            <div class="stat-card-label">Total Reach</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.2);">💫</div>
            <div class="stat-card-value">${(POSTS.reduce((s,p)=>s+p.engagement,0)/POSTS.length).toFixed(1)}%</div>
            <div class="stat-card-label">Avg. Engagement</div>
          </div>
        </div>

        <!-- Filters & Search -->
        <div class="card" style="margin-bottom:20px;padding:16px 20px;">
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <!-- Search -->
            <div class="search-bar" style="flex:1;min-width:200px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" id="postSearch" placeholder="Search posts…" />
            </div>
            <!-- Sort -->
            <select class="form-select" id="postSort" style="width:auto;min-width:160px;">
              <option value="date">Sort: Newest</option>
              <option value="likes">Sort: Most Liked</option>
              <option value="engagement">Sort: Engagement</option>
              <option value="reach">Sort: Most Reach</option>
            </select>
          </div>

          <!-- Platform Filters -->
          <div class="filter-bar" style="margin-top:12px;margin-bottom:0;">
            <button class="filter-btn active" data-post-platform="all">All</button>
            ${[...new Set(POSTS.map(p=>p.platform))].map(pid => {
              const plat = getPlatform(pid);
              return `<button class="filter-btn" data-post-platform="${pid}">${plat?.icon} ${plat?.name}</button>`;
            }).join('')}
          </div>
        </div>

        <!-- Posts List -->
        <div id="postsList" style="display:flex;flex-direction:column;gap:10px;"></div>

        <!-- Empty state -->
        <div id="postsEmpty" class="empty-state" style="display:none;">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-title">No posts found</div>
          <div class="empty-state-subtitle">Try adjusting your search or filters.</div>
        </div>
      </div>
    `;
  }

  function renderPosts() {
    // Filter
    let list = [...POSTS];
    if (activePlatform !== 'all') list = list.filter(p => p.platform === activePlatform);
    if (searchQuery) list = list.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

    // Sort
    if (activeSort === 'likes') list.sort((a,b) => b.likes - a.likes);
    else if (activeSort === 'engagement') list.sort((a,b) => b.engagement - a.engagement);
    else if (activeSort === 'reach') list.sort((a,b) => b.reach - a.reach);
    else list.sort((a,b) => a.daysAgo - b.daysAgo);

    filtered = list;

    const container = document.getElementById('postsList');
    const empty = document.getElementById('postsEmpty');
    if (!container) return;

    if (!list.length) {
      container.innerHTML = '';
      if (empty) empty.style.display = 'flex';
      return;
    }
    if (empty) empty.style.display = 'none';

    container.innerHTML = list.map((post, i) => {
      const plat = getPlatform(post.platform);
      const engColor = post.engagement >= 6 ? 'var(--emerald-400)' : post.engagement >= 3 ? 'var(--amber-400)' : 'var(--text-secondary)';
      
      let mediaHtml = '';
      if (post.media_url) {
        const isVideo = post.media_url.match(/\.(mp4|webm|mov)$/i);
        if (isVideo) {
          mediaHtml = `<div style="margin-top:12px; border-radius:8px; overflow:hidden;"><video src="${post.media_url}" controls style="width:100%; max-height:300px; background:#000;"></video></div>`;
        } else {
          mediaHtml = `<div style="margin-top:12px; border-radius:8px; overflow:hidden;"><img src="${post.media_url}" style="width:100%; max-height:300px; object-fit:cover;" /></div>`;
        }
      }

      return `
        <div class="post-item card-entrance" style="animation-delay:${Math.min(i*0.04,0.4)}s"
             onclick="window.PostsPage.viewPost('${post.id}')">
          <div class="post-thumb" style="background:${plat?.grad || '#333'}">${post.emoji}</div>
          <div class="post-info">
            <div class="post-title">${post.title}</div>
            ${mediaHtml}
            <div class="post-meta" style="${post.media_url ? 'margin-top:12px;' : ''}">
              <span class="platform-chip platform-${post.platform}">
                <span class="chip-dot"></span>${plat?.name}
              </span>
              <span class="badge badge-subtle">${post.type}</span>
              <span class="text-xs text-muted">${post.date}</span>
            </div>
            <div class="post-metrics">
              <div class="post-metric">❤️ <strong>${formatNum(post.likes)}</strong></div>
              <div class="post-metric">💬 <strong>${formatNum(post.comments)}</strong></div>
              <div class="post-metric">🔁 <strong>${formatNum(post.shares)}</strong></div>
              <div class="post-metric">👁️ <strong>${formatNum(post.reach)}</strong></div>
              <div class="post-metric" style="color:${engColor};font-weight:700;">
                💫 ${post.engagement}%
              </div>
            </div>
          </div>
          <div class="post-status">
            <span class="badge ${post.status === 'published' ? 'badge-emerald' : 'badge-amber'}">
              ${post.status}
            </span>
          </div>
        </div>`;
    }).join('');
  }

  function viewPost(id) {
    const post = POSTS.find(p => p.id === id);
    if (!post) return;
    const plat = getPlatform(post.platform);
    const engColor = post.engagement >= 6 ? 'var(--emerald-400)' : post.engagement >= 3 ? 'var(--amber-400)' : 'var(--rose-400)';
    const content = `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
        <div style="width:64px;height:64px;border-radius:14px;background:${plat?.grad};
          display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0;">${post.emoji}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:1rem;font-weight:700;margin-bottom:6px;line-height:1.4;">${post.title}</div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span class="platform-chip platform-${post.platform}">
              <span class="chip-dot"></span>${plat?.name}
            </span>
            <span class="badge badge-subtle">${post.type}</span>
            <span class="text-xs text-muted">${post.date}</span>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
        ${[
          ['❤️ Likes', formatNum(post.likes)],
          ['💬 Comments', formatNum(post.comments)],
          ['🔁 Shares', formatNum(post.shares)],
          ['👁️ Reach', formatNum(post.reach)],
          ['📊 Impressions', formatNum(post.impressions)],
          ['🔖 Saves', formatNum(post.saves)],
        ].map(([l,v]) => `
          <div style="background:rgba(255,255,255,0.04);border-radius:12px;padding:12px;text-align:center;">
            <div style="font-size:0.7rem;color:rgba(255,255,255,0.4);margin-bottom:4px;">${l}</div>
            <div style="font-size:1rem;font-weight:800;">${v}</div>
          </div>`).join('')}
      </div>

      <div style="background:rgba(255,255,255,0.04);border-radius:14px;padding:16px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.85rem;color:rgba(255,255,255,0.6);">Engagement Rate</span>
          <span style="font-size:1.5rem;font-weight:900;color:${engColor};">${post.engagement}%</span>
        </div>
        <div class="progress-bar-wrap" style="margin-top:10px;">
          <div class="progress-bar-fill" style="width:${Math.min(post.engagement/10*100,100)}%;background:${engColor};"></div>
        </div>
        <div style="font-size:0.72rem;color:rgba(255,255,255,0.3);margin-top:6px;">
          ${post.engagement >= 6 ? '🔥 Excellent performance!' : post.engagement >= 3 ? '✅ Above average' : '📉 Below average'}
        </div>
      </div>

      <div style="display:flex;gap:10px;">
        <button class="btn btn-primary" style="flex:1;" onclick="window.BoosterXApp.showToast('Opening post...','info');window.BoosterXApp.closeModal();">
          View on ${plat?.name}
        </button>
        <button class="btn btn-secondary" onclick="window.BoosterXApp.closeModal();">Close</button>
      </div>`;
    window.BoosterXApp.openModal(content);
  }

  function showNewPostModal() {
    const content = `
      <div class="modal-title">Create New Post</div>
      <div class="modal-subtitle">Schedule or log a post across your platforms.</div>
      <div class="form-group">
        <label class="form-label">Post Caption</label>
        <textarea class="form-textarea" id="newPostCaption" placeholder="Write your caption here…"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Platform</label>
        <select class="form-select" id="newPostPlatform">
          ${window.BoosterXData.ACCOUNTS.map(a =>
            `<option value="${a.platform}">${getPlatform(a.platform)?.icon} ${getPlatform(a.platform)?.name}</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Upload Media (Optional)</label>
        <input type="file" id="newPostMedia" class="form-input" accept="image/*,video/*" />
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="form-group">
          <label class="form-label">Post Type</label>
          <select class="form-select" id="newPostType">
            <option>photo</option><option>video</option><option>reel</option>
            <option>story</option><option>carousel</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Schedule Date</label>
          <input class="form-input" type="date" id="newPostDate" />
        </div>
      </div>
      <button class="btn btn-primary w-full" id="btnSubmitPost" onclick="window.PostsPage.submitPost()">
        Schedule Post
      </button>`;
    window.BoosterXApp.openModal(content);
    // Set today as default
    const dateInput = document.getElementById('newPostDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
  }

  async function submitPost() {
    const caption = document.getElementById('newPostCaption')?.value;
    const platform = document.getElementById('newPostPlatform')?.value;
    const type = document.getElementById('newPostType')?.value;
    const dateStr = document.getElementById('newPostDate')?.value;
    const mediaInput = document.getElementById('newPostMedia');
    const btn = document.getElementById('btnSubmitPost');

    if (!caption?.trim()) {
      window.BoosterXApp.showToast('Please add a caption!', 'error'); return;
    }
    if (!platform) {
      window.BoosterXApp.showToast('Please select a platform! (You must connect an account first)', 'error'); return;
    }

    try {
      if (btn) {
        btn.innerText = 'Uploading & Scheduling...';
        btn.disabled = true;
      }

      let media_url = null;
      if (mediaInput && mediaInput.files && mediaInput.files.length > 0) {
        const file = mediaInput.files[0];
        media_url = await window.BoosterXSupabase.uploadPostMedia(file);
      }

      const newPost = {
        client_id: window.BoosterXData.currentClientId,
        platform: platform,
        title: caption.substring(0, 50) + (caption.length > 50 ? '...' : ''),
        emoji: '📝',
        type: type || 'photo',
        media_url: media_url,
        likes: Math.floor(Math.random() * 5000),
        comments: Math.floor(Math.random() * 500),
        shares: Math.floor(Math.random() * 200),
        reach: Math.floor(Math.random() * 20000),
        engagement_rate: (Math.random() * 8 + 1).toFixed(1) * 1,
        posted_at: new Date(dateStr).toISOString()
      };

      await window.BoosterXSupabase.addPost(newPost);
      window.BoosterXApp.closeModal();
      window.BoosterXApp.showToast('🎉 Post scheduled successfully!', 'success');
      
      // Reload Data from Supabase and Re-render Page
      await window.BoosterXData.initData();
      window.BoosterXApp.navigate('posts');
    } catch (e) {
      window.BoosterXApp.showToast('Error scheduling post: ' + e.message, 'error');
      if (btn) {
        btn.innerText = 'Schedule Post';
        btn.disabled = false;
      }
    }
  }

  function init() {
    renderPosts();

    // Platform filter
    document.querySelectorAll('[data-post-platform]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-post-platform]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activePlatform = btn.dataset.postPlatform;
        renderPosts();
      });
    });

    // Search
    const searchEl = document.getElementById('postSearch');
    if (searchEl) {
      searchEl.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderPosts();
      });
    }

    // Sort
    const sortEl = document.getElementById('postSort');
    if (sortEl) {
      sortEl.addEventListener('change', (e) => {
        activeSort = e.target.value;
        renderPosts();
      });
    }

    // New Post button
    document.getElementById('btnNewPost')?.addEventListener('click', showNewPostModal);
  }

  return { render, init, viewPost, submitPost };
})();
