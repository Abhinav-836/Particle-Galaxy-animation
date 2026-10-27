# 🌀 Particle Galaxy

An interactive spiral galaxy drawn on a single canvas: thousands of particles orbit a glowing core, and your mouse or finger pushes them aside as it moves through.

**Live demo:** https://abhinav-836.github.io/Particle-Galaxy-animation/

![Particle Galaxy preview](./preview.png)

## ✨ Features

- Pure vanilla JavaScript: no libraries, no build step
- Four-armed spiral that keeps its shape as it turns, with soft motion trails
- Pointer repulsion field that works with mouse, pen and touch
- Scales to any screen, and resizing (or a phone's address bar sliding) doesn't reset the galaxy
- Sharp on high-DPI displays
- Respects the system **Reduce motion** setting by slowing the animation to a gentle drift

## 🚀 Run locally

Open `index.html` in a browser. That's it.

## 🛠️ Tweak it

All settings live in one object at the top of `script.js`:

```js
const CONFIG = {
  particleCount: 2200,          // more = denser galaxy
  arms: 4,                      // number of spiral arms
  spin: 0.012,                  // rotation speed
  colorInner: [255, 220, 160],  // core color
  colorOuter: [120, 180, 255],  // outer arm color
  mouseRadius: 180,             // pointer influence radius (px)
  mouseForce: 1.6,              // pointer push strength
  reducedMotionSpeed: 0.1       // speed when "reduce motion" is on
};
```

Some fun combinations: `arms: 2` for a classic two-arm spiral, `arms: 6` for a flower pattern, `colorInner: [255, 100, 200]` for a neon-pink core, or `mouseForce: 4` to scatter the stars.

## 🧠 How it works

Each particle stores a fixed position along its spiral arm (0 at the core, 1 at the edge) and an angle. The whole galaxy turns as one, while each star drifts slightly back and forth along its arm, so the arms keep their shape instead of winding up into rings. Positions are projected onto a flattened ellipse to give the disc a tilted look. Nearby particles get pushed away from the pointer and spring back toward their orbit. Instead of clearing the canvas, each frame paints a translucent dark layer over the last one, which leaves the soft trails.

## 📄 License

[MIT](./LICENSE.txt) © Abhinav Ashutosh
