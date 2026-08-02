
/* =========================================================
   FRIENDSHIP DAY — script.js
   No frameworks, no build step — just DOM + Canvas + a few
   small Web APIs (Clipboard, Web Share, Web Animations).
   ========================================================= */

// ---------- Grab elements we'll reuse ----------
const gradientBg      = document.getElementById("gradientBg");
const starsLayer      = document.getElementById("starsLayer");
const floatingLayer   = document.getElementById("floatingLayer");
const confettiCanvas  = document.getElementById("confettiCanvas");
const card            = document.getElementById("card");
const cardContainer   = document.getElementById("cardContainer");
const generateBtn     = document.getElementById("generateBtn");
const messageContent  = document.getElementById("messageContent");
const quoteEl         = document.getElementById("quote");
const photoFrame      = document.getElementById("photoFrame");
const resetBtn        = document.getElementById("resetBtn");
const nextSlideBtn    = document.getElementById("nextSlideBtn");
const stickerStage    = document.getElementById("stickerStage");
const stickerBackBtn  = document.getElementById("stickerBackBtn");
const stickerResetBtn = document.getElementById("stickerResetBtn");
const cutoutRow1      = document.getElementById("cutoutRow1");
const cutoutRow2      = document.getElementById("cutoutRow2");

const ctx = confettiCanvas.getContext("2d");

// No form left to fill in — both names are fixed
const FRIEND_NAME = "Kuchupuchu";
const YOUR_NAME = "Omkar";

const state = { yourName: YOUR_NAME, friendName: FRIEND_NAME, isNight: false, memoryTimer: null };

/* =========================================================
   1. AMBIENT FLOATING ICONS (hearts / stars / smileys)
   ========================================================= */
function initFloatingAmbient() {
  const icons = ["💙", "💕", "✨", "⭐", "🙂", "💫", "🎀", "🌸", "🦋", "💌", "🧸", "🌟"];
  const count = 22;
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.className = "floaty";
    span.textContent = icons[Math.floor(Math.random() * icons.length)];
    const size = 14 + Math.random() * 18;
    const duration = 10 + Math.random() * 10;
    const delay = Math.random() * 14;
    const drift = (Math.random() * 80 - 40) + "px";
    span.style.left = Math.random() * 100 + "vw";
    span.style.fontSize = size + "px";
    span.style.animationDuration = duration + "s";
    span.style.animationDelay = -delay + "s"; // negative delay = already mid-flight on load
    span.style.setProperty("--drift", drift);
    floatingLayer.appendChild(span);
  }
}

/* =========================================================
   2. STARRY SKY (built once, faded in after reveal)
   ========================================================= */
function initStars() {
  const count = 90;
  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
    const size = Math.random() * 2.4 + 1;
    star.style.width = size + "px";
    star.style.height = size + "px";
    star.style.top = Math.random() * 100 + "%";
    star.style.left = Math.random() * 100 + "%";
    star.style.animationDuration = 2 + Math.random() * 3 + "s";
    star.style.animationDelay = Math.random() * 4 + "s";
    starsLayer.appendChild(star);
  }
}

// Small drifting "memory" bubbles once night mode kicks in
function spawnMemory() {
  const icons = ["💙", "✨", "⭐"];
  const el = document.createElement("span");
  el.className = "memory";
  el.textContent = icons[Math.floor(Math.random() * icons.length)];
  el.style.left = Math.random() * 100 + "vw";
  el.style.setProperty("--drift", (Math.random() * 60 - 30) + "px");
  el.style.animationDuration = 9 + Math.random() * 6 + "s";
  starsLayer.appendChild(el);
  setTimeout(() => el.remove(), 16000);
}

function startNightMode() {
  if (state.isNight) return;
  state.isNight = true;
  document.body.classList.add("night");
  gradientBg.classList.add("night");
  starsLayer.classList.add("visible");
  spawnMemory();
  state.memoryTimer = setInterval(spawnMemory, 2200);
}

function stopNightMode() {
  state.isNight = false;
  document.body.classList.remove("night");
  gradientBg.classList.remove("night");
  starsLayer.classList.remove("visible");
  clearInterval(state.memoryTimer);
  starsLayer.querySelectorAll(".memory").forEach((m) => m.remove());
}

/* =========================================================
   3. FORM VALIDATION + FLIP REVEAL
   ========================================================= */
function buildMessageLines(friend, you) {
  return [
    "Happy Friendship Day to my HG. 🤍🌸",
    "I honestly don't think you realize how much you've become a part of my life. You're not just my best friend... you're the person I automatically want to tell everything to, the one who somehow understands my silence as much as my words. 🫂✨",
    "You've seen me at my happiest, my most annoying, my most random, and even my lowest, yet you've stayed. That means more to me than I could ever explain. ❤️",
    "I love how our connection isn't just emotional, it's mental too. We match each other's energy, finish each other's thoughts, make the dumbest jokes, have the deepest conversations, and somehow turn ordinary moments into my favorite memories. 🧠💞",
    " There's something so comforting about your presence that I can't really put into words.",
    "Thank you for making my days brighter, for putting up with my drama, for laughing at my stupid jokes (even when they're not funny 😭), and for always being there when I need someone. You're genuinely one of the most beautiful souls I've ever met. 🌹",
    "If I had one wish, it'd be that no matter where life takes us, we never lose what we have. I want us to keep making memories, teasing each other, annoying each other, supporting each other, and always finding our way back to one another. ♾️✨",
    "And okay... I have to say it—you look way too pretty for your own good sometimes. 😤❤️ It's honestly unfair, but I'll let it slide because you're my HG. 😌🤏",
    "Thank you for being my safe place, my comfort person, my favorite notification, and someone I'll always care about. 🫶",
    "Happy Friendship Day, pretty girl. 🌷🤍",
    "Love you endlessly... now come here and give me my hug. 🫂💖",
    `— ${you}`,
  ];
}

function buildQuote(friend) {
  return `“Soon, we'll be back in each other's arms, ${friend} — and honestly, that already feels like heaven.” 🌌🤍`;
}

function renderMessage(friend, you) {
  messageContent.innerHTML = ""; // safe: only our own template strings + escaped names go in via textContent below
  const lines = buildMessageLines(friend, you);

  lines.forEach((text, i) => {
    const div = document.createElement("div");
    div.className = "line" + (i === lines.length - 1 ? " signature" : "");
    div.textContent = text;
    div.style.animationDelay = 0.1 + i * 0.09 + "s";
    messageContent.appendChild(div);
  });

  const afterLines = 100 + lines.length * 90 + 250;

  quoteEl.textContent = buildQuote(friend);
  quoteEl.classList.remove("visible");
  setTimeout(() => quoteEl.classList.add("visible"), afterLines);

  photoFrame.classList.remove("visible");
  setTimeout(() => photoFrame.classList.add("visible"), afterLines + 400);
}

function handleGenerate() {
  renderMessage(FRIEND_NAME, YOUR_NAME);
  card.classList.add("flipped");

  // Once the flip has visually happened, layer on the celebration
  setTimeout(() => {
    burstConfetti(window.innerWidth / 2, window.innerHeight / 2.4);
    burstSparkles();
    startNightMode();
  }, 550);
}

function resetCard() {
  hideStickerSlide();
  card.classList.remove("flipped");
  stopNightMode();
  setTimeout(() => {
    messageContent.innerHTML = "";
    quoteEl.classList.remove("visible");
    quoteEl.textContent = "";
    photoFrame.classList.remove("visible");
  }, 500);
}

/* =========================================================
   4. CONFETTI BURST (canvas-based particle system)
   ========================================================= */
function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeConfettiCanvas();
window.addEventListener("resize", resizeConfettiCanvas);

function burstConfetti(originX, originY) {
  const colors = ["#6C63FF", "#FF8FB1", "#FFC978", "#9AD1FF", "#C9B8FF", "#ffffff"];
  const particles = [];
  const count = 90;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 7;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 4 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      life: 1,
    });
  }

  function tick() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    particles.forEach((p) => {
      if (p.life <= 0) return;
      alive = true;
      p.vy += 0.12; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;
      p.life -= 0.012;

      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (alive) {
      requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }
  tick();
}

function burstSparkles() {
  const rect = cardContainer.getBoundingClientRect();
  const spots = [
    { x: rect.left + 10, y: rect.top + 10 },
    { x: rect.right - 10, y: rect.top + 20 },
    { x: rect.left + 20, y: rect.bottom - 20 },
    { x: rect.right - 20, y: rect.bottom - 10 },
  ];
  spots.forEach((spot, i) => {
    setTimeout(() => {
      const s = document.createElement("span");
      s.className = "sparkle";
      s.textContent = "✨";
      s.style.left = spot.x + "px";
      s.style.top = spot.y + "px";
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1200);
    }, i * 140);
  });
}


/* =========================================================
   7. SLIDE 3 — SCRAPBOOK STICKER CARD
   ========================================================= */

// A handful of paper-cutout "swatches" (bg + text colour) and font treatments,
// mixed together so each letter looks like it was snipped from a different magazine.
const CUTOUT_SWATCHES = [
  { bg: "#f4e9da", fg: "#1f1b1b" },
  { bg: "#e9553b", fg: "#ffffff" },
  { bg: "#1f1b1b", fg: "#ffffff" },
  { bg: "#a9c9e8", fg: "#1f1b1b" },
  { bg: "#e8b93e", fg: "#1f1b1b" },
  { bg: "#f2a6c0", fg: "#1f1b1b" },
  { bg: "#8fae8b", fg: "#ffffff" },
  { bg: "#ffffff", fg: "#1f1b1b" },
];
const CUTOUT_FONTS = [
  { fontFamily: "'Poppins', sans-serif", fontWeight: 800 },
  { fontFamily: "Georgia, serif", fontWeight: 700, fontStyle: "italic" },
  { fontFamily: "'Courier New', monospace", fontWeight: 700 },
  { fontFamily: "'Dancing Script', cursive", fontWeight: 700 },
];

function buildCutoutRow(container, word) {
  container.innerHTML = "";
  word.split("").forEach((ch) => {
    const span = document.createElement("span");
    if (ch === " ") {
      span.className = "cutout-letter space";
      span.textContent = "\u00A0";
      container.appendChild(span);
      return;
    }
    const swatch = CUTOUT_SWATCHES[Math.floor(Math.random() * CUTOUT_SWATCHES.length)];
    const font = CUTOUT_FONTS[Math.floor(Math.random() * CUTOUT_FONTS.length)];
    span.className = "cutout-letter";
    span.textContent = ch;
    span.style.background = swatch.bg;
    span.style.color = swatch.fg;
    span.style.fontFamily = font.fontFamily;
    span.style.fontWeight = font.fontWeight;
    if (font.fontStyle) span.style.fontStyle = font.fontStyle;
    span.style.setProperty("--rot", (Math.random() * 14 - 7).toFixed(1) + "deg");
    container.appendChild(span);
  });
}

function initStickerSlide() {
  buildCutoutRow(cutoutRow1, "HAPPY");
  buildCutoutRow(cutoutRow2, "FRIENDSHIP DAY");
}

function showStickerSlide() {
  stickerStage.classList.add("active");
}

function hideStickerSlide() {
  stickerStage.classList.remove("active");
}


/* =========================================================
   8. WIRE EVERYTHING UP
   ========================================================= */
generateBtn.addEventListener("click", handleGenerate);
resetBtn.addEventListener("click", resetCard);

nextSlideBtn.addEventListener("click", showStickerSlide);
stickerBackBtn.addEventListener("click", hideStickerSlide);
stickerResetBtn.addEventListener("click", () => {
  hideStickerSlide();
  resetCard();
});

initFloatingAmbient();
initStars();
initStickerSlide();