// markup: src/_components/DistanceConcentration.vto
const DIMS = [1, 2, 3, 5, 10, 20, 50, 100, 200, 500, 1000];
const N = 500, Q = 5, NOISE = 0.02, BINS = 40;
const FAIL = 0.5;

const mulberry32 = (a) => () => {
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const gaussian = (rand) => () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());

function sample(d, k, seed) {
  const g = gaussian(mulberry32(seed));
  const rows = N + Q, X = new Float64Array(rows * d);
  if (k === 0) {
    for (let i = 0; i < X.length; i++) X[i] = g();
    return X;
  }
  const R = Float64Array.from({ length: d * k }, () => g() / Math.sqrt(d));
  const z = new Float64Array(k);
  for (let i = 0; i < rows; i++) {
    for (let a = 0; a < k; a++) z[a] = g();
    for (let j = 0; j < d; j++) {
      let s = 0;
      for (let a = 0; a < k; a++) s += R[j * k + a] * z[a];
      X[i * d + j] = s + NOISE * g();
    }
  }
  return X;
}

function distances(X, d, q) {
  const out = new Float64Array(N), o = (N + q) * d;
  for (let i = 0; i < N; i++) {
    let s = 0;
    const b = i * d;
    for (let j = 0; j < d; j++) {
      const t = X[b + j] - X[o + j];
      s += t * t;
    }
    out[i] = Math.sqrt(s);
  }
  return out;
}

function compute(k) {
  return DIMS.map((d) => {
    const X = sample(d, k, 1_000_003 * k + d);
    const contrats = [];
    let first;
    for (let q = 0; q < Q; q++) {
      const dist = distances(X, d, q);
      let lo = Infinity, hi = 0;
      for (const v of dist) { if (v < lo) lo = v; if (v > hi) hi = v; }
      lo = Math.max(lo, 1e-12);
      contrats.push((hi - lo) / lo);
      if (q === 0) first = { dist, lo, hi };
    }
    contrats.sort((a, b) => a - b);
    return { ...first, median: contrats[Q >> 1] };
  })
}

const fmt = (x) => (x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const line = (ctx, x0, y0, x1, y1) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }

function setup(canvas) {
  const dpr = window.devicePixelRatio || 1, W = canvas.clientWidth, H = canvas.clientHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  return [ctx, W, H];
}

for (const fig of document.querySelectorAll(".c-conc:not([data-ready])")) {
  fig.dataset.ready = "";

  const histCanvas = fig.querySelector(".c-conc__hist"), curveCanvas = fig.querySelector(".c-conc__curve");
  const dIn = fig.querySelector("[name=d]"), kIn = fig.querySelector("[name=k]");
  const dOut = fig.querySelector(".c-conc__d-out"), kOut = fig.querySelector(".c-conc__k-out");
  const kRow = fig.querySelector(".c-conc__k-row"), text = fig.querySelector(".c-conc__text");
  dIn.max = DIMS.length - 1;

  const cache = new Map();
  const results = (k) => {
    if (!cache.has(k)) cache.set(k, compute(k));
    return cache.get(k);
  }

  function drawHist(r, c) {
    const [ctx, W, H] = setup(histCanvas);
    const L = 8, R = 8, T = 18, B = 22, pw = W - L - R, ph = H - T - B;

    const counts = new Uint32Array(BINS);
    for (const v of r.dist) counts[Math.min(BINS - 1, Math.floor((v / r.hi) * BINS))]++;
    const top = Math.max(...counts), bw = pw / BINS;

    ctx.fillStyle = c.ink;
    ctx.globalAlpha = 0.75;
    counts.forEach((n, b) => {
      const h = (ph * n) / top;
      ctx.fillRect(L + b * bw + 0.5, T + ph - h, Math.max(bw - 1, 1), h);
    });
    ctx.globalAlpha = 1;

    const xNN = L + (pw * r.lo) / r.hi;
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2;
    line(ctx, xNN, T, xNN, T + ph);
    ctx.fillStyle = c.accent;
    ctx.font = c.font;
    ctx.textAlign = xNN > L + pw - 60 ? "right" : "left";
    ctx.fillText("nearest", xNN + (ctx.textAlign == "left" ? 4 : -4), T - 5);

    ctx.strokeStyle = c.muted;
    ctx.lineWidth = 1;
    line(ctx, L, T + ph, L + pw, T + ph);
    ctx.fillStyle = c.muted;
    ctx.textAlign = "left";
    ctx.fillText("0", L, H - 6);
    ctx.textAlign = "right";
    ctx.fillText("1 = farthest", L + pw, H - 6);
    ctx.textAlign = "center";
    ctx.fillText("distance / farthest", L + pw / 2, H - 6);
  }

  function drawCurve(res, idx, c) {
    const [ctx, W, H] = setup(curveCanvas);
    const L = 38, R = 10, T = 10, B = 22, pw = W - L - R, ph = H - T - B;
    const x0f = (d) => L + (pw * Math.log10(d)) / 3;
    const y0f = (v) => T + (ph * (4 - clamp(Math.log10(v), -2, 4))) / 6;

    ctx.font = c.font;
    ctx.lineWidth = 1;

    ctx.strokeStyle = c.muted;
    ctx.fillStyle = c.muted;
    ctx.globalAlpha = 0.3;
    for (let e = -2; e <= 4; e++) line(ctx, L, y0f(10 ** e), L + pw, y0f(10 ** e));
    ctx.globalAlpha = 1;
    ctx.textAlign = "right";
    const yLabel = { "-2": "0.01", "-1": "0.1", 0: "1", 1: "10", 2: "100", 3: "1k", 4: "10k" };
    for (let e = -2; e <= 4; e++) ctx.fillText(yLabel[e], L - 5, y0f(10 ** e) + 4);
    ctx.textAlign = "center";
    for (const d of [1, 10, 100, 1000]) ctx.fillText(String(d), x0f(d), H - 6);

    ctx.strokeStyle = c.accent;
    ctx.setLineDash([5, 4]);
    line(ctx, L, y0f(FAIL), L + pw, y0f(FAIL));
    ctx.setLineDash([]);

    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    res.forEach((r, i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, x0f(DIMS[i]), y0f(r.median)));
    ctx.stroke();
    ctx.fillStyle = c.ink;
    res.forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(x0f(DIMS[i], y0f(r.median), 2.5, 0, 2 * Math.PI));
      ctx.fill();
    });

    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.arc(x0f(DIMS[i]), y0f(res[idx].median), 5.5, 0, 2 * Math.PI);
    ctx.fill();
  }

  function draw() {
    const subspace = fig.querySelector("input[type=radio]:checked").value === "subspace";
    const k = subspace ? +kIn.value : 0, idx = +dIn.value, d = DIMS[idx];
    kRow.hidden = !subspace;
    dOut.textContent = d;
    kOut.textContent = kIn.value;

    const s = getComputedStyle(fig);
    const c = {
      ink: s.getPropertyValue("--conc-ink").trim() || "#333",
      muted: s.getPropertyValue("--conc-muted").trim() || "#666",
      accent: s.getPropertyValue("--conc-accent").trim() || "#c22",
      font: `12px ${s.fontFamily}`
    };

    const res = results(k), r = res[idx];
    drawHist(r, c);
    drawCurve(res, idx, c);

    const contrast = (r.hi - r.lo) / r.lo;
    text.textContent = `d = ${d}: the farthest point is ${fmt(r.hi / r.lo)} as far as the nearest ` +
      `(contrast ${fmt(contrast)}).`;
    fig.classList.toggle("is-concentrated", contrast < FAIL);
  }

  fig.querySelectorAll("input").forEach((el) => el.addEventListener("input", draw));
  new ResizeObserver(draw).observe(fig);
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  draw();
}
