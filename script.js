/* ============================================================
   PARTICLE GALAXY
   - Thousands of particles orbiting a glowing core
   - Each particle has its own place on a spiral arm, size and color
   - Mouse / finger pushes particles away (repulsion field)
   - Respects "reduce motion" accessibility settings
   - Pure vanilla JS, no libraries
   ============================================================ */

(function () {
  "use strict";

  const canvas = document.getElementById("galaxy");
  const ctx = canvas.getContext("2d");

  // ---------- Settings (tweak these) ----------
  const CONFIG = {
    particleCount: 2200,          // how many stars
    arms: 4,                      // spiral arms
    coreRadius: 40,               // empty center radius (at 1000px screen)
    maxRadius: 520,               // outer edge (at 1000px screen)
    spin: 0.012,                  // rotation speed of the whole galaxy
    colorInner: [255, 220, 160],  // warm core color
    colorOuter: [120, 180, 255],  // cool outer color
    bgStars: 180,                 // tiny background stars
    mouseRadius: 180,             // how far the pointer affects particles
    mouseForce: 1.6,              // how strongly the pointer pushes
    reducedMotionSpeed: 0.1       // speed multiplier when "reduce motion" is on
  };

  // ---------- State ----------
  let W = 0;
  let H = 0;
  let cx = 0;
  let cy = 0;
  let dpr = 1;
  let coreR = 0;
  let maxR = 0;

  const pointer = { x: 0, y: 0, active: false };
  let particles = [];
  let bgStars = [];

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let speedFactor = motionQuery.matches ? CONFIG.reducedMotionSpeed : 1;
  const onMotionChange = (e) => {
    speedFactor = e.matches ? CONFIG.reducedMotionSpeed : 1;
  };
  if (motionQuery.addEventListener) motionQuery.addEventListener("change", onMotionChange);
  else if (motionQuery.addListener) motionQuery.addListener(onMotionChange); // older Safari

  // ---------- Setup / Resize ----------
  // Particles store their orbit as a 0..1 fraction (t), and background stars
  // store 0..1 screen coordinates, so a resize only rescales the scene. It no
  // longer rebuilds it, which made the galaxy "jump" every time a phone's
  // address bar slid in or out.
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2); // re-read: monitor may have changed
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cx = W / 2;
    cy = H / 2;
    // Size relative to a 1000px screen, never smaller than 0.55 so small
    // laptops still get a big galaxy, but always narrow enough to fit the
    // width (on phones the 0.55 floor alone pushed the arms off-screen).
    const scale = Math.min(
      Math.max(Math.min(W, H) / 1000, 0.55),
      (W * 0.47) / CONFIG.maxRadius
    );
    maxR = CONFIG.maxRadius * scale;
    coreR = CONFIG.coreRadius * scale;

    ctx.fillStyle = "#03040a";
    ctx.fillRect(0, 0, W, H);
  }

  // ---------- Build the galaxy (once) ----------
  function mixColor(t) {
    const a = CONFIG.colorInner;
    const b = CONFIG.colorOuter;
    const r = Math.round(a[0] * (1 - t) + b[0] * t);
    const g = Math.round(a[1] * (1 - t) + b[1] * t);
    const bl = Math.round(a[2] * (1 - t) + b[2] * t);
    return `rgba(${r},${g},${bl},`;
  }

  function buildGalaxy() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      // Distance from center as a 0..1 fraction: denser near the core
      const t = Math.pow(Math.random(), 0.65);

      // Which spiral arm
      const arm = Math.floor(Math.random() * CONFIG.arms);
      const armOffset = (arm / CONFIG.arms) * Math.PI * 2;

      // Spiral twist (further out = more twist) plus a little scatter
      const twist = t * 3.2;
      const scatter = (Math.random() - 0.5) * 0.5;

      particles.push({
        t,
        angle: armOffset + twist + scatter,
        // Each star drifts a little back and forth along its arm. The whole
        // galaxy turns as one, so the arms keep their shape. (When inner
        // stars orbited ~3x faster, the arms wound up into plain rings
        // within a few seconds.)
        drift: 0.04 + Math.random() * 0.08,
        driftPhase: Math.random() * Math.PI * 2,
        driftSpeed: 0.0004 + Math.random() * 0.0008,
        size: Math.random() * 1.6 + 0.4,
        color: mixColor(t),
        // Dimmer toward the edge for a sense of depth
        alpha: Math.max(0.15, (0.5 + Math.random() * 0.5) * (1 - t * 0.75)),
        dx: 0, // pointer displacement
        dy: 0,
        wobble: Math.random() * Math.PI * 2, // small vertical drift
        wobbleSpeed: 0.0006 + Math.random() * 0.001
      });
    }
  }

  function buildBgStars() {
    bgStars = [];
    for (let i = 0; i < CONFIG.bgStars; i++) {
      bgStars.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 0.8 + 0.2,
        a: Math.random() * 0.6 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.002 + Math.random() * 0.004
      });
    }
  }

  // ---------- Glowing core ----------
  function drawCore() {
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 6);
    glow.addColorStop(0, "rgba(255, 240, 200, 0.55)");
    glow.addColorStop(0.15, "rgba(255, 180, 120, 0.28)");
    glow.addColorStop(0.4, "rgba(120, 140, 255, 0.12)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 6, 0, Math.PI * 2);
    ctx.fill();

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
  let rotation = 0; // shared rotation of the whole galaxy
  const TAU = Math.PI * 2;

  function render(now) {
    requestAnimationFrame(render);

    // Cap the step so returning to a background tab doesn't jump
    const dt = Math.min(now - last, 50) * speedFactor;
    last = now;

    // Translucent fill instead of a full clear -> soft motion trails
    ctx.fillStyle = "rgba(3, 4, 10, 0.28)";
    ctx.fillRect(0, 0, W, H);

    // Background stars (twinkling)
    for (let i = 0; i < bgStars.length; i++) {
      const s = bgStars[i];
      s.twinkle += s.twinkleSpeed * dt;
      ctx.fillStyle = `rgba(200, 220, 255, ${s.a * (0.6 + 0.4 * Math.sin(s.twinkle))})`;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, TAU);
      ctx.fill();
    }

    drawCore();

    rotation += CONFIG.spin * (dt / 16.67);
    const mr = CONFIG.mouseRadius;
    const push = CONFIG.mouseForce * 18 * 0.15;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.wobble += p.wobbleSpeed * dt;
      p.driftPhase += p.driftSpeed * dt;

      const angle = p.angle + rotation + Math.sin(p.driftPhase) * p.drift;
      const radius = coreR + p.t * (maxR - coreR);
      let px = cx + Math.cos(angle) * radius;
      let py = cy + Math.sin(angle) * radius * 0.55 + Math.sin(p.wobble) * 6; // flattened disc

      // Pointer pushes nearby stars away
      if (pointer.active) {
        const mdx = px - pointer.x;
        const mdy = py - pointer.y;
        const dist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (dist < mr && dist > 0.01) {
          const force = (1 - dist / mr) * push;
          p.dx += (mdx / dist) * force;
          p.dy += (mdy / dist) * force;
        }
      }

      // Spring back toward the orbit
      p.dx *= 0.92;
      p.dy *= 0.92;

      ctx.fillStyle = p.color + p.alpha + ")";
      ctx.beginPath();
      ctx.arc(px + p.dx, py + p.dy, p.size, 0, TAU);
      ctx.fill();
    }
  }

  // ---------- Pointer (mouse, pen and touch) ----------
  function setPointer(x, y) {
    pointer.x = x;
    pointer.y = y;
    pointer.active = true;
  }
  function clearPointer() {
    pointer.active = false;
  }

  window.addEventListener("pointermove", (e) => setPointer(e.clientX, e.clientY), { passive: true });
  window.addEventListener("pointerdown", (e) => setPointer(e.clientX, e.clientY), { passive: true });
  window.addEventListener("pointerup", (e) => {
    if (e.pointerType !== "mouse") clearPointer(); // a lifted finger stops pushing
  });
  window.addEventListener("pointercancel", clearPointer);
  // "mouseleave" never fires on window; the document element gets it when
  // the cursor leaves the page, so the push field turns off as intended.
  document.documentElement.addEventListener("mouseleave", clearPointer);
  window.addEventListener("blur", clearPointer);

  // ---------- Resize ----------
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  // ---------- Boot ----------
  buildGalaxy();
  buildBgStars();
  resize();
  requestAnimationFrame(render);
})();
