---
title: 'Tech that Powers my Life - 2025 Edition'
date: 2025-03-06
draft: false
tags:
    - "tech"
    - "updates"
author: Enrico Bolzonello
---

In the last year my personal infrastructure has changed a lot from reading lots of books and blogs about individual's productive life. With this post I want to start a bi-annual series to track changes in how my approach to productivity, technology, and knowledge management is shifting, and what’s working (or not), inspired by [Elliot Clowes](http://elliotclowes.com/)'s [I'm Left Handed](https://imlefthanded.com/2025/the-tech-that-powers-my-life-2025-edition/). 

<figure>
    <img src="/images/posts/2025/tech/2025_setup.png" alt="2025 Setup">
    <figcaption>2025 setup</figcaption>
</figure>

## Computer 1: Custom built
My personal setup has two machines: a 2020 Macbook Air M1 and a custom build Windows from 2019. I hate Windows and I wouldn't want to spend any time on it. It's slow, bloated with legacy features, a mess to work with, now it's introducing AI features that nobody wants, BUT... it runs games. I mounted Linux in dual boot some time ago, but I removed it ever since to upgrade it to Windows 11. I can safely say it was one of the worst choices I ever made, as I should have just stayed with Win10 and keep the dual boot.
I would 100% switch to Linux when it gets better support for gaming, and with the release of [SteamOS](https://store.steampowered.com/steamos/buildyourown) for all PCs, I think I will try it to see how it feels. Expect a blog post about it in this year.

Since it is a machine mainly built for gaming, it has gaming components. As a GPU it has an Nvidia RTX 2060, the first release with ray tracing. It is showing its age compared to the modern cards, but I don't play high quality graphics games right now so I don't feel like upgrading just yet. The only time I got some serious difficulties was with Cyberpunk 2077, which I bought on release date (another big mistake), and I was able to run it barely at 30 fps, mainly due to the horrible optimization. For the CPU, the AMD Ryzen 2700 is still going strong. I am amazed at how AMD was able to turn around its competitiveness with a crazy good lineup of products, especially in terms of efficiency. The newly released GPUs, with really good pricing compared to the new RTX 50 series, makes me really excited for the future of AMD in gaming, since NVIDIA is focusing its efforts on AI and business clients. What I should upgrade in this machine is certainly the RAM (16GB of DDR4) but most importantly the disk space. I bought too much hard disk (1Tb) and too few SSD (256Gb, and non NVMe). 

As I said I don't play many games, in this period mainly Marvel Rivals, Minecraft and Balatro (best game ever by the way), so I don't feel to rush an upgrade as these games don't require much resources. Another project I have in mind is a mini pc to have in the living room, acting as a console [^1].

## Computer 2: MacBook Air M1 (2020)
On the other hand, I love my Macbook. It was my first purchase going into university and also my first ever Apple product. Even though it was a new architecture, the launch was not traumatic, some compatibility issue here and there, some memory leaks, but Rosetta was quite a spectacular piece of software. Some MacOs features are frustrating, but extensions feel some gaps, like [Rectangle](https://rectangleapp.com/), for moving, snapping and resizing windows, [battery](https://github.com/actuallymentor/battery##readme), because when I'm in dock mode I want to limit the battery charge to avoid heating my usb-c hub, [f.lux](https://justgetflux.com/news/pages/macquickstart/), [amphetamine](https://apps.apple.com/it/app/amphetamine/id937984704) and others. 

The only issue I felt is the lack of active ventilation while running some heavy tasks, as it tends to get quite hot. Don't get me wrong, it's miles better than the Intel Macs. I used to have at work an Intel MacBook Pro 2019 (so with active ventilation) and it was boiling hot even in the easiest tasks. The energy efficiency of the M series is mind blowing, but still in some tasks I feel the need for a vent. Another thing I would want is more RAM, 8 is not enough for me anymore.

## Computer 3: Server
Recently I got into the world of self hosting, but since I didn't want to spend too much money without experimenting first I dusted off an old Lenovo PC tower and I repurposed it as a server. I mounted Ubuntu server and I host some basic services like [Jellyfin](https://jellyfin.org/), [Home Assistant](https://www.home-assistant.io/) and [NextCloud](https://nextcloud.com/). Sometimes I even use it for development when I can't run things on my Mac, like in the case of CLANN. It is not powerful enough to host all the things I want, but it is a decent start to experiment with some services. My future plan is to buy a refurbished or used server from some offices to not spend a fortune and still having a decent machine for my needs. 

To access the server remotely instead of opening ports to the internet, I use [Tailscale](https://tailscale.com/), which allows to create private networking with stupidly easy setup. For personal use, it's free. I couldn't have found anything better! I even hosted a Minecraft server to play with my friends and Tailscale made it easy to share it. I didn't even need to share the IP of the whole server, since I contained it with Docker and I got a fresh IP just for the Minecraft server container [^2]. 


## Peripherals
As keyboard I recently switched to a mechanical one, after years of membrane. I was looking into getting into the world of mechanical keyboards for some time, watching keyboard building (and ASMRs...) in my spare time. Then I got a sweet deal from one of my colleagues for a Keychron K8 with Gateron Pro Red switches. The switches are linear and it maybe requires too few force to activate, but it feels really good to write on it. What gets me the most is the feeling of actually writing, from the sound to the travel distance. Unfortunately just this week the on/off switch broke, so I'm back to a trashy membrane keyboard. I hope to be able to get it repaired quickly, as I don't want to write on this hell anymore now that I am accustomed to heaven. 
The second most important peripheral, the mouse, is also quite good. It's the Logitech G502, which I got from an Amazon sale for 40 euros back in 2019. It's proving quite durable and effective, but it has one downside, it's wired. For this reason I had to get a KVM switch to use it in both machines. It's not a big deal, even with the additional cables. 

<figure>
    <img src="/images/posts/2025/tech/2025_keyboard.png" alt="keychron k8 pro">
    <figcaption>Keychron K8 Pro with Gateron Pro red switches</figcaption>
</figure>

## Other Stuff

I have two monitors, a 27 inch Samsung C27FG7x curved display and a repurposed 24-inch LG TV as a second screen. The curved display doesn't feel it gives any visibility improvements, but it looks cool. The downside of this specific model is the base being too big, so I got an arm monitor raiser from Amazon to get back some precious desk space. Another thing I would change is the resolution, when I'll do an upgrade I'll definitely get at least 2K resolution. I don't care a lot about the second monitor, as I can currently use it only on the Windows PC since I don't have a good enough usb c hub for the Mac to have double display support. 

On top of the first monitor, I recently bought a lightbar, which seems a gimmick, but actually improved my eye fatigue during night and lights up the workspace really well. Speaking about lighting, I NEVER turn on the main light, as it makes the space dull and flattens it. Instead I have three small lights (including the lightbar) with warm temperature that evenly light up the whole room. 
Some other notable miscellaneous stuff include:
- [A beautiful deksmat](https://keygem.com/products/gestalt-keycap-pre-order?variant=45402118881548)
- [Charging station](https://amzn.eu/d/3CMIYia) for all my mobile devices
- An old android phone reused as a digital clock plus elgato stream deck alternative with [WebDeck ](https://github.com/Lenochxd/WebDeck). Unfortunately it only supports Windows. I also set up an automation to open the webdeck local ip whenever the PC boots up.
- a 1996 stereo system from Technics
- a 3D printed pen holder (design by [bene]([bene](https://bene.com/en/products/accessories/bfriends-desk-pots)))
- a Lego Lamborghini Countach model

As a browser in MacOs I mainly use [Arc](https://arc.net/gift/3dfaa55), a Chromium-based browser developed by the Browser company. It has many cool features, but the main selling points to me are the vertical bar with easier to see spaces and PIP view when switching tabs. Also hovering on the gmail shortcut to see a sneak peek of the inbox is cool. On windows I feel like it is not stable enough yet, so I tend to use Chrome a lot more. There's also a mobile app that has an AI-augmented search called Search for Me. I don't use this feature often, but the mobile app is stable and works well, minus the lack of extensions due to Apple policy. Speaking about extensions on PC there are all Chrome extensions, since Arc is based on Chromium. My go-to are:
- [Obsidian Web Clipper](https://chromewebstore.google.com/detail/obsidian-web-clipper/cnjifjpddelmedmihgijeibhnjfabmlf), to save websites in Obsidian. I don't use it very often.
- [Keepa](https://chromewebstore.google.com/detail/keepa-amazon-price-tracke/neebplgakaahbhdphmkckjjcegoiijjo), to see amazon price history charts
- [Privacy Badger](https://chromewebstore.google.com/detail/privacy-badger/pkehgijcmpdhfbdbbnkijodmdjhbjlgp), which blocks invisible trackers
- [SponsorBlock for Youtube](https://chromewebstore.google.com/detail/sponsorblock-per-youtube/mnjggcdmjocbbbhaepdhchncahnbgone), crowdsourced extension to skip promotions and sponsored segments
- [Zotero Connector](https://chromewebstore.google.com/detail/zotero-connector/ekhagklcjbdpajgpjgmbionohlpdbjgc), saves references to Zotero
- [uBlock Origin](https://chromewebstore.google.com/detail/ublock/epcnnfbjfcgphgdmggkamkmgojdagdnn), Ad block
- [Shut Up](https://chromewebstore.google.com/detail/shut-up-comment-blocker/oklfoejikkmejobodofaimigojomlfim), removes comments to all websites

For my productive life, I tend to follow the teachings of [How to Take Smart Notes](https://www.soenkeahrens.de/en/takesmartnotes) by Sönke Ahrens for when I don't have any too specific tasks. With this mindset, I keep every note in [Obsidian](https://obsidian.md/), that helps me follow the Zettelkasten principles. I settled to Obsidian after switching different note taking apps, from pure Latex, where I was spending more time to fix things rather than actual writing, to Notion, the last note taking app I used before Obsidian. I switched from Notion for two main reasons:
- I don't like the cloud approach of Notion, keeping every note with their proprietary format. This was not future-proof enough for me and I didn't actually own my notes. Instead Obsidian takes a local-first approach, with its cloud servers being a monthly 5$ add-on, and uses markdown, so even if I decide to change app or Obsidian shuts down I can still read all my notes without problems. 
- the second reason is the high customizability, with endless community plugins. I am not ashamed to admit I spent countless hours trying different plugins, setups and approaches. I finally settled for this [PARA+Zettelkasten vault template](https://github.com/DuskWasHere/dusk-obsidian-vault) which is amazing.
For tasks, I use the classic [Todoist](https://www.todoist.com/it) synced with Google calendar. I don't have any special configurations for todo lists organization, I'm still experimenting with it. 

<figure>
    <img src="/images/posts/2025/tech/obsidian_vault.png" alt="obsidian vault">
    <figcaption>Obsidian Vault homepage</figcaption>
</figure>

--- 

That's about it. It’s not as impressive as some other setups I’ve seen, but it works for me—for now. I’ve left out many smaller tools that aren’t as essential to mention. Inspired by Elliot, I’d encourage others to document their own digital lives as well.

[^1]: Like [this one](https://youtu.be/xpki1IcjinU?si=mhuGZ9JsnvauPuyu)
[^2]: See this [deep dive](https://tailscale.com/blog/docker-tailscale-guide) for reference