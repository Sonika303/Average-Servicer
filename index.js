/* ── 1. Hero entrance (staggered fade-in) ── */
var heroItems = document.querySelectorAll('#hero .fi');
heroItems.forEach(function(el, i) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(14px)';
  el.style.transition =
    'opacity .7s ease ' + (i * .13 + .12) + 's,' +
    'transform .7s cubic-bezier(.22,.68,0,1.18) ' + (i * .13 + .12) + 's';
});
requestAnimationFrame(function() {
  requestAnimationFrame(function() {
    heroItems.forEach(function(el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });
});

/* ── 2. Scroll reveal ── */
var revealTargets = document.querySelectorAll('.card, .pill');
var io = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (!entry.isIntersecting) return;
    var el = entry.target;
    var siblings = Array.from(el.parentElement.children).filter(function(c) {
      return c.classList.contains('card') || c.classList.contains('pill');
    });
    el.style.transitionDelay = (siblings.indexOf(el) * .09) + 's';
    el.classList.add('visible');
    io.unobserve(el);
  });
}, { threshold: .1, rootMargin: '0px 0px -28px 0px' });
revealTargets.forEach(function(el) { io.observe(el); });

/* ── 3. Nav opacity on scroll ── */
var nav = document.getElementById('navbar');
window.addEventListener('scroll', function() {
  nav.style.background = 'rgba(252,252,252,' + Math.min(.96, .75 + window.scrollY / 320) + ')';
}, { passive: true });

/* ── 4. Card tilt ── */
document.querySelectorAll('.card:not(.soon-card)').forEach(function(card) {
  card.addEventListener('mousemove', function(e) {
    var r = card.getBoundingClientRect();
    var dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    var dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    card.style.transform =
      'translateY(-5px) perspective(700px) rotateX(' + (dy * -4) + 'deg) rotateY(' + (dx * 4) + 'deg)';
  });
  card.addEventListener('mouseleave', function() { card.style.transform = ''; });
});

/* ── 5. Block right-click ── */
document.addEventListener('contextmenu', function(e) { e.preventDefault(); });

/* ── 6. Firebase & Settings ── */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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
const colorTrigger = document.getElementById('color-trigger');
const bgPicker = document.getElementById('bg-picker');
const pfpCircle = document.getElementById('user-initials');

/* ── Global total orders counter ── */
let currentDisplayCount = 0;
let hasAnimated = false;

onValue(ref(db, 'users'), (snapshot) => {
  const users = snapshot.val();
  let targetCount = 0;
  if (users) Object.values(users).forEach(u => targetCount += (u.orderCount || 0));

  const totalDisplay = document.getElementById('total-orders-display');
  if (!totalDisplay) return;

  const startCounter = () => {
    if (hasAnimated) return;
    hasAnimated = true;
    const tick = () => {
      if (currentDisplayCount < targetCount) {
        currentDisplayCount++;
        totalDisplay.innerText = currentDisplayCount;
        setTimeout(tick, 30);
      } else {
        totalDisplay.innerText = targetCount;
      }
    };
    tick();
  };

  new IntersectionObserver(
    (entries) => { if (entries[0].isIntersecting) startCounter(); },
    { threshold: 1.0 }
  ).observe(totalDisplay);
});

/* ── Auth state ── */
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('login-nav').style.display = 'none';
    document.getElementById('user-nav').style.display = 'block';

    onValue(ref(db, 'users/' + user.uid), (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // ✅ Only write if orderCount is genuinely missing — never touch other fields
      if (data.orderCount === undefined) {
        update(ref(db, 'users/' + user.uid), { orderCount: 0 });
      }

      // Populate UI — read only, no database overwrites
      document.getElementById('display-uid').innerText = user.uid;
      document.getElementById('edit-username').value = data.username || '';
      document.getElementById('user-order-count').innerText = data.orderCount || 0;

      const initials = (data.username || '??')
        .split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      pfpCircle.innerText = initials;

      if (data.pfpColor) {
        pfpCircle.style.backgroundColor = data.pfpColor;
        bgPicker.value = data.pfpColor;
        colorTrigger.style.borderColor = data.pfpColor;
      }
    });

  } else {
    // ✅ Logged out — UI reset only, zero database interaction
    document.getElementById('login-nav').style.display = 'block';
    document.getElementById('user-nav').style.display = 'none';
    modal.style.display = 'none';
  }
});

/* ── Copy UID ── */
document.getElementById('copy-id').onclick = () => {
  navigator.clipboard.writeText(document.getElementById('display-uid').innerText).then(() => {
    const fb = document.getElementById('copy-feedback');
    fb.style.display = 'inline';
    setTimeout(() => { fb.style.display = 'none'; }, 2000);
  });
};

/* ── Modal & colour picker ── */
openBtn.onclick = () => modal.style.display = 'flex';
closeBtn.onclick = () => modal.style.display = 'none';
colorTrigger.onclick = () => bgPicker.click();
bgPicker.oninput = (e) => {
  pfpCircle.style.backgroundColor = e.target.value;
  colorTrigger.style.borderColor = e.target.value;
};

/* ── Save settings ── */
document.getElementById('save-settings').onclick = async () => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await update(ref(db, 'users/' + user.uid), {
      username: document.getElementById('edit-username').value,
      pfpColor: bgPicker.value
    });
    alert('Profile Updated!');
    modal.style.display = 'none';
  } catch (err) {
    console.error('Save failed:', err);
  }
};

/* ── Logout — only signs out, zero database writes ── */
document.getElementById('logout-btn').onclick = () => {
  signOut(auth)
    .then(() => window.location.reload())
    .catch((err) => console.error('Logout error:', err));
};
