// app.js — shared UI utilities

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(msg, type = 'default', duration = (type === 'error' ? 5000 : 3000)) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast' + (type !== 'default' ? ' ' + type : '');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

function setTopbarUser(name, role) {
  const el = document.getElementById('topbar-user');
  if (el) el.textContent = name + ' · ' + (role === 'nutritionist' ? 'Nutritionist' : 'Client');
}

function initLogout() {
  const btn = document.getElementById('logout-btn');
  if (btn) btn.addEventListener('click', logout);
}

function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const group = tab.closest('[data-tabs]').dataset.tabs;
      document.querySelectorAll(`[data-tab-group="${group}"]`).forEach(p => p.classList.remove('active'));
      document.querySelectorAll(`[data-tabs="${group}"] .tab`).forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.querySelector(`[data-tab-group="${group}"][data-tab="${tab.dataset.tab}"]`);
      if (panel) panel.classList.add('active');
      else console.warn(`[initTabs] no panel for tab "${tab.dataset.tab}" in group "${group}"`);
    });
  });
}

function getInitials(name) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function showAccountModal(session) {
  let backdrop = document.getElementById('account-modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'account-modal-backdrop';
    backdrop.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:600;align-items:flex-end;justify-content:center';
    const sheet = document.createElement('div');
    sheet.style.cssText = 'background:var(--surface);width:100%;max-width:480px;border-radius:24px 24px 0 0;padding:24px 20px 40px';
    sheet.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <span style="font-size:17px;font-weight:700">Account</span>
        <button id="close-account-modal-btn" class="btn btn-sm btn-ghost">✕</button>
      </div>
      <div style="margin-bottom:20px">
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:2px">Signed in as</div>
        <div style="font-weight:600;font-size:15px">${escapeHtml(session.name)}</div>
        <div style="font-size:13px;color:var(--text-muted)">${escapeHtml(session.email)}</div>
      </div>
      <hr class="divider">
      <div id="account-modal-body" style="margin-top:16px"></div>`;
    backdrop.appendChild(sheet);
    document.body.appendChild(backdrop);

    backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.style.display = 'none'; });
    document.getElementById('close-account-modal-btn').addEventListener('click', () => { backdrop.style.display = 'none'; });
  }

  function showReauthForm(msg) {
    document.getElementById('account-modal-body').innerHTML = `
      <p style="font-size:14px;color:var(--text-muted);margin-bottom:16px">${escapeHtml(msg)}</p>
      <div class="form-group">
        <label for="reauth-pw">Current password</label>
        <input type="password" id="reauth-pw" placeholder="Enter your password" autocomplete="current-password">
      </div>
      <div id="reauth-err" style="display:none;color:var(--danger);font-size:13px;margin-bottom:12px;padding:10px 14px;background:var(--danger-light);border-radius:var(--radius)"></div>
      <button id="confirm-delete-btn" class="btn btn-full" style="background:var(--danger);color:#fff;font-weight:600">Confirm Delete</button>`;
    document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
      const pw = document.getElementById('reauth-pw').value;
      const errEl = document.getElementById('reauth-err');
      const btn = document.getElementById('confirm-delete-btn');
      if (!pw) { errEl.textContent = 'Please enter your password.'; errEl.style.display = 'block'; return; }
      btn.disabled = true; btn.textContent = 'Deleting…';
      const r = await reauthAndDelete(pw);
      if (r.ok) { window.location.href = 'index.html'; return; }
      errEl.textContent = r.error; errEl.style.display = 'block';
      btn.disabled = false; btn.textContent = 'Confirm Delete';
    });
  }

  document.getElementById('account-modal-body').innerHTML = `
    <button id="delete-account-btn" class="btn btn-full" style="background:var(--danger-light);color:var(--danger);border:1px solid var(--danger);font-weight:600;margin-bottom:8px">Delete Account</button>
    <p style="font-size:12px;color:var(--text-muted);text-align:center">Permanently deletes your account. This cannot be undone.</p>`;
  document.getElementById('delete-account-btn').addEventListener('click', async () => {
    if (!confirm('Delete your account permanently? This cannot be undone.')) return;
    const btn = document.getElementById('delete-account-btn');
    btn.disabled = true; btn.textContent = 'Deleting…';
    const result = await deleteAccount();
    if (result.ok) { window.location.href = 'index.html'; return; }
    if (result.requiresReauth) { showReauthForm(result.error); return; }
    btn.disabled = false; btn.textContent = 'Delete Account';
    showToast(result.error, 'error');
  });

  backdrop.style.display = 'flex';
}

// field: the checkIn property to chart (default 'weight'), unit: display suffix
function renderWeightChart(checkIns, containerId, field = 'weight', unit = 'kg') {
  const el = document.getElementById(containerId);
  if (!el || !checkIns.length) return;

  const sorted = [...checkIns].sort((a, b) => a.date.localeCompare(b.date));
  const values = sorted.map(c => c[field]).filter(v => v != null);
  if (!values.length) { el.innerHTML = '<p style="color:var(--text-light);font-size:13px">No data recorded.</p>'; return; }

  const min = Math.min(...values) - (values.length === 1 ? 1 : 0);
  const max = Math.max(...values) + (values.length === 1 ? 1 : 0);
  const range = max - min || 1;

  const W = 400, H = 100, PAD = 12;
  // unique gradient id per chart to avoid SVG conflicts
  const gradId = 'wg_' + containerId;
  const pts = values.map((v, i) => {
    const x = PAD + (i / Math.max(values.length - 1, 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polyline = pts.join(' ');
  const areaClose = `${pts[pts.length - 1].split(',')[0]},${H} ${PAD},${H}`;

  el.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1CBFA2" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#1CBFA2" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <polygon points="${polyline} ${areaClose}" fill="url(#${gradId})"/>
      <polyline points="${polyline}" fill="none" stroke="#1CBFA2" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      ${values.map((v, i) => {
        const [x, y] = pts[i].split(',');
        return `<circle cx="${x}" cy="${y}" r="4" fill="#1CBFA2" stroke="#fff" stroke-width="1.5"/>`;
      }).join('')}
    </svg>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-light);margin-top:6px">
      <span>${sorted[0]?.date ? formatDateShort(sorted[0].date) : ''}</span>
      <span style="font-weight:700;color:var(--teal)">${values[values.length - 1]} ${unit}</span>
      <span>${sorted[sorted.length - 1]?.date ? formatDateShort(sorted[sorted.length - 1].date) : ''}</span>
    </div>`;
}
