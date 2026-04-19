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
    // Weather
    on($('.top-bar__links a:nth-child(1)'), 'click', (e) => {
      e.preventDefault();
      alert('Local Weather: 24°C, Sunny in Johannesburg.');
    });

    // E-Paper
    on($('.top-bar__links a:nth-child(2)'), 'click', (e) => {
      e.preventDefault();
      alert('Opening Digital Edition... (Simulated)');
    });

    // Newsletter Scroll
    on($('.top-bar__links a:nth-child(3), .btn-subscribe'), 'click', (e) => {
      e.preventDefault();
      $('.newsletter-widget')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Live TV
    on($('.top-bar__links a:nth-child(4)'), 'click', (e) => {
      e.preventDefault();
      alert('Live TV Stream starting... (Simulated)');
    });

    // Back to top
    on(btt, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ================================================================
     DYNAMIC NEWS LOADING
  ================================================================ */
  async function loadNews() {
    if (typeof API === 'undefined') return;
    const category = document.body.dataset.category || 'Main';

    async function render(sel, cat = null, limit = 6) {
        const container = $(sel) || $('#category-news-container');
        if (!container) return;

        const stories = await API.fetchStories(cat, limit);
        if (stories?.length) {
            container.innerHTML = '';
            stories.forEach(s => {
                const art = document.createElement('article');
                art.className = 'article-card fade-in visible';
                art.innerHTML = `
                    <div class="article-card__img"><img src="${s.image}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;"></div>
                    <div class="article-card__body">
                        <div class="article-card__tag"><span class="tag tag--${s.category.toLowerCase()}">${s.category}</span></div>
                        <h3 class="article-card__title">${s.title}</h3>
                        <p class="article-card__excerpt">${s.excerpt}</p>
                        <div class="article-card__meta">
                            <div class="article-card__author-avatar" aria-hidden="true">${s.author.substring(0,2).toUpperCase()}</div>
                            <span>${s.author}</span>
                            <span><i data-lucide="clock" style="width:14px;height:14px;"></i> <time>${new Date(s.date).toLocaleDateString()}</time></span>
                        </div>
                    </div>
                `;
                container.appendChild(art);
            });
            initIcons();
        } else {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--gray-400);"><i data-lucide="inbox" style="width:48px;height:48px;display:block;margin:0 auto 15px;"></i> No stories found in ${cat || 'all'} categories.</div>`;
            initIcons();
        }
    }

    if (category !== 'Main') {
        await render('#category-news-container', category, 12);
    } else {
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

  console.log('ZiloNews Infrastructure Ready.');
})();
