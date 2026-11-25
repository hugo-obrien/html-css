/*
 * Кровь и Мёд — интерактив сайта.
 * Реализовано: мобильное меню, табы, аккордеон, лайтбокс-галерея,
 * canvas-демо «прокачки», reveal-анимации и валидация формы.
 */

(function () {
  'use strict';

  // ---------- Мобильное меню ----------
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');

  function closeMenu() {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      const open = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Закрытие меню при клике по ссылке.
    mainNav.addEventListener('click', function (e) {
      if (e.target.closest('.menu-link')) {
        closeMenu();
      }
    });

    // Закрытие меню при нажатии Escape.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMenu();
      }
    });
  }

  // ---------- Табы (фракции) ----------
  const tablist = document.getElementById('factions');
  if (tablist) {
    const tabs = tablist.querySelectorAll('.tabs-btn');
    const panels = tablist.querySelectorAll('.tabs-panel');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) {
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        panels.forEach(function (panel) {
          panel.classList.toggle('tabs-panel--active', panel.id === tab.getAttribute('aria-controls'));
        });
      });
    });
  }

  // ---------- Аккордеон ----------
  const accordion = document.getElementById('mechanics');
  if (accordion) {
    const items = accordion.querySelectorAll('.accordion-trigger');
    items.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        const panel = document.getElementById(trigger.getAttribute('aria-controls'));

        // Закрываем остальные открытые пункты (один открыт за раз).
        items.forEach(function (t) {
          t.setAttribute('aria-expanded', 'false');
          const p = document.getElementById(t.getAttribute('aria-controls'));
          if (p) p.style.maxHeight = null;
        });

        if (!expanded) {
          trigger.setAttribute('aria-expanded', 'true');
          if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  }

  // ---------- Лайтбокс-галерея ----------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');

  if (lightbox && lightboxImg) {
    const galleryFigures = document.querySelectorAll('[data-lightbox]');

    function openLightbox(src, caption, alt) {
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      if (lightboxCaption) lightboxCaption.textContent = caption || '';
      lightbox.classList.add('lightbox--open');
      document.body.classList.add('no-scroll');
    }

    function closeLightbox() {
      lightbox.classList.remove('lightbox--open');
      document.body.classList.remove('no-scroll');
    }

    galleryFigures.forEach(function (figure) {
      figure.addEventListener('click', function () {
        const img = figure.querySelector('img');
        const caption = figure.getAttribute('data-caption');
        if (img) openLightbox(img.src, caption, img.alt);
      });
    });

    lightbox.querySelectorAll('[data-lightbox-close]').forEach(function (el) {
      el.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('lightbox--open')) {
        closeLightbox();
      }
    });
  }

  // ---------- Canvas-демо «прокачки» ----------
  const canvas = document.getElementById('skill-demo');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const masteryEl = document.getElementById('demo-mastery');
    const levelEl = document.getElementById('demo-level');

    let mastery = 0;
    let toNext = 10;
    let level = 1;
    let particles = [];

    // Подгонка размера под ретину и DPR.
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function draw() {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // Фон.
      ctx.fillStyle = '#120d1e';
      ctx.fillRect(0, 0, w, h);

      // Шкала мастерства.
      const barW = w * 0.72;
      const barH = 22;
      const barX = (w - barW) / 2;
      const barY = h / 2 - barH / 2;
      const progress = Math.min(mastery / toNext, 1);

      ctx.fillStyle = '#241a35';
      ctx.fillRect(barX, barY, barW, barH);

      ctx.fillStyle = progress >= 1 ? '#b23a3a' : '#c9a227';
      ctx.fillRect(barX, barY, barW * progress, barH);

      // Текст.
      ctx.fillStyle = '#ece5d6';
      ctx.font = '600 14px Nunito Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Мастерство ' + mastery + ' / ' + toNext, w / 2, barY - 14);
      if (progress >= 1) {
        ctx.fillText('+ УРОВЕНЬ!', w / 2, barY + barH + 26);
      }

      // Рисуем частицы.
      particles.forEach(function (p) {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Раскраска фона в зависимости от активности.
      const hint = level > 1 ? 'Новый уровень! Продолжай кликать.' : 'Кликай по полю, чтобы расти.';
      ctx.fillText(hint, w / 2, h - 20);
    }

    function spawnBurst(x, y) {
      const colors = ['#c9a227', '#7a4ff0', '#b23a3a', '#ece5d6'];
      for (let i = 0; i < 22; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 1.5 + Math.random() * 2.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 40 + Math.random() * 20,
          maxLife: 60,
        });
      }
    }

    function tick() {
      particles = particles.filter(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        return p.life > 0;
      });
      draw();
      requestAnimationFrame(tick);
    }

    canvas.addEventListener('pointerdown', function (e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mastery += 1;
      if (masteryEl) masteryEl.textContent = mastery;

      if (mastery >= toNext) {
        mastery = 0;
        level += 1;
        toNext = 10 + (level - 1) * 5;
        if (levelEl) levelEl.textContent = level;
        spawnBurst(x, y);
      } else {
        spawnBurst(x, y);
      }
    });

    window.addEventListener('resize', resize);
    resize();
    draw();
    requestAnimationFrame(tick);
  }

  // ---------- Reveal-анимации при скролле ----------
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(function (el) {
    el.classList.add('reveal');
    observer.observe(el);
  });

  // ---------- Валидация формы ----------
  const form = document.getElementById('contact-form');
  if (form) {
    const formMessage = document.getElementById('form-message');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const message = form.elements.message.value.trim();
      const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

      if (!name) {
        formMessage.textContent = 'Пожалуйста, представься.';
        formMessage.className = 'form-message form-message--error';
        return;
      }

      if (!emailRe.test(email)) {
        formMessage.textContent = 'Проверь адрес почты — он выглядит подозрительно.';
        formMessage.className = 'form-message form-message--error';
        return;
      }

      if (message.length < 10) {
        formMessage.textContent = 'Сообщение слишком короткое. Расскажи чуть подробнее.';
        formMessage.className = 'form-message form-message--error';
        return;
      }

      formMessage.textContent = 'Спасибо! Твоё сообщение улетело в Кровавый культ. Мы свяжемся с тобой из катакомб.';
      formMessage.className = 'form-message form-message--success';
      form.reset();
    });
  }
})();
