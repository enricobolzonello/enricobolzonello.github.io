---
title: "Introduction to Nearest Neighbor Search"
date: 2025-04-01
draft: false
author: "Enrico Bolzonello"
tags: ["nearest neighbor", "weekly paper"]
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

<script type="text/javascript" src="https://cdn.bokeh.org/bokeh/release/bokeh-3.8.2.min.js"></script>
<script type="text/javascript" src="https://cdn.bokeh.org/bokeh/release/bokeh-gl-3.8.2.min.js"></script>
<script type="text/javascript" src="https://cdn.bokeh.org/bokeh/release/bokeh-widgets-3.8.2.min.js"></script>
<script type="text/javascript" src="https://cdn.bokeh.org/bokeh/release/bokeh-tables-3.8.2.min.js"></script>
<script type="text/javascript" src="https://cdn.bokeh.org/bokeh/release/bokeh-mathjax-3.8.2.min.js"></script>
<script type="text/javascript">
Bokeh.set_log_level("info");
</script>
<div id="ec4c1e06-3824-4b85-969c-af0ed9e5d65d" data-root-id="p1821" style="display: contents;"></div><script type="text/javascript">
(function() {
  const fn = function() {
    Bokeh.safely(function() {
      (function(root) {
        function embed_document(root) {
        const docs_json = '{"54dbacd0-1473-4b80-b72c-39dde9ee2dd4":{"version":"3.8.2","title":"Bokeh Application","config":{"type":"object","name":"DocumentConfig","id":"p1822","attributes":{"notifications":{"type":"object","name":"Notifications","id":"p1823"}}},"roots":[{"type":"object","name":"Column","id":"p1821","attributes":{"children":[{"type":"object","name":"Figure","id":"p1757","attributes":{"js_event_callbacks":{"type":"map","entries":[["tap",[{"type":"object","name":"CustomJS","id":"p1815","attributes":{"args":{"type":"map","entries":[["pts",{"type":"object","name":"ColumnDataSource","id":"p1742","attributes":{"selected":{"type":"object","name":"Selection","id":"p1743","attributes":{"indices":[],"line_indices":[]}},"selection_policy":{"type":"object","name":"UnionRenderers","id":"p1744"},"data":{"type":"map","entries":[["x",[239.705676062312,608.4571561023463,468.47612275929924,383.1414298861034,99.85192988315937,99.8364930151697,37.173511787647655,554.3527332959585,384.7136075156536,453.1664497894691,13.174076349313566,620.7423053836764,532.7632901122699,135.89703083409674,116.3679790125444,117.37888630619764,194.71503549410414,335.84411624463223,276.4448119309541,186.38664972674684,391.5858526223229,89.27607081730677,186.97257506253962,234.4715797079627,291.884789898903,502.51261529152873,127.79122058135023,329.11004058471144,379.1453240717072,29.728264140798544,388.8287052169205,109.13543915986658,41.63301951057889,607.2867438421333,618.004501167718,517.3743027945351,194.95281227095722,62.51015296408568,437.9091369677804,281.69759599334486,78.10447030065845,316.9132224712129,22.008653513739773,581.9650573304206,165.61918822401083,424.0142619865485,199.49508869722303,332.8435335537989,349.894578779699,118.3068515363373,620.5341617693175,496.0850069511133,601.279322601081,572.6895042736952,382.6559864390945,589.9995104147947,56.63520131322848,125.42903194825293,28.945464902744362,208.2114116884892,248.7534654012685,173.66338033529337,530.3920058572348,228.32212908389715,179.7980861999237,347.32549322127903,90.1915039838481,513.4060676825854,47.71241195505333,631.6076394243311,494.2366523498607,127.17803618187034,3.5341549591055355,521.8953142110938,452.388700062475,466.5645875462319,493.61302187900526,47.38857710981783,229.41806626833448,74.15619809608302,552.3861925603799,398.91080116963707,211.77473590569548,40.677344183055126,199.0286858980238,208.1173260971181,466.947954136361,408.0367816673364,567.816155248849,302.21755210364756,76.54031740051309,456.4766638227168,486.90243111481436,359.2174064444776,493.41899517091906,316.0291816732101,334.5490108044762,273.62625174947175,16.26824111622092,69.05051327571485]],["y",[12.5716742746937,254.56416450551217,125.74239243053067,203.4282764658811,363.0265895704372,99.71689165954997,164.1531692142519,302.22045541721945,91.51926619664899,30.791963931517195,115.9005811655072,64.48851490160177,371.87906093702924,323.2481518257668,253.36150260416937,348.58423607508706,321.4688307596458,74.62802355441434,357.0235993959911,215.7368967662603,322.976062065625,358.4365199693973,127.20138998874555,44.02076981107071,91.17406501677667,170.84311545050252,327.20590636899726,344.2922333025374,2.7808522124762813,204.29892103102628,166.9644012595116,88.8431241882921,47.94614693347312,135.0460685614512,377.16388156500767,129.2811728083021,207.51624869734644,281.2075835580711,145.4518409517176,388.7128330883843,384.9789179768445,100.71291833014567,198.89940235695417,120.35132392670786,113.93619775098705,14.754778941813118,243.82573359195874,201.0716092915446,20.59150049999574,111.45858569464457,363.3063543866615,95.82475626678897,57.95794883648924,195.7811041110252,394.2601816442403,96.82210860460016,268.8542189623514,304.64784613148703,95.05501759695987,291.2865394447438,147.11325308770128,252.9223322374318,253.41188430435787,214.3098736299034,36.11590802176332,334.1209982356952,128.31202598869433,74.6074041599417,16.310056621905566,236.35717727529672,271.02574473691294,6.635131571142461,204.8372233197124,90.59831007917518,258.06911616377994,69.74657160199658,276.37509524098635,154.69413852021495,374.6919954946938,55.0083776583973,136.4265404201034,45.38940849623563,369.8774473114251,350.9357413523924,103.17665108606224,263.99361841367164,326.88888008048633,222.08032463978492,211.86023134240259,96.74091636018068,37.241107122359686,358.8863031813307,360.1672228653322,253.24058290930716,135.61191641948028,139.68382984506437,290.38227154809573,358.84410398103086,354.8345697060469,311.9502183430495]],["color",["gray","gray","gray","green","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","green","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","green","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","red","gray","gray","red","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","gray","red","gray","gray","gray","gray","gray","green","gray","green","red","gray","gray","gray"]]]}}}],["qry",{"type":"object","name":"ColumnDataSource","id":"p1745","attributes":{"selected":{"type":"object","name":"Selection","id":"p1746","attributes":{"indices":[],"line_indices":[]}},"selection_policy":{"type":"object","name":"UnionRenderers","id":"p1747"},"data":{"type":"map","entries":[["x",[320.0]],["y",[200.0]]]}}}],["knn_c",{"type":"object","name":"ColumnDataSource","id":"p1748","attributes":{"selected":{"type":"object","name":"Selection","id":"p1749","attributes":{"indices":[],"line_indices":[]}},"selection_policy":{"type":"object","name":"UnionRenderers","id":"p1750"},"data":{"type":"map","entries":[["x",[320.0]],["y",[200.0]],["r",[76.34619470530474]]]}}}],["ann_c",{"type":"object","name":"ColumnDataSource","id":"p1751","attributes":{"selected":{"type":"object","name":"Selection","id":"p1752","attributes":{"indices":[],"line_indices":[]}},"selection_policy":{"type":"object","name":"UnionRenderers","id":"p1753"},"data":{"type":"map","entries":[["x",[320.0]],["y",[200.0]],["r",[99.25005311689617]]]}}}],["state",{"type":"object","name":"ColumnDataSource","id":"p1754","attributes":{"selected":{"type":"object","name":"Selection","id":"p1755","attributes":{"indices":[],"line_indices":[]}},"selection_policy":{"type":"object","name":"UnionRenderers","id":"p1756"},"data":{"type":"map","entries":[["k",[5]],["eps",[0.3]]]}}}]]},"code":"\\nconst qx = cb_obj.x, qy = cb_obj.y;\\n\\nconst xs = pts.data[&#x27;x&#x27;], ys = pts.data[&#x27;y&#x27;], colors = pts.data[&#x27;color&#x27;];\\nconst k   = state.data[&#x27;k&#x27;][0];\\nconst eps = state.data[&#x27;eps&#x27;][0];\\n\\nconst dists = xs.map((x, i) =&gt; [i, Math.sqrt((x - qx)**2 + (ys[i] - qy)**2)]);\\ndists.sort((a, b) =&gt; a[1] - b[1]);\\n\\nconst nn_set  = new Set(dists.slice(0, k).map(d =&gt; d[0]));\\nconst worst_d = dists[k - 1][1];\\nconst ann_r   = (1 + eps) * worst_d;\\nconst dist_map = Object.fromEntries(dists);\\n\\nfor (let i = 0; i &lt; xs.length; i++) {\\n    if      (nn_set.has(i))          colors[i] = &#x27;green&#x27;;\\n    else if (dist_map[i] &lt;= ann_r)   colors[i] = &#x27;red&#x27;;\\n    else                             colors[i] = &#x27;gray&#x27;;\\n}\\n\\npts.change.emit();\\nqry.data[&#x27;x&#x27;] = [qx];   qry.data[&#x27;y&#x27;] = [qy];   qry.change.emit();\\nknn_c.data[&#x27;x&#x27;] = [qx]; knn_c.data[&#x27;y&#x27;] = [qy]; knn_c.data[&#x27;r&#x27;] = [worst_d]; knn_c.change.emit();\\nann_c.data[&#x27;x&#x27;] = [qx]; ann_c.data[&#x27;y&#x27;] = [qy]; ann_c.data[&#x27;r&#x27;] = [ann_r];   ann_c.change.emit();\\n"}}]]]},"width":640,"height":400,"x_range":{"type":"object","name":"DataRange1d","id":"p1758"},"y_range":{"type":"object","name":"DataRange1d","id":"p1759"},"x_scale":{"type":"object","name":"LinearScale","id":"p1766"},"y_scale":{"type":"object","name":"LinearScale","id":"p1767"},"title":{"type":"object","name":"Title","id":"p1764"},"outline_line_color":null,"renderers":[{"type":"object","name":"GlyphRenderer","id":"p1785","attributes":{"data_source":{"id":"p1742"},"view":{"type":"object","name":"CDSView","id":"p1786","attributes":{"filter":{"type":"object","name":"AllIndices","id":"p1787"}}},"glyph":{"type":"object","name":"Scatter","id":"p1782","attributes":{"x":{"type":"field","field":"x"},"y":{"type":"field","field":"y"},"size":{"type":"value","value":6},"line_color":{"type":"value","value":null},"fill_color":{"type":"field","field":"color"},"hatch_color":{"type":"field","field":"color"}}},"nonselection_glyph":{"type":"object","name":"Scatter","id":"p1783","attributes":{"x":{"type":"field","field":"x"},"y":{"type":"field","field":"y"},"size":{"type":"value","value":6},"line_color":{"type":"value","value":null},"line_alpha":{"type":"value","value":0.1},"fill_color":{"type":"field","field":"color"},"fill_alpha":{"type":"value","value":0.1},"hatch_color":{"type":"field","field":"color"},"hatch_alpha":{"type":"value","value":0.1}}},"muted_glyph":{"type":"object","name":"Scatter","id":"p1784","attributes":{"x":{"type":"field","field":"x"},"y":{"type":"field","field":"y"},"size":{"type":"value","value":6},"line_color":{"type":"value","value":null},"line_alpha":{"type":"value","value":0.2},"fill_color":{"type":"field","field":"color"},"fill_alpha":{"type":"value","value":0.2},"hatch_color":{"type":"field","field":"color"},"hatch_alpha":{"type":"value","value":0.2}}}}},{"type":"object","name":"GlyphRenderer","id":"p1794","attributes":{"data_source":{"id":"p1745"},"view":{"type":"object","name":"CDSView","id":"p1795","attributes":{"filter":{"type":"object","name":"AllIndices","id":"p1796"}}},"glyph":{"type":"object","name":"Scatter","id":"p1791","attributes":{"x":{"type":"field","field":"x"},"y":{"type":"field","field":"y"},"size":{"type":"value","value":15},"line_color":{"type":"value","value":null},"fill_color":{"type":"value","value":"steelblue"},"hatch_color":{"type":"value","value":"steelblue"},"marker":{"type":"value","value":"star"}}},"nonselection_glyph":{"type":"object","name":"Scatter","id":"p1792","attributes":{"x":{"type":"field","field":"x"},"y":{"type":"field","field":"y"},"size":{"type":"value","value":15},"line_color":{"type":"value","value":null},"line_alpha":{"type":"value","value":0.1},"fill_color":{"type":"value","value":"steelblue"},"fill_alpha":{"type":"value","value":0.1},"hatch_color":{"type":"value","value":"steelblue"},"hatch_alpha":{"type":"value","value":0.1},"marker":{"type":"value","value":"star"}}},"muted_glyph":{"type":"object","name":"Scatter","id":"p1793","attributes":{"x":{"type":"field","field":"x"},"y":{"type":"field","field":"y"},"size":{"type":"value","value":15},"line_color":{"type":"value","value":null},"line_alpha":{"type":"value","value":0.2},"fill_color":{"type":"value","value":"steelblue"},"fill_alpha":{"type":"value","value":0.2},"hatch_color":{"type":"value","value":"steelblue"},"hatch_alpha":{"type":"value","value":0.2},"marker":{"type":"value","value":"star"}}}}},{"type":"object","name":"GlyphRenderer","id":"p1803","attributes":{"data_source":{"id":"p1748"},"view":{"type":"object","name":"CDSView","id":"p1804","attributes":{"filter":{"type":"object","name":"AllIndices","id":"p1805"}}},"glyph":{"type":"object","name":"Circle","id":"p1800","attributes":{"x":{"type":"field","field":"x"},"y":{"type":"field","field":"y"},"radius":{"type":"field","field":"r"},"line_color":{"type":"value","value":"green"},"line_width":{"type":"value","value":1.5},"fill_color":{"type":"value","value":null}}},"nonselection_glyph":{"type":"object","name":"Circle","id":"p1801","attributes":{"x":{"type":"field","field":"x"},"y":{"type":"field","field":"y"},"radius":{"type":"field","field":"r"},"line_color":{"type":"value","value":"green"},"line_alpha":{"type":"value","value":0.1},"line_width":{"type":"value","value":1.5},"fill_color":{"type":"value","value":null},"fill_alpha":{"type":"value","value":0.1},"hatch_alpha":{"type":"value","value":0.1}}},"muted_glyph":{"type":"object","name":"Circle","id":"p1802","attributes":{"x":{"type":"field","field":"x"},"y":{"type":"field","field":"y"},"radius":{"type":"field","field":"r"},"line_color":{"type":"value","value":"green"},"line_alpha":{"type":"value","value":0.2},"line_width":{"type":"value","value":1.5},"fill_color":{"type":"value","value":null},"fill_alpha":{"type":"value","value":0.2},"hatch_alpha":{"type":"value","value":0.2}}}}},{"type":"object","name":"GlyphRenderer","id":"p1812","attributes":{"data_source":{"id":"p1751"},"view":{"type":"object","name":"CDSView","id":"p1813","attributes":{"filter":{"type":"object","name":"AllIndices","id":"p1814"}}},"glyph":{"type":"object","name":"Circle","id":"p1809","attributes":{"x":{"type":"field","field":"x"},"y":{"type":"field","field":"y"},"radius":{"type":"field","field":"r"},"line_color":{"type":"value","value":"red"},"line_width":{"type":"value","value":1.5},"fill_color":{"type":"value","value":null}}},"nonselection_glyph":{"type":"object","name":"Circle","id":"p1810","attributes":{"x":{"type":"field","field":"x"},"y":{"type":"field","field":"y"},"radius":{"type":"field","field":"r"},"line_color":{"type":"value","value":"red"},"line_alpha":{"type":"value","value":0.1},"line_width":{"type":"value","value":1.5},"fill_color":{"type":"value","value":null},"fill_alpha":{"type":"value","value":0.1},"hatch_alpha":{"type":"value","value":0.1}}},"muted_glyph":{"type":"object","name":"Circle","id":"p1811","attributes":{"x":{"type":"field","field":"x"},"y":{"type":"field","field":"y"},"radius":{"type":"field","field":"r"},"line_color":{"type":"value","value":"red"},"line_alpha":{"type":"value","value":0.2},"line_width":{"type":"value","value":1.5},"fill_color":{"type":"value","value":null},"fill_alpha":{"type":"value","value":0.2},"hatch_alpha":{"type":"value","value":0.2}}}}}],"toolbar":{"type":"object","name":"Toolbar","id":"p1765","attributes":{"tools":[{"type":"object","name":"TapTool","id":"p1778","attributes":{"renderers":"auto"}}]}},"toolbar_location":null,"left":[{"type":"object","name":"LinearAxis","id":"p1773","attributes":{"visible":false,"ticker":{"type":"object","name":"BasicTicker","id":"p1774","attributes":{"mantissas":[1,2,5]}},"formatter":{"type":"object","name":"BasicTickFormatter","id":"p1775"},"major_label_policy":{"type":"object","name":"AllLabels","id":"p1776"}}}],"below":[{"type":"object","name":"LinearAxis","id":"p1768","attributes":{"visible":false,"ticker":{"type":"object","name":"BasicTicker","id":"p1769","attributes":{"mantissas":[1,2,5]}},"formatter":{"type":"object","name":"BasicTickFormatter","id":"p1770"},"major_label_policy":{"type":"object","name":"AllLabels","id":"p1771"}}}],"center":[{"type":"object","name":"Grid","id":"p1772","attributes":{"visible":false,"axis":{"id":"p1768"}}},{"type":"object","name":"Grid","id":"p1777","attributes":{"visible":false,"dimension":1,"axis":{"id":"p1773"}}}],"background_fill_color":null}},{"type":"object","name":"Row","id":"p1820","attributes":{"children":[{"type":"object","name":"Slider","id":"p1816","attributes":{"js_property_callbacks":{"type":"map","entries":[["change:value",[{"type":"object","name":"CustomJS","id":"p1817","attributes":{"args":{"type":"map","entries":[["pts",{"id":"p1742"}],["qry",{"id":"p1745"}],["knn_c",{"id":"p1748"}],["ann_c",{"id":"p1751"}],["state",{"id":"p1754"}]]},"code":"\\nstate.data[&#x27;eps&#x27;] = [cb_obj.value];\\nconst qx = qry.data[&#x27;x&#x27;][0], qy = qry.data[&#x27;y&#x27;][0];\\n\\nconst xs = pts.data[&#x27;x&#x27;], ys = pts.data[&#x27;y&#x27;], colors = pts.data[&#x27;color&#x27;];\\nconst k   = state.data[&#x27;k&#x27;][0];\\nconst eps = state.data[&#x27;eps&#x27;][0];\\n\\nconst dists = xs.map((x, i) =&gt; [i, Math.sqrt((x - qx)**2 + (ys[i] - qy)**2)]);\\ndists.sort((a, b) =&gt; a[1] - b[1]);\\n\\nconst nn_set  = new Set(dists.slice(0, k).map(d =&gt; d[0]));\\nconst worst_d = dists[k - 1][1];\\nconst ann_r   = (1 + eps) * worst_d;\\nconst dist_map = Object.fromEntries(dists);\\n\\nfor (let i = 0; i &lt; xs.length; i++) {\\n    if      (nn_set.has(i))          colors[i] = &#x27;green&#x27;;\\n    else if (dist_map[i] &lt;= ann_r)   colors[i] = &#x27;red&#x27;;\\n    else                             colors[i] = &#x27;gray&#x27;;\\n}\\n\\npts.change.emit();\\nqry.data[&#x27;x&#x27;] = [qx];   qry.data[&#x27;y&#x27;] = [qy];   qry.change.emit();\\nknn_c.data[&#x27;x&#x27;] = [qx]; knn_c.data[&#x27;y&#x27;] = [qy]; knn_c.data[&#x27;r&#x27;] = [worst_d]; knn_c.change.emit();\\nann_c.data[&#x27;x&#x27;] = [qx]; ann_c.data[&#x27;y&#x27;] = [qy]; ann_c.data[&#x27;r&#x27;] = [ann_r];   ann_c.change.emit();\\n"}}]]]},"title":"\\u03b5 (epsilon)","start":0,"end":1,"value":0.3,"step":0.01}},{"type":"object","name":"NumericInput","id":"p1818","attributes":{"js_property_callbacks":{"type":"map","entries":[["change:value",[{"type":"object","name":"CustomJS","id":"p1819","attributes":{"args":{"type":"map","entries":[["pts",{"id":"p1742"}],["qry",{"id":"p1745"}],["knn_c",{"id":"p1748"}],["ann_c",{"id":"p1751"}],["state",{"id":"p1754"}]]},"code":"\\nstate.data[&#x27;k&#x27;] = [cb_obj.value];\\nconst qx = qry.data[&#x27;x&#x27;][0], qy = qry.data[&#x27;y&#x27;][0];\\n\\nconst xs = pts.data[&#x27;x&#x27;], ys = pts.data[&#x27;y&#x27;], colors = pts.data[&#x27;color&#x27;];\\nconst k   = state.data[&#x27;k&#x27;][0];\\nconst eps = state.data[&#x27;eps&#x27;][0];\\n\\nconst dists = xs.map((x, i) =&gt; [i, Math.sqrt((x - qx)**2 + (ys[i] - qy)**2)]);\\ndists.sort((a, b) =&gt; a[1] - b[1]);\\n\\nconst nn_set  = new Set(dists.slice(0, k).map(d =&gt; d[0]));\\nconst worst_d = dists[k - 1][1];\\nconst ann_r   = (1 + eps) * worst_d;\\nconst dist_map = Object.fromEntries(dists);\\n\\nfor (let i = 0; i &lt; xs.length; i++) {\\n    if      (nn_set.has(i))          colors[i] = &#x27;green&#x27;;\\n    else if (dist_map[i] &lt;= ann_r)   colors[i] = &#x27;red&#x27;;\\n    else                             colors[i] = &#x27;gray&#x27;;\\n}\\n\\npts.change.emit();\\nqry.data[&#x27;x&#x27;] = [qx];   qry.data[&#x27;y&#x27;] = [qy];   qry.change.emit();\\nknn_c.data[&#x27;x&#x27;] = [qx]; knn_c.data[&#x27;y&#x27;] = [qy]; knn_c.data[&#x27;r&#x27;] = [worst_d]; knn_c.change.emit();\\nann_c.data[&#x27;x&#x27;] = [qx]; ann_c.data[&#x27;y&#x27;] = [qy]; ann_c.data[&#x27;r&#x27;] = [ann_r];   ann_c.change.emit();\\n"}}]]]},"title":"K","value":5,"low":1,"high":20}}]}}]}}]}}';
        const render_items = [{"docid":"54dbacd0-1473-4b80-b72c-39dde9ee2dd4","roots":{"p1821":"ec4c1e06-3824-4b85-969c-af0ed9e5d65d"},"root_ids":["p1821"]}];
        root.Bokeh.embed.embed_items(docs_json, render_items);
        }
        if (root.Bokeh !== undefined) {
          embed_document(root);
        } else {
          let attempts = 0;
          const timer = setInterval(function(root) {
            if (root.Bokeh !== undefined) {
              clearInterval(timer);
              embed_document(root);
            } else {
              attempts++;
              if (attempts > 100) {
                clearInterval(timer);
                console.log("Bokeh: ERROR: Unable to run BokehJS code because BokehJS library is missing");
              }
            }
          }, 10, root)
        }
      })(window);
    });
  };
  if (document.readyState != "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn);
})();
</script>

With this definition we don’t necessarily want \\(p\\) but all the points
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
point on where it *might* be. Instead let’s say you reorganize the same
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
    dimensions in real word datasets it’s because it cannot “see”
    intrinsic dimensionality, but rather always work in external
    dimensionality.
