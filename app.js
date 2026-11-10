const goalForm = document.getElementById('goal-form');
const goalInput = document.getElementById('goal-input');
const goalList = document.getElementById('goal-list');
const notes = document.getElementById('notes');
const saveNotes = document.getElementById('save-notes');

function load() {
  const goals = JSON.parse(localStorage.getItem('realityos-goals') || '[]');
  goalList.innerHTML = '';
  goals.forEach((g, i) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = g.text;
    if (g.done) span.classList.add('done');
    span.onclick = () => toggle(i);
    const btn = document.createElement('button');
    btn.textContent = '×';
    btn.onclick = () => remove(i);
    li.append(span, btn);
    goalList.append(li);
  });
  notes.value = localStorage.getItem('realityos-notes') || '';
}

function saveGoals(goals) {
  localStorage.setItem('realityos-goals', JSON.stringify(goals));
  load();
}

function getGoals() {
  return JSON.parse(localStorage.getItem('realityos-goals') || '[]');
}

goalForm.onsubmit = (e) => {
  e.preventDefault();
  const text = goalInput.value.trim();
  if (!text) return;
  const goals = getGoals();
  goals.push({ text, done: false });
  saveGoals(goals);
  goalInput.value = '';
};

function toggle(i) {
  const goals = getGoals();
  goals[i].done = !goals[i].done;
  saveGoals(goals);
}

function remove(i) {
  const goals = getGoals();
  goals.splice(i, 1);
  saveGoals(goals);
}

saveNotes.onclick = () => {
  localStorage.setItem('realityos-notes', notes.value);
  saveNotes.textContent = 'Saved';
  setTimeout(() => saveNotes.textContent = 'Save notes', 1500);
};

load();
