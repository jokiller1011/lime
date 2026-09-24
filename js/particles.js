// White particles drifting up + left from the bottom-right corner.
export function startParticles(canvas = document.getElementById('particles')) {
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize); resize();

  const COUNT = Math.round(Math.min(140, (w * h) / 14000));

  function spawn(seed = false) {
    return {
      x: w - Math.random() * (w * .35) + (seed ? 0 : Math.random() * 20),
      y: h - Math.random() * (h * .35) + (seed ? 0 : Math.random() * 20),
      vx: -(0.15 + Math.random() * 0.5),
      vy: -(0.15 + Math.random() * 0.5),
      r: 0.6 + Math.random() * 1.6,
      a: 0.15 + Math.random() * 0.55
    };
  }
  for (let i = 0; i < COUNT; i++) particles.push(spawn(true));

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (let p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20 || p.y < -20) Object.assign(p, spawn());
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  tick();
}
