/**
 * SHANKARA NRITHA VIDYALAYAM — MAIN SCRIPT
 * Handles: Header, Mobile Menu, Scroll Animations,
 *          Gallery Filter + Lightbox, Testimonial Slider,
 *          Contact Form
 */

(function () {
  'use strict';

  /* ─── Utility ───────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const isMobile = () => window.innerWidth <= 768;
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════════════════════════
     1. HEADER — Scroll behaviour + Hero mode
     ═══════════════════════════════════════════════════════════════ */
  const header = $('#site-header');
  const hero = $('#home');

  function updateHeader() {
    const scrolled = window.scrollY > 40;
    const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
    const inHero = heroBottom > 80;

    header.classList.toggle('scrolled', scrolled);
    header.classList.toggle('hero-mode', inHero && !scrolled);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ═══════════════════════════════════════════════════════════════
     2. MOBILE MENU
     ═══════════════════════════════════════════════════════════════ */
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobile-menu');

  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'menu-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(backdrop);

  function openMenu() {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('visible');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  backdrop.addEventListener('click', closeMenu);

  $$('.mobile-nav-link, .mobile-cta').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* ═══════════════════════════════════════════════════════════════
     3. SMOOTH SCROLLING — Nav & in-page links
     ═══════════════════════════════════════════════════════════════ */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = $(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-h')) || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ═══════════════════════════════════════════════════════════════
     4. SCROLL REVEAL — Intersection Observer
     ═══════════════════════════════════════════════════════════════ */
  if (!prefersReducedMotion()) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    $$('.reveal-section, .reveal-card, .reveal-step').forEach((el) => {
      revealObs.observe(el);
    });

    // Stagger siblings within the same parent
    $$('.bharata-cards, .why-grid, .programs-grid, .journey-timeline, .events-list').forEach(parent => {
      $$('.reveal-card, .reveal-step', parent).forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.1}s`;
      });
    });
  } else {
    // No animation — just show everything
    $$('.reveal-section, .reveal-card, .reveal-step').forEach(el => {
      el.classList.add('in-view');
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     5. GALLERY FILTER + LIGHTBOX
     ═══════════════════════════════════════════════════════════════ */
  const filterBtns = $$('.filter-btn');
  const galleryItems = $$('.gallery-item', $('#gallery-grid'));

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;

      galleryItems.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !show);
        // Animate
        if (show) {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.96)';
          requestAnimationFrame(() => {
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          });
        }
      });
    });
  });

  // Lightbox
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightbox-img');
  const lightboxCaption = $('#lightbox-caption');
  const lightboxClose = $('#lightbox-close');
  const lightboxPrev = $('#lightbox-prev');
  const lightboxNext = $('#lightbox-next');

  let currentLbIndex = 0;
  let visibleItems = [];

  function openLightbox(index) {
    visibleItems = galleryItems.filter(i => !i.classList.contains('hidden'));
    if (!visibleItems.length) return;

    currentLbIndex = ((index % visibleItems.length) + visibleItems.length) % visibleItems.length;
    setLightboxImage(currentLbIndex);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function setLightboxImage(idx) {
    const item = visibleItems[idx];
    if (!item) return;
    const img = $('img', item);
    const caption = $('.gallery-title', item);
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption ? caption.textContent : '';
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      const visIdx = galleryItems
        .filter(it => !it.classList.contains('hidden'))
        .indexOf(item);
      openLightbox(visIdx >= 0 ? visIdx : i);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  lightboxPrev.addEventListener('click', e => {
    e.stopPropagation();
    currentLbIndex = (currentLbIndex - 1 + visibleItems.length) % visibleItems.length;
    setLightboxImage(currentLbIndex);
  });

  lightboxNext.addEventListener('click', e => {
    e.stopPropagation();
    currentLbIndex = (currentLbIndex + 1) % visibleItems.length;
    setLightboxImage(currentLbIndex);
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev.click();
    if (e.key === 'ArrowRight') lightboxNext.click();
  });

  /* ═══════════════════════════════════════════════════════════════
     6. TESTIMONIALS SLIDER
     ═══════════════════════════════════════════════════════════════ */
  const track = $('#testimonials-track');
  const cards = $$('.testimonial-card', track);
  const dotsContainer = $('#slider-dots');
  const prevBtn = $('#slider-prev');
  const nextBtn = $('#slider-next');

  let currentSlide = 0;
  let autoSlideTimer;

  function getCardsVisible() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function totalSlides() {
    return Math.max(1, cards.length - getCardsVisible() + 1);
  }

  // Build dots
  function buildDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides(); i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === currentSlide ? ' active' : '');
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.dataset.i = i;
      dot.addEventListener('click', () => goTo(parseInt(dot.dataset.i)));
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(idx) {
    const total = totalSlides();
    currentSlide = ((idx % total) + total) % total;

    const cardWidth = cards[0].offsetWidth + 24; // gap = 24px
    track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;

    $$('.slider-dot', dotsContainer).forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function autoSlide() {
    autoSlideTimer = setInterval(() => {
      goTo(currentSlide + 1);
    }, 5000);
  }

  function resetAuto() {
    clearInterval(autoSlideTimer);
    autoSlide();
  }

  prevBtn.addEventListener('click', () => { goTo(currentSlide - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { goTo(currentSlide + 1); resetAuto(); });

  buildDots();
  autoSlide();

  window.addEventListener('resize', () => {
    buildDots();
    goTo(0);
  });

  /* ═══════════════════════════════════════════════════════════════
     7. CONTACT FORM
     ═══════════════════════════════════════════════════════════════ */
  const form = $('#contact-form');
  const formSuccess = $('#form-success');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const name = $('#contact-name').value.trim();
      const phone = $('#contact-phone-field').value.trim();
      const email = $('#contact-email-field').value.trim();

      if (!name || !phone || !email) {
        // Simple validation highlight
        [['#contact-name', name], ['#contact-phone-field', phone], ['#contact-email-field', email]]
          .forEach(([sel, val]) => {
            const el = $(sel);
            if (!val) {
              el.style.borderColor = 'var(--maroon)';
              el.addEventListener('input', () => {
                el.style.borderColor = '';
              }, { once: true });
            }
          });
        return;
      }

      // Simulate submission
      const submitBtn = $('#contact-submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      setTimeout(() => {
        form.reset();
        formSuccess.hidden = false;
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Enquiry <span class="btn-arrow" aria-hidden="true">→</span>';
        setTimeout(() => { formSuccess.hidden = true; }, 6000);
      }, 1200);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     8. ACTIVE NAV LINK on scroll
     ═══════════════════════════════════════════════════════════════ */
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  const sectionObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.25, rootMargin: '-80px 0px -55% 0px' }
  );

  sections.forEach(section => sectionObs.observe(section));

  /* ═══════════════════════════════════════════════════════════════
     9. LAZY IMAGE REVEAL (clip-path)
     ═══════════════════════════════════════════════════════════════ */
  if (!prefersReducedMotion()) {
    const imgObs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('img-revealed');
            imgObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    $$('.image-frame, .guru-image-wrap, .about-image-panel').forEach(el => {
      imgObs.observe(el);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     10. PAGE LOAD — Fade in body
     ═══════════════════════════════════════════════════════════════ */
  document.body.style.opacity = '0';
  window.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.5s ease';
      document.body.style.opacity = '1';
    });
  });

  // If DOM already loaded
  if (document.readyState !== 'loading') {
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.5s ease';
      document.body.style.opacity = '1';
    });
  }

})();
