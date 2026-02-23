---
title: "$title$"
date: $date$
draft: $draft$
author: "$author$"
tags: [$for(tags)$"$tags$"$sep$, $endfor$]
$if(comments)$comments:
$if(comments.src)$  src: "$comments.src$"
$endif$$if(comments.bluesky)$  bluesky: "$comments.bluesky$"
$endif$$endif$---

$body$
