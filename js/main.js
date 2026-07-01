/* ============================================================
   Loftare Studio — main.js
   Nav · Components · Calculator · Reveals · Menu · Form · FAQ
   ============================================================ */

const CONFIG = {
  formspreeId:  'YOUR_FORMSPREE_ID',
  calendlyUrl:  'https://calendly.com/dennis-loftare/discovery',
  contactEmail: 'dennis@loftare.studio',
  siteUrl:      'https://loftare.studio',
};

/* --- Component loader --------------------------------------- */
async function loadComponent(id, file) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res = await fetch(`/components/${file}`);
    if (!res.ok) return;
    el.innerHTML = await res.text();
  } catch (_) { /* local file protocol — components won't load, that's fine */ }
}

/* --- Nav scroll behaviour ----------------------------------- */
function initNavScroll() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  function update() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* --- Active nav link ---------------------------------------- */
function initActiveNav() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a, .footer-nav a').forEach(a => {
    const href = a.getAttribute('href')?.replace(/\/$/, '') || '';
    if (href === path || (path === '' && href === '/') || (href !== '/' && href !== '' && path.startsWith(href))) {
      a.classList.add('active');
    }
  });
}

/* --- Mobile menu -------------------------------------------- */
function initMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger');
  const menu = document.getElementById('mobile-menu');
  const close = document.getElementById('mobile-close');

  if (!hamburger || !menu) return;

  hamburger.addEventListener('click', () => {
    menu.classList.toggle('open');
    hamburger.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });

  function closeMenu() {
    menu.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Active state for mobile nav links
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  menu.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href')?.replace(/\/$/, '') || '';
    if (href === path || (path === '' && href === '/') || (href !== '/' && href !== '' && path.startsWith(href))) {
      a.classList.add('nav-active');
    }
    a.addEventListener('click', closeMenu);
  });

  if (close) close.addEventListener('click', closeMenu);
}

/* --- Fee calculator ----------------------------------------- */
function initCalculator() {
  const input   = document.getElementById('calc-input');
  const result  = document.getElementById('calc-result');
  const primary = document.getElementById('calc-primary');
  const secondary = document.getElementById('calc-secondary');
  const placeholder = document.getElementById('calc-placeholder');
  const ctaBlock = document.getElementById('calc-cta');

  if (!input || !result) return;

  const AVG_STAY  = 7000;
  const FEE_RATE  = 0.155;
  let   animFrame = null;

  function animateCounter(el, target, duration) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = formatDollar(target);
      return;
    }
    const start = performance.now();
    const from  = 0;

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
      const current  = Math.round(from + (target - from) * eased);
      el.textContent = formatDollar(current);
      if (progress < 1) animFrame = requestAnimationFrame(step);
    }

    if (animFrame) cancelAnimationFrame(animFrame);
    animFrame = requestAnimationFrame(step);
  }

  function formatDollar(n) {
    return '$' + n.toLocaleString('en-US');
  }

  function calculate() {
    const raw = input.value.replace(/[^0-9.]/g, '');
    const revenue = parseFloat(raw);

    if (!raw || isNaN(revenue) || revenue <= 0) {
      if (placeholder) placeholder.style.display = 'block';
      if (primary)     primary.style.display = 'none';
      if (secondary)   secondary.style.display = 'none';
      if (ctaBlock)    ctaBlock.classList.remove('visible');
      return;
    }

    const fees     = Math.round(revenue * FEE_RATE);
    const bookings = Math.round(fees / AVG_STAY);

    if (placeholder) placeholder.style.display = 'none';
    if (primary)     primary.style.display = 'block';
    if (secondary)   secondary.style.display = 'block';
    if (ctaBlock)    ctaBlock.classList.add('visible');

    if (primary) {
      primary.textContent = formatDollar(0);
      animateCounter(primary, fees, 800);
    }

    if (secondary) {
      secondary.textContent = "Airbnb's cut at 15.5%.";
    }
  }

  input.addEventListener('input', calculate);
}

/* --- Scroll reveal ------------------------------------------ */
function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* --- FAQ accordion ------------------------------------------ */
function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* --- Contact form ------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

    const data = new FormData(form);
    try {
      const res = await fetch('/form-handler.php', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        form.innerHTML = '<p class="form-success">Message received. We\'ll be in touch within 24 hours.</p>';
      } else {
        if (btn) { btn.textContent = 'Send message →'; btn.disabled = false; }
        alert('Something went wrong. Please email dennis@loftare.studio directly.');
      }
    } catch (_) {
      if (btn) { btn.textContent = 'Send message →'; btn.disabled = false; }
      alert('Something went wrong. Please email dennis@loftare.studio directly.');
    }
  });
}

/* --- Calendly inline embed ---------------------------------- */
function initCalendly() {
  const el = document.getElementById('calendly-embed');
  if (!el) return;
  const script = document.createElement('script');
  script.src = 'https://assets.calendly.com/assets/external/widget.js';
  script.async = true;
  document.head.appendChild(script);
}

/* --- Boot --------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const shell = document.querySelector('.calc-shell');
  if (shell) shell.style.visibility = 'visible';
  loadComponent('nav-placeholder', 'nav.html').then(() => {
    initNavScroll();
    initActiveNav();
    initMobileMenu();
  });
  loadComponent('footer-placeholder', 'footer.html');

  initCalculator();
  initReveal();
  initFAQ();
  initContactForm();
  initCalendly();
});
