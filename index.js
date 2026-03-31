/* ── 1. Hero entrance ── */
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

/* ── 3. Nav opacity ── */
var nav = document.getElementById('navbar');
window.addEventListener('scroll', function() {
  nav.style.background = 'rgba(252,252,252,' + Math.min(.96, .75 + window.scrollY / 320) + ')';
}, { passive: true });

/* ── 4. Card tilt ── */
document.querySelectorAll('.card:not(.soon-card)').forEach(function(card) {
  card.addEventListener('mousemove', function(e) {
    var r = card.getBoundingClientRect();
    var dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    var dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    card.style.transform = 'translateY(-5px) perspective(700px) rotateX(' + (dy * -4) + 'deg) rotateY(' + (dx * 4) + 'deg)';
  });
  card.addEventListener('mouseleave', function() { card.style.transform = ''; });
});

/* ── 5. Block right-click ── */
document.addEventListener('contextmenu', function(e) { e.preventDefault(); });

/* ── 6. Firebase ── */
import { initializeApp }                    from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, onValue, update }   from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const app  = initializeApp({
  apiKey:            "AIzaSyDfT41VGcSPRkYDgflZFwtzQzyH5a3RUIM",
  authDomain:        "average-servicer.firebaseapp.com",
  databaseURL:       "https://average-servicer-default-rtdb.firebaseio.com",
  projectId:         "average-servicer",
  storageBucket:     "average-servicer.firebasestorage.app",
  messagingSenderId: "186112502875",
  appId:             "1:186112502875:web:ba22beac9aac70fe9b237e"
});
const auth = getAuth(app);
const db   = getDatabase(app);

const modal        = document.getElementById('settings-modal');
const openBtn      = document.getElementById('open-settings');
const closeBtn     = document.querySelector('.close-modal');
const colorTrigger = document.getElementById('color-trigger');
const bgPicker     = document.getElementById('bg-picker');
const pfpCircle    = document.getElementById('user-initials');

/* ── Total orders counter ── */
let counterDone = false;
let counterVal  = 0;

onValue(ref(db, 'users'), (snapshot) => {
  const users = snapshot.val();
  let total = 0;
  if (users) Object.values(users).forEach(u => total += (u.orderCount || 0));

  const display = document.getElementById('total-orders-display');
  if (!display) return;

  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    if (counterDone) return;
    counterDone = true;
    const tick = () => {
      if (counterVal < total) { counterVal++; display.innerText = counterVal; setTimeout(tick, 30); }
      else display.innerText = total;
    };
    tick();
  }, { threshold: 1.0 }).observe(display);
});

/* ── Auth — KEY FIX: store unsubscribe fn, call it on logout ── */
let unsubscribeUserData = null; // ← holds the onValue detach function

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('login-nav').style.display = 'none';
    document.getElementById('user-nav').style.display  = 'block';

    // ── Clean up any previous listener before attaching a new one ──
    // This prevents stale listeners from firing after logout/re-login
    if (unsubscribeUserData) { unsubscribeUserData(); unsubscribeUserData = null; }

    unsubscribeUserData = onValue(ref(db, 'users/' + user.uid), (snapshot) => {
      const data = snapshot.val();
      if (!data) return; // new user with no data yet — don't touch anything

      // Only initialise orderCount if it has NEVER been set — never wipe existing fields
      if (data.orderCount === undefined) {
        update(ref(db, 'users/' + user.uid), { orderCount: 0 });
      }

      // Populate UI — purely read, zero writes
      document.getElementById('display-uid').innerText        = user.uid;
      document.getElementById('edit-username').value          = data.username || '';
      document.getElementById('user-order-count').innerText   = data.orderCount || 0;

      const initials = (data.username || '??')
        .split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      pfpCircle.innerText = initials;

      if (data.pfpColor) {
        pfpCircle.style.backgroundColor = data.pfpColor;
        bgPicker.value                  = data.pfpColor;
        colorTrigger.style.borderColor  = data.pfpColor;
      }
    });

  } else {
    // ── LOGOUT: kill the listener immediately, touch ZERO database paths ──
    if (unsubscribeUserData) { unsubscribeUserData(); unsubscribeUserData = null; }

    document.getElementById('login-nav').style.display = 'block';
    document.getElementById('user-nav').style.display  = 'none';
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

/* ── Modal ── */
openBtn.onclick  = () => { modal.style.display = 'flex'; };
closeBtn.onclick = () => { modal.style.display = 'none'; };
modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

/* ── Color picker ── */
colorTrigger.onclick = () => bgPicker.click();
bgPicker.oninput = (e) => {
  pfpCircle.style.backgroundColor = e.target.value;
  colorTrigger.style.borderColor  = e.target.value;
};

/* ── Save settings — only writes username + pfpColor, nothing else ── */
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

/* ── Logout — signOut only, zero DB writes, listener already killed above ── */
document.getElementById('logout-btn').onclick = () => {
  signOut(auth)
    .then(() => window.location.reload())
    .catch((err) => console.error('Logout error:', err));
};
