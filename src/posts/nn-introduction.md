---
title: "Introduction to Nearest Neighbor Search"
date: 2025-04-01
draft: false
author: "Enrico Bolzonello"
tags: ["nearest neighbor", "weekly paper"]
description: An introduction to Nearest Neighbor Search, the algorithm powering recommendation systems and vector databases, with a look at exact and approximate methods.
---

Nearest Neighbor Search is an important primitive in different
applications. You probably use it every day without noticing it as it
powers recommendation algorithms on Spotify and Netflix, to name two
examples. More recently, it became popular again due to vector
databases, and the surge of RAG-augmented AI assistants.

The idea is simple: given a dataset \\(P\\) of vectors of dimensionality \\(d\\)
and given another vector \\(q\\), named query vector, the aim is to find the
nearest vector in \\(P\\) from \\(q\\). But what does near mean? It depends on
the data. Usually data is defined on a metric space, meaning it also
defines a distance. The easiest and most familiar example is the
Euclidean space, where the distance between two points \\(p\\) and \\(q\\) is
defined as: $$
d(p,q) = \sqrt{(p_1-q_1)^2+(p_2-q_2)^2+...+(p_d-q_d)^2}
$$ where \\\( p_i \\\) and \\(q_i\\) with \\(i\in [0,d]\\) represents the \\(i\\)-th
coordinate respectively of vectors \\(p\\) and \\(q\\). But there are many other
ones: angular, cosine, hamming, etc. The idea is intuitive, right?

Solving this problem at a first seems simple, just do a linear scan of
the data and compare each distance, saving only the best ones. But it
requires time \\(O(n\cdot d)\\), where \\(O(d)\\) is the time to compute the
distance, which is impractical. Imagine having millions, if not billions
of points each one with thousands of dimensions, it would be impossible
for Spotify to recommend your next favourite song in milliseconds as it
does now.

To improve efficiency, more optimized algorithms, such as the Kd-Tree,
has been proposed. But a nefarious enemy lurks in the shadow, waiting to
strike: it is the **Curse of Dimensionality**.

## Curse of Dimensionality

The term curse of dimensionality was introduced in 1961 by Bellman.
Nowadays it is a general term related to high dimensional data, spanning
in different domains like machine learning, data mining and obviously
the k Nearest Neighbor problem. In this context, it refers to the
exponential dependency of both space and time on the number of
dimensions. A key reason for this inefficiency is related to the
distance concentration, a phenomenon where in high dimensions the
distances between all pairs of points have almost the same value. To
illustrate the effect, consider the example in the figure below.

<img src="/images/posts/2025/nn-introduction/knn_avg_dist_synt.png" alt="knn distances syntethic" style="background-color: white;">

As the number of dimensions increases, the relative difference between
the closest and farthest points becomes increasingly smaller, so it is
exponentially more difficult to distinguish true nearest neighbors from
the other points. This effect is captured by the relation: $$
\lim_{d\rightarrow \infty}E\bigg(\frac{dist_{max}(d)-dist_{min}(d)}{dist_{min}(d)}\bigg) \rightarrow 0
$$ This rule applies in datasets generated from distributions where
there is little to no structure, like the normal distribution in the
example. However, in real-world datasets, data often have significant
structure, meaning that while the explicit dimensionality may be high,
the intrinsic dimensionality (the number of dimensions that truly
capture meaningful variations in the data) is often much lower. This can
be seen in the following figure [^1], where the ratio for real datasets
is similar to that of much lower-dimensional synthetic data.

<img src="/images/posts/2025/nn-introduction/knn-distances.png" alt="knn distances real world" style="background-color: white;">

But still, even for real world datasets, this effect is visible, making
approaches such as the KD-Tree mentioned before infeasible for high
dimension data [^2]. A new point of view on the problem is needed.

## Approximate Nearest Neighbors

The fundamental question is the following: do we require all the exact
points? In the Spotify example, if we want 10 songs similar to another
one, do we require all to be exactly the nearest ones or are we
satisfied with similar ones, but not exactly the most similar? If we are
more interested in efficiency rather than the exact result, we can relax
the accuracy constraints and solve a variant called Approximate Nearest
Neighbors (ANN). The formal definition is:

> Given a set of points \\(P\\) in a metric space and a query point \\(q\\),
> find a point \\(p \in P\\) that is an \\(\epsilon\\)-approximate nearest
> neighbor of \\(q\\). This means that for all points \\(p^\prime \in P\\), the
> distance between \\(p\\) and \\(q\\) satisfies the inequality: $$
> d(p,q) \le (1+\epsilon)\cdot d(p^\prime,q)
> $$

<div id="knn-demo">
  <svg id="knn-svg" viewBox="0 0 640 400" style="cursor:crosshair;display:block;max-width:100%"></svg>
  <div style="margin-top:0.75rem;display:flex;gap:2rem;align-items:center;flex-wrap:wrap">
    <label>ε (epsilon): <input id="eps-input" type="range" min="0" max="1" step="0.01" style="width:140px"> <span id="eps-val"></span></label>
    <label>K: <input id="k-input" type="number" min="1" max="20" style="width:56px"></label>
  </div>
</div>

<script type="module">
    const N = 100;
    const xs = Array.from({length: N}, () => Math.random() * 630 + 5);
    const ys = Array.from({length: N}, () => Math.random() * 390 + 5);
    
    const svg = document.getElementById('knn-svg');
    const NS = 'http://www.w3.org/2000/svg';
    
    let qx = 320, qy = 200, K = 5, eps = 0.3;
    
    function render() {
    svg.innerHTML = '';
    
    const dists = Array.from({length: N}, (_, i) => [i, Math.hypot(xs[i] - qx, ys[i] - qy)])
                        .sort((a, b) => a[1] - b[1]);
    const nnSet = new Set(dists.slice(0, K).map(d => d[0]));
    const worstD = dists[K - 1][1];
    const annR = (1 + eps) * worstD;
    const distMap = Object.fromEntries(dists);
    
    for (let i = 0; i < N; i++) {
        const fill = nnSet.has(i) ? 'green' : (distMap[i] <= annR ? 'red' : '#aaa');
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', xs[i]); c.setAttribute('cy', ys[i]);
        c.setAttribute('r', 5); c.setAttribute('fill', fill);
        svg.appendChild(c);
    }
    
    for (const [r, stroke] of [[worstD, 'green'], [annR, 'red']]) {
        const ring = document.createElementNS(NS, 'circle');
        ring.setAttribute('cx', qx); ring.setAttribute('cy', qy); ring.setAttribute('r', r);
        ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', stroke); ring.setAttribute('stroke-width', 1.5);
        svg.appendChild(ring);
    }
    
    const star = document.createElementNS(NS, 'circle');
    star.setAttribute('cx', qx); star.setAttribute('cy', qy); star.setAttribute('r', 8);
    star.setAttribute('fill', 'steelblue');
    svg.appendChild(star);
    }
    
    svg.addEventListener('click', e => {
    const r = svg.getBoundingClientRect();
    qx = (e.clientX - r.left) * 640 / r.width;
    qy = (e.clientY - r.top) * 400 / r.height;
    render();
    });
    
    const epsInput = document.getElementById('eps-input');
    epsInput.value = eps;
    document.getElementById('eps-val').textContent = eps.toFixed(2);
    epsInput.addEventListener('input', () => {
    eps = parseFloat(epsInput.value);
    document.getElementById('eps-val').textContent = eps.toFixed(2);
    render();
    });
    
    document.getElementById('k-input').addEventListener('input', e => {
    K = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
    render();
    });
    
    render();
</script>

With this definition we don't necessarily want \\(p\\) but all the points
inside the red circle, which we deem good enough. This definition
allowed huge increases on efficiency, leading to algorithms such as HNSW
or ANNOY, which we will see in later posts.

## Approaches

Instead of starting from scratch each time generally the approach is to
build a specialized data structure to save computations in the
subsequent searches. The data structure prepares the data in an
organized way to retrieve the desired point easily. Imagine searching a
pen in an unorganized garage, where all the objects are scattered
around. You will spend hours searching it, because you have no reference
point on where it *might* be. Instead let's say you reorganize the same
garage: the reorganization will require a lot more time than just
searching the pen, but if you need the pen or any other object often, it
will be much better. But the garage can be organized in different ways:
in boxes, shelves, etc.

The analogy applies to our case. There are different approaches to build
the data structure, which could be divided in three macro areas:

- **Clusters**, used in FAISS, the most important library for the
  problem
- **LSH**, common in academia as it can guarantee the quality of
  solutions
- **Graphs**, on which HNSW is based on, the current state-of-the-art
  algorithm

I will present at least an algorithm for each of these macro areas in
other posts, also claryfing each approach. I get it that LSH for now is
the most obscure one.

## Conclusions

With this post I wanted to present the Nearest Neighbor problem, so you
will be prepared for the next posts, where in each post we will go in
depth on one paper among the most important ones in the field. We will
start with HNSW, stay tuned!

[^1]: Both figures are from
    <a href="https://erikbern.com/2015/10/20/nearest-neighbors-and-vector-models-epilogue-curse-of-dimensionality">Erik
    Bernhardsson blog</a>

[^2]: One of the reasons KD-tree does not work as good in high
    dimensions in real word datasets it's because it cannot "see"
    intrinsic dimensionality, but rather always work in external
    dimensionality.
