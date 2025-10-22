// script.js
// Theme toggle, typing on Home only, repo fetch for Projects page, active nav highlight,
// hamburger toggle (slide-down glass), click-outside to close, and auto-close on nav click.

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
const toggleBtns = document.querySelectorAll('#theme-toggle, #theme-toggle-2, #theme-toggle-3, #theme-toggle-4, #theme-toggle-5, #theme-toggle-6');
toggleBtns.forEach(b => {
  if (!b) return;
  b.addEventListener('click', () => {
    const now = document.body.classList.contains('light') ? 'light' : 'dark';
    const next = now === 'light' ? 'dark' : 'light';
    applyTheme(next);
  });
});
initTheme();

// ---------- NAV HIGHLIGHT ----------
(function highlightNav(){
  try {
    const path = location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-center .nav-link');
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      if ((href === 'index.html' && (path === '' || path === 'index.html')) || href === path) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  } catch(e){}
})();

// ---------- HAMBURGER & MOBILE MENU ----------
const hamburgerIds = ['hamburger','hamburger-2','hamburger-3','hamburger-4','hamburger-5','hamburger-6'];
const mobileMenuIds = ['mobile-menu']; // all pages use same id multiple times; script will grab the first visible
function getMobileMenu() {
  // mobile-menu elements are repeated on each page; use the one in DOM
  return document.getElementById('mobile-menu');
}
function toggleMobileMenu(open) {
  const menu = getMobileMenu();
  const hamb = document.querySelector('.hamburger');
  if (!menu) return;
  if (open === undefined) open = !menu.classList.contains('open');
  if (open) {
    menu.classList.add('open');
    menu.setAttribute('aria-hidden','false');
    // set all hamburger aria-expanded attributes to true
    document.querySelectorAll('.hamburger').forEach(h=>h.setAttribute('aria-expanded','true'));
  } else {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden','true');
    document.querySelectorAll('.hamburger').forEach(h=>h.setAttribute('aria-expanded','false'));
  }
}

// attach listeners to all hamburger buttons present
hamburgerIds.forEach(id=>{
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', (e)=>{
    e.stopPropagation();
    toggleMobileMenu();
  });
});

// when a mobile link is clicked, close menu
document.addEventListener('click', (e)=>{
  const menu = getMobileMenu();
  if (!menu) return;
  const isLink = e.target.closest('.mobile-link');
  if (isLink) {
    toggleMobileMenu(false);
    return;
  }
  const isHamb = e.target.closest('.hamburger');
  if (!isHamb && menu.classList.contains('open')) {
    // click outside menu closes it
    const insideMenu = e.target.closest('.mobile-menu');
    if (!insideMenu) toggleMobileMenu(false);
  }
});

// close mobile menu on ESC
document.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape') toggleMobileMenu(false);
});

// ---------- TYPING (Home only, Style 3) ----------
const typingStrings = [
  "I build AI and cloud systems at scale.",
  "I'm a full-stack engineer and entrepreneur.",
  "I turn ideas into products and products into value."
];
const TYPING_SPEED = 36;
const PAUSE = 900;

async function typeLoopIfHome() {
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
typeLoopIfHome().catch(()=>{/* silent */});

// ---------- REPO FETCH & POPULATE (Projects page) ----------
async function fetchRepos(){
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if (!res.ok) throw new Error("GitHub API error");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

function escapeHtml(s){
  return String(s || '').replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

function createRepoCard(repo){
  const div = document.createElement('div');
  div.className = 'repo-card';
  div.innerHTML = `
    <h3>${escapeHtml(repo.name)}</h3>
    <p>${escapeHtml(repo.description || 'No description')}</p>
    <div style="display:flex;gap:8px;margin-top:10px;align-items:center;">
      <a target="_blank" href="${repo.html_url}">View</a>
      ${repo.homepage ? `<a target="_blank" href="${repo.homepage}">Live</a>` : ''}
      <div style="margin-left:auto;color:var(--muted);font-size:13px">★ ${repo.stargazers_count} • ${escapeHtml(repo.language || '—')}</div>
    </div>
  `;
  return div;
}

async function loadProjectsPage(){
  const grid = document.getElementById('projects-grid') || document.getElementById('repo-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const repos = await fetchRepos();
  if (!repos || repos.length === 0) {
    grid.innerHTML = '<div class="muted">No repositories found or an error occurred.</div>';
    return;
  }
  const limit = (document.location.pathname.includes('projects.html')) ? 12 : 6;
  repos.slice(0, limit).forEach(r => grid.appendChild(createRepoCard(r)));
}

// ---------- YEAR FILL & INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  ['year','year2','year3','year4','year5','year6','year7'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = new Date().getFullYear();
  });

  loadProjectsPage();
});
