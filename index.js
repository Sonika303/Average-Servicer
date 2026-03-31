/* ── 1. Hero entrance (staggered fade-in) ────────────────── */
var heroItems = document.querySelectorAll('#hero .fi');

heroItems.forEach(function (el, i) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(14px)';
  el.style.transition =
    'opacity .7s ease ' + (i * .13 + .12) + 's,' +
    'transform .7s cubic-bezier(.22,.68,0,1.18) ' + (i * .13 + .12) + 's';
});

requestAnimationFrame(function () {
  requestAnimationFrame(function () {
    heroItems.forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });
});

/* ── 2. Scroll reveal ────────────────────────────────────── */
var revealTargets = document.querySelectorAll('.card, .pill');

var io = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (!entry.isIntersecting) return;
    var el = entry.target;
    var parent = el.parentElement;
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
    var r = card.getBoundingClientRect();
    var dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    var dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    card.style.transform =
      'translateY(-5px) perspective(700px) ' +
      'rotateX(' + (dy * -4) + 'deg) ' +
      'rotateY(' + (dx * 4) + 'deg)';
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
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, onValue, update, off } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

// 1. GLOBAL TOTAL ORDERS
let hasAnimated = false; 
onValue(ref(db, 'users'), (snapshot) => {
  const users = snapshot.val();
  let targetCount = 0;
  if (users) {
    Object.values(users).forEach(u => targetCount += (u.orderCount || 0));
  }
  const totalDisplay = document.getElementById('total-orders-display');
  const startCounter = () => {
    if (hasAnimated || targetCount === 0) return;
    hasAnimated = true;
    const duration = 3000;
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress * (2 - progress);
      const currentValue = Math.floor(easedProgress * targetCount);
      totalDisplay.innerText = currentValue;
      if (progress < 1) requestAnimationFrame(animate);
      else totalDisplay.innerText = targetCount;
    };
    requestAnimationFrame(animate);
  };
  const observer = new IntersectionObserver((entries) => {
    if(entries[0].isIntersecting) startCounter();
  }, { threshold: 1.0 });
  if (totalDisplay) observer.observe(totalDisplay);
});

// 2. AUTH & USER DATA
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('login-nav').style.display = 'none';
    document.getElementById('user-nav').style.display = 'block';

    const userRef = ref(db, 'users/' + user.uid);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // UI UPDATES
        document.getElementById('display-uid').innerText = user.uid;
        document.getElementById('edit-username').value = data.username || "";
        document.getElementById('user-order-count').innerText = data.orderCount || 0;
        
        const name = data.username || "??";
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        pfpCircle.innerText = initials.substring(0, 2);

        if (data.pfpColor) {
          pfpCircle.style.backgroundColor = data.pfpColor;
          bgPicker.value = data.pfpColor;
          colorTrigger.style.borderColor = data.pfpColor;
        }
      }
    });
  } else {
    document.getElementById('login-nav').style.display = 'block';
    document.getElementById('user-nav').style.display = 'none';
  }
});

// 3. COPY ID LOGIC
document.getElementById('copy-id').onclick = () => {
  const uid = document.getElementById('display-uid').innerText;
  if(!uid || uid.includes('-')) return;
  navigator.clipboard.writeText(uid).then(() => {
    const feedback = document.getElementById('copy-feedback');
    feedback.style.display = 'inline';
    setTimeout(() => { feedback.style.display = 'none'; }, 2000);
  });
};

// 4. MODAL & COLOR PICKER UI
openBtn.onclick = () => modal.style.display = 'flex';
closeBtn.onclick = () => modal.style.display = 'none';
colorTrigger.onclick = () => bgPicker.click();
bgPicker.oninput = (e) => {
  pfpCircle.style.backgroundColor = e.target.value;
  colorTrigger.style.borderColor = e.target.value;
};

// 5. SAVE SETTINGS
document.getElementById('save-settings').onclick = async () => {
  const user = auth.currentUser;
  if (!user) return;
  const newName = document.getElementById('edit-username').value;
  const newColor = bgPicker.value;
  try {
    await update(ref(db, 'users/' + user.uid), {
      username: newName,
      pfpColor: newColor
    });
    alert("Profile Updated!");
    modal.style.display = 'none';
  } catch (error) {
    console.error("Save failed:", error);
  }
};

// 6. LOGOUT LOGIC
document.getElementById('logout-btn').onclick = () => {
  const user = auth.currentUser;
  modal.style.display = 'none';
  if (user) {
    off(ref(db, 'users/' + user.uid));
    off(ref(db, 'users'));
  }
  signOut(auth).then(() => {
    window.location.reload();
  }).catch((err) => {
    console.error("Logout Error:", err);
  });
};
