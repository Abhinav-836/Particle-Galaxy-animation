# 🌀 Particle Galaxy

A tiny canvas experiment — thousands of particles orbit a glowing core,
forming a spiral galaxy. Move your mouse to warp spacetime. 🌌

![preview](./preview.png)

## ✨ Features

- Pure vanilla JS — no libraries, no build step
- Spiral galaxy with 4 arms and depth
- Mouse acts as a gravity/repulsion field
- Works on desktop and mobile
- Single canvas, ~60fps

## 🚀 Run locally

Just open `index.html` in a browser. That's it.

## 🛠️ Tweak it

All settings live in one place in `script.js`:

```js
const CONFIG = {
  particleCount: 2200,  // more = denser galaxy
  arms: 4,              // number of spiral arms
  spin: 0.12,           // rotation speed
  mouseRadius: 180,     // mouse influence radius
  mouseForce: 1.6,      // mouse push strength
  ...
};
