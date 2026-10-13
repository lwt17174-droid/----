/* 山野有橙 — vanilla interactions; no runtime dependencies */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Intro: play once per tab session; the skip button is always keyboard reachable.
  const intro = $('#intro');
  const closeIntro = () => {
    if (!intro) return;
    intro.classList.add('is-gone');
    try { sessionStorage.setItem('gannan-intro-seen', '1'); } catch (_) {}
  };
  try { if (sessionStorage.getItem('gannan-intro-seen') || reducedMotion) intro?.classList.add('is-gone'); } catch (_) {}
  $('#skipIntro')?.addEventListener('click', closeIntro);
  if (!reducedMotion && !intro?.classList.contains('is-gone')) window.setTimeout(closeIntro, 2450);

  // Reveal sections as they enter view; no animation work is done off-screen.
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -35px 0px' });
  $$('.reveal, .story-visual, .trace-board').forEach(el => revealObserver.observe(el));

  // Scroll state: nav glass, juice progress, story chapters, and footer fruit drift.
  const header = $('.site-header');
  const progress = $('#scrollProgress');
  const footerFruit = $('.footer-oranges');
  const storySteps = $$('#storySteps li');
  let scrollFrame = 0;
  const updateScrollDetails = () => {
    scrollFrame = 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    header?.classList.toggle('is-scrolled', window.scrollY > 40);
    if (footerFruit) footerFruit.style.setProperty('--footer-shift', `${Math.max(-28, Math.min(0, (window.innerHeight - footerFruit.getBoundingClientRect().top) * -.035))}px`);
  };
  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollDetails);
  }, { passive: true });
  window.addEventListener('resize', updateScrollDetails, { passive: true });
  updateScrollDetails();

  // Current section follows the reading position, with the hero selected at the top.
  const navLinks = $$('.nav-links a');
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: '-33% 0px -58% 0px', threshold: 0 });
  navLinks.forEach(link => {
    const section = link.hash && $(link.hash);
    if (section) sectionObserver.observe(section);
  });

  // Mobile menu opens as an accessible full-screen panel and closes on selection/Escape.
  const menuToggle = $('#menuToggle');
  const nav = $('#primaryNav');
  const setMenu = open => {
    menuToggle?.setAttribute('aria-expanded', String(open));
    menuToggle?.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    nav?.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };
  menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });

  // Low-amplitude hero parallax and cursor-following light spot on fine pointers only.
  const hero = $('.hero');
  const cursor = $('#juiceCursor');
  if (finePointer && !reducedMotion && hero) {
    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      hero.style.setProperty('--glow-x', `${x * 100}%`);
      hero.style.setProperty('--glow-y', `${y * 100}%`);
      hero.querySelector('.hero-photo').style.transform = `translate3d(${(x - .5) * -8}px,${(y - .5) * -6}px,0) scale(1.035)`;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      hero.querySelector('.hero-photo').style.transform = '';
      hero.style.setProperty('--glow-x', '69%');
      hero.style.setProperty('--glow-y', '34%');
    });
  }
  if (finePointer) {
    document.addEventListener('pointermove', event => {
      cursor?.classList.add('is-visible');
      if (cursor) { cursor.style.left = `${event.clientX}px`; cursor.style.top = `${event.clientY}px`; }
      const target = event.target.closest?.('a, button');
      cursor?.classList.toggle('is-active', Boolean(target));
    }, { passive: true });
    document.addEventListener('pointerdown', event => {
      if (reducedMotion) return;
      const ripple = document.createElement('i');
      ripple.className = 'juice-ripple';
      ripple.style.left = `${event.clientX - 6}px`;
      ripple.style.top = `${event.clientY - 6}px`;
      document.body.append(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    }, { passive: true });
  }

  // Optional tiny Web Audio cue. No audio context or sound is created until opted in.
  let soundEnabled = false;
  let audioContext;
  const soundToggle = $('#soundToggle');
  const setSound = enabled => {
    soundEnabled = enabled;
    soundToggle?.setAttribute('aria-pressed', String(enabled));
    soundToggle?.setAttribute('aria-label', enabled ? '关闭轻柔提示音' : '开启轻柔提示音');
    $('.sound-label', soundToggle)?.replaceChildren(document.createTextNode(enabled ? '声音已开' : '声音已关'));
  };
  soundToggle?.addEventListener('click', () => setSound(!soundEnabled));
  const playCue = () => {
    if (!soundEnabled) return;
    try {
      audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = 660;
      gain.gain.setValueAtTime(.045, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .15);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + .16);
    } catch (_) { /* Audio is an optional enhancement; the UI stays functional. */ }
  };

  // Product image gestures: subtle 3D tilt preview, cut/splash feedback and cart flight.
  const cartCount = $('#cartCount');
  let cartItems = 0;
  try { cartItems = Number(localStorage.getItem('gannan-cart-count') || 0); } catch (_) {}
  if (cartCount) cartCount.textContent = String(cartItems);
  let toastTimer;
  const toast = message => {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.classList.remove('is-visible'), 2300);
  };
  $$('.product-visual').forEach(visual => {
    const image = $('img', visual);
    let startX = 0;
    let dragDistance = 0;
    visual.addEventListener('pointerdown', event => {
      startX = event.clientX; dragDistance = 0;
      visual.setPointerCapture?.(event.pointerId);
      visual.dataset.dragging = 'true';
    });
    visual.addEventListener('pointermove', event => {
      if (visual.dataset.dragging !== 'true') return;
      const delta = event.clientX - startX;
      dragDistance += Math.abs(delta);
      startX = event.clientX;
      const current = Number(visual.dataset.angle || 0);
      const next = (current + delta * .6) % 360;
      visual.dataset.angle = String(next);
      image?.style.setProperty('--drag-rotate', `${next}deg`);
    });
    const finishDrag = () => { visual.dataset.dragging = 'false'; };
    visual.addEventListener('pointerup', finishDrag);
    visual.addEventListener('pointercancel', finishDrag);
    visual.addEventListener('click', () => {
      if (dragDistance > 8) return;
      visual.classList.add('is-sliced');
      playCue();
      if (!reducedMotion) {
        const splash = $('.splash', visual);
        for (let i = 0; i < 7; i++) {
          const drop = document.createElement('i');
          drop.className = 'juice-drop';
          drop.style.setProperty('--drop-angle', `${i * 51 + 8}deg`);
          splash?.append(drop);
          window.setTimeout(() => drop.remove(), 750);
        }
      }
      window.setTimeout(() => visual.classList.remove('is-sliced'), 720);
    });
  });

  $$('[data-add]').forEach(button => button.addEventListener('click', event => {
    event.stopPropagation();
    const card = button.closest('.product-card');
    const source = $('.product-visual img', card);
    const target = $('.cart-link');
    if (source && target && !reducedMotion) {
      const from = source.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const flyer = source.cloneNode();
      flyer.className = 'flying-fruit';
      Object.assign(flyer.style, { left: `${from.left + from.width / 2 - 26}px`, top: `${from.top + from.height / 2 - 26}px`, width: '52px', height: '52px' });
      document.body.append(flyer);
      const dx = to.left + to.width / 2 - (from.left + from.width / 2);
      const dy = to.top + to.height / 2 - (from.top + from.height / 2);
      flyer.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(.12)`, opacity: .15 }], { duration: 680, easing: 'cubic-bezier(.2,.8,.25,1)' }).finished.finally(() => flyer.remove());
    }
    cartItems += 1;
    try { localStorage.setItem('gannan-cart-count', String(cartItems)); } catch (_) {}
    if (cartCount) cartCount.textContent = String(cartItems);
    target?.setAttribute('aria-label', `购物袋，${cartItems} 件`);
    cartCount?.classList.remove('bump');
    requestAnimationFrame(() => cartCount?.classList.add('bump'));
    toast(`${card?.dataset.product || '赣南脐橙'} 已加入购物袋`);
    playCue();
  }));

  // Story timeline lights one chapter at a time as the reading point moves.
  const storyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const index = storySteps.indexOf(entry.target);
      storySteps.forEach((step, stepIndex) => step.classList.toggle('is-current', stepIndex === index));
    });
  }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
  storySteps.forEach(step => storyObserver.observe(step));

  // Trace detail cards expand independently for keyboard and touch users.
  $$('.trace-card').forEach(card => card.addEventListener('click', () => {
    const open = card.getAttribute('aria-expanded') === 'true';
    card.setAttribute('aria-expanded', String(!open));
    playCue();
  }));

  // Review rail: CSS auto glide pauses on hover/focus; pointer drag works on touch/desktop.
  const reviewViewport = $('#reviewViewport');
  let reviewDown = false;
  let reviewStartX = 0;
  let reviewScroll = 0;
  reviewViewport?.addEventListener('pointerdown', event => {
    reviewDown = true; reviewStartX = event.clientX; reviewScroll = reviewViewport.scrollLeft;
    reviewViewport.classList.add('is-dragging');
  });
  reviewViewport?.addEventListener('pointermove', event => {
    if (reviewDown) reviewViewport.scrollLeft = reviewScroll - (event.clientX - reviewStartX);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => reviewViewport?.addEventListener(type, () => {
    reviewDown = false; reviewViewport?.classList.remove('is-dragging');
  }));
  const reviewStep = () => Math.min(380, reviewViewport?.clientWidth * .82 || 300);
  $('#reviewPrev')?.addEventListener('click', () => reviewViewport?.scrollBy({ left: -reviewStep(), behavior: reducedMotion ? 'auto' : 'smooth' }));
  $('#reviewNext')?.addEventListener('click', () => reviewViewport?.scrollBy({ left: reviewStep(), behavior: reducedMotion ? 'auto' : 'smooth' }));

  // Seasonal countdown (demo date; replace with the confirmed event schedule).
  const harvestAt = new Date('2026-11-15T09:00:00+08:00').getTime();
  const updateCountdown = () => {
    let remaining = Math.max(0, harvestAt - Date.now());
    const days = Math.floor(remaining / 86400000); remaining %= 86400000;
    const hours = Math.floor(remaining / 3600000); remaining %= 3600000;
    const minutes = Math.floor(remaining / 60000); remaining %= 60000;
    const seconds = Math.floor(remaining / 1000);
    const values = [days, hours, minutes, seconds].map(value => String(value).padStart(2, '0'));
    ['#countDays', '#countHours', '#countMinutes', '#countSeconds'].forEach((selector, index) => {
      const digit = $(selector);
      if (!digit || digit.textContent === values[index]) return;
      digit.textContent = values[index];
      digit.classList.remove('flip');
      void digit.offsetWidth;
      digit.classList.add('flip');
    });
  };
  updateCountdown();
  if ($('#countSeconds')) window.setInterval(updateCountdown, 1000);

  // Small seasonal particle burst; capped and reduced on phones.
  const couponButton = $('#couponButton');
  couponButton?.addEventListener('click', () => {
    $('#couponFeedback').textContent = '采摘节提醒已为你记下。新果季见。';
    toast('采摘节提醒已加入');
    playCue();
    const field = $('#harvestParticles');
    const count = window.innerWidth < 680 ? 5 : 12;
    for (let i = 0; i < count; i++) {
      const orange = document.createElement('i');
      orange.className = 'particle';
      orange.style.left = `${Math.random() * 100}%`;
      orange.style.setProperty('--fall', `${3.8 + Math.random() * 2.8}s`);
      orange.style.setProperty('--drift', `${Math.round(Math.random() * 120 - 60)}px`);
      field?.append(orange);
      orange.addEventListener('animationend', () => orange.remove(), { once: true });
    }
  });

  // Contact form preview: validate locally, then clearly disclose that no message is sent.
  $('#contactForm')?.addEventListener('submit', event => {
    event.preventDefault();
    $('#formFeedback').textContent = '演示模式：表单验证通过，但尚未发送。请接入真实邮件或 CRM 服务。';
    toast('表单预览完成，尚未发送');
  });
})();

