// ===== Слайдеры "до/после" =====
const compares = document.querySelectorAll('[data-compare]');

function setCompareValue(compare, value) {
  const beforeWrap = compare.querySelector('.compare__before-wrap');
  const beforeImg = compare.querySelector('.compare__before');
  const divider = compare.querySelector('.compare__divider');
  const width = compare.offsetWidth;

  beforeWrap.style.width = value + '%';
  divider.style.left = value + '%';
  // изображение "до" держит полную ширину контейнера, чтобы не сжиматься вместе с обёрткой
  beforeImg.style.width = width + 'px';
}

compares.forEach((compare) => {
  const range = compare.querySelector('.compare__range');
  setCompareValue(compare, range.value);
  range.addEventListener('input', () => setCompareValue(compare, range.value));
  window.addEventListener('resize', () => setCompareValue(compare, range.value));
});

// ===== Мобильное меню =====
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav');

if (burger) {
  burger.addEventListener('click', () => {
    nav.classList.toggle('nav--open');
    burger.classList.toggle('burger--open');
  });
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav--open');
      burger.classList.remove('burger--open');
    });
  });
}

// ===== Форма заявки (демо, без реальной отправки) =====
const leadForm = document.getElementById('leadForm');
const formStatus = document.getElementById('formStatus');

if (leadForm) {
  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formStatus.textContent = 'Спасибо! Это демо-форма — заявки никуда не отправляются.';
    leadForm.reset();
  });
}

// ===== Кастомный курсор =====
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

if (cursorDot && cursorRing && !isCoarsePointer) {
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, input, textarea, [data-tilt]').forEach((el) => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-ring--active'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-ring--active'));
  });
}

// ===== Магнитные кнопки =====
if (!isCoarsePointer) {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
    });
  });
}

// ===== 3D-наклон карточек =====
if (!isCoarsePointer) {
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateX = (-py * 10).toFixed(2);
      const rotateY = (px * 12).toFixed(2);
      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

// ===== Скролл-риввил =====
const revealEls = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => revealObserver.observe(el));

// ===== Счётчики в хиро-статистике =====
const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.4 });
counters.forEach((el) => counterObserver.observe(el));

// ===== Хиро: скролл сдвигает границу "до/после" =====
const heroScroll = document.querySelector('[data-hero-scroll]');
const heroAfterImg = document.querySelector('[data-hero-after]');
const heroDivider = document.querySelector('[data-hero-divider]');

if (heroScroll && heroAfterImg && heroDivider) {
  function updateHeroProgress() {
    const rect = heroScroll.getBoundingClientRect();
    const total = heroScroll.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = total > 0 ? Math.min(Math.max(scrolled / total, 0), 1) : 0;
    const percent = progress * 100;
    heroAfterImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    heroDivider.style.left = percent + '%';
    // у самых краёв линия читается как рамка экрана — прячем её там
    heroDivider.style.opacity = (percent < 3 || percent > 97) ? '0' : '1';
  }
  window.addEventListener('scroll', updateHeroProgress, { passive: true });
  window.addEventListener('resize', updateHeroProgress);
  updateHeroProgress();
}

// ===== Боковая sticky-навигация со scrollspy =====
const sideNav = document.querySelector('[data-side-nav]');

if (sideNav) {
  const sideLinks = Array.from(sideNav.querySelectorAll('[data-side-link]'));
  const sideSections = sideLinks
    .map((link) => document.getElementById(link.dataset.sideLink))
    .filter(Boolean);

  const sideNavObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = sideNav.querySelector(`[data-side-link="${entry.target.id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        sideLinks.forEach((l) => l.classList.remove('is-active'));
        link.classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sideSections.forEach((section) => sideNavObserver.observe(section));
}

// ===== Карусель "до/после" =====
const carousel = document.querySelector('[data-carousel]');

if (carousel) {
  const track = carousel.querySelector('[data-carousel-track]');
  const slides = Array.from(track.children);
  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  const thumbs = Array.from(document.querySelectorAll('[data-carousel-goto]'));
  let current = 0;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    thumbs.forEach((thumb, i) => thumb.classList.toggle('is-active', i === current));
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => goTo(i)));

  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Свайп на тач-устройствах
  let touchStartX = 0;
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  carousel.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 40) {
      diff < 0 ? goTo(current + 1) : goTo(current - 1);
    }
  }, { passive: true });

  goTo(0);
}

// ===== Лайтбокс портфолио =====
const gallery = document.querySelector('[data-gallery]');
const lightbox = document.querySelector('[data-lightbox]');

if (gallery && lightbox) {
  const items = Array.from(gallery.querySelectorAll('.portfolio-item'));
  const lbImg = lightbox.querySelector('[data-lightbox-img]');
  const lbTag = lightbox.querySelector('[data-lightbox-tag]');
  const lbTitle = lightbox.querySelector('[data-lightbox-title]');
  const lbCount = lightbox.querySelector('[data-lightbox-count]');
  const closeBtn = lightbox.querySelector('[data-lightbox-close]');
  const prevLbBtn = lightbox.querySelector('[data-lightbox-prev]');
  const nextLbBtn = lightbox.querySelector('[data-lightbox-next]');
  let lbCurrent = 0;

  function renderLightbox() {
    const item = items[lbCurrent];
    const img = item.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbTag.textContent = item.querySelector('.portfolio-item__tag').textContent;
    lbTitle.textContent = item.querySelector('.portfolio-item__overlay h3').textContent;
    lbCount.textContent = `${lbCurrent + 1} / ${items.length}`;
  }

  // iOS Safari игнорирует overflow:hidden на body при открытых fixed-элементах —
  // фиксируем body на текущей позиции скролла и возвращаем её при закрытии.
  function openLightbox(index) {
    lbCurrent = index;
    renderLightbox();
    lightbox.hidden = false;
    const scrollY = window.scrollY;
    document.body.dataset.scrollLock = String(scrollY);
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
  }

  function closeLightbox() {
    lightbox.hidden = true;
    const scrollY = parseInt(document.body.dataset.scrollLock || '0', 10);
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    delete document.body.dataset.scrollLock;
    window.scrollTo(0, scrollY);
  }

  function goLightbox(delta) {
    lbCurrent = (lbCurrent + delta + items.length) % items.length;
    renderLightbox();
  }

  items.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
  closeBtn.addEventListener('click', closeLightbox);
  prevLbBtn.addEventListener('click', () => goLightbox(-1));
  nextLbBtn.addEventListener('click', () => goLightbox(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goLightbox(-1);
    if (e.key === 'ArrowRight') goLightbox(1);
  });
}
