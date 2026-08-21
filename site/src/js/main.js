// Alchemist 404 - vanilla JS: burger menu, scroll reveal, screenshots carousel + lightbox.
import '../styles/main.css';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Mobile nav toggle ---------------------------------------------------
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');

function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  menu.classList.remove('is-open');
}

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  menu.classList.toggle('is-open', !open);
});

menu.addEventListener('click', (e) => {
  if (e.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    toggle.focus();
  }
});

// --- Scroll reveal -------------------------------------------------------
const revealEls = document.querySelectorAll('.reveal');

// Reveal anything already intersecting the viewport. The IntersectionObserver
// alone misses elements arrived at via anchor jumps (nav clicks, /#hash loads),
// leaving sections at opacity 0 until the user scrolls manually.
function revealInView() {
  const vh = window.innerHeight;
  for (const el of revealEls) {
    if (el.classList.contains('is-visible')) continue;
    const r = el.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) el.classList.add('is-visible');
  }
}

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );
  revealEls.forEach((el) => observer.observe(el));

  revealInView(); // initial load, including direct /#hash loads
  window.addEventListener('load', revealInView);
  window.addEventListener('hashchange', revealInView);
  if ('onscrollend' in window) {
    window.addEventListener('scrollend', revealInView);
  }
  // Fallback for browsers without scrollend: check after anchor-driven scrolls
  document.addEventListener('click', (e) => {
    if (e.target.closest('a[href^="#"]')) {
      setTimeout(revealInView, 450);
      setTimeout(revealInView, 1000);
    }
  });
}

// The browser's initial hash jump happens before styles/images settle the
// layout (the carousel collapses its stacked slides once CSS applies), so a
// direct /#section load can land far from the target. Re-align after load.
window.addEventListener('load', () => {
  if (!location.hash) return;
  const target = document.getElementById(location.hash.slice(1));
  if (target) {
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
    revealInView();
  }
});

// --- Screenshots carousel ------------------------------------------------
const carousel = document.querySelector('.carousel');
const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
const dots = Array.from(carousel.querySelectorAll('.carousel-dot'));
const counter = carousel.querySelector('.carousel-counter');
const AUTOPLAY_MS = 5000;
const RESUME_MS = 10000;

let index = 0;
let autoTimer = null;
let resumeTimer = null;
let autoplayAllowed = !reduceMotion; // killed permanently on keyboard interaction
let hovered = false;
let focused = false;

function setSlide(i) {
  index = (i + slides.length) % slides.length;
  slides.forEach((slide, n) => {
    const active = n === index;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
    slide.querySelector('.shot-zoom').tabIndex = active ? 0 : -1;
  });
  dots.forEach((dot, n) => {
    if (n === index) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
  counter.textContent = `${index + 1} / ${slides.length}`;
  // Preload the neighbors so arrow clicks never show an empty frame
  for (const n of [(index + 1) % slides.length, (index - 1 + slides.length) % slides.length]) {
    for (const img of slides[n].querySelectorAll('img[loading="lazy"]')) {
      img.loading = 'eager';
    }
  }
}

function stopAuto() {
  clearInterval(autoTimer);
  autoTimer = null;
}

function startAuto() {
  if (!autoplayAllowed || autoTimer || hovered || focused || document.hidden) return;
  autoTimer = setInterval(() => setSlide(index + 1), AUTOPLAY_MS);
}

function killAuto() {
  autoplayAllowed = false;
  stopAuto();
  clearTimeout(resumeTimer);
}

// Pause after a pointer interaction, resume after 10s of inactivity.
function pauseAuto() {
  stopAuto();
  clearTimeout(resumeTimer);
  if (autoplayAllowed) resumeTimer = setTimeout(startAuto, RESUME_MS);
}

// event.detail === 0 on click means keyboard activation (Enter/Space)
function interacted(e) {
  if (e && e.type === 'click' && e.detail === 0) killAuto();
  else pauseAuto();
}

carousel.querySelector('.carousel-prev').addEventListener('click', (e) => {
  setSlide(index - 1);
  interacted(e);
});
carousel.querySelector('.carousel-next').addEventListener('click', (e) => {
  setSlide(index + 1);
  interacted(e);
});
dots.forEach((dot, n) =>
  dot.addEventListener('click', (e) => {
    setSlide(n);
    interacted(e);
  })
);

carousel.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    setSlide(index - 1);
    killAuto();
  } else if (e.key === 'ArrowRight') {
    setSlide(index + 1);
    killAuto();
  }
});

carousel.addEventListener('mouseenter', () => { hovered = true; stopAuto(); });
carousel.addEventListener('mouseleave', () => { hovered = false; startAuto(); });
carousel.addEventListener('focusin', (e) => {
  // Only keyboard-driven focus should hold autoplay: pointer clicks leave
  // focus on the button, which would otherwise block the resume timer forever.
  if (e.target.matches(':focus-visible')) {
    focused = true;
    stopAuto();
  }
});
carousel.addEventListener('focusout', (e) => {
  if (!carousel.contains(e.relatedTarget)) {
    focused = false;
    startAuto();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAuto();
  else startAuto();
});

setSlide(0);
startAuto();

// --- About pager (tutorial window arrow gems) ----------------------------
const pager = document.querySelector('.about-pager');
const pages = Array.from(pager.querySelectorAll('.about-page'));
const pagerDots = Array.from(pager.querySelectorAll('.carousel-dot'));
const pagerCounter = pager.querySelector('.about-counter');
let pageIndex = 0;

function setPage(i) {
  pageIndex = (i + pages.length) % pages.length;
  pages.forEach((page, n) => {
    page.classList.toggle('is-active', n === pageIndex);
    page.setAttribute('aria-hidden', String(n !== pageIndex));
  });
  pagerDots.forEach((dot, n) => {
    if (n === pageIndex) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
  pagerCounter.textContent = `${pageIndex + 1} / ${pages.length}`;
}

// Brief pressed flash with the game's pink gem art, visible even on fast taps
function flashPressed(btn) {
  btn.classList.add('is-pressed');
  setTimeout(() => btn.classList.remove('is-pressed'), 150);
}

for (const btn of pager.querySelectorAll('.about-arrow-prev, .about-mobile-prev')) {
  btn.addEventListener('click', () => {
    setPage(pageIndex - 1);
    flashPressed(btn);
  });
}
for (const btn of pager.querySelectorAll('.about-arrow-next, .about-mobile-next')) {
  btn.addEventListener('click', () => {
    setPage(pageIndex + 1);
    flashPressed(btn);
  });
}
pagerDots.forEach((dot, n) => dot.addEventListener('click', () => setPage(n)));

pager.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    setPage(pageIndex - 1);
    flashPressed(pager.querySelector('.about-arrow-prev'));
  } else if (e.key === 'ArrowRight') {
    setPage(pageIndex + 1);
    flashPressed(pager.querySelector('.about-arrow-next'));
  }
});

setPage(0);

// --- Lightbox (native <dialog>: focus trap + Escape for free) ------------
const lightbox = document.querySelector('.lightbox');
const lightboxImg = lightbox.querySelector('.lightbox-img');
const lightboxCaption = lightbox.querySelector('.lightbox-caption');

function largeUrlFor(slide) {
  // Largest WebP candidate from the screenshot's srcset (already Vite-hashed).
  // Scope to .shot-zoom: the slide's first <source> is the frame border art.
  const srcset = slide.querySelector('.shot-zoom source[type="image/webp"]').srcset;
  const candidates = srcset.split(',').map((c) => c.trim().split(/\s+/));
  const large = candidates.find(([, size]) => size === '1600w') || candidates.at(-1);
  return large[0];
}

function showInLightbox(i) {
  setSlide(i); // keep the carousel in sync
  const slide = slides[index];
  lightboxImg.src = largeUrlFor(slide);
  lightboxImg.alt = slide.querySelector('.shot-zoom img').alt;
  lightboxCaption.textContent = slide.querySelector('.shot-caption').textContent;
}

slides.forEach((slide, n) => {
  slide.querySelector('.shot-zoom').addEventListener('click', (e) => {
    interacted(e);
    showInLightbox(n);
    lightbox.showModal();
  });
});

lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showInLightbox(index - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => showInLightbox(index + 1));

lightbox.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') showInLightbox(index - 1);
  else if (e.key === 'ArrowRight') showInLightbox(index + 1);
});

// Click on the backdrop (outside the figure/buttons) closes
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.close();
});
