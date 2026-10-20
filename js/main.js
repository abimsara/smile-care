/* ============================================================
   SMILECARE DENTAL CLINIC - SHARED SCRIPTS
   ============================================================ */

/* --- Mobile menu --- */
const navToggle  = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');
const header     = document.getElementById('siteHeader');

if (navToggle && navLinksEl) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinksEl.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinksEl.addEventListener('click', e => {
    if (e.target.closest('a')) {
      navLinksEl.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinksEl.classList.contains('open')) {
      navLinksEl.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });
  document.addEventListener('click', e => {
    if (!navLinksEl.contains(e.target) && !navToggle.contains(e.target)) {
      navLinksEl.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* --- Sticky header shadow --- */
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
}

/* --- Scroll reveal --- */
const revealEls = Array.from(document.querySelectorAll('.reveal'));
let observer = null;
if ('IntersectionObserver' in window) {
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  revealEls.forEach(el => observer.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}
window.addEventListener('scroll', () => {
  if (!observer) return;
  revealEls.forEach(el => {
    if (el.classList.contains('in')) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.96 && rect.bottom > 0) {
      el.classList.add('in');
      observer.unobserve(el);
    }
  });
}, { passive: true });

/* --- FAQ accordion --- */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const panel  = item.querySelector('.faq-a');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(other => {
      if (other !== item) {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      }
    });
    item.classList.toggle('open', !isOpen);
    btn.setAttribute('aria-expanded', String(!isOpen));
    panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : null;
  });
});

/* --- Gallery lightbox --- */
(function () {
  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn    = document.getElementById('lightboxClose');
  if (!lightbox) return;

  function open(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('click', () => {
      const full = item.getAttribute('data-full');
      const alt  = item.getAttribute('data-alt') || '';
      if (full) open(full, alt);
    });
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) close();
  });
})();

/* --- Appointment form validation --- */
(function () {
  const form = document.getElementById('appointmentForm');
  if (!form) return;

  const successBox = document.getElementById('formSuccess');
  const dateInput  = document.getElementById('date');

  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2, '0');
  const dd    = String(today.getDate()).padStart(2, '0');
  if (dateInput) dateInput.min = `${yyyy}-${mm}-${dd}`;

  const rules = {
    fullName: { test: v => v.trim().length >= 3 && /[a-zA-Z\u0D80-\u0DFF]/.test(v), msg: 'Please enter your full name.' },
    phone:    { test: v => /^[+0-9][0-9\s\-()]{8,15}$/.test(v.trim()), msg: 'Please enter a valid phone number.' },
    email:    { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), msg: 'Please enter a valid email.' },
    service:  { test: v => v !== '', msg: 'Please select a treatment.' },
    date:     { test: v => v !== '', msg: 'Please choose a date.' }
  };

  function setError(name, message) {
    const input = form.elements[name];
    const errEl = form.querySelector(`[data-error-for="${name}"]`);
    if (input) input.classList.toggle('invalid', Boolean(message));
    if (errEl) errEl.textContent = message || '';
  }
  function validateField(name) {
    const rule = rules[name];
    if (!rule) return true;
    const valid = rule.test(form.elements[name].value);
    setError(name, valid ? '' : rule.msg);
    return valid;
  }

  Object.keys(rules).forEach(name => {
    const input = form.elements[name];
    if (!input) return;
    input.addEventListener('blur', () => validateField(name));
    input.addEventListener('input', () => { if (input.classList.contains('invalid')) validateField(name); });
    input.addEventListener('change', () => { if (input.classList.contains('invalid')) validateField(name); });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let firstInvalid = null;
    let allValid = true;
    Object.keys(rules).forEach(name => {
      const ok = validateField(name);
      if (!ok) { allValid = false; if (!firstInvalid) firstInvalid = form.elements[name]; }
    });
    if (!allValid) {
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.style.opacity = '0.75';
    btn.textContent = 'Sending...';
    setTimeout(() => {
      successBox.classList.add('show');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.reset();
      Object.keys(rules).forEach(name => setError(name, ''));
      btn.disabled = false;
      btn.style.opacity = '';
      btn.innerHTML = originalHTML;
      setTimeout(() => successBox.classList.remove('show'), 8000);
    }, 900);
  });
})();

/* --- Footer year --- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();