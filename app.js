/* realityOS — local-only personal OS prototype
   Data stays in browser localStorage. No network. */

const STORAGE_KEY = 'realityos-v1';

const state = {
  goals: [],
  protocols: [],
  notes: '',
  history: [],
  startedAt: Date.now()
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(state, parsed);
      if (!state.startedAt) state.startedAt = Date.now();
    }
  } catch (e) {
    console.warn('Failed to load state', e);
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatUptime() {
  const ms = Date.now() - state.startedAt;
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

function addHistory(text) {
  state.history.unshift({
    id: uid(),
    ts: Date.now(),
    text
  });
  if (state.history.length > 200) state.history.length = 200;
}

/* ---------- Tabs ---------- */
function initTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

/* ---------- Goals ---------- */
function renderGoals() {
  const list = document.getElementById('goal-list');
  list.innerHTML = '';
  state.goals.forEach(g => {
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = g.text;
    if (g.done) label.classList.add('done');
    if (g.tags && g.tags.length) {
      const tags = document.createElement('span');
      tags.className = 'hint';
      tags.textContent = ' ' + g.tags.map(t => '#' + t).join(' ');
      label.appendChild(tags);
    }
    const actions = document.createElement('span');
    const edit = document.createElement('button');
    edit.textContent = 'Edit';
    edit.onclick = () => {
      const newText = prompt('Edit goal:', g.text);
      if (newText && newText.trim() && newText.trim() !== g.text) {
        g.text = newText.trim();
        addHistory(`Edited goal: ${g.text}`);
        save();
      }
    };
    const toggle = document.createElement('button');
    toggle.textContent = g.done ? 'Undo' : 'Done';
    toggle.onclick = () => {
      g.done = !g.done;
      addHistory(`${g.done ? 'Completed' : 'Reopened'} goal: ${g.text}`);
      save();
    };
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.onclick = () => {
      if (confirm(`Delete goal: ${g.text}?`)) {
        state.goals = state.goals.filter(x => x.id !== g.id);
        addHistory(`Deleted goal: ${g.text}`);
        save();
      }
    };
    actions.append(edit, ' ', toggle, ' ', del);
    li.append(label, actions);
    list.append(li);
  });
  document.getElementById('goal-count').textContent = `Goals: ${state.goals.length}`;
  document.getElementById('dash-active').textContent = state.goals.filter(g => !g.done).length;
  document.getElementById('dash-done').textContent = state.goals.filter(g => g.done).length;
}

function initGoals() {
  document.getElementById('goal-form').addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('goal-input');
    const text = input.value.trim();
    if (!text) return;
    const tags = (text.match(/#(\w+)/g) || []).map(t => t.slice(1));
    const cleanText = text.replace(/#\w+/g, '').trim();
    state.goals.unshift({ id: uid(), text: cleanText || text, tags, done: false, created: Date.now() });
    addHistory(`Added goal: ${cleanText || text}`);
    input.value = '';
    save();
  });
}

/* ---------- Protocols ---------- */
function renderProtocols() {
  const list = document.getElementById('protocol-list');
  list.innerHTML = '';
  state.protocols.forEach(p => {
    const li = document.createElement('li');
    const content = document.createElement('div');
    const tagStr = p.tags && p.tags.length ? ' ' + p.tags.map(t => '#' + t).join(' ') : '';
    content.innerHTML = `<strong>${p.title}${tagStr}</strong><br><span class="hint">${p.body}</span>${p.uses ? `<br><span class="hint">Used ${p.uses} time(s)</span>` : ''}`;
    const actions = document.createElement('span');
    const edit = document.createElement('button');
    edit.textContent = 'Edit';
    edit.onclick = () => {
      const newTitle = prompt('Edit title:', p.title);
      if (newTitle === null) return;
      const newBody = prompt('Edit body:', p.body);
      if (newBody === null) return;
      const t = newTitle.trim();
      const b = newBody.trim();
      if (t && b && (t !== p.title || b !== p.body)) {
        p.title = t;
        p.body = b;
        addHistory(`Edited protocol: ${p.title}`);
        save();
      }
    };
    const exec = document.createElement('button');
    exec.textContent = 'Execute';
    exec.onclick = () => {
      const outcome = prompt('Outcome / note (optional):') || '';
      addHistory(`Executed protocol "${p.title}"${outcome ? ': ' + outcome : ''}`);
      p.uses = (p.uses || 0) + 1;
      save();
    };
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.onclick = () => {
      if (confirm(`Delete protocol: ${p.title}?`)) {
        state.protocols = state.protocols.filter(x => x.id !== p.id);
        addHistory(`Deleted protocol: ${p.title}`);
        save();
      }
    };
    actions.append(edit, ' ', exec, ' ', del);
    li.append(content, actions);
    list.append(li);
  });
  document.getElementById('protocol-count').textContent = `Protocols: ${state.protocols.length}`;
  document.getElementById('dash-protocols').textContent = state.protocols.length;
}

function initProtocols() {
  document.getElementById('protocol-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('protocol-title').value.trim();
    const body = document.getElementById('protocol-body').value.trim();
    if (!title || !body) return;
    const tags = (title.match(/#(\w+)/g) || []).map(t => t.slice(1));
    const cleanTitle = title.replace(/#\w+/g, '').trim();
    state.protocols.unshift({ id: uid(), title: cleanTitle || title, body, tags, uses: 0, created: Date.now() });
    addHistory(`Saved protocol: ${cleanTitle || title}`);
    document.getElementById('protocol-title').value = '';
    document.getElementById('protocol-body').value = '';
    save();
  });

  document.querySelectorAll('.template').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('protocol-title').value = btn.dataset.title;
      document.getElementById('protocol-body').value = btn.dataset.body;
    });
  });
}

/* ---------- Notes ---------- */
function initNotes() {
  const ta = document.getElementById('notes');
  ta.value = state.notes || '';
  document.getElementById('save-notes').addEventListener('click', () => {
    state.notes = ta.value;
    addHistory('Saved system notes');
    save();
  });
}

/* ---------- History & Import/Export ---------- */
function renderHistory() {
  const list = document.getElementById('history-list');
  list.innerHTML = '';
  state.history.slice(0, 50).forEach(h => {
    const li = document.createElement('li');
    const d = new Date(h.ts);
    li.innerHTML = `<span class="hint">${d.toLocaleString()}</span> ${h.text}`;
    list.append(li);
  });
  const recent = document.getElementById('dash-recent');
  recent.innerHTML = '';
  state.history.slice(0, 8).forEach(h => {
    const li = document.createElement('li');
    li.textContent = h.text;
    recent.append(li);
  });
  document.getElementById('dash-executions').textContent =
    state.history.filter(h => h.text.startsWith('Executed')).length;
}

function initImportExport() {
  document.getElementById('export-btn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'realityos-export.json';
    a.click();
  });

  document.getElementById('import-btn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          if (confirm('Import will overwrite current data. Continue?')) {
            Object.assign(state, data);
            if (!state.startedAt) state.startedAt = Date.now();
            save();
            addHistory('Imported state');
          }
        } catch (e) {
          alert('Invalid JSON');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}

/* ---------- Visualization ---------- */
function renderViz() {
  const viz = document.getElementById('viz');
  const active = state.goals.filter(g => !g.done).length;
  const done = state.goals.filter(g => g.done).length;
  const protos = state.protocols.length;
  const execs = state.history.filter(h => h.text.startsWith('Executed')).length;
  const total = active + done + protos + execs || 1;
  viz.innerHTML = `
    <div class="viz-bar">
      <div class="seg goals" style="flex:${active}" title="Active goals: ${active}"></div>
      <div class="seg" style="flex:${done}; background:#666" title="Completed: ${done}"></div>
      <div class="seg protocols" style="flex:${protos}" title="Protocols: ${protos}"></div>
      <div class="seg executions" style="flex:${execs}" title="Executions: ${execs}"></div>
    </div>
  `;
}

/* ---------- Search ---------- */
function initSearch() {
  const input = document.getElementById('global-search');
  if (!input) return;
  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    filterLists(q);
  });
}

function filterLists(q) {
  // Filter goals
  document.querySelectorAll('#goal-list li').forEach(li => {
    const text = li.textContent.toLowerCase();
    li.style.display = !q || text.includes(q) ? '' : 'none';
  });
  // Filter protocols
  document.querySelectorAll('#protocol-list li').forEach(li => {
    const text = li.textContent.toLowerCase();
    li.style.display = !q || text.includes(q) ? '' : 'none';
  });
  // Simple note highlight or filter not implemented for notes textarea
}

function renderAll() {
  document.getElementById('uptime').textContent = `Uptime: ${formatUptime()}`;
  renderGoals();
  renderProtocols();
  renderHistory();
  renderViz();
}

function boot() {
  load();
  initTabs();
  initGoals();
  initProtocols();
  initNotes();
  initImportExport();
  initSearch();
  renderAll();
  setInterval(() => {
    document.getElementById('uptime').textContent = `Uptime: ${formatUptime()}`;
  }, 1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
