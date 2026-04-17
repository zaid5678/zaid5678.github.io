// script.js
// Theme, typing, repo fetch, nav highlight, hamburger, scroll animations,
// hero stagger, nav scroll indicator, custom cursor.

const username = "zaid5678";

// ─── THEME ────────────────────────────────────────────────────────────────────
const applyTheme = (t) => {
  document.body.classList.toggle("light", t === "light");
  try { localStorage.setItem("theme", t); } catch(e){}
};

const initTheme = () => {
  const saved = (() => {
    try { return localStorage.getItem("theme"); } catch(e){ return null; }
  })();
  applyTheme(saved || (window.matchMedia?.('(prefers-color-scheme:dark)').matches ? 'dark' : 'dark'));
};

document.querySelectorAll('button[id^="theme-toggle"]').forEach(b => {
  b?.addEventListener('click', () => {
    applyTheme(document.body.classList.contains('light') ? 'dark' : 'light');
  });
});
initTheme();

// ─── NAV ACTIVE HIGHLIGHT ─────────────────────────────────────────────────────
(function highlightNav() {
  try {
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-center .nav-link').forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      const isHome = (href === 'index.html' && (path === '' || path === 'index.html'));
      a.classList.toggle('active', isHome || href === path);
    });
  } catch(e){}
})();

// ─── HAMBURGER & MOBILE MENU ──────────────────────────────────────────────────
const mobileMenu = document.getElementById('mobile-menu');

function toggleMobileMenu(open) {
  if (!mobileMenu) return;
  if (open === undefined) open = !mobileMenu.classList.contains('open');
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.querySelectorAll('.hamburger').forEach(h => {
    h.setAttribute('aria-expanded', String(open));
  });
}

document.querySelectorAll('.hamburger').forEach(btn => {
  btn.addEventListener('click', e => { e.stopPropagation(); toggleMobileMenu(); });
});

document.addEventListener('click', e => {
  if (!mobileMenu) return;
  if (e.target.closest('.mobile-link')) { toggleMobileMenu(false); return; }
  if (!e.target.closest('.hamburger') && mobileMenu.classList.contains('open')) {
    if (!e.target.closest('.mobile-menu')) toggleMobileMenu(false);
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') toggleMobileMenu(false);
});

// ─── SCROLL ANIMATIONS (IntersectionObserver) ─────────────────────────────────
let scrollObserver = null;

function observeScrollElements(root) {
  const target = root || document;
  if (!scrollObserver) {
    scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          scrollObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -36px 0px' });
  }
  target.querySelectorAll('.fade-up').forEach(el => scrollObserver.observe(el));
}

// ─── HERO STAGGER (load-in) ───────────────────────────────────────────────────
function initHeroStagger() {
  document.querySelectorAll('.hero-stagger').forEach(el => {
    const delay = parseInt(el.dataset.delay || 0) * 90;
    setTimeout(() => el.classList.add('visible'), 80 + delay);
  });
}

// ─── NAV SCROLL INDICATOR ─────────────────────────────────────────────────────
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 24);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ─── CUSTOM CURSOR ────────────────────────────────────────────────────────────
function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Hide the default browser cursor
  const noPointer = document.createElement('style');
  noPointer.textContent = '* { cursor: none !important; }';
  document.head.appendChild(noPointer);

  // Only the ring — no dot
  const ring = Object.assign(document.createElement('div'), { className: 'cursor-ring' });
  document.body.appendChild(ring);

  let visible = false;

  document.addEventListener('mousemove', e => {
    ring.style.left = `${e.clientX}px`;
    ring.style.top  = `${e.clientY}px`;
    if (!visible) {
      visible = true;
      ring.style.opacity = '1';
    }
  });

  document.addEventListener('mouseleave', () => {
    visible = false;
    ring.style.opacity = '0';
  });

  const interactive = 'a, button, .repo-card, .webdev-card, .badge, .btn';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactive)) {
      ring.style.width       = '44px';
      ring.style.height      = '44px';
      ring.style.borderColor = 'rgba(244, 63, 94, 0.65)';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactive)) {
      ring.style.width       = '28px';
      ring.style.height      = '28px';
      ring.style.borderColor = 'rgba(244, 63, 94, 0.45)';
    }
  });
}

// ─── TYPING (Home only) ───────────────────────────────────────────────────────
const typingStrings = [
  "I build AI and cloud systems at scale.",
  "I'm a full-stack engineer and entrepreneur.",
  "I turn ideas into products and products into value."
];
const TYPING_SPEED = 36;
const PAUSE = 900;

const wait = ms => new Promise(r => setTimeout(r, ms));

async function typeText(el, text) {
  for (let i = 0; i <= text.length; i++) {
    el.textContent = text.slice(0, i);
    await wait(TYPING_SPEED);
  }
}
async function deleteText(el) {
  const t = el.textContent;
  for (let i = t.length; i >= 0; i--) {
    el.textContent = t.slice(0, i);
    await wait(18);
  }
}
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
typeLoopIfHome().catch(() => {});

// ─── REPO FETCH & POPULATE (Projects page) ────────────────────────────────────
const WEBSITE_REPOS = new Set([
  "fruitcandyuk","urbanshinemobilevaleting","mirzavideo","onetimegem",
  "diggiespopupevents","commercialcanopycleaning","kayancoffee","makeupbynedz",
  "CMC","eventuradesigns","bigbenproductions","ATRUMEDIA","LondonForLess",
  "DTRHair","WICC","FatFellas"
]);

async function fetchRepos() {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if (!res.ok) throw new Error("GitHub API error");
    return await res.json();
  } catch(err) {
    console.error(err);
    return [];
  }
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, m =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])
  );
}

function createRepoCard(repo, delay) {
  const div = document.createElement('div');
  div.className = 'repo-card fade-up';
  if (delay) div.dataset.delay = delay;
  // Entire card is clickable
  div.style.cursor = 'pointer';
  div.addEventListener('click', () => window.open(repo.html_url, '_blank', 'noopener,noreferrer'));
  div.innerHTML = `
    <h3>${escapeHtml(repo.name)}</h3>
    <p>${escapeHtml(repo.description || 'No description.')}</p>
    <div class="repo-card-footer">
      ${repo.homepage ? `<a target="_blank" rel="noopener noreferrer" href="${repo.homepage}" onclick="event.stopPropagation()">Live ↗</a>` : ''}
      <span class="repo-meta">${escapeHtml(repo.language || '—')}</span>
    </div>
  `;
  return div;
}

async function loadProjectsPage() {
  const grid = document.getElementById('projects-grid') || document.getElementById('repo-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="muted">Loading repositories…</div>';
  const repos = await fetchRepos();
  if (!repos?.length) {
    grid.innerHTML = '<div class="muted">No repositories found or an error occurred.</div>';
    return;
  }
  const filtered = repos.filter(r => !WEBSITE_REPOS.has(r.name));
  const limit = location.pathname.includes('projects.html') ? 12 : 6;
  grid.innerHTML = '';
  filtered.slice(0, limit).forEach((r, i) => {
    grid.appendChild(createRepoCard(r, (i % 6) + 1));
  });
  // Observe newly added cards
  observeScrollElements(grid.parentElement);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Fill year spans
  ['year','year2','year3','year4','year5','year6'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = new Date().getFullYear();
  });

  loadProjectsPage();
  observeScrollElements();
  initHeroStagger();
  initNavScroll();
  initCursor();
});
