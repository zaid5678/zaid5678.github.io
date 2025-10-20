// script.js
// Handles: theme toggle, typing animation, repo fetch for index + projects pages, year fill.
// No tokens required; uses public GitHub API (rate limits apply but fine for anonymous use).

const username = "zaid5678";

// ---------- THEME ----------
const applyTheme = (t) => {
  if (t === "light") document.body.classList.add("light");
  else document.body.classList.remove("light");
  try { localStorage.setItem("theme", t); } catch(e){}
};
const initTheme = () => {
  const saved = localStorage.getItem("theme") || (window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'dark');
  applyTheme(saved);
};
const toggleBtns = document.querySelectorAll('#theme-toggle, #theme-toggle-2, #theme-toggle-3');
toggleBtns.forEach(b => {
  b && b.addEventListener('click', () => {
    const now = document.body.classList.contains('light') ? 'light' : 'dark';
    const next = now === 'light' ? 'dark' : 'light';
    applyTheme(next);
  });
});
initTheme();

// ---------- TYPING ANIMATION (Option B + entrepreneur) ----------
const typingStrings = [
  "Hi, I’m Zaid — I build AI systems, cloud solutions, and full-stack products that solve real problems.",
  "I'm also a builder & entrepreneur."
];
const TYPING_SPEED = 36;
const PAUSE = 900;
async function typeLoop() {
  const el = document.getElementById('type-text');
  if (!el) return;
  while (true) {
    for (const txt of typingStrings) {
      await typeText(el, txt);
      await wait(PAUSE);
      await deleteText(el);
      await wait(200);
    }
  }
}
function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function typeText(el, text){
  for (let i=0;i<=text.length;i++){
    el.textContent = text.slice(0,i);
    await wait(TYPING_SPEED);
  }
}
async function deleteText(el){
  const t = el.textContent;
  for (let i=t.length;i>=0;i--){
    el.textContent = t.slice(0,i);
    await wait(18);
  }
}
typeLoop().catch(()=>{});

// ---------- REPO FETCH & POPULATE ----------
async function fetchRepos(limit=6){
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if (!res.ok) throw new Error("GitHub API error");
    const list = await res.json();
    return list;
  } catch (err) {
    console.error(err);
    return [];
  }
}

function createRepoCard(repo){
  const div = document.createElement('div');
  div.className = 'repo-card';
  div.innerHTML = `
    <h3>${escapeHtml(repo.name)}</h3>
    <p>${escapeHtml(repo.description || 'No description')}</p>
    <div><a target="_blank" href="${repo.html_url}">View on GitHub</a></div>
  `;
  return div;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

async function loadIndexRepos(){
  const grid = document.getElementById('repo-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const repos = await fetchRepos(6);
  if (!repos || repos.length === 0) {
    grid.innerHTML = '<div class="muted">No repositories found or an error occurred.</div>';
    return;
  }
  repos.slice(0,6).forEach(r => grid.appendChild(createRepoCard(r)));
}

async function loadProjectsPage(){
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const repos = await fetchRepos(12);
  if (!repos || repos.length === 0) {
    grid.innerHTML = '<div class="muted">No repositories found or an error occurred.</div>';
    return;
  }
  repos.slice(0,12).forEach(r => {
    const card = document.createElement('div');
    card.className = 'repo-card';
    card.innerHTML = `
      <h3>${escapeHtml(r.name)}</h3>
      <p>${escapeHtml(r.description || 'No description')}</p>
      <div style="display:flex;gap:8px;margin-top:10px">
        <a target="_blank" href="${r.html_url}">View</a>
        ${r.homepage ? `<a target="_blank" href="${r.homepage}">Live</a>` : ''}
        <div style="margin-left:auto;color:var(--muted);font-size:13px">★ ${r.stargazers_count} • ${r.language || '—'}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  // fill years
  document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
  document.getElementById('year2') && (document.getElementById('year2').textContent = new Date().getFullYear());
  document.getElementById('year3') && (document.getElementById('year3').textContent = new Date().getFullYear());

  loadIndexRepos();
  loadProjectsPage();
});
