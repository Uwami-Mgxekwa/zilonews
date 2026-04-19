/**
 * ZiloNews — Main JavaScript
 */
(function () {
  'use strict';

  /* ================================================================
     HELPERS
  ================================================================ */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

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
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  /* ================================================================
     IMAGE PROTECTION
     Blocks right-click save, drag, and iOS long-press on images
  ================================================================ */
  function protectImages() {
    on(document, 'contextmenu', (e) => {
      if (e.target.tagName === 'IMG') e.preventDefault();
    });
    on(document, 'dragstart', (e) => {
      if (e.target.tagName === 'IMG') e.preventDefault();
    });

    function applyToImg(img) {
      img.setAttribute('draggable', 'false');
      img.style.webkitUserSelect    = 'none';
      img.style.userSelect          = 'none';
      img.style.webkitTouchCallout  = 'none';
    }

    // Apply to all current images
    $$('img').forEach(applyToImg);

    // Apply to future dynamically added images
    new MutationObserver((mutations) => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          if (node.tagName === 'IMG') applyToImg(node);
          node.querySelectorAll && node.querySelectorAll('img').forEach(applyToImg);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ================================================================
     ARTICLE READER MODAL
  ================================================================ */
  let articleModal = null;

  function buildModal() {
    if ($('#article-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'article-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Article reader');
    modal.innerHTML = `
      <div class="article-modal__backdrop"></div>
      <div class="article-modal__panel" role="document">
        <button class="article-modal__close" aria-label="Close article">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div class="article-modal__content" id="article-modal-content"></div>
      </div>
    `;
    document.body.appendChild(modal);
    articleModal = modal;
    modal.querySelector('.article-modal__backdrop').addEventListener('click', closeArticleModal);
    modal.querySelector('.article-modal__close').addEventListener('click', closeArticleModal);
  }

  function openArticleModal(story) {
    buildModal();
    const content = $('#article-modal-content');
    const catUrl  = categoryUrl(story.category);
    const hasImg  = story.image && !story.image.includes('logo.png');

    content.innerHTML = `
      <div class="article-modal__meta-top">
        <a class="article-modal__cat-link tag tag--${(story.category || '').toLowerCase()}"
           href="${catUrl}">${story.category || 'News'}</a>
      </div>
      <h1 class="article-modal__title">${story.title}</h1>
      <div class="article-modal__byline">
        <div class="article-card__author-avatar" aria-hidden="true">${(story.author || 'ZN').substring(0,2).toUpperCase()}</div>
        <span class="article-modal__author">${story.author || 'ZiloNews Staff'}</span>
        <span class="article-modal__date">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <time>${new Date(story.date).toLocaleDateString('en-ZA', { year:'numeric', month:'long', day:'numeric' })}</time>
        </span>
        <span class="article-modal__read-time">${story.readTime || '5 min read'}</span>
      </div>
      ${hasImg ? `<div class="article-modal__img-wrap"><img src="${story.image}" alt="${story.title}" class="article-modal__img" draggable="false" /></div>` : ''}
      <div class="article-modal__body">${(story.content || story.excerpt || 'No content available.').replace(/\n/g, '<br>')}</div>
      <div class="article-modal__footer">
        <a class="article-modal__cat-btn" href="${catUrl}">
          More ${story.category || 'News'} stories →
        </a>
      </div>
    `;

    articleModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    articleModal.querySelector('.article-modal__panel').scrollTop = 0;
    setTimeout(() => articleModal.querySelector('.article-modal__close')?.focus(), 50);
  }

  function closeArticleModal() {
    if (!articleModal) return;
    articleModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ================================================================
     LIVE DATE & TIME
  ================================================================ */
  function updateDateTime() {
    const el = $('#live-datetime');
    if (!el) return;
    el.textContent = new Date().toLocaleDateString('en-ZA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
  updateDateTime();
  setInterval(updateDateTime, 60000);

  /* ================================================================
     SCROLL EFFECTS
  ================================================================ */
  const header      = $('.site-header');
  const btt         = $('#back-to-top');
  const progressBar = $('.progress-bar');

  function onScroll() {
    const y    = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (header)      header.classList.toggle('scrolled', y > 10);
    if (btt)         btt.classList.toggle('visible', y > 400);
    if (progressBar) progressBar.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
  }
  on(window, 'scroll', onScroll, { passive: true });

  /* ================================================================
     SEARCH OVERLAY
  ================================================================ */
  const searchOverlay  = $('.search-overlay');
  const searchInput    = $('.search-overlay__input');
  const btnSearch      = $('.btn-search');
  const btnCloseSearch = $('.search-overlay__close');

  function openSearch()  {
    searchOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput?.focus(), 100);
  }
  function closeSearch() {
    searchOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }
  on(btnSearch,      'click', openSearch);
  on(btnCloseSearch, 'click', closeSearch);
  on(searchOverlay,  'click', (e) => { if (e.target === searchOverlay) closeSearch(); });
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape') { closeSearch(); closeMobileNav(); closeArticleModal(); }
  });

  /* ================================================================
     MOBILE NAV
  ================================================================ */
  const mobileNav     = $('.mobile-nav');
  const mobileOverlay = $('.mobile-nav__overlay');
  const btnHamburger  = $('.btn-hamburger');
  const btnCloseNav   = $('.mobile-nav__close');

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
  on(btnHamburger,  'click', openMobileNav);
  on(btnCloseNav,   'click', closeMobileNav);
  on(mobileOverlay, 'click', closeMobileNav);

  /* ================================================================
     BUTTON HANDLERS
  ================================================================ */
  function initHandlers() {
    on($('.top-bar__links a:nth-child(1)'), 'click', (e) => {
      e.preventDefault(); alert('Local Weather: 24°C, Sunny in Johannesburg.');
    });
    on($('.top-bar__links a:nth-child(2)'), 'click', (e) => {
      e.preventDefault(); alert('Opening Digital Edition... (Simulated)');
    });
    on($('.top-bar__links a:nth-child(3), .btn-subscribe'), 'click', (e) => {
      e.preventDefault(); $('.newsletter-widget')?.scrollIntoView({ behavior: 'smooth' });
    });
    on($('.top-bar__links a:nth-child(4)'), 'click', (e) => {
      e.preventDefault(); alert('Live TV Stream starting... (Simulated)');
    });
    on(btt, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ================================================================
     DYNAMIC NEWS LOADING
  ================================================================ */
  async function loadNews() {
    if (typeof API === 'undefined') return;

    const category = document.body.dataset.category || 'Main';

    // Build an article card — clicking opens the full article modal,
    // clicking the category tag navigates to the category page
    function makeCard(s) {
      const url = categoryUrl(s.category);
      const art = document.createElement('article');
      art.className = 'article-card fade-in visible';
      art.style.cursor = 'pointer';
      art.setAttribute('role', 'button');
      art.setAttribute('tabindex', '0');
      art.setAttribute('aria-label', `Read: ${s.title}`);
      art.addEventListener('click', () => openArticleModal(s));
      art.addEventListener('keydown', (e) => { if (e.key === 'Enter') openArticleModal(s); });
      art.innerHTML = `
        <div class="article-card__img-wrap">
          <img src="${s.image}" alt="${s.title}" loading="lazy" draggable="false" />
        </div>
        <div class="article-card__body">
          <div class="article-card__tag">
            <a class="tag tag--${(s.category || '').toLowerCase()}"
               href="${url}"
               onclick="event.stopPropagation()">${s.category}</a>
          </div>
          <h3 class="article-card__title">${s.title}</h3>
          <p class="article-card__excerpt">${s.excerpt || ''}</p>
          <div class="article-card__meta">
            <div class="article-card__author-avatar" aria-hidden="true">${(s.author || 'ZN').substring(0,2).toUpperCase()}</div>
            <span>${s.author}</span>
            <span>
              <i data-lucide="clock" style="width:14px;height:14px;"></i>
              <time>${new Date(s.date).toLocaleDateString()}</time>
            </span>
          </div>
        </div>
      `;
      return art;
    }

    async function render(sel, cat = null, limit = 6) {
      const container = (typeof sel === 'string') ? $(sel) : sel;
      if (!container) return;
      try {
        const stories = await API.fetchStories(cat, limit);
        const parentSection = container.closest('.section-block');
        if (stories?.length) {
          if (parentSection) parentSection.style.display = 'block';
          container.innerHTML = '';
          stories.forEach(s => container.appendChild(makeCard(s)));
        } else {
          if (document.body.dataset.category === 'Main' && parentSection && cat !== null) {
            parentSection.style.display = 'none';
          } else {
            container.innerHTML = `
              <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400);font-size:0.9rem;">
                <i data-lucide="inbox" style="width:32px;height:32px;display:block;margin:0 auto 10px;opacity:0.5;"></i>
                No ${cat || 'latest'} stories yet. Start posting!
              </div>`;
          }
        }
        initIcons();
      } catch (e) { /* silent */ }
    }

    /* ----------------------------------------------------------
       HERO — uses a background-image approach.
       The hero__main element has `background: var(--dark)` in CSS
       as a permanent fallback, so it's never blank.
    ---------------------------------------------------------- */
    async function loadHero() {
      const heroGrid = $('.hero__grid');
      if (!heroGrid) return;

      try {
        const stories = await API.fetchStories(null, 6);

        if (!stories?.length) {
          const heroMain = $('.hero__main');
          if (heroMain) {
            heroMain.innerHTML = `
              <div class="hero__main-overlay" aria-hidden="true"></div>
              <div class="hero__main-content" style="text-align:center;">
                <h3 style="color:#fff;">No stories published yet.</h3>
                <p style="color:rgba(255,255,255,.7);margin-top:8px;">Go to the admin panel to post your first story!</p>
              </div>`;
          }
          initIcons();
          return;
        }

        // ---- Main hero card (first story) ----
        const main     = stories[0];
        const heroMain = $('.hero__main');
        if (heroMain) {
          heroMain.style.cursor = 'pointer';
          // Clear any leftover inline background from previous loads
          heroMain.style.backgroundImage = '';

          heroMain.innerHTML = `
            <img class="hero__main-img" src="${main.image}" alt="${main.title}" draggable="false" />
            <div class="hero__main-overlay" aria-hidden="true"></div>
            <div class="hero__main-content">
              <a class="tag tag--${(main.category || 'news').toLowerCase()}"
                 href="${categoryUrl(main.category)}"
                 onclick="event.stopPropagation()">${main.category || 'News'}</a>
              <h1 class="hero__main-title">${main.title}</h1>
              <p style="color:rgba(255,255,255,.75);font-size:14px;margin-bottom:12px;line-height:1.5;">${main.excerpt || ''}</p>
              <div class="hero__main-meta">
                <span><i data-lucide="user"></i> ${main.author}</span>
                <span><i data-lucide="clock"></i> <time>${new Date(main.date).toLocaleDateString()}</time></span>
              </div>
            </div>
          `;
          heroMain.addEventListener('click', (e) => {
            if (!e.target.closest('a')) openArticleModal(main);
          });
        }

        // ---- Side cards (stories 2 & 3) ----
        const side     = stories.slice(1, 3);
        const heroSide = $('.hero__side');
        if (heroSide) {
          if (side.length > 0) {
            heroSide.innerHTML = '';
            heroSide.style.display = '';
            side.forEach((s, i) => {
              const card = document.createElement('article');
              card.className = `hero__card fade-in stagger-${i + 1} visible`;
              card.style.cursor = 'pointer';
              card.innerHTML = `
                <img class="hero__card-img" src="${s.image}" alt="${s.title}" draggable="false" />
                <div class="hero__card-overlay" aria-hidden="true"></div>
                <div class="hero__card-content">
                  <a class="tag tag--${(s.category || 'news').toLowerCase()}"
                     href="${categoryUrl(s.category)}"
                     onclick="event.stopPropagation()">${s.category || 'News'}</a>
                  <h2 class="hero__card-title">${s.title}</h2>
                  <div class="hero__card-meta"><time>${new Date(s.date).toLocaleDateString()}</time></div>
                </div>
              `;
              card.addEventListener('click', (e) => {
                if (!e.target.closest('a')) openArticleModal(s);
              });
              heroSide.appendChild(card);
            });
          } else {
            heroSide.style.display = 'none';
            heroGrid.style.gridTemplateColumns = '1fr';
          }
        }

        initIcons();
      } catch (e) { /* silent */ }
    }

    if (category !== 'Main') {
      const container = $('#category-news-container') || $('.news-grid');
      await render(container, category, 100);
    } else {
      await loadHero();
      await render('#latest-news-container',  null,         6);
      await render('#tech-news-container',    'Technology', 3);
      await render('#politics-news-container','Politics',   3);
      await render('#science-news-container', 'Science',    3);
      await render('#sports-news-container',  'Sports',     3);
    }
  }

  /* ================================================================
     INIT
  ================================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    initIcons();
    initHandlers();
    protectImages();
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
