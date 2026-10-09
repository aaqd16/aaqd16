// Original code-native ASCII illustration. No photographs or external assets.
// The terminal is illustrative, not a recording of shell commands or benchmarks.
// Orthographic ray/surface intersections resolve the planet, rings and moon
// together; character density represents illumination, not an image filter.
export function drawTerminal(ctx, time = 0, compact = false) {
  const W = compact ? 360 : 640, H = compact ? 460 : 274;
  const c = { bg: '#0d1117', bar: '#161b22', line: '#30363d', ink: '#e6edf3', muted: '#9ba9b7', blue: '#79c0ff', mint: '#9be9bc', violet: '#c8b6ef' };
  const t = ((time % 12) + 12) % 12, phase = t * Math.PI / 6;
  ctx.save();
  ctx.scale(ctx.canvas.width / W, ctx.canvas.height / H);
  ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = c.bar; ctx.fillRect(0, 0, W, 27);
  for (const [i, color] of ['#f47067', '#e3b341', '#57ab5a'].entries()) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(15 + i * 12, 13.5, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.font = `${compact ? 10 : 9}px Menlo, monospace`; ctx.fillStyle = c.muted;
  ctx.fillText('aaqd16 / terminal', 64, 17);
  ctx.fillStyle = c.line; ctx.fillRect(0, 27, W, 1);
  const x = compact ? 20 : 26;
  const put = (text, y, color = c.ink, size = compact ? 14 : 11.5) => {
    ctx.font = `${size}px Menlo, monospace`; ctx.fillStyle = color; ctx.fillText(text, x, y);
  };
  const type = (text, start, y) => {
    if (t < start) return;
    const count = Math.min(text.length, Math.floor((t - start) * 21));
    const fragment = text.slice(0, count); put(fragment, y, c.blue);
    if (count < text.length) {
      ctx.fillStyle = c.violet; ctx.fillRect(x + ctx.measureText(fragment).width + 2, y - (compact ? 11 : 9), 6, compact ? 13 : 11);
    }
  };
  type('$ whoami', .05, 56);
  if (t > .55) put('aaqd16', 84, c.ink, compact ? 28 : 25);
  type('$ cat focus.md', 1.2, 113);
  if (t > 2) put('Developer / Founder @ Apex', 135, c.muted, compact ? 12.5 : 10.5);
  if (t > 2.5) put('Building Apex Feed', 155, c.mint);
  type('$ ls stack/', 3.2, 184);
  if (t > 3.95) put('Python  JavaScript  Flask', 205, c.ink, compact ? 12.5 : 10.5);
  if (t > 4.2) put('SQLite  HTML  CSS', 224, c.muted, compact ? 12.5 : 10.5);
  if (t > 4.9) {
    put('$', 248, c.blue);
    ctx.fillStyle = Math.floor(t * 1.4) % 2 ? c.violet : '#c8b6ef55'; ctx.fillRect(x + 14, 239, 6, 11);
  }

  // A tilted ring plane in an orthonormal basis. Its slow precession is
  // periodic, so geometry and shading join seamlessly at the GIF boundary.
  const tilt = 1.08 + .10 * Math.sin(phase), turn = -.39 + .06 * Math.cos(phase);
  const cs = Math.cos(turn), sn = Math.sin(turn), ct = Math.cos(tilt), st = Math.sin(tilt);
  const R = compact ? 45 : 53, cx = compact ? 180 : 490, cy = compact ? 354 : 150;
  const moonAngle = phase + .9;
  const moon = [2.4 * Math.cos(moonAngle), 1.45 * Math.sin(moonAngle) * ct, 1.45 * Math.sin(moonAngle) * st];
  const cols = 90, rows = 55, dx = 3.05, dy = 3.65;
  const chars = '.,:;=+*#%@';
  ctx.font = '5.1px Menlo, monospace';

  // A few stationary stars leave the silhouette readable, with no flashing.
  for (const [sx, sy] of [[-104,-86],[74,-94],[104,65],[-82,84],[25,98]]) {
    ctx.fillStyle = '#485768'; ctx.fillText('.', cx + sx, cy + sy);
  }
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const px = (col - (cols - 1) / 2) * dx / R;
    const py = (row - (rows - 1) / 2) * dy / R;
    let z = -Infinity, light = 0, material = 'planet';
    const rr = px * px + py * py;
    if (rr <= 1) {
      z = Math.sqrt(1 - rr);
      // Rotating, continuous cloud bands follow spherical coordinates.
      const latitude = py * ct + z * st;
      const longitude = Math.atan2(px, z * ct - py * st) + phase;
      const bands = .82 + .12 * Math.sin(latitude * 24 + 1.8 * Math.sin(longitude * 3));
      light = (.18 + .82 * Math.max(0, -.48 * px - .5 * py + .72 * z)) * bands;
    }
    // Invert the projected ring basis to find the intersection of this
    // camera ray with the ring plane. Front rings correctly occlude the globe.
    const a = px * cs + py * sn, b = (-px * sn + py * cs) / ct;
    const ringRadius = Math.hypot(a, b), ringZ = b * st;
    if (ringRadius > 1.37 && ringRadius < 2.16 && ringZ > z) {
      const gap = ringRadius > 1.76 && ringRadius < 1.84;
      if (!gap) {
        z = ringZ; material = 'ring';
        const lane = .7 + .18 * Math.sin(ringRadius * 67);
        light = lane * (.72 + .22 * Math.cos(Math.atan2(b, a) - phase));
        // A stylised planetary shadow darkens the back half of the ring.
        if (b < 0 && Math.abs(a + .34) < .45) light *= .35;
      }
    }
    const mx = px - moon[0], my = py - moon[1], mr = .14;
    if (mx * mx + my * my < mr * mr) {
      const mz = Math.sqrt(mr * mr - mx * mx - my * my);
      if (moon[2] + mz > z) {
        z = moon[2] + mz; material = 'moon';
        light = .32 + .68 * Math.max(0, (-.48 * mx - .5 * my + .72 * mz) / mr);
      }
    }
    if (z === -Infinity) continue;
    light = Math.max(.08, Math.min(.999, light));
    ctx.fillStyle = material === 'ring' ? (light > .63 ? '#b9dbf6' : '#6d92b0')
      : material === 'moon' ? c.ink : light > .68 ? '#d3e8f7' : light > .4 ? c.blue : '#476882';
    ctx.fillText(chars[Math.floor(light * chars.length)], cx + px * R, cy + py * R);
  }
  ctx.restore();
}
