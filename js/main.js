/* ============================================================
   Vedant Sharma — Portfolio
   Plexus network scene + Lenis smooth scroll + GSAP effects
   ============================================================ */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (prefersReduced) document.documentElement.classList.add('no-motion');

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Smooth scroll (Lenis) ---------------- */
  let lenis = null;
  if (!prefersReduced && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { offset: -64, duration: 1.4 });
    else target.scrollIntoView({ behavior: 'smooth' });
  }

  /* ---------------- Three.js plexus network ----------------
     Drifting nodes form and dissolve connections by proximity.
     The cursor gently pushes nodes aside; a handful of "signal"
     edges light up in the accent colour, like activations moving
     through a neural net. ------------------------------------ */
  let scrollProgress = 0;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  if (!prefersReduced && typeof THREE !== 'undefined') {
    const canvas = document.getElementById('webgl');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    const CAM_Z = 11;
    camera.position.z = CAM_Z;

    // palette — matches the CSS theme
    const BG = new THREE.Color(0xfaf9f6);
    const LINE_INK = new THREE.Color(0x39415f);
    const SIGNAL = new THREE.Color(0x2742e8);
    const SIGNAL_FAR = new THREE.Color(0x6d5bd0);

    // field sized to fill the viewport at z = 0
    let halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * CAM_Z * 1.15;
    let halfW = halfH * camera.aspect * 1.15;
    const DEPTH = 2.6;

    const COUNT = isTouch ? 70 : 130;
    const LINK_DIST = isTouch ? 2.9 : 2.6;
    const LINK_DIST2 = LINK_DIST * LINK_DIST;
    const MAX_SEGMENTS = COUNT * 10;

    const group = new THREE.Group();
    scene.add(group);

    // node state
    const pos = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() * 2 - 1) * halfW;
      pos[i * 3 + 1] = (Math.random() * 2 - 1) * halfH;
      pos[i * 3 + 2] = (Math.random() * 2 - 1) * DEPTH;
      vel[i * 3] = (Math.random() * 2 - 1) * 0.22;
      vel[i * 3 + 1] = (Math.random() * 2 - 1) * 0.22;
      vel[i * 3 + 2] = (Math.random() * 2 - 1) * 0.08;
    }

    // circular sprite — raw WebGL points are squares, which reads harsh on paper
    const circleTex = (() => {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const ctx = c.getContext('2d');
      ctx.beginPath();
      ctx.arc(32, 32, 28, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      const tex = new THREE.CanvasTexture(c);
      return tex;
    })();

    // nodes — muted ink dots, with a sparse accent subset
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const nodeMat = new THREE.PointsMaterial({
      color: 0x9aa3b8, size: 0.07, transparent: true, opacity: 0.75,
      map: circleTex, alphaTest: 0.3,
      depthWrite: false, sizeAttenuation: true,
    });
    group.add(new THREE.Points(nodeGeo, nodeMat));

    const accentIdx = [];
    for (let i = 0; i < COUNT; i += 8) accentIdx.push(i);
    const accentPos = new Float32Array(accentIdx.length * 3);
    const accentGeo = new THREE.BufferGeometry();
    accentGeo.setAttribute('position', new THREE.BufferAttribute(accentPos, 3));
    const accentMat = new THREE.PointsMaterial({
      color: SIGNAL.clone(), size: 0.11, transparent: true, opacity: 0.9,
      map: circleTex, alphaTest: 0.3,
      depthWrite: false, sizeAttenuation: true,
    });
    group.add(new THREE.Points(accentGeo, accentMat));

    // connections — vertex colours fade lines into the paper background,
    // so no alpha blending artifacts on a light page
    const linePos = new Float32Array(MAX_SEGMENTS * 6);
    const lineCol = new Float32Array(MAX_SEGMENTS * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineCol, 3));
    const lineMat = new THREE.LineBasicMaterial({ vertexColors: true });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    // scroll drives drift, rotation and signal hue
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => { scrollProgress = self.progress; },
    });

    window.addEventListener('pointermove', (e) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    });

    const clock = new THREE.Clock();
    const tmp = new THREE.Color();
    const signalNow = new THREE.Color();
    const mouseWorld = new THREE.Vector3();
    const mouseLocal = new THREE.Vector3();
    const proj = new THREE.Vector3();

    function render() {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.getElapsedTime();
      const p = scrollProgress;

      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      // cursor position on the z=0 plane, in the group's local space
      proj.set(mouse.x, mouse.y, 0.5).unproject(camera);
      proj.sub(camera.position).normalize();
      mouseWorld.copy(camera.position).addScaledVector(proj, -camera.position.z / proj.z);
      mouseLocal.copy(mouseWorld);
      group.worldToLocal(mouseLocal);

      // drift nodes, bounce at bounds, push away from the cursor
      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3;
        pos[ix] += vel[ix] * dt;
        pos[ix + 1] += vel[ix + 1] * dt;
        pos[ix + 2] += vel[ix + 2] * dt;

        if (Math.abs(pos[ix]) > halfW) vel[ix] *= -1;
        if (Math.abs(pos[ix + 1]) > halfH) vel[ix + 1] *= -1;
        if (Math.abs(pos[ix + 2]) > DEPTH) vel[ix + 2] *= -1;

        if (!isTouch) {
          const dx = pos[ix] - mouseLocal.x;
          const dy = pos[ix + 1] - mouseLocal.y;
          const d2 = dx * dx + dy * dy;
          const R = 2.4;
          if (d2 < R * R && d2 > 0.0001) {
            const d = Math.sqrt(d2);
            const f = ((R - d) / R) * 2.2 * dt;
            pos[ix] += (dx / d) * f;
            pos[ix + 1] += (dy / d) * f;
          }
        }
      }
      nodeGeo.attributes.position.needsUpdate = true;

      for (let a = 0; a < accentIdx.length; a++) {
        const s = accentIdx[a] * 3;
        accentPos[a * 3] = pos[s];
        accentPos[a * 3 + 1] = pos[s + 1];
        accentPos[a * 3 + 2] = pos[s + 2];
      }
      accentGeo.attributes.position.needsUpdate = true;
      accentMat.size = 0.11 + Math.sin(t * 2.2) * 0.02;

      // signal colour eases indigo -> violet down the page
      signalNow.copy(SIGNAL).lerp(SIGNAL_FAR, p);
      accentMat.color.copy(signalNow);

      // rebuild connections
      let seg = 0;
      for (let i = 0; i < COUNT && seg < MAX_SEGMENTS; i++) {
        const ix = i * 3;
        for (let j = i + 1; j < COUNT && seg < MAX_SEGMENTS; j++) {
          const jx = j * 3;
          const dx = pos[ix] - pos[jx];
          const dy = pos[ix + 1] - pos[jx + 1];
          const dz = pos[ix + 2] - pos[jx + 2];
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 > LINK_DIST2) continue;

          const strength = 1 - Math.sqrt(d2) / LINK_DIST;
          // a sparse, slowly changing set of edges carries the "signal"
          const isSignal = (i * 31 + j * 17 + ((t * 0.45) | 0) * 13) % 23 === 0;
          if (isSignal) tmp.copy(BG).lerp(signalNow, Math.min(1, strength * 1.2));
          else tmp.copy(BG).lerp(LINE_INK, strength * 0.32);

          const o = seg * 6;
          linePos[o] = pos[ix];     linePos[o + 1] = pos[ix + 1]; linePos[o + 2] = pos[ix + 2];
          linePos[o + 3] = pos[jx]; linePos[o + 4] = pos[jx + 1]; linePos[o + 5] = pos[jx + 2];
          lineCol[o] = tmp.r;     lineCol[o + 1] = tmp.g; lineCol[o + 2] = tmp.b;
          lineCol[o + 3] = tmp.r; lineCol[o + 4] = tmp.g; lineCol[o + 5] = tmp.b;
          seg++;
        }
      }
      lineGeo.setDrawRange(0, seg * 2);
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.color.needsUpdate = true;

      // gentle scroll parallax + a hint of 3D rotation
      group.rotation.y = Math.sin(t * 0.05) * 0.05 + p * 0.3;
      group.rotation.x = p * 0.12;
      group.position.y = p * 2.6;

      camera.position.x += (mouse.x * 0.35 - camera.position.x) * 0.04;
      camera.position.y += (mouse.y * 0.25 - camera.position.y) * 0.04;
      camera.position.z = CAM_Z - p * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
    render();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * CAM_Z * 1.15;
      halfW = halfH * camera.aspect * 1.15;
    });
  }

  /* ---------------- Preloader + hero entrance ---------------- */
  const preloader = document.getElementById('preloader');

  // split hero title into chars
  document.querySelectorAll('[data-split]').forEach((el) => {
    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text);
    [...text].forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? ' ' : ch;
      span.setAttribute('aria-hidden', 'true');
      el.appendChild(span);
    });
  });

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('done');

      if (prefersReduced) return;

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('.hero__line .char', {
        yPercent: 110,
        rotateX: -40,
        duration: 1.1,
        stagger: 0.035,
      })
        .from('[data-hero-fade]', {
          y: 30,
          opacity: 0,
          duration: 0.9,
          stagger: 0.12,
        }, '-=0.6');
    }, 900);
  });

  /* ---------------- Scroll-triggered reveals ---------------- */
  if (!prefersReduced) {
    // generic reveals
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      });
    });

    // hero content parallax-out on scroll
    gsap.to('.hero__content', {
      yPercent: -22,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 35%', scrub: true },
    });

    // Apple-style word lighting for big statements
    document.querySelectorAll('[data-words]').forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach((w, i) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = w;
        el.appendChild(span);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
      gsap.to(el.querySelectorAll('.word'), {
        opacity: 1,
        stagger: 0.06,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: 0.4 },
      });
    });

    // timeline line draws as you scroll
    const tLine = document.getElementById('timelineLine');
    if (tLine) {
      gsap.to(tLine, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.timeline', start: 'top 75%', end: 'bottom 55%', scrub: 0.5 },
      });
    }

    // scroll progress bar
    gsap.to('#scrollProgress', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
    });

    // animated counters
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => { el.textContent = obj.val.toFixed(decimals); },
      });
    });
  } else {
    // reduced motion: just show counters at final value
    document.querySelectorAll('[data-count]').forEach((el) => {
      el.textContent = parseFloat(el.dataset.count).toFixed(parseInt(el.dataset.decimals || '0', 10));
    });
  }

  /* ---------------- Nav behaviour ---------------- */
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // active section highlighting
  document.querySelectorAll('main section[id]').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (self.isActive) {
          navLinks.forEach((l) =>
            l.classList.toggle('active', l.getAttribute('href') === '#' + section.id)
          );
        }
      },
    });
  });

  // smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      nav.classList.remove('open');
      scrollToTarget(target);
    });
  });

  // mobile burger
  document.getElementById('navBurger').addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  /* ---------------- Custom cursor ---------------- */
  if (!isTouch && !prefersReduced) {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { x: pos.x, y: pos.y };

    window.addEventListener('pointermove', (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%,-50%)`;
    });

    gsap.ticker.add(() => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%,-50%)`;
    });

    document.querySelectorAll('a, button, [data-hover]').forEach((el) => {
      el.addEventListener('pointerenter', () => ring.classList.add('is-hover'));
      el.addEventListener('pointerleave', () => ring.classList.remove('is-hover'));
    });
  } else {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
  }

  /* ---------------- 3D tilt on project cards ---------------- */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      let raf = null;
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rx = (0.5 - py) * 6;
          const ry = (px - 0.5) * 6;
          card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
        });
      });
      card.addEventListener('pointerleave', () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        card.style.transform = 'rotateX(0deg) rotateY(0deg)';
        setTimeout(() => { card.style.transition = ''; }, 600);
      });
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * 0.28, y: y * 0.28, duration: 0.4, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
      });
    });
  }

  /* ---------------- Copy email ---------------- */
  const copyBtn = document.getElementById('copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('svedant1603@gmail.com');
        showToast('Email copied — talk soon 👋');
      } catch {
        showToast('svedant1603@gmail.com');
      }
    });
  }

  function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2400);
  }
})();
