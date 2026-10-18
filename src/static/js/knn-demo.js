// markup: src/_components/KnnDemo.vto
const NS = "http://www.w3.org/2000/svg"
const W = 640, H = 400, PAD = 5;

const mulberry32 = (a) => () => {
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const svgEl = (name, attrs) => {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

for (const fig of document.querySelectorAll(".c-knn:not([data-ready])")) {
  fig.dataset.ready = "";

  const N = +fig.dataset.n;
  const rand = mulberry32(+fig.dataset.seed);
  const pts = Array.from({ length: N }, () => [
    PAD + rand() * (W - 2 * PAD),
    PAD + rand() * (H - 2 * PAD),
  ]);

  const svg = fig.querySelector(".c-knn__plot");
  const kIn = fig.querySelector("[name=k]"), epsIn = fig.querySelector("[name=eps]");
  const kOut = fig.querySelector(".c-knn__k-out"), epsOut = fig.querySelector(".c-knn__eps-out");
  const legend = fig.querySelector(".c-knn__legend");

  kIn.max = Math.min(20, N);
  kIn.value = fig.dataset.k;
  epsIn.value = fig.dataset.eps;

  const annRing = svgEl("circle", { class: "c-knn__ring c-knn__ring--approx" });
  const exactRing = svgEl("circle", { class: "c-knn__ring c-knn__ring--exact" });
  const dots = pts.map(([x, y]) => svgEl("circle", { cx: x, cy: y, r: 5, class: "c-knn__dot" }));
  const query = svgEl("circle", { r: 8, class: "c-knn__query" });
  svg.append(annRing, exactRing, ...dots, query);

  let qx = W / 2, qy = H / 2;
  const draw = () => {
    const K = +kIn.value, eps = +epsIn.value;
    kOut.textContent = K;
    epsOut.textContent = eps.toFixed(2);

    const d = pts.map(([x, y]) => Math.hypot(x - qx, y - qy));
    const order = d.map((_, i) => i).sort((a, b) => d[a] - d[b]);
    const rank = new Int32Array(N);
    order.forEach((i, r) => (rank[i] = r));

    const rK = d[order[K - 1]];
    const rAnn = (1 + eps) * rK;

    let accepted = 0;
    dots.forEach((dot, i) => {
      const exact = rank[i] < K;
      const approx = !exact && d[i] <= rAnn;
      accepted += approx;
      dot.classList.toggle("is-exact", exact);
      dot.classList.toggle("is-approx", approx);
    });

    for (const [ring, r] of [[exactRing, rK], [annRing, rAnn]]) {
      ring.setAttribute("cx", qx);
      ring.setAttribute("cy", qy);
      ring.setAttribute("r", r);
    }
    query.setAttribute("cx", qx);
    query.setAttribute("cy", qy);

    legend.textContent =
      `${K} exact nearest neighbour${K > 1 ? "s" : ""} (green);` +
      `${accepted} more point${accepted === 1 ? "" : "s"} also acceptable with ε = ${eps.toFixed(2)} (red).`
  };

  const moveTo = (e) => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    qx = clamp(p.x, 0, W);
    qy = clamp(p.y, 0, H);
    draw();
  };
  svg.addEventListener("pointerdown", (e) => {
    svg.setPointerCapture(e.pointerId);
    moveTo(e);
  });
  svg.addEventListener("pointermove", (e) => {
    if (svg.hasPointerCapture(e.pointerId)) moveTo(e);
  });

  const STEPS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  svg.addEventListener("keydown", (e) => {
    const s = STEPS[e.key];
    if (!s) return;
    e.preventDefault();
    const step = e.shiftKey ? 40 : 10;
    qx = clamp(qx + s[0] * step, 0, W);
    qy = clamp(qy + s[1] * step, 0, H);
    draw();
  });

  kIn.addEventListener("input", draw);
  epsIn.addEventListener("input", draw);
  draw();
}
