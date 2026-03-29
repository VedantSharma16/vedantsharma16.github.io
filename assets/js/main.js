// ── LOADER ───────────────────────────────────────────────────────
(function () {
  var msgs = ['INITIALIZING SCENE', 'LOADING 3D ASSETS', 'CALIBRATING GSAP', 'SYSTEM READY'];
  var i = 0, pct = 0;
  var fill = document.getElementById('ldfill');
  var msg = document.getElementById('ld-msg');
  var loader = document.getElementById('loader');
  
  var iv = setInterval(function () {
    pct = Math.min(100, pct + Math.random() * 20 + 5);
    if (fill) fill.style.width = pct + '%';
    if (msg && i < msgs.length) { msg.textContent = msgs[i] + '...'; i++; }
    
    if (pct >= 100) {
      clearInterval(iv);
      if(msg) msg.textContent = 'SYSTEM READY.';
      setTimeout(function () {
        if(loader) {
          loader.classList.add('hidden');
          setTimeout(function () { loader.style.display = 'none'; }, 900);
        }
      }, 300);
    }
  }, 150);
})();

// ── CLOCK ────────────────────────────────────────────────────────
(function () {
  var el = document.getElementById('clk');
  if(!el) return;
  function tick() {
    try { el.textContent = new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); }
    catch (e) { el.textContent = new Date().toLocaleTimeString(); }
  }
  tick(); setInterval(tick, 1000);
})();

// ── GSAP SCROLL ANIMATIONS (scroll-experience skill) ─────────────
document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(ScrollTrigger);

  // Animate hero content on load
  gsap.from(".hero-content > *", {
    y: 40,
    opacity: 0,
    duration: 1,
    stagger: 0.15,
    ease: "power3.out",
    delay: 0.5
  });

  gsap.from(".hstats .sbox", {
    x: 40,
    opacity: 0,
    duration: 1,
    stagger: 0.1,
    ease: "power3.out",
    delay: 1.2
  });

  // Reveal sections on scroll
  const sections = gsap.utils.toArray('.rev');
  sections.forEach((section) => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        toggleActions: "play none none reverse"
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    });
  });

  // Animate skill bars
  const skillCards = gsap.utils.toArray('.skc');
  skillCards.forEach(card => {
    const bar = card.querySelector('.sbf');
    if (bar) {
      gsap.to(bar, {
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
        },
        width: card.dataset.pct + "%",
        duration: 1.5,
        ease: "power3.out"
      });
    }
  });
  
  // Timeline CSS Sticky Stacking (Shrink effect)
  const timelineItems = gsap.utils.toArray('.tli');
  timelineItems.forEach((item, i) => {
    if (i < timelineItems.length - 1) {
      gsap.to(item, {
        scale: 0.9,
        filter: "brightness(0.3)",
        ease: "none",
        scrollTrigger: {
          trigger: timelineItems[i + 1],
          start: "top 80%", // Animates as the next item scrolls up from the bottom
          end: "top 25%",   // Finishes shrinking exactly as the next item overlaps it
          scrub: 1
        }
      });
    }
  });

  // Horizontal Carousel for Projects
  const pSection = document.querySelector('#projects');
  const pGrid = document.querySelector('.pgrid');
  if (pSection && pGrid) {
    let getScrollAmount = () => -(pGrid.scrollWidth - window.innerWidth + 100);
    gsap.to(pGrid, {
      x: getScrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: pSection,
        start: "center center", // Centers section perfectly so text isn't cut off
        end: () => `+=${pGrid.scrollWidth}`, // Scroll distance directly proportional to width
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      }
    });
  }

  // Localized Liquid Mouse Tracking for Name
  const hname = document.querySelector('.hname');
  if (hname) {
    hname.addEventListener('mousemove', (e) => {
      const rect = hname.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      hname.style.setProperty('--x', `${x}px`);
      hname.style.setProperty('--y', `${y}px`);
    });
    hname.addEventListener('mouseleave', () => {
      // Moves gradient off-screen
      hname.style.setProperty('--x', `-1000px`);
      hname.style.setProperty('--y', `-1000px`);
    });
  }

});

// ── ACTIVE NAV HIGHLIGHT ─────────────────────────────────────────
document.querySelectorAll('nav a[href^="#"]').forEach(function (a) {
  if (a.classList.contains('cv-btn')) return;
  a.addEventListener('click', function (e) {
    e.preventDefault();
    var t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
  });
});

window.addEventListener('scroll', function () {
  var current = '';
  document.querySelectorAll('section[id]').forEach(function (s) { 
    if (window.scrollY >= s.offsetTop - 250) current = s.id; 
  });
  document.querySelectorAll('nav a[href^="#"]:not(.cv-btn)').forEach(function (a) { 
    a.classList.toggle('act', a.getAttribute('href') === '#' + current); 
  });
}, { passive: true });

// ── CV MODAL ─────────────────────────────────────────────────────
var modal = document.getElementById('cvm');
function openM() { 
  if(modal) {
    modal.classList.add('open'); 
    document.body.style.overflow = 'hidden'; 
  }
}
function closeM() { 
  if(modal) {
    modal.classList.remove('open'); 
    document.body.style.overflow = ''; 
  }
}

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
  w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Vedant Sharma - CV</title><style>@import url(\'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Orbitron:wght@700&display=swap\');*{margin:0;padding:0;box-sizing:border-box;}body{background:#fff;color:#111;font-family:\'Inter\',sans-serif;padding:44px;max-width:800px;margin:0 auto;line-height: 1.6;}.cvch{text-align:center;margin-bottom:32px;padding-bottom:22px;border-bottom:2px solid #0EA5E9;}.cvname{font-family:\'Orbitron\',sans-serif;font-size:1.8rem;font-weight:700;color:#0F172A;letter-spacing:2px;}.cvsub{font-size:.85rem;color:#0EA5E9;letter-spacing:1px;margin:8px 0 14px;font-weight:600;text-transform:uppercase;}.cvcts{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;}.cvct{font-size:.8rem;color:#475569;display:flex;align-items:center;gap:4px;}.cvct em{color:#0EA5E9;font-style:normal;}.cvs{margin-bottom:26px;}.cvst{font-family:\'Orbitron\',sans-serif;font-size:.9rem;color:#0F172A;letter-spacing:1px;text-transform:uppercase;padding-bottom:7px;margin-bottom:14px;border-bottom:1px solid #E2E8F0;}.cvsum{font-size:.9rem;color:#334155;}.cvei{margin-bottom:20px;}.cveh{display:flex;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:4px;}.cvrole{font-size:.95rem;color:#0F172A;font-weight:600;}.cvco{font-size:.85rem;color:#0EA5E9;margin-top:2px;}.cvdt{font-size:.8rem;color:#10B981;font-weight:500;}.cvbl{list-style:none;margin-top:8px;}.cvbl li{font-size:.85rem;color:#475569;padding:4px 0;border-bottom:1px solid #F8FAFC;display:flex;gap:8px;}.cvbl li::before{content:\'•\';color:#0EA5E9;flex-shrink:0;}.cvedu{display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid #E2E8F0;flex-wrap:wrap;gap:6px;}.cvdeg{font-size:.9rem;color:#0F172A;font-weight:600;margin-bottom:3px;}.cvsch{font-size:.85rem;color:#0EA5E9;}.cvbdg{font-size:.75rem;padding:3px 8px;background:rgba(16,185,129,0.1);color:#10B981;border-radius:4px;}.cvsg{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}.cvsk{padding:6px 10px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:4px;font-size:.8rem;color:#334155;}.cvri{padding:11px 0;border-bottom:1px solid #E2E8F0;}.cvrt{font-size:.9rem;color:#0F172A;font-weight:600;margin-bottom:6px;}.cvrd{font-size:.85rem;color:#475569;}.cvlr{display:flex;gap:10px;}.cvlg{font-size:.8rem;padding:6px 14px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:100px;color:#334155;}@media print{body{padding:24px;}}</style></head><body>' + content + '<script>window.onload=function(){window.print();};<\/script></body></html>');
  w.document.close();
}

['dlcv1', 'dlcv2', 'cvdlbtn'].forEach(function (id) {
  var el = document.getElementById(id);
  if (el) el.addEventListener('click', function (e) { e.preventDefault(); printCV(); });
});

// ── IMMERSIVE TILT & MAGNETIC FX ─────────────────────────────────
document.querySelectorAll('.sbox, .skc, .pc, .tlbox').forEach(el => {
  el.classList.add('has-tilt');
  let glare = document.createElement('div');
  glare.className = 'glare';
  
  if (el.classList.contains('pc')) {
    let pf = el.querySelector('.pf');
    if (pf) pf.appendChild(glare);
  } else {
    el.appendChild(glare);
  }

  el.addEventListener('mousemove', e => {
    let rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    let xPct = (x / rect.width - 0.5) * 2;
    let yPct = (y / rect.height - 0.5) * 2;
    
    let rotX = -(yPct * 6);
    let rotY = (xPct * 6);
    
    el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
    if(!el.classList.contains('pc')) el.style.borderColor = 'rgba(14, 165, 233, 0.4)';
    glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.18) 0%, transparent 60%)`;
  });
  
  el.addEventListener('mouseleave', () => {
    el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    el.style.transition = `transform 0.5s ease-out, border-color 0.5s ease`;
    if(!el.classList.contains('pc')) el.style.borderColor = '';
    glare.style.opacity = '0';
  });
  
  el.addEventListener('mouseenter', () => {
    el.style.transition = `transform 0.1s ease-out, border-color 0.1s ease`;
    glare.style.opacity = '1';
  });
});

// Magnetic Buttons
document.querySelectorAll('.bp, .bs, .bdl, .cv-btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    let rect = btn.getBoundingClientRect();
    let x = (e.clientX - rect.left) - rect.width / 2;
    let y = (e.clientY - rect.top) - rect.height / 2;
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = `translate(0px, 0px)`;
    btn.style.transition = 'transform 0.4s ease-out';
  });
  btn.addEventListener('mouseenter', () => {
    btn.style.transition = 'transform 0.1s linear';
  });
});
