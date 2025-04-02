---
title: 'Introduction to Nearest Neighbor Search'
date: 2025-04-01
draft: false
tags:
    - "nearest neighbor"
    - "weekly paper"
author: Enrico Bolzonello
---

Nearest Neighbor Search is an important primitive in different applications. You probably use it every day without noticing it as it powers recommendation algorithms on Spotify and Netflix, to name two examples. More recently, it became popular again due to vector databases, and the surge of RAG-augmented AI assistants. 

The idea is simple: given a dataset \\(P\\) of vectors of dimensionality \\(d\\) and given another vector \\(q\\), named query vector, the aim is to find the nearest vector in \\(P\\) from \\(q\\). But what does near mean? It depends on the data. 
Usually data is defined on a metric space, meaning it also defines a distance. The easiest and most familiar example is the Euclidean space, where the distance between two points \\(p\\) and \\(q\\) is defined as:
$$
d(p,q) = \sqrt{(p_1-q_1)^2+(p_2-q_2)^2+...+(p_d-q_d)^2}
$$
where \\(p_i\\) and \\(q_i\\) with \\(i\in [0,d]\\) represents the \\(i\\)-th coordinate respectively of vectors \\(p\\) and \\(q\\). But there are many other ones: angular, cosine, hamming, etc. The idea is intuitive, right? 

Solving this problem at a first seems simple, just do a linear scan of the data and compare each distance, saving only the best ones. But it requires time \\(O(n\cdot d)\\), where \\(O(d)\\) is the time to compute the distance, which is impractical. Imagine having millions, if not billions of points each one with thousands of dimensions, it would be impossible for Spotify to recommend your next favourite song in milliseconds as it does now.  

To improve efficiency, more optimized algorithms, such as the Kd-Tree, has been proposed. But a nefarious enemy lurks in the shadow, waiting to strike: it is the **Curse of Dimensionality**.

## Curse of Dimensionality

The term curse of dimensionality was introduced in 1961 by Bellman. Nowadays it is a general term related to high dimensional data, spanning in different domains like machine learning, data mining and obviously the k Nearest Neighbor problem. In this context, it refers to the exponential dependency of both space and time on the number of dimensions. A key reason for this inefficiency is related to the distance concentration, a phenomenon where in high dimensions the distances between all pairs of points have almost the same value. To illustrate the effect, consider the example in the figure below. 

<img src="/images/posts/2025/nn-introduction/knn_avg_dist_synt.png" alt="knn distances syntethic" style="background-color: white;">

As the number of dimensions increases, the relative difference between the closest and farthest points becomes increasingly smaller, so it is exponentially more difficult to distinguish true nearest neighbors from the other points. This effect is captured by the relation:
$$
\lim_{d\rightarrow \infty}E\bigg(\frac{dist_{max}(d)-dist_{min}(d)}{dist_{min}(d)}\bigg) \rightarrow 0
$$
This rule applies in datasets generated from distributions where there is little to no structure, like the normal distribution in the example. However, in real-world datasets, data often have significant structure, meaning that while the explicit dimensionality may be high, the intrinsic dimensionality (the number of dimensions that truly capture meaningful variations in the data) is often much lower. This can be seen in the following figure [^1], where the ratio for real datasets is similar to that of much lower-dimensional synthetic data.

<img src="/images/posts/2025/nn-introduction/knn-distances.png" alt="knn distances real world" style="background-color: white;">

But still, even for real world datasets, this effect is visible, making approaches such as the KD-Tree mentioned before infeasible for high dimension data [^1]. A new point of view on the problem is needed.

## Approximate Nearest Neighbors 

The fundamental question is the following: do we require all the exact points? In the Spotify example, if we want 10 songs similar to another one, do we require all to be exactly the nearest ones or are we satisfied with similar ones, but not exactly the most similar? If we are more interested in efficiency rather than the exact result, we can relax the accuracy constraints and solve a variant called Approximate Nearest Neighbors (ANN). The formal definition is:

> Given a set of points \\(P\\) in a metric space and a query point \\(q\\), find a point \\(p \in P\\) that is an \\(\epsilon\\)-approximate nearest neighbor of \\(q\\). This means that for all points \\(p^\prime \in P\\), the distance between \\(p\\) and \\(q\\) satisfies the inequality:
$$
d(p,q) \le (1+\epsilon)\cdot d(p^\prime,q)
$$

<div id="container"></div>
<div style="display: flex; gap: var(--row-gap-xsmall);">
    <div style="display: flex; align-items: center;">
        <label for="epsilon-input" style="text-align: right; margin-right: 0.5rem; color: var(--color-text); font: var(--font-ui-bold);">ε: </label>
        <input type="range" id="epsilon-input" min="0" max="1" step="0.01" value="0.3" 
               style="flex: 1; accent-color: var(--color-primary);">
        <span id="epsilon-value" style="margin-left: 0.5rem; color: var(--color-text); font: var(--font-ui);">0.30</span>
    </div>
    <div style="display: flex; align-items: center;">
        <label for="k-input" style="text-align: right; margin-right: 0.5rem; color: var(--color-text); font: var(--font-ui-bold);">K: </label>
        <input type="number" id="k-input" name="# of neighbors" min="1" max="20" value="5" 
               style="border: 1px solid var(--color-line); border-radius: var(--border-radius); background: var(--color-background); color: var(--color-text); font: var(--font-ui); padding: 0.25rem;">
    </div>
</div>
<script type="module">
    function getCSSVar(variable) {
        return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    }
    import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
    // Declare chart dimensions.
    const width = 640, height = 400;
    let query = [width / 2, height / 2];
    let query_color = getCSSVar("--color-primary");
    // Generate random points.
    var data = d3.range(100).map(() => [Math.random() * width, Math.random() * height]);
    var svg = d3.select("#container").append("svg")
        .attr("width", width)
        .attr("height", height)
        .on("click", function (event) {
            var xy = d3.pointer(event);
            query = xy;
            updateQuery();
        });
    var point = svg.selectAll(".point")
        .data(data)
        .enter().append("circle")
        .attr("class", "point")
        .attr("cx", d => d[0])
        .attr("cy", d => d[1])
        .attr("r", 3)
        .style("fill", "gray");
    // Add query point as a star
    var queryPoint = svg.append("path")
        .attr("d", d3.symbol().type(d3.symbolStar).size(100))
        .attr("transform", `translate(${query[0]}, ${query[1]})`)
        .style("fill", query_color);
    function knn(query_point, k) {
        const distances = data.map(p => {
            const dx = p[0] - query_point[0], dy = p[1] - query_point[1];
            return { point: p, distance: Math.sqrt(dx * dx + dy * dy) };
        });
        distances.sort((a, b) => a.distance - b.distance);
        return distances.slice(0, k);
    }
    let k = 5, epsilon = 0.3;
    let neighbors = knn(query, k);
    let worst_distance = neighbors[neighbors.length - 1].distance;
    const knnCircle = svg.append("circle")
        .attr("class", "knn-outline")
        .attr("cx", query[0])
        .attr("cy", query[1])
        .attr("r", worst_distance)
        .style("fill", "none")
        .style("stroke", "green")
        .style("stroke-width", 1);
    const annCircle = svg.append("circle")
        .attr("class", "ann-outline")
        .attr("cx", query[0])
        .attr("cy", query[1])
        .attr("r", (1 + epsilon) * worst_distance)
        .style("fill", "none")
        .style("stroke", "red")
        .style("stroke-width", 1);
    function updateQuery() {
        if(neighbors === undefined){
            return;
        }
        neighbors = knn(query, k);
        worst_distance = neighbors[neighbors.length - 1].distance;
        knnCircle.attr("cx", query[0]).attr("cy", query[1]).attr("r", worst_distance);
        annCircle.attr("cx", query[0]).attr("cy", query[1]).attr("r", (1 + epsilon) * worst_distance);
        updatePoints();
    }
    function updatePoints() {
        if(neighbors === undefined){
            return;
        }
        let ann_radius = (1 + epsilon) * worst_distance;
        svg.selectAll(".point")
            .style("fill", d => {
                let dx = d[0] - query[0], dy = d[1] - query[1];
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (neighbors.some(n => n.point[0] === d[0] && n.point[1] === d[1])) {
                    return "green";
                } else if (dist <= ann_radius) {
                    return "red";
                } else {
                    return "gray";
                }
            });
        knnCircle.attr("r", worst_distance);
        annCircle.attr("r", ann_radius);
    }
    d3.select("#epsilon-input").on("input", function() {
        epsilon = +this.value;
        d3.select("#epsilon-value").text(epsilon.toFixed(2));
        updatePoints();
    });
    d3.select("#k-input").on("input", function() {
        k = +this.value;
        neighbors = knn(query, k);
        updateQuery();
    });
    updatePoints();
</script>

With this definition we don't necessarily want \\(p\\) but all the points inside the red circle, which we deem good enough. This definition allowed huge increases on efficiency, leading to algorithms such as HNSW or ANNOY, which we will see in later posts. 

## Approaches
Instead of starting from scratch each time generally the approach is to build a specialized data structure to save computations in the subsequent searches. The data structure prepares the data in an organized way to retrieve the desired point easily. Imagine searching a pen in an unorganized garage, where all the objects are scattered around. You will spend hours searching it, because you have no reference point on where it *might* be. Instead let's say you reorganize the same garage: the reorganization will require a lot more time than just searching the pen, but if you need the pen or any other object often, it will be much better. But the garage can be organized in different ways: in boxes, shelves, etc.

The analogy applies to our case. There are different approaches to build the data structure, which could be divided in three macro areas:
- **Clusters**, used in FAISS, the most important library for the problem
- **LSH**, common in academia as it can guarantee the quality of solutions
- **Graphs**, on which HNSW is based on, the current state-of-the-art algorithm
I will present at least an algorithm for each of these macro areas in other posts, also claryfing each approach. I get it that LSH for now is the most obscure one. 

## Conclusions
With this post I wanted to present the Nearest Neighbor problem, so you will be prepared for the next posts, where in each post we will go in depth on one paper among the most important ones in the field. We will start with HNSW, stay tuned!

[^1]: Both figures are from <a href="https://erikbern.com/2015/10/20/nearest-neighbors-and-vector-models-epilogue-curse-of-dimensionality">Erik Bernhardsson blog</a>

[^2]: One of the reasons KD-tree does not work as good in high dimensions in real word datasets it's because it cannot "see" intrinsic dimensionality, but rather always work in external dimensionality.