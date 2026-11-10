const goalForm = document.getElementById('goal-form');
const goalInput = document.getElementById('goal-input');
const goalList = document.getElementById('goal-list');
const notesEl = document.getElementById('notes');
const saveNotesBtn = document.getElementById('save-notes');
const protocolForm = document.getElementById('protocol-form');
const protocolTitle = document.getElementById('protocol-title');
const protocolBody = document.getElementById('protocol-body');
const protocolList = document.getElementById('protocol-list');
const historyList = document.getElementById('history-list');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');

const KEYS = {
  goals: 'realityos-goals',
  notes: 'realityos-notes',
  protocols: 'realityos-protocols',
  history: 'realityos-history',
  start: 'realityos-start'
};

function now() { return new Date().toISOString(); }
function log(event, detail = '') {
  const history = JSON.parse(localStorage.getItem(KEYS.history) || '[]');
  history.unshift({ time: now(), event, detail });
  if (history.length > 200) history.length = 200;
  localStorage.setItem(KEYS.history, JSON.stringify(history));
}

function loadGoals() {
  const goals = JSON.parse(localStorage.getItem(KEYS.goals) || '[]');
  goalList.innerHTML = '';
  goals.forEach((g, i) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = g.text;
    if (g.done) span.classList.add('done');
    span.onclick = () => toggleGoal(i);
    const btn = document.createElement('button');
    btn.textContent = '×';
    btn.onclick = (e) => { e.stopPropagation(); removeGoal(i); };
    li.append(span, btn);
    goalList.append(li);
  });
  updateStatus();
}

function loadProtocols() {
  const protocols = JSON.parse(localStorage.getItem(KEYS.protocols) || '[]');
  protocolList.innerHTML = '';
  protocols.forEach((p, i) => {
    const li = document.createElement('li');
    const div = document.createElement('div');
    div.innerHTML = `<strong>${escapeHtml(p.title)}</strong><br><span class="hint">${escapeHtml(p.body)}</span>`;
    const btn = document.createElement('button');
    btn.textContent = '×';
    btn.onclick = () => removeProtocol(i);
    li.append(div, btn);
    protocolList.append(li);
  });
  updateStatus();
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem(KEYS.history) || '[]');
  historyList.innerHTML = '';
  history.slice(0, 50).forEach(h => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="hint">${new Date(h.time).toLocaleString()}</span> — ${escapeHtml(h.event)} ${h.detail ? `<em>${escapeHtml(h.detail)}</em>` : ''}`;
    historyList.append(li);
  });
  // dashboard recent
  const recent = document.getElementById('dash-recent');
  recent.innerHTML = '';
  history.slice(0, 5).forEach(h => {
    const li = document.createElement('li');
    li.textContent = `${new Date(h.time).toLocaleTimeString()} — ${h.event}`;
    recent.append(li);
  });
}

function updateStatus() {
  const goals = JSON.parse(localStorage.getItem(KEYS.goals) || '[]');
  const protocols = JSON.parse(localStorage.getItem(KEYS.protocols) || '[]');
  const active = goals.filter(g => !g.done).length;
  const done = goals.filter(g => g.done).length;
  document.getElementById('goal-count').textContent = `Goals: ${goals.length}`;
  document.getElementById('dash-active').textContent = active;
  document.getElementById('dash-done').textContent = done;
  document.getElementById('dash-protocols').textContent = protocols.length;

  const start = localStorage.getItem(KEYS.start) || now();
  if (!localStorage.getItem(KEYS.start)) localStorage.setItem(KEYS.start, start);
  const ms = Date.now() - new Date(start).getTime();
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  document.getElementById('uptime').textContent = `Uptime: ${days}d ${hours}h`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function loadAll() {
  notesEl.value = localStorage.getItem(KEYS.notes) || '';
  loadGoals();
  loadProtocols();
  loadHistory();
  updateStatus();
}

goalForm.onsubmit = (e) => {
  e.preventDefault();
  const text = goalInput.value.trim();
  if (!text) return;
  const goals = JSON.parse(localStorage.getItem(KEYS.goals) || '[]');
  goals.push({ text, done: false, created: now() });
  localStorage.setItem(KEYS.goals, JSON.stringify(goals));
  log('Goal added', text);
  goalInput.value = '';
  loadAll();
};

function toggleGoal(i) {
  const goals = JSON.parse(localStorage.getItem(KEYS.goals) || '[]');
  goals[i].done = !goals[i].done;
  localStorage.setItem(KEYS.goals, JSON.stringify(goals));
  log(goals[i].done ? 'Goal completed' : 'Goal reopened', goals[i].text);
  loadAll();
}

function removeGoal(i) {
  const goals = JSON.parse(localStorage.getItem(KEYS.goals) || '[]');
  const text = goals[i].text;
  goals.splice(i, 1);
  localStorage.setItem(KEYS.goals, JSON.stringify(goals));
  log('Goal removed', text);
  loadAll();
}

protocolForm.onsubmit = (e) => {
  e.preventDefault();
  const title = protocolTitle.value.trim();
  const body = protocolBody.value.trim();
  if (!title || !body) return;
  const protocols = JSON.parse(localStorage.getItem(KEYS.protocols) || '[]');
  protocols.push({ title, body, created: now() });
  localStorage.setItem(KEYS.protocols, JSON.stringify(protocols));
  log('Protocol saved', title);
  protocolTitle.value = '';
  protocolBody.value = '';
  loadAll();
};

function removeProtocol(i) {
  const protocols = JSON.parse(localStorage.getItem(KEYS.protocols) || '[]');
  const title = protocols[i].title;
  protocols.splice(i, 1);
  localStorage.setItem(KEYS.protocols, JSON.stringify(protocols));
  log('Protocol removed', title);
  loadAll();
}

saveNotesBtn.onclick = () => {
  localStorage.setItem(KEYS.notes, notesEl.value);
  log('Notes saved');
  saveNotesBtn.textContent = 'Saved';
  setTimeout(() => saveNotesBtn.textContent = 'Save notes', 1500);
};

exportBtn.onclick = () => {
  const data = {
    goals: JSON.parse(localStorage.getItem(KEYS.goals) || '[]'),
    notes: localStorage.getItem(KEYS.notes) || '',
    protocols: JSON.parse(localStorage.getItem(KEYS.protocols) || '[]'),
    history: JSON.parse(localStorage.getItem(KEYS.history) || '[]'),
    exported: now()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `realityos-export-${Date.now()}.json`;
  a.click();
  log('Data exported');
};

importBtn.onclick = () => importFile.click();
importFile.onchange = () => {
  const file = importFile.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.goals) localStorage.setItem(KEYS.goals, JSON.stringify(data.goals));
      if (data.notes !== undefined) localStorage.setItem(KEYS.notes, data.notes);
      if (data.protocols) localStorage.setItem(KEYS.protocols, JSON.stringify(data.protocols));
      if (data.history) localStorage.setItem(KEYS.history, JSON.stringify(data.history));
      log('Data imported');
      loadAll();
      alert('Import successful');
    } catch (err) {
      alert('Invalid JSON');
    }
  };
  reader.readAsText(file);
  importFile.value = '';
};

// Tabs
document.querySelectorAll('.tab').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  };
});

loadAll();
setInterval(updateStatus, 60000);
