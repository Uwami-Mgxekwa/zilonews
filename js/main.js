/**
 * ZiloNews — Main JavaScript
 */
(function () {
  'use strict';

  /* ================================================================
     HELPERS
  ================================================================ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  // Map category names to their page paths (works from both root and /pages/)
  function categoryUrl(category) {
    const isRoot = !window.location.pathname.includes('/pages/');
    const base = isRoot ? 'pages/' : '';
    const map = {
      'Technology': `${base}technology.html`,
      'Politics':   `${base}politics.html`,
      'World':      `${base}world.html`,
      'Business':   `${base}business.html`,
      'Science':    `${base}science.html`,
      'Sports':     `${base}sports.html`,
      'Health':     `${base}health.html`,
      'Culture':    `${base}culture.html`,
    };
    return map[category] || (isRoot ? 'index.html' : '../index.html');
  }

  function initIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  /* ================================================================
     LIVE DATE & TIME
  ================================================================ */
  function updateDateTime() {
    const el = $('#live-datetime');
    if (!el) return;
    const now = new Date();
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    el.textContent = now.toLocaleDateString('en-ZA', opts);
  }
  updateDateTime();
  setInterval(updateDateTime, 60000);

  /* ================================================================
     SCROLL EFFECTS
  ================================================================ */
  const header = $('.site-header');
  const btt = $('#back-to-top');
  const progressBar = $('.progress-bar');

  function onScroll() {
    const y = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('scrolled', y > 10);
    if (btt) btt.classList.toggle('visible', y > 400);
    if (progressBar) progressBar.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
  }
  on(window, 'scroll', onScroll, { passive: true });

  /* ================================================================
     SEARCH OVERLAY
  ================================================================ */
  const searchOverlay = $('.search-overlay');
  const searchInput = $('.search-overlay__input');
  const btnSearch = $('.btn-search');
  const btnCloseSearch = $('.search-overlay__close');

  function openSearch() {
    searchOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput?.focus(), 100);
  }
  function closeSearch() {
    searchOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }
  on(btnSearch, 'click', openSearch);
  on(btnCloseSearch, 'click', closeSearch);
  on(searchOverlay, 'click', (e) => { if (e.target === searchOverlay) closeSearch(); });
  on(document, 'keydown', (e) => { if (e.key === 'Escape') { closeSearch(); closeMobileNav(); } });

  /* ================================================================
     MOBILE NAV
  ================================================================ */
  const mobileNav = $('.mobile-nav');
  const mobileOverlay = $('.mobile-nav__overlay');
  const btnHamburger = $('.btn-hamburger');
  const btnCloseNav = $('.mobile-nav__close');

  function openMobileNav() {
    mobileNav?.classList.add('open');
    mobileOverlay?.classList.add('open');
    btnHamburger?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    mobileNav?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    btnHamburger?.classList.remove('open');
    document.body.style.overflow = '';
  }
  on(btnHamburger, 'click', openMobileNav);
  on(btnCloseNav, 'click', closeMobileNav);
  on(mobileOverlay, 'click', closeMobileNav);

  /* ================================================================
     BUTTON HANDLERS
  ================================================================ */
  function initHandlers() {
    on($('.top-bar__links a:nth-child(1)'), 'click', (e) => {
      e.preventDefault();
      alert('Local Weather: 24°C, Sunny in Johannesburg.');
    });
    on($('.top-bar__links a:nth-child(2)'), 'click', (e) => {
      e.preventDefault();
      alert('Opening Digital Edition... (Simulated)');
    });
    on($('.top-bar__links a:nth-child(3), .btn-subscribe'), 'click', (e) => {
      e.preventDefault();
      $('.newsletter-widget')?.scrollIntoView({ behavior: 'smooth' });
    });
    on($('.top-bar__links a:nth-child(4)'), 'click', (e) => {
      e.preventDefault();
      alert('Live TV Stream starting... (Simulated)');
    });
    on(btt, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ================================================================
     DYNAMIC NEWS LOADING
  ================================================================ */
  async function loadNews() {
    if (typeof API === 'undefined') return;

    const category = document.body.dataset.category || 'Main';

    async function render(sel, cat = null, limit = 6) {
      const container = (typeof sel === 'string') ? $(sel) : sel;
      if (!container) return;

      try {
        const stories = await API.fetchStories(cat, limit);
        const parentSection = container.closest('.section-block');

        if (stories?.length) {
          if (parentSection) parentSection.style.display = 'block';
          container.innerHTML = '';
          stories.forEach(s => {
            const url = categoryUrl(s.category);
            const art = document.createElement('article');
            art.className = 'article-card fade-in visible';
            art.style.cursor = 'pointer';
            art.setAttribute('role', 'link');
            art.setAttribute('tabindex', '0');
            art.setAttribute('aria-label', s.title);
            art.addEventListener('click', () => { window.location.href = url; });
            art.addEventListener('keydown', (e) => { if (e.key === 'Enter') window.location.href = url; });
            art.innerHTML = `
              <div class="article-card__img"><img src="${s.image}" alt="${s.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;"></div>
              <div class="article-card__body">
                <div class="article-card__tag"><span class="tag tag--${(s.category || '').toLowerCase()}">${s.category}</span></div>
                <h3 class="article-card__title">${s.title}</h3>
                <p class="article-card__excerpt">${s.excerpt || ''}</p>
                <div class="article-card__meta">
                  <div class="article-card__author-avatar" aria-hidden="true">${(s.author || 'ZN').substring(0, 2).toUpperCase()}</div>
                  <span>${s.author}</span>
                  <span><i data-lucide="clock" style="width:14px;height:14px;"></i> <time>${new Date(s.date).toLocaleDateString()}</time></span>
                </div>
              </div>
            `;
            container.appendChild(art);
          });
        } else {
          // Hide per-category sections when empty on homepage; show message elsewhere
          if (document.body.dataset.category === 'Main' && parentSection && cat !== null) {
            parentSection.style.display = 'none';
          } else {
            container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400);font-size:0.9rem;"><i data-lucide="inbox" style="width:32px;height:32px;display:block;margin:0 auto 10px;opacity:0.5;"></i> No ${cat || 'latest'} stories yet. Start posting!</div>`;
          }
        }
        initIcons();
      } catch (e) {
        // silent fail — network errors shouldn't break the page
      }
    }

    async function loadHero() {
      const heroGrid = $('.hero__grid');
      if (!heroGrid) return;

      try {
        const stories = await API.fetchStories(null, 3);
        if (stories?.length) {
          const main = stories[0];
          const heroMain = $('.hero__main');
          if (heroMain) {
            if (main.image && !main.image.includes('logo.png')) {
              heroMain.style.backgroundImage = `url(${main.image})`;
              heroMain.style.backgroundSize = 'cover';
              heroMain.style.backgroundPosition = 'center';
            }
            const url = categoryUrl(main.category);
            heroMain.style.cursor = 'pointer';
            heroMain.addEventListener('click', () => { window.location.href = url; });
            heroMain.innerHTML = `
              <div class="hero__main-overlay" aria-hidden="true"></div>
              <div class="hero__main-content">
                <span class="tag tag--${(main.category || 'news').toLowerCase()}">${main.category || 'News'}</span>
                <h1 class="hero__main-title">${main.title}</h1>
                <p style="color:rgba(255,255,255,.75);font-size:14px;margin-bottom:12px;line-height:1.5;">${main.excerpt || ''}</p>
                <div class="hero__main-meta">
                  <span><i data-lucide="user"></i> ${main.author}</span>
                  <span><i data-lucide="clock"></i> <time>${new Date(main.date).toLocaleDateString()}</time></span>
                </div>
              </div>
            `;
          }

          const side = stories.slice(1);
          const heroSide = $('.hero__side');
          if (heroSide && side.length > 0) {
            heroSide.innerHTML = '';
            side.forEach((s, i) => {
              const url = categoryUrl(s.category);
              const card = document.createElement('article');
              card.className = `hero__card fade-in stagger-${i + 1} visible`;
              card.style.cursor = 'pointer';
              if (s.image && !s.image.includes('logo.png')) {
                card.style.backgroundImage = `url(${s.image})`;
                card.style.backgroundSize = 'cover';
                card.style.backgroundPosition = 'center';
              }
              card.addEventListener('click', () => { window.location.href = url; });
              card.innerHTML = `
                <div class="hero__card-overlay" aria-hidden="true"></div>
                <div class="hero__card-content">
                  <span class="tag tag--${(s.category || 'news').toLowerCase()}">${s.category || 'News'}</span>
                  <h2 class="hero__card-title">${s.title}</h2>
                  <div class="hero__card-meta"><time>${new Date(s.date).toLocaleDateString()}</time></div>
                </div>
              `;
              heroSide.appendChild(card);
            });
          }

          if (stories.length === 1) {
            heroGrid.style.gridTemplateColumns = '1fr';
            const heroSideEl = $('.hero__side');
            if (heroSideEl) heroSideEl.style.display = 'none';
          }
        } else {
          const mainHero = $('.hero__main');
          if (mainHero) mainHero.innerHTML = '<div style="padding:40px;text-align:center;color:#fff;"><h3>No stories published yet.</h3><p style="opacity:.7;margin-top:8px;">Go to the admin panel to post your first story!</p></div>';
        }
        initIcons();
      } catch (e) {
        // silent fail
      }
    }

    if (category !== 'Main') {
      const container = $('#category-news-container') || $('.news-grid');
      await render(container, category, 12);
    } else {
      await loadHero();
      await render('#latest-news-container', null, 6);
      await render('#tech-news-container', 'Technology', 3);
      await render('#politics-news-container', 'Politics', 3);
      await render('#science-news-container', 'Science', 3);
      await render('#sports-news-container', 'Sports', 3);
    }
  }

  /* ================================================================
     INIT
  ================================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    initIcons();
    initHandlers();
    loadNews();
    onScroll();
  });

  console.log(
    '%cZiloNews Infrastructure 🌍 %cPowered by %cBrelinx',
    'color:#E8001D; font-weight:800; font-size:14px;',
    'color:#6b7280; font-weight:400; font-size:12px;',
    'color:#14B980; font-weight:800; font-size:14px;'
  );
})();
