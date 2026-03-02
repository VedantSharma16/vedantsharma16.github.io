// ── MOUSE TRACKING (Global scope for scene to use) ───────────────
window.mx = 0;
window.my = 0;

// ── LOADER ───────────────────────────────────────────────────────
(function () {
  var msgs = ['LOADING CORE MODULES', 'INITIALIZING 3D ENGINE', 'SCANNING FOR THREATS', 'ESTABLISHING SECURE SHELL', 'DECRYPTING PORTFOLIO DATA', 'COMPILING SKILL MATRIX', 'SYSTEM READY'];
  var i = 0, pct = 0;
  var fill = document.getElementById('ldfill');
  var msg = document.getElementById('ld-msg');
  var loader = document.getElementById('loader');
  var iv = setInterval(function () {
    pct = Math.min(100, pct + Math.random() * 16 + 2);
    fill.style.width = pct + '%';
    if (i < msgs.length) { msg.textContent = '> ' + msgs[i] + '...'; i++; }
    if (pct >= 100) {
      clearInterval(iv);
      msg.textContent = '> SYSTEM READY.';
      setTimeout(function () {
        loader.classList.add('hidden');
        setTimeout(function () { loader.style.display = 'none'; }, 900);
      }, 300);
    }
  }, 200);
})();

// ── CLOCK ────────────────────────────────────────────────────────
(function () {
  var el = document.getElementById('clk');
  function tick() {
    try { el.textContent = new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); }
    catch (e) { el.textContent = new Date().toLocaleTimeString(); }
  }
  tick(); setInterval(tick, 1000);
})();

// ── CURSOR ───────────────────────────────────────────────────────
var cur = document.getElementById('cur'), cur2 = document.getElementById('cur2');
document.addEventListener('mousemove', function (e) {
  window.mx = e.clientX; window.my = e.clientY;
  cur.style.left = window.mx + 'px'; cur.style.top = window.my + 'px';
  setTimeout(function () { cur2.style.left = window.mx + 'px'; cur2.style.top = window.my + 'px'; }, 90);
});
function bigC() { cur.style.width = '20px'; cur.style.height = '20px'; cur.style.background = 'rgba(0,245,255,.18)'; }
function smlC() { cur.style.width = '12px'; cur.style.height = '12px'; cur.style.background = ''; }
document.querySelectorAll('a,button,.skc,.pc,.ec,.sbox').forEach(function (el) {
  el.addEventListener('mouseenter', bigC); el.addEventListener('mouseleave', smlC);
});

// ── TYPING ───────────────────────────────────────────────────────
var phrases = ['Cybersecurity Specialist', 'Python Developer', 'Web Architect', 'AI Security Researcher', 'Penetration Tester'];
var pi = 0, ci = 0, del = false;
var tel = document.getElementById('typt');
function tickTyping() {
  if (!tel) return;
  var curStr = phrases[pi];
  if (!del) {
    tel.textContent = curStr.slice(0, ci + 1); ci++;
    if (ci === curStr.length) { del = true; setTimeout(tickTyping, 1800); return; }
  } else {
    tel.textContent = curStr.slice(0, ci - 1); ci--;
    if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
  }
  setTimeout(tickTyping, del ? 65 : 92);
}
setTimeout(tickTyping, 2000);

// ── SCROLL REVEALS ───────────────────────────────────────────────
var obs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      var bar = e.target.querySelector('.sbf');
      if (bar) setTimeout(function () { bar.style.width = (e.target.dataset.pct || 0) + '%'; }, 180);
    }
  });
}, { threshold: .12 });
document.querySelectorAll('.rev,.tli').forEach(function (el) { obs.observe(el); });

// ── SMOOTH SCROLL ────────────────────────────────────────────────
document.querySelectorAll('nav a[href^="#"]').forEach(function (a) {
  if (a.classList.contains('cv-btn')) return;
  a.addEventListener('click', function (e) {
    e.preventDefault();
    var t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
  });
});
if (document.querySelector('a[href="#projects"]')) {
  document.querySelector('a[href="#projects"]').addEventListener('click', function (e) {
    e.preventDefault(); document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
  });
}

// Active nav highlight
var secs = document.querySelectorAll('section[id]');
var nlinks = document.querySelectorAll('nav a[href^="#"]:not(.cv-btn)');
window.addEventListener('scroll', function () {
  var current = '';
  secs.forEach(function (s) { if (window.scrollY >= s.offsetTop - 200) current = s.id; });
  nlinks.forEach(function (a) { a.classList.toggle('act', a.getAttribute('href') === '#' + current); });
}, { passive: true });

// ── PAGE TRANSITION ──────────────────────────────────────────────
function ptrans(cb) {
  var bs = document.querySelectorAll('.ptb');
  bs.forEach(function (b) { b.className = 'ptb'; });
  bs.forEach(function (b, i) { setTimeout(function () { b.classList.add('in'); }, i * 28); });
  setTimeout(function () {
    if (cb) cb();
    bs.forEach(function (b, i) { setTimeout(function () { b.className = 'ptb out'; setTimeout(function () { b.className = 'ptb'; }, 460); }, i * 28); });
  }, bs.length * 28 + 480);
}

// ── CV MODAL ─────────────────────────────────────────────────────
var modal = document.getElementById('cvm');
function openM() { ptrans(function () { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }); }
function closeM() { modal.classList.remove('open'); document.body.style.overflow = ''; }
['ocv1', 'ocv2', 'ocv3'].forEach(function (id) {
  var el = document.getElementById(id);
  if (el) el.addEventListener('click', function (e) { e.preventDefault(); openM(); });
});
if (document.getElementById('cvclose')) {
  document.getElementById('cvclose').addEventListener('click', closeM);
  document.getElementById('cvbd').addEventListener('click', closeM);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeM(); });
}

// ── PRINT CV ─────────────────────────────────────────────────────
function printCV() {
  var content = document.getElementById('cvprint').innerHTML;
  var w = window.open('', '_blank', 'width=860,height=700');
  if (!w) { alert('Please allow popups to download CV'); return; }
  w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Vedant Sharma - CV</title><style>@import url(\'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600&family=Orbitron:wght@700;900&display=swap\');*{margin:0;padding:0;box-sizing:border-box;}body{background:#fff;color:#111;font-family:\'Rajdhani\',sans-serif;padding:44px;max-width:800px;margin:0 auto;}.cvch{text-align:center;margin-bottom:32px;padding-bottom:22px;border-bottom:2px solid #007799;}.cvname{font-family:\'Orbitron\',monospace;font-size:1.8rem;font-weight:900;color:#020810;letter-spacing:4px;}.cvsub{font-family:\'Share Tech Mono\';font-size:.75rem;color:#007799;letter-spacing:3px;margin:8px 0 14px;}.cvcts{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;}.cvct{font-family:\'Share Tech Mono\';font-size:.68rem;color:#555;display:flex;align-items:center;gap:4px;}.cvct em{color:#007799;font-style:normal;}.cvs{margin-bottom:26px;}.cvst{font-family:\'Orbitron\',monospace;font-size:.7rem;color:#007799;letter-spacing:3px;text-transform:uppercase;padding-bottom:7px;margin-bottom:14px;border-bottom:1px solid #ddd;display:flex;align-items:center;gap:8px;}.cvst::before{content:\'//\';opacity:.4;font-size:.62rem;}.cvsum{font-size:.88rem;line-height:1.8;color:#333;}.cvei{margin-bottom:20px;}.cveh{display:flex;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:4px;}.cvrole{font-family:\'Orbitron\',monospace;font-size:.8rem;color:#020810;font-weight:700;}.cvco{font-size:.82rem;color:#007799;margin-top:2px;}.cvdt{font-family:\'Share Tech Mono\';font-size:.62rem;color:#009955;letter-spacing:1px;}.cvbl{list-style:none;margin-top:8px;}.cvbl li{font-size:.84rem;color:#444;padding:4px 0;border-bottom:1px solid #f5f5f5;display:flex;gap:8px;line-height:1.5;}.cvbl li::before{content:\'▸\';color:#007799;flex-shrink:0;}.cvedu{display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid #eee;flex-wrap:wrap;gap:6px;}.cvdeg{font-family:\'Orbitron\',monospace;font-size:.78rem;color:#020810;font-weight:700;margin-bottom:3px;}.cvsch{font-size:.8rem;color:#007799;}.cvbdg{font-family:\'Share Tech Mono\';font-size:.56rem;padding:3px 8px;border:1px solid #009955;color:#009955;white-space:nowrap;}.cvsg{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;}.cvsk{padding:7px 11px;border:1px solid #dde;font-family:\'Share Tech Mono\';font-size:.65rem;color:#444;display:flex;align-items:center;gap:6px;}.cvsk::before{content:\'◆\';color:#007799;font-size:.38rem;flex-shrink:0;}.cvri{padding:11px 0;border-bottom:1px solid #eee;}.cvrt{font-family:\'Orbitron\',monospace;font-size:.78rem;color:#007799;margin-bottom:6px;}.cvrd{font-size:.82rem;color:#444;line-height:1.65;}.cvlr{display:flex;gap:10px;}.cvlg{font-family:\'Share Tech Mono\';font-size:.7rem;padding:6px 14px;border:1px solid #007799;color:#007799;}@media print{body{padding:24px;}}</style></head><body>' + content + '<script>window.onload=function(){window.print();};<\/script></body></html>');
  w.document.close();
}
['dlcv1', 'dlcv2', 'cvdlbtn'].forEach(function (id) {
  var el = document.getElementById(id);
  if (el) el.addEventListener('click', function (e) { e.preventDefault(); printCV(); });
});

// ── 3D HOVER EFFECTS (Vanilla Tilt) ──────────────────────────────
document.querySelectorAll('.skc, .pc, .sbox, .ec').forEach(function (el) {
  el.addEventListener('mousemove', function (e) {
    var rect = el.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var centerX = rect.width / 2;
    var centerY = rect.height / 2;
    var tiltX = (y - centerY) / centerY * -10; // Max rotation 10deg
    var tiltY = (x - centerX) / centerX * 10;

    el.style.transform = 'perspective(1000px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) scale3d(1.02, 1.02, 1.02)';
    el.style.transition = 'transform 0.1s ease-out';
    el.style.zIndex = '10'; // Bring to front while hovering

    // Add dynamic glare
    if (!el.querySelector('.glare')) {
      var glare = document.createElement('div');
      glare.className = 'glare';
      glare.style.position = 'absolute';
      glare.style.top = '0';
      glare.style.left = '0';
      glare.style.width = '100%';
      glare.style.height = '100%';
      glare.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent)';
      glare.style.pointerEvents = 'none';
      glare.style.opacity = '0';
      glare.style.transition = 'opacity 0.3s ease';
      glare.style.borderRadius = 'inherit'; // inherit card's border radius
      el.appendChild(glare);
      if (window.getComputedStyle(el).position === 'static') {
        el.style.position = 'relative';
      }
    }
    var glareEl = el.querySelector('.glare');
    if (glareEl) {
      glareEl.style.opacity = '1';
      glareEl.style.background = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(0, 245, 255, 0.15), transparent 60%)';
    }
  });

  el.addEventListener('mouseleave', function () {
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    el.style.transition = 'transform 0.5s ease-out';
    el.style.zIndex = '';
    var glareEl = el.querySelector('.glare');
    if (glareEl) {
      glareEl.style.opacity = '0';
    }
  });
});
