/* ============================================================
   PARTICLE GALAXY
   - Thousands of particles orbiting a glowing core
   - Each particle has its own radius, angle, speed, color
   - Mouse pushes particles (repulsion / gravity well)
   - Everything is pure vanilla JS, no libraries
   ============================================================ */

(function () {
  const canvas = document.getElementById("pinkboard");
  const ctx = canvas.getContext("2d");

  let W = 0;
  let H = 0;
  let cx = 0;
  let cy = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Mouse state
  const mouse = { x: 0, y: 0, active: false };

  // Galaxy settings
  const CONFIG = {
    particleCount: 2200,      // how many stars
    arms: 4,                  // spiral arms
    coreRadius: 40,           // empty center radius
    maxRadius: 520,           // outer edge
    spin: 0.12,               // base rotation speed
    colorInner: [255, 220, 160], // warm core color
    colorOuter: [120, 180, 255], // cool outer color
    bgStars: 180,             // tiny background stars
    mouseRadius: 180,         // how far mouse affects particles
    mouseForce: 1.6           // how strongly mouse pushes
  };

  // Particle pool
  let particles = [];
  let bgStars = [];

  // ---------- Setup / Resize ----------
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2;
    cy = H / 2;
    buildGalaxy();
    buildBgStars();
  }

  // ---------- Build the galaxy ----------
  function buildGalaxy() {
    particles = [];
    const scale = Math.min(W, H) / 1000; // keep galaxy fitting on any screen
    const maxR = CONFIG.maxRadius * Math.max(scale, 0.55);
    const coreR = CONFIG.coreRadius * Math.max(scale, 0.55);

    for (let i = 0; i < CONFIG.particleCount; i++) {
      // Distance from center — denser near core, sparse at edges
      const t = Math.pow(Math.random(), 0.65);
      const radius = coreR + t * (maxR - coreR);

      // Which spiral arm
      const arm = Math.floor(Math.random() * CONFIG.arms);
      const armOffset = (arm / CONFIG.arms) * Math.PI * 2;

      // Spiral twist — further out = more twist
      const twist = (radius / maxR) * 3.2;

      // Slight randomness so it doesn't look too perfect
      const scatter = (Math.random() - 0.5) * 0.35;

      const angle = armOffset + twist + scatter;

      // Orbital speed — inner faster (like real galaxies)
      const speed =
        (CONFIG.spin * (1 - t * 0.7) + Math.random() * 0.02) *
        (Math.random() < 0.5 ? 1 : 1);

      // Color: blend inner -> outer
      const mix = t;
      const r = Math.round(
        CONFIG.colorInner[0] * (1 - mix) + CONFIG.colorOuter[0] * mix
      );
      const g = Math.round(
        CONFIG.colorInner[1] * (1 - mix) + CONFIG.colorOuter[1] * mix
      );
      const b = Math.round(
        CONFIG.colorInner[2] * (1 - mix) + CONFIG.colorOuter[2] * mix
      );

      particles.push({
        radius,
        angle,
        speed,
        size: Math.random() * 1.6 + 0.4,
        color: `rgba(${r},${g},${b},`,
        baseAlpha: 0.5 + Math.random() * 0.5,
        // offset for mouse displacement
        dx: 0,
        dy: 0,
        // small vertical wobble so it's not flat
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.0006 + Math.random() * 0.001
      });
    }
  }

  // ---------- Tiny background stars (static) ----------
  function buildBgStars() {
    bgStars = [];
    for (let i = 0; i < CONFIG.bgStars; i++) {
      bgStars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 0.8 + 0.2,
        a: Math.random() * 0.6 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.002 + Math.random() * 0.004
      });
    }
  }

  // ---------- Draw the glowing core ----------
  function drawCore() {
    const scale = Math.min(W, H) / 1000;
    const coreR = CONFIG.coreRadius * Math.max(scale, 0.55);

    // Outer glow
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 6);
    grad.addColorStop(0, "rgba(255, 240, 200, 0.55)");
    grad.addColorStop(0.15, "rgba(255, 180, 120, 0.28)");
    grad.addColorStop(0.4, "rgba(120, 140, 255, 0.12)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 6, 0, Math.PI * 2);
    ctx.fill();

    // Bright inner core
    const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 0.9);
    inner.addColorStop(0, "rgba(255, 255, 255, 1)");
    inner.addColorStop(0.5, "rgba(255, 230, 180, 0.9)");
    inner.addColorStop(1, "rgba(255, 180, 100, 0)");
    ctx.fillStyle = inner;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---------- Main render loop ----------
  let last = performance.now();

  function render(now) {
    requestAnimationFrame(render);

    const dt = Math.min(now - last, 50); // cap so tab-switch doesn't explode
    last = now;

    // Fade-trail background instead of full clear -> soft motion blur
    ctx.fillStyle = "rgba(3, 4, 10, 0.28)";
    ctx.fillRect(0, 0, W, H);

    // Draw background stars (with twinkle)
    for (let i = 0; i < bgStars.length; i++) {
      const s = bgStars[i];
      s.twinkle += s.twinkleSpeed * dt;
      const a = s.a * (0.6 + 0.4 * Math.sin(s.twinkle));
      ctx.fillStyle = `rgba(200, 220, 255, ${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Core glow
    drawCore();

    // Update + draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Orbit
      p.angle += p.speed * (dt / 16.67);
      p.wobble += p.wobbleSpeed * dt;

      // Base position
      let px = cx + Math.cos(p.angle) * p.radius;
      let py = cy + Math.sin(p.angle) * p.radius * 0.55; // squash -> disc shape

      // Vertical wobble for depth
      py += Math.sin(p.wobble) * 6;

      // Mouse interaction — push away from cursor
      if (mouse.active) {
        const mdx = px - mouse.x;
        const mdy = py - mouse.y;
        const dist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (dist < CONFIG.mouseRadius && dist > 0.01) {
          const force =
            (1 - dist / CONFIG.mouseRadius) * CONFIG.mouseForce * 18;
          p.dx += (mdx / dist) * force * 0.15;
          p.dy += (mdy / dist) * force * 0.15;
        }
      }

      // Spring back to rest
      p.dx *= 0.92;
      p.dy *= 0.92;
      px += p.dx;
      py += p.dy;

      // Alpha fades with distance from core
      const depth = 1 - p.radius / (CONFIG.maxRadius + 200);
      const alpha = Math.max(0.15, p.baseAlpha * depth);

      ctx.fillStyle = p.color + alpha + ")";
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------- Mouse / touch ----------
  function onMove(x, y) {
    mouse.x = x;
    mouse.y = y;
    mouse.active = true;
  }

  window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
  window.addEventListener("mouseleave", () => (mouse.active = false));
  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );
  window.addEventListener("touchend", () => (mouse.active = false));

  // ---------- Resize handling ----------
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  // ---------- Boot ----------
  resize();
  requestAnimationFrame(render);
})();
