/* ============================================================
   AGENCY CLIENTS PAGE
   ============================================================ */
window.ClientsPage = (() => {
  function render() {
    const { AGENCY_CLIENTS, currentClientId } = window.BoosterXData;
    
    return `
      <div class="page-enter">
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div>
            <h1 class="page-title">👥 Manage Clients</h1>
            <p class="page-subtitle">Agency Dashboard: Manage and switch between your influencer profiles.</p>
          </div>
          <button class="btn btn-primary" onclick="window.ClientsPage.showAddClientModal()">+ Add New Client</button>
        </div>
        
        <div class="grid-3">
          ${AGENCY_CLIENTS.map(client => `
            <div class="card" style="border: ${client.id === currentClientId ? '2px solid var(--purple-400)' : '1px solid var(--border-subtle)'}; cursor: pointer; transition: all 0.2s;" onclick="window.BoosterXData.switchClient('${client.id}')">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
                <div style="width:50px; height:50px; border-radius:50%; background:var(--grad-primary); display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:800; box-shadow:0 0 15px rgba(168,85,247,0.3);">
                  ${client.name.charAt(0).toUpperCase()}
                </div>
                ${client.id === currentClientId ? '<span class="badge badge-purple">Active</span>' : ''}
              </div>
              <div style="font-size:1.2rem; font-weight:700; margin-bottom:4px;">${client.name}</div>
              <div style="color:var(--text-muted); font-size:0.9rem; margin-bottom:12px;">${client.handle}</div>
              <div style="display:flex; gap:8px;">
                <span class="badge" style="background:rgba(255,255,255,0.05);">${client.niche}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function init() {}

  function showAddClientModal() {
    const html = `
      <div class="modal-title">Add New Client</div>
      <div class="modal-subtitle">Create a new influencer profile to track.</div>
      <div class="form-group">
        <label class="form-label">Client Name</label>
        <input type="text" id="newClientName" class="form-input" placeholder="e.g. Sarah Jenkins">
      </div>
      <div class="form-group">
        <label class="form-label">Primary Handle</label>
        <input type="text" id="newClientHandle" class="form-input" placeholder="e.g. @sarahbeauty">
      </div>
      <div class="form-group">
        <label class="form-label">Niche</label>
        <input type="text" id="newClientNiche" class="form-input" placeholder="e.g. Beauty & Fashion">
      </div>
      <button class="btn btn-primary w-full" onclick="window.ClientsPage.saveNewClient()">Add Client</button>
    `;
    window.BoosterXApp.openModal(html);
  }

  async function saveNewClient() {
    const name = document.getElementById('newClientName')?.value.trim();
    const handle = document.getElementById('newClientHandle')?.value.trim();
    const niche = document.getElementById('newClientNiche')?.value.trim();
    
    if (!name || !handle) {
      window.BoosterXApp.showToast('Name and handle are required.', 'error');
      return;
    }
    
    const newClient = {
      user_id: window.BoosterXData.USER.id,
      name,
      handle,
      niche: niche || 'General'
    };
    
    try {
      await window.BoosterXSupabase.addClient(newClient);
      window.BoosterXApp.closeModal();
      window.BoosterXApp.showToast('Client added successfully!', 'success');
      
      // Reload Data from Supabase
      await window.BoosterXData.initData();
      
      // Reload the page to reflect the new client in all states and dropdowns
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {
      window.BoosterXApp.showToast('Error adding client: ' + e.message, 'error');
    }
  }

  return { render, init, showAddClientModal, saveNewClient };
})();
