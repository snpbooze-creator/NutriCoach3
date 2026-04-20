// app.js — shared UI utilities

function showToast(msg, type = 'default', duration = 3000) {
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
    });
  });
}

function getInitials(name) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
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
