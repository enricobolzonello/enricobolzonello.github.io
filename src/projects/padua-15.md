---
title: "Padua15"
year: 2024
category: ["Network Analysis"]
client: "University"
technologies: ["Python", "Open Street Maps", "NetworkX", "GeoPandas"]
icon: "1F3D9"
description: "This study explores practical solutions for urban challenges arising from long journeys and uncontrolled city growth. Inspired by the 15 Minute City idea, we focus on making essential services accessible within a 15-minute walk (or bike ride) in Padua. Using a network-based approach, we analyze the current state of the city and propose ways to expand the coverage of services within this timeframe. Our goal is to create a more convenient and sustainable urban living experience, addressing issues like traffic, air quality and time waste."
link: "https://github.com/enricobolzonello/Padua15"
---

In 1994, a physicist named Cesare Marchetti proposed theorized the Marchetti Constant [^1], which states that in general, people have been always been willing to commute for about a half-hour, one-way. The immediate consequence is that even if there is vast amount of land available, that land has no value in an urban context, unless transportation makes it quickly accessible to the urban core. With the advancement of faster modes of transport, the city boundaries exploded. The introduction of cheap cars combined with the low cost of farmland paved the way for the urban sprawl era. But this car-centric planning caused several problems including biodiversity, decrease in citizen’s quality of life caused by increased traffic congestions, low quality of air and increasing financial burdens and social inequalities.

In this landscape, Carlos Moreno proposed a new way of planning cities: the **15 Minute City framework** [^2]. The basic idea is that people should be able to access essential urban services in 15 minutes by bike or walking. The framework highlights four characteristics but in our project we emphasized the proximity aspect within a network-based approach, leveraging the inherent network structure of cities. This was explored through a case study centered around the city of Padua, first analyzing the current state of the city and then expanding the area covered by all services in 15 minutes.

## Dataset
The dataset we have used is the Padua’s street network extracted from OpenStreetMap using the OSMnx library [^3]. OSMnx models the data as a NetworkX [^4] MultiDiGraph, which is a nonplanar directed graph with possible self-loops and parallel edges. After cleaning the data, nodes represent intersections or dead-ends and edges represent the walking connection.
The count of nodes and edges after cleanup is 5462 nodes and 10496 edges.

## Results

The initial coverage of each category is the following:

| Category   | POIs | Covered nodes | Coverage % |
|----------------|--------------------|-----------------------------|----------------------------|
| Education      | 94                 | 3124                        | 57.13%                    |
| Bank          | 43                 | 1713                        | 31.31%                    |
| Healthcare     | 64                 | 2491                        | 45.56%                    |
| Transportation | 454                | 4299                        | 78.62%                    |
| Food           | 120                | 3543                        | 64.8%                     |

While transportation in Padua is well-established, there is a noticeable gap in healthcare coverage, which is mainly concentrated around the center of the city. Similarly, the food and education categories also have limited coverage in the outskirts of the city, emphasizing a disadvantage for individuals with lower economic means. The total coverage is at **35%**, while the isolated nodes are at **7.97%**.

After having selected which nodes for each community detected are the ones with highest value of closeness centrality and betweenness centrality, the analysis of coverage have been repeated but this time considering (separately) these new sets of nodes as POIs for the category they belong to and here are the results.

#### Using Closeness Centrality
Using Closeness centrality improves the coverage of all categories by **29,57%** while also bringing down the percentage of isolated nodes by **5.72%**.

#### Using Betweenness Centrality
Using Betweenness centrality improves the coverage of all categories by **31.56%** while also bringing down the percentage of isolated nodes by **6.32%**. Note that betweenness performs slightly better than closeness, in particular by approximately 2% in terms of coverage.

[^1]: C. Marchetti. *Anthropological invariants in travel behavior.* Technological Forecasting and Social Change, 47(1):75–88, 1994.
[^2]: Carlos Moreno, Zaheer Allam, Didier Chabaud, Catherine Gall, and Florent Pratlong. *Introducing the “15-minute city”: Sustainability, resilience and place identity in future post-pandemic cities.* Smart Cities, 4(1):93–111, 2021.
[^3]: Geoff Boeing. *Osmnx: New methods for acquiring, constructing, analyzing, and visualizing complex street networks.* CoRR, abs/1611.01890, 2016.
[^4]: Aric A. Hagberg, Daniel A. Schult, and Pieter J. Swart. *Exploring network structure, dynamics, and function using networkx.* In Gaël Varoquaux, Travis Vaught, and Jarrod Millman, editors, Proceedings of the 7th Python in Science Conference, pages 11 – 15, Pasadena, CA USA, 2008.