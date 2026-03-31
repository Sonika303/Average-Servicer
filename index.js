/* ═══════════════════════════════════════════
   index.js — Average Servicer
   Hero fade · Scroll reveal · Nav · Tilt
   Zero dependencies. ~60 lines.
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. Hero entrance (staggered fade-in) ────────────────── */
  var heroItems = document.querySelectorAll('#hero .fi');

  heroItems.forEach(function (el, i) {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition =
      'opacity .7s ease '    + (i * .13 + .12) + 's,' +
      'transform .7s cubic-bezier(.22,.68,0,1.18) ' + (i * .13 + .12) + 's';
  });

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      heroItems.forEach(function (el) {
        el.style.opacity   = '1';
        el.style.transform = 'none';
      });
    });
  });


  /* ── 2. Scroll reveal ────────────────────────────────────── */
  var revealTargets = document.querySelectorAll('.card, .pill');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var el       = entry.target;
      var parent   = el.parentElement;
      var siblings = Array.from(parent.children).filter(function (c) {
        return c.classList.contains('card') || c.classList.contains('pill');
      });
      var idx = siblings.indexOf(el);

      el.style.transitionDelay = (idx * .09) + 's';
      el.classList.add('visible');
      io.unobserve(el);
    });
  }, { threshold: .1, rootMargin: '0px 0px -28px 0px' });

  revealTargets.forEach(function (el) { io.observe(el); });


  /* ── 3. Nav background on scroll ────────────────────────── */
  var nav = document.getElementById('navbar');

  window.addEventListener('scroll', function () {
    var alpha = Math.min(.96, .75 + window.scrollY / 320);
    nav.style.background = 'rgba(252,252,252,' + alpha + ')';
  }, { passive: true });


  /* ── 4. Card tilt on hover ───────────────────────────────── */
  document.querySelectorAll('.card:not(.soon-card)').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r  = card.getBoundingClientRect();
      var dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
      var dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
      card.style.transform =
        'translateY(-5px) perspective(700px) ' +
        'rotateX(' + (dy * -4) + 'deg) ' +
        'rotateY(' + (dx *  4) + 'deg)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  /* ── 5. Block right-click context menu ──────────────────── */
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });
   
  /* ── 6. Firebase & Settings Logic ────────────────────────── */
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
  import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDfT41VGcSPRkYDgflZFwtzQzyH5a3RUIM",
    authDomain: "average-servicer.firebaseapp.com",
    databaseURL: "https://average-servicer-default-rtdb.firebaseio.com",
    projectId: "average-servicer",
    storageBucket: "average-servicer.firebasestorage.app",
    messagingSenderId: "186112502875",
    appId: "1:186112502875:web:ba22beac9aac70fe9b237e"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getDatabase(app);

  const modal = document.getElementById('settings-modal');
  const openBtn = document.getElementById('open-settings');
  const closeBtn = document.querySelector('.close-modal');

  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.getElementById('login-nav').style.display = 'none';
      document.getElementById('user-nav').style.display = 'block';
      
      // Load user data from Realtime Database
      onValue(ref(db, 'users/' + user.uid), (snapshot) => {
        const data = snapshot.val();
        if (data) {
          document.getElementById('display-uid').innerText = user.uid;
          document.getElementById('edit-username').value = data.username;
          // WhatsApp Style Initials (e.g., "John Doe" -> "JD")
          const initials = data.username.split(' ').map(n => n[0]).join('').toUpperCase();
          document.getElementById('user-initials').innerText = initials.substring(0,2);
          
          if(data.bgColor) {
            document.body.style.backgroundColor = data.bgColor;
            document.getElementById('bg-picker').value = data.bgColor;
          }
        }
      });
    }
  });

  openBtn.onclick = () => modal.style.display = 'flex';
  closeBtn.onclick = () => modal.style.display = 'none';

  document.getElementById('save-settings').onclick = async () => {
    const user = auth.currentUser;
    const newName = document.getElementById('edit-username').value;
    const newColor = document.getElementById('bg-picker').value;

    await update(ref(db, 'users/' + user.uid), {
      username: newName,
      bgColor: newColor
    });
    
    document.body.style.backgroundColor = newColor;
    alert("Settings Saved!");
    modal.style.display = 'none';
  };
}());
