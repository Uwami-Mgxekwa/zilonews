/**
 * ZiloNews — Main JavaScript
 * Handles: ticker, search overlay, mobile nav, scroll effects,
 *          intersection observer animations, date/time, back-to-top,
 *          reading progress, weather widget, newsletter.
 */
(function () {
  'use strict';

  /* ================================================================
     HELPERS
  ================================================================ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  /* ================================================================
     LIVE DATE & TIME — Top Bar
  ================================================================ */
  function updateDateTime() {
    const el = $('#live-datetime');
    if (!el) return;
    const now = new Date();
    const opts = {
      weekday: 'long', year: 'numeric',
      month: 'long', day: 'numeric'
    };
    el.textContent = now.toLocaleDateString('en-ZA', opts);
  }
  updateDateTime();
  setInterval(updateDateTime, 60000);

  /* ================================================================
     SCROLL-BASED HEADER EFFECTS
  ================================================================ */
  const header = $('.site-header');
  const backToTop = $('.back-to-top');
  const progressBar = $('.progress-bar');

  function onScroll() {
    const scrollY = window.scrollY;
    const docH = document.documentElement.scrollHeight - window.innerHeight;

    // Sticky header shadow
    if (header) header.classList.toggle('scrolled', scrollY > 10);

    // Back to top
    if (backToTop) backToTop.classList.toggle('visible', scrollY > 400);

    // Reading progress
    if (progressBar) progressBar.style.width = (docH > 0 ? (scrollY / docH) * 100 : 0) + '%';
  }
  on(window, 'scroll', onScroll, { passive: true });
  onScroll();

  /* ================================================================
     BACK TO TOP
  ================================================================ */
  on(backToTop, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ================================================================
     SEARCH OVERLAY
  ================================================================ */
  const searchOverlay = $('.search-overlay');
  const searchInput = $('.search-overlay__input');
  const btnSearch = $('.btn-search');
  const btnCloseSearch = $('.search-overlay__close');

  function openSearch() {
    searchOverlay && searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput && searchInput.focus(), 100);
  }
  function closeSearch() {
    searchOverlay && searchOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  on(btnSearch, 'click', openSearch);
  on(btnCloseSearch, 'click', closeSearch);
  on(searchOverlay, 'click', (e) => { if (e.target === searchOverlay) closeSearch(); });
  on(document, 'keydown', (e) => { if (e.key === 'Escape') closeSearch(); });

  // Search form submission (replace with your search logic)
  const searchForm = $('.search-overlay__form');
  on(searchForm, 'submit', (e) => {
    e.preventDefault();
    const q = searchInput ? searchInput.value.trim() : '';
    if (q) {
      // Future: redirect to search results page
      closeSearch();
    }
  });

  /* ================================================================
     MOBILE NAV DRAWER
  ================================================================ */
  const mobileNav = $('.mobile-nav');
  const mobileOverlay = $('.mobile-nav__overlay');
  const btnHamburger = $('.btn-hamburger');
  const btnCloseNav = $('.mobile-nav__close');

  function openMobileNav() {
    mobileNav && mobileNav.classList.add('open');
    mobileOverlay && mobileOverlay.classList.add('open');
    btnHamburger && btnHamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    mobileNav && mobileNav.classList.remove('open');
    mobileOverlay && mobileOverlay.classList.remove('open');
    btnHamburger && btnHamburger.classList.remove('open');
    document.body.style.overflow = '';
  }

  on(btnHamburger, 'click', openMobileNav);
  on(btnCloseNav, 'click', closeMobileNav);
  on(mobileOverlay, 'click', closeMobileNav);
  on(document, 'keydown', (e) => { if (e.key === 'Escape') closeMobileNav(); });

  /* ================================================================
     BREAKING NEWS TICKER — Duplicate items for seamless loop
  ================================================================ */
  const tickerItems = $('.ticker__items');
  if (tickerItems) {
    // Clone the items for seamless infinite scroll
    tickerItems.innerHTML += tickerItems.innerHTML;
  }

  /* ================================================================
     INTERSECTION OBSERVER — Fade-in Animations
  ================================================================ */
  const fadeEls = $$('.fade-in');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all immediately
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  /* ================================================================
     WEATHER WIDGET — Simulated (replace with real API)
  ================================================================ */
  function setWeather() {
    const tempEl = $('#weather-temp');
    const descEl = $('#weather-desc');
    const cityEl = $('#weather-city');
    if (!tempEl) return;

    // Simulated weather data (replace with OpenWeatherMap API call)
    const conditions = ['☀️ Sunny', '⛅ Partly Cloudy', '🌤 Clear', '🌥 Overcast'];
    const temps = [18, 22, 25, 19, 27];
    const temp = temps[Math.floor(Math.random() * temps.length)];
    const cond = conditions[Math.floor(Math.random() * conditions.length)];

    if (tempEl) tempEl.textContent = temp + '°C';
    if (descEl) descEl.textContent = cond;
    if (cityEl) cityEl.textContent = 'Johannesburg, ZA';
  }
  setWeather();

  /* ================================================================
     LUCIDE ICONS
  ================================================================ */
  function initIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
  initIcons();

  /* ================================================================
     BACK4APP NEWS INTEGRATION
  ================================================================ */
  async function loadDynamicNews() {
    if (typeof API === 'undefined') return;
    
    const techContainer = $('#tech-news-container');
    if (techContainer) {
      const techNews = await API.fetchStories('Technology', 3);
      if (techNews && techNews.length > 0) {
        techNews.forEach(story => {
          const card = document.createElement('article');
          card.className = 'article-card fade-in visible';
          card.innerHTML = `
            <div class="article-card__img">
              <img src="${story.image}" alt="${story.title}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div class="article-card__body">
              <div class="article-card__tag"><span class="tag tag--tech">${story.category}</span></div>
              <h3 class="article-card__title">${story.title}</h3>
              <p class="article-card__excerpt">${story.excerpt}</p>
              <div class="article-card__meta">
                <div class="article-card__author-avatar" aria-hidden="true">${story.author.substring(0,2).toUpperCase()}</div>
                <span>${story.author}</span>
                <span>
                  <i data-lucide="clock" style="width:14px; height:14px;"></i>
                  <time datetime="${story.date}">${new Date(story.date).toLocaleDateString()}</time>
                </span>
                <span>${story.readTime}</span>
              </div>
            </div>
          `;
          techContainer.prepend(card);
        });
        initIcons();
      }
    }
  }
  loadDynamicNews();

  /* ================================================================
     NEWSLETTER FORM (Updated for Back4App)
  ================================================================ */
  const newsletterForm = $('#newsletter-form');
  if (newsletterForm) {
    on(newsletterForm, 'submit', async (e) => {
      e.preventDefault();
      const emailInput = $('#newsletter-email');
      if (!emailInput || !emailInput.value.trim()) return;

      const btn = newsletterForm.querySelector('.newsletter-widget__btn');
      const originalText = btn ? btn.innerHTML : '';

      if (btn) {
        btn.textContent = 'Processing…';
        btn.disabled = true;
      }

      const success = typeof API !== 'undefined' ? await API.subscribe(emailInput.value.trim()) : true;

      if (btn) {
        if (success) {
          btn.innerHTML = '✓ Subscribed!';
          btn.style.background = '#14B980';
          btn.style.color = '#fff';
          emailInput.value = '';
        } else {
          btn.textContent = 'Error. Try again.';
        }
        btn.disabled = false;
      }

      setTimeout(() => {
        if (btn) {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.style.color = '';
          initIcons();
        }
      }, 4000);
    });
  }

  /* ================================================================
     COUNTER ANIMATION — Stats Bar
  ================================================================ */
  function animateCounter(el, target, duration = 1800) {
    const start = performance.now();
    const suffix = el.dataset.suffix || '';
    const initial = 0;

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(initial + (target - initial) * eased).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counters = $$('[data-counter]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.counter, 10);
          animateCounter(entry.target, target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
  }

  /* ================================================================
     CATEGORY TABS (if present)
  ================================================================ */
  $$('.category-tabs').forEach(tabs => {
    const buttons = $$('.tab-btn', tabs);
    buttons.forEach(btn => {
      on(btn, 'click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Future: filter articles by category
      });
    });
  });

  /* ================================================================
     ARTICLE CARD CLICK — Navigate to article page (future)
  ================================================================ */
  $$('.article-card, .article-list-item, .trending-item, .video-card').forEach(card => {
    on(card, 'click', (e) => {
      // Prevent action if clicking a link inside the card
      if (e.target.closest('a')) return;
      const link = card.dataset.href;
      if (link) window.location.href = link;
    });
    // Keyboard support
    card.setAttribute('tabindex', '0');
    on(card, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  /* ================================================================
     LOAD MORE BUTTON — Simulated
  ================================================================ */
  on($('#load-more-btn'), 'click', function () {
    this.textContent = 'Loading…';
    this.disabled = true;
    setTimeout(() => {
      this.textContent = 'No more articles';
      this.style.pointerEvents = 'none';
      this.style.opacity = '.5';
    }, 1200);
  });

  /* ================================================================
     REGION BUTTONS — World Coverage
  ================================================================ */
  $$('.global-banner__region-btn').forEach(btn => {
    on(btn, 'click', () => {
      $$('.global-banner__region-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ================================================================
     STRUCTURED DATA — inject Article breadcrumbs dynamically
  ================================================================ */
  // This is handled in the HTML via <script type="application/ld+json">

  /* ================================================================
     LAZY LOAD IMAGES — use native when available
  ================================================================ */
  $$('img[data-src]').forEach(img => {
    if ('loading' in HTMLImageElement.prototype) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    } else if ('IntersectionObserver' in window) {
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.src = entry.target.dataset.src;
            entry.target.removeAttribute('data-src');
            lazyObserver.unobserve(entry.target);
          }
        });
      });
      lazyObserver.observe(img);
    } else {
      img.src = img.dataset.src;
    }
  });

  /* ================================================================
     SERVICE WORKER REGISTRATION — PWA / offline caching
  ================================================================ */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW not critical; fail silently
      });
    });
  }

  console.log('%cZiloNews 🌍 Loaded', 'color:#E8001D;font-weight:800;font-size:14px;');
})();
