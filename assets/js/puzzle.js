document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("puzzleHero");
  if (!mount) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const slices = [
    {
      name: "Spatial Design",
      color: "#f89344",
      href: "spatial-design.html",
      ringText: "architecture · spaces · cities",
      ringOffset: 0.9 // top-ish
    },
    {
      name: "Industrial Design",
      color: "#335b93ff",
      href: "industrial-design.html",
      ringText: "objects · fabrication · products · assemblies",
      ringOffset: 0.25 // right
    },
    {
      name: "Interaction Design",
      color: "#438dfbff",
      href: "interaction-design.html",
      ringText: "interfaces · behaviors · flows",
      ringOffset: 0.50 // bottom
    },
    {
      name: "Writing",
      color: "#FF642F",
      href: "writing-projects.html",
      ringText: "books · papers",
      ringOffset: 0.75 // left
    },
    {
      name: "Ceramics",
      color: "#d4e6f8ff",
      href: "ceramics-gallery.html",
      ringText: "clay · glaze · fire",
      ringOffset: 0.30 // slightly right of top
    }
  ];

  // ============================================================
  // HARD-CODED LAYOUTS
  // ============================================================
  const LAYOUTS = [
    {
      name: "circle",
      items: [
        { cx: 400, cy: 140, w: 400, h: 400, rx: 200, ry: 200 },
        { cx: 600, cy: 100, w: 200, h: 200, rx: 100, ry: 100 },
        { cx: 150, cy: 300, w: 300, h: 300, rx: 150, ry: 150 },
        { cx: 830, cy: 70,  w: 300, h: 300, rx: 150, ry: 150 },
        { cx: 800, cy: 215, w: 120, h: 120, rx: 60,  ry: 60  }
      ]
    },
    {
      name: "rect",
      items: [
        { cx: 600, cy: 145, w: 240, h: 170, rx: 0, ry: 0 },
        { cx: 590, cy: 120, w: 50, h: 300,  rx: 0, ry: 0 },
        { cx: 400, cy: 220, w: 400, h: 400, rx: 0, ry: 0 },
        { cx: 640, cy: 220, w: 120, h: 80,  rx: 0, ry: 0 },
        { cx: 170, cy: 220, w: 300, h: 120, rx: 0, ry: 0 }
      ]
    },
    {
      name: "pill-vertical",
      items: [
        { cx: 550, cy: 300, w: 100, h: 300, rx: 50, ry: 50 },
        { cx: 400, cy: 50,  w: 100, h: 100, rx: 50, ry: 50 },
        { cx: 400, cy: 220, w: 100, h: 200, rx: 50, ry: 50 },
        { cx: 700, cy: 220, w: 100, h: 160, rx: 50, ry: 50 },
        { cx: 250, cy: 150, w: 100, h: 300, rx: 50, ry: 50 }
      ]
    }
  ];

  const MORPH_EVERY_MS = prefersReducedMotion ? Number.POSITIVE_INFINITY : 4000;
  const MORPH_DURATION_MS = prefersReducedMotion ? 1 : 600;

  const VIEWBOX_W = 1000;
  const VIEWBOX_H = 320;

  mount.innerHTML = `
    <svg viewBox="0 0 ${VIEWBOX_W} ${VIEWBOX_H}" role="group" aria-labelledby="puzzle-title puzzle-description">
      <title id="puzzle-title">Portfolio disciplines</title>
      <desc id="puzzle-description">Five animated shapes link to Spatial Design, Industrial Design, Interaction Design, Writing, and Ceramics.</desc>
      <defs id="defs"></defs>
      <g id="layer"></g>
    </svg>
  `;

  const svg = mount.querySelector("svg");
  const defs = svg.querySelector("#defs");
  const layer = svg.querySelector("#layer");

  const createSVG = (tag, attrs = {}) => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
    return el;
  };

  function clamp01(x){ return Math.max(0, Math.min(1, x)); }
  function easeInOut(t){
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  }
  function lerp(a,b,t){ return a + (b-a)*t; }

  // ----------------------------
  // Color helpers
  // ----------------------------
  function parseHexToRgb(hex){
    const h = hex.replace("#","");
    if (h.length !== 6 && h.length !== 8) return { r: 0, g: 0, b: 0 };
    const r = parseInt(h.slice(0,2),16);
    const g = parseInt(h.slice(2,4),16);
    const b = parseInt(h.slice(4,6),16);
    return { r, g, b };
  }
  function relLuma({r,g,b}){
    const srgb = [r,g,b].map(v => {
      const c = v/255;
      return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
    });
    return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
  }
  function bestBW(hexColor){
    const lum = relLuma(parseHexToRgb(hexColor));
    const blackContrast = (lum + 0.05) / 0.05;
    const whiteContrast = 1.05 / (lum + 0.05);
    return blackContrast >= whiteContrast ? "#000" : "#fff";
  }

  // ----------------------------
  // Offscreen start
  // ----------------------------
  function startPos(i){
    const fromLeft = (i % 2 === 0);

    let maxDim = 0;
    for (const L of LAYOUTS){
      const it = L.items[i];
      if (!it) continue;
      maxDim = Math.max(maxDim, it.w, it.h);
    }
    if (!maxDim) maxDim = 200;

    const half = maxDim / 2;
    const safety = 1200;
    const x = fromLeft ? -(half + safety) : (VIEWBOX_W + half + safety);
    const y = 40 + Math.random() * (VIEWBOX_H - 80);
    return { x, y };
  }

  let stateIndex = 0;
  let nextIndex  = 1;
  let morphT     = 0;
  let morphing   = false;
  let timeUntilMorph = MORPH_EVERY_MS;

  let active = -1;
  let transitioning = false;

  function getLayoutItem(layoutIdx, i){
    const L = LAYOUTS[layoutIdx];
    return (L && L.items[i])
      ? L.items[i]
      : { cx: 500, cy: 160, w: 140, h: 140, rx: 70, ry: 70 };
  }

  // ----------------------------
  // Stripe helpers
  // ----------------------------
  function stripeAngleDeg(i){
    const angles = [-18, -33, -52, 18, 34, 57, -72, 72];
    return angles[i % angles.length];
  }
  function stripeWidthPx(i){
    const widths = [34, 56, 42, 70, 48, 62, 38, 80];
    return widths[i % widths.length];
  }

  // ----------------------------
  // Ring path helpers
  // ----------------------------
  const RING_MARGIN = 14;

  function buildRingPathD(cx, cy, w, h, rx, ry) {
    const hw = w / 2 + RING_MARGIN;
    const hh = h / 2 + RING_MARGIN;

    const r = Math.min(Math.max(rx + RING_MARGIN, 0), hw, hh);

    const x0 = cx - hw; // left
    const x1 = cx + hw; // right
    const y0 = cy - hh; // top
    const y1 = cy + hh; // bottom

    // Path starts at top center and goes clockwise
    return [
      `M ${cx},${y0}`,                      // top center
      `H ${x1 - r}`,                        // top right straight
      `A ${r} ${r} 0 0 1 ${x1} ${y0 + r}`,  // top-right corner
      `V ${y1 - r}`,                        // right side
      `A ${r} ${r} 0 0 1 ${x1 - r} ${y1}`,  // bottom-right
      `H ${x0 + r}`,                        // bottom
      `A ${r} ${r} 0 0 1 ${x0} ${y1 - r}`,  // bottom-left
      `V ${y0 + r}`,                        // left side
      `A ${r} ${r} 0 0 1 ${x0 + r} ${y0}`,  // top-left
      "Z"
    ].join(" ");
  }

  // ----------------------------
  // Build bubbles
  // ----------------------------
  const bubbles = slices.map((s, i) => {
    const sp = startPos(i);

    const bobAmp   = prefersReducedMotion ? 0 : 2.5 + Math.random() * 3.5;
    const bobSpeed = 0.0007 + Math.random() * 0.0006;
    const bobPhase = Math.random() * Math.PI * 2;

    const clipId = `clipBubble_${i}`;
    const clipPath = createSVG("clipPath", { id: clipId });
    const clipRect = createSVG("rect", {
      x: sp.x, y: sp.y,
      width: 120, height: 120,
      rx: 60, ry: 60
    });
    clipPath.appendChild(clipRect);
    defs.appendChild(clipPath);

    const r = createSVG("rect", {
      x: sp.x, y: sp.y,
      width: 120, height: 120,
      rx: 60, ry: 60,
      fill: s.color,
      class: "puzzle-bubble",
      "data-i": String(i),
      role: "link",
      tabindex: "0",
      focusable: "true",
      "aria-label": `${s.name} — ${s.ringText.replaceAll(" · ", ", ")}`
    });

    const t = createSVG("text", {
      x: sp.x, y: sp.y,
      class: "puzzle-label",
      "data-i": String(i),
      "text-anchor": "middle",
      "dominant-baseline": "middle"
    });
    t.textContent = s.name;

    const stripe = createSVG("line", {
      x1: 0, y1: 0, x2: 0, y2: 0,
      "stroke-width": stripeWidthPx(i),
      "stroke-linecap": "round",
      "clip-path": `url(#${clipId})`,
      class: "puzzle-stripe"
    });
    stripe.style.opacity = "0";

    // Ring path + ring text
    const ringPathId = `ringPath_${i}`;
    const ringPath = createSVG("path", { id: ringPathId });
    defs.appendChild(ringPath);

    const ringText = createSVG("text", {
      class: "puzzle-ring-text",
      "data-i": String(i)
    });
    const ringTextPath = createSVG("textPath", {
      href: `#${ringPathId}`,
      startOffset: `${(s.ringOffset ?? 0) * 100}%`,
      "text-anchor": "middle"
    });
    ringTextPath.textContent = s.ringText || "";
    ringText.appendChild(ringTextPath);
    ringText.style.opacity = "0";
    ringText.style.pointerEvents = "none";

    layer.appendChild(r);
    layer.appendChild(stripe);
    layer.appendChild(t);
    layer.appendChild(ringText);

    return {
      i, ...s,
      sx: sp.x, sy: sp.y,
      bx: sp.x, by: sp.y,
      ox: 0, oy: 0,
      px: 0, py: 0,
      pushToX: 0, pushToY: 0,

      bobAmp, bobSpeed, bobPhase,

      w: 120, h: 120, rx: 60, ry: 60,

      el: r,
      label: t,
      stripe,
      clipRect,

      stripeAngle: stripeAngleDeg(i),
      stripeThickness: stripeWidthPx(i),
      textColor: bestBW(s.color),

      ringPath,
      ringText,
      ringTextPath
    };
  });

  function renderBubble(b){
    const cx = b.bx + b.ox + b.px;
    const cy = b.by + b.oy + b.py;

    const x = cx - b.w/2;
    const y = cy - b.h/2;

    b.el.setAttribute("x", x);
    b.el.setAttribute("y", y);
    b.el.setAttribute("width", b.w);
    b.el.setAttribute("height", b.h);
    b.el.setAttribute("rx", b.rx);
    b.el.setAttribute("ry", b.ry);

    b.clipRect.setAttribute("x", x);
    b.clipRect.setAttribute("y", y);
    b.clipRect.setAttribute("width", b.w);
    b.clipRect.setAttribute("height", b.h);
    b.clipRect.setAttribute("rx", b.rx);
    b.clipRect.setAttribute("ry", b.ry);

    b.label.setAttribute("x", cx);
    b.label.setAttribute("y", cy);

    const theta = (b.stripeAngle * Math.PI) / 180;
    const L = Math.max(b.w, b.h) * 2.2;
    const dx = Math.cos(theta) * L;
    const dy = Math.sin(theta) * L;

    b.stripe.setAttribute("x1", cx - dx);
    b.stripe.setAttribute("y1", cy - dy);
    b.stripe.setAttribute("x2", cx + dx);
    b.stripe.setAttribute("y2", cy + dy);
    b.stripe.setAttribute("stroke-width", b.stripeThickness);
    b.stripe.setAttribute("stroke", "#ffffff"); // all SVG lines white

    // Ring path follows current shape (circle / square / pill)
    const d = buildRingPathD(cx, cy, b.w, b.h, b.rx, b.ry);
    b.ringPath.setAttribute("d", d);

    // Flip ring text 180° if it's on the bottom half of the path
    const offset = b.ringOffset ?? 0;
    const inBottomHalf = offset >= 0.25 && offset <= 0.75;
    if (inBottomHalf) {
      b.ringText.setAttribute("transform", `rotate(180 ${cx} ${cy})`);
    } else {
      b.ringText.removeAttribute("transform");
    }
  }

  function updatePush(b){
    const ease = 0.10;
    b.px += (b.pushToX - b.px) * ease;
    b.py += (b.pushToY - b.py) * ease;
  }

  // Hover visuals
  function applyHoverVisuals(){
    bubbles.forEach((b) => {
      const isActive = (b.i === active);

      if (!isActive){
        b.el.setAttribute("fill", b.color);
        b.stripe.style.opacity = "0";
        b.label.style.fill = b.textColor;
        b.label.style.opacity = "0";
        b.ringText.style.opacity = "0";
        return;
      }

      b.el.setAttribute("fill", b.color);
      b.stripe.setAttribute("stroke", "#ffffff");
      b.stripe.style.opacity = "1";

      b.label.style.fill = b.textColor;
      b.label.style.opacity = "1";

      const hasRing = (b.ringTextPath.textContent || "").trim().length > 0;
      b.ringText.style.opacity = hasRing ? "1" : "0";
    });
  }

  function setActive(i){
    if (transitioning) return;
    active = i;

    if (active < 0){
      bubbles.forEach((b) => {
        b.el.classList.remove("dim");
        b.pushToX = 0; b.pushToY = 0;
      });
      applyHoverVisuals();
      return;
    }

    const a = bubbles[active];

    bubbles.forEach((b) => {
      const isActive = (b.i === active);
      b.el.classList.toggle("dim", !isActive);

      if (isActive){
        b.pushToX = 0; b.pushToY = 0;
      } else {
        const dx = (b.bx - a.bx);
        const dy = (b.by - a.by);
        const dist = Math.max(1, Math.hypot(dx, dy));
        const push = 18;
        b.pushToX = (dx/dist) * push;
        b.pushToY = (dy/dist) * push;
      }
    });

    applyHoverVisuals();
  }

  svg.addEventListener("pointerleave", () => setActive(-1));

  // Click expansion
  function expandThenNavigate(bubble, href){
    if (transitioning) return;
    if (prefersReducedMotion) {
      window.location.href = href;
      return;
    }
    transitioning = true;

    active = bubble.i;
    applyHoverVisuals();

    const svgRect = svg.getBoundingClientRect();
    const cx = bubble.bx + bubble.ox + bubble.px;
    const cy = bubble.by + bubble.oy + bubble.py;

    const screenX = svgRect.left + (cx / VIEWBOX_W) * svgRect.width;
    const screenY = svgRect.top  + (cy / VIEWBOX_H) * svgRect.height;

    const screenW = (bubble.w / VIEWBOX_W) * svgRect.width;
    const screenH = (bubble.h / VIEWBOX_H) * svgRect.height;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const fill = bubble.color;
    const stripeColor = "#ffffff";          // overlay line is white
    const textColor = "#ffffff";            // title white

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "999999";
    overlay.style.background = fill;
    overlay.style.pointerEvents = "none";
    overlay.style.transformOrigin = "center center";
    overlay.style.willChange = "transform";

    const stripe = document.createElement("div");
    stripe.style.position = "absolute";
    stripe.style.left = "50%";
    stripe.style.top = "50%";
    stripe.style.width = "140vmax"; // big horizontal span
    stripe.style.height = bubble.stripeThickness + "px";
    stripe.style.background = stripeColor;
    stripe.style.borderRadius = "999px";
    stripe.style.transform = `translate(-50%,-50%) rotate(${bubble.stripeAngle}deg)`;
    stripe.style.transformOrigin = "center center";
    stripe.style.willChange = "transform, height";

    const title = document.createElement("div");
    title.textContent = bubble.name;
    title.style.position = "absolute";
    title.style.left = "50%";
    title.style.top = "50%";
    title.style.transform = "translate(-50%,-50%)";
    title.style.color = textColor;
    title.style.fontFamily = "Helvetica, Arial, sans-serif";
    title.style.fontWeight = "700";
    title.style.letterSpacing = "0.06em";
    title.style.fontSize = "clamp(22px, 4vw, 56px)";
    title.style.opacity = "0";
    title.style.willChange = "opacity, transform";

    overlay.appendChild(stripe);
    overlay.appendChild(title);
    document.body.appendChild(overlay);

    bubbles.forEach((b) => {
      b.el.style.visibility = "hidden";
      b.label.style.visibility = "hidden";
      b.stripe.style.visibility = "hidden";
      b.ringText.style.visibility = "hidden";
    });

    const scaleX = Math.max(0.001, screenW / vw);
    const scaleY = Math.max(0.001, screenH / vh);
    const tx = screenX - (vw/2);
    const ty = screenY - (vh/2);

    overlay.style.transform = `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`;

    const expandMs   = 650;
    const shrinkMs   = 320;  // line shrinks + rotates to horizontal
    const holdMs     = 220;  // short hold as thin baseline
    const floodMs    = 450;  // quick flood

    overlay.animate(
      [
        { transform: overlay.style.transform },
        { transform: "translate(0px,0px) scale(1,1)" }
      ],
      { duration: expandMs, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
    ).onfinish = () => {
      const baseHeight = stripe.style.height || (bubble.stripeThickness + "px");
      const thinHeight = "4px";
      const baseAngle  = bubble.stripeAngle;

      // Fade in title over the shrink+hold time
      title.animate(
        [
          { opacity: 0, transform: "translate(-50%,-50%) scale(0.98)" },
          { opacity: 1, transform: "translate(-50%,-50%) scale(1)" }
        ],
        { duration: shrinkMs + holdMs, easing: "ease-out", fill: "forwards" }
      );

      // Phase 1: diagonal -> horizontal + shrink height
      stripe.animate(
        [
          {
            transform: `translate(-50%,-50%) rotate(${baseAngle}deg)`,
            height: baseHeight
          },
          {
            transform: `translate(-50%,-50%) rotate(0deg)`,
            height: thinHeight
          }
        ],
        {
          duration: shrinkMs,
          easing: "cubic-bezier(.2,.9,.2,1)",
          fill: "forwards"
        }
      ).onfinish = () => {
        // Phase 2: brief hold as horizontal thin line
        setTimeout(() => {
          // Phase 3: horizontal -> diagonal + flood
          stripe.animate(
            [
              {
                transform: `translate(-50%,-50%) rotate(0deg)`,
                height: thinHeight
              },
              {
                transform: `translate(-50%,-50%) rotate(${baseAngle}deg)`,
                height: "250vh" // large enough to cover viewport
              }
            ],
            {
              duration: floodMs,
              easing: "cubic-bezier(.2,.9,.2,1)",
              fill: "forwards"
            }
          ).onfinish = () => {
            // As soon as flooded → go immediately
            window.location.href = href;
          };
        }, holdMs);
      };
    };
  }

  // Interactions
  bubbles.forEach((b) => {
    const onEnter = () => setActive(b.i);
    const onLeave = () => setActive(-1);
    const onClick = () => expandThenNavigate(b, b.href);

    b.el.addEventListener("pointerenter", onEnter);
    b.el.addEventListener("pointerleave", onLeave);
    b.el.addEventListener("click", onClick);
    b.el.addEventListener("focus", onEnter);
    b.el.addEventListener("blur", onLeave);
    b.el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick();
      }
    });

    b.label.addEventListener("pointerenter", onEnter);
    b.label.addEventListener("pointerleave", onLeave);
    b.label.addEventListener("click", onClick);

    b.stripe.addEventListener("pointerenter", onEnter);
    b.stripe.addEventListener("pointerleave", onLeave);
    b.stripe.addEventListener("click", onClick);
  });

  const introStart = performance.now();
  const INTRO_DURATION = prefersReducedMotion ? 1 : 3200;
  const INTRO_STAGGER  = prefersReducedMotion ? 0 : 220;

  let lastNow = performance.now();

  function tick(now){
    if (transitioning) return;

    const dt = Math.min(40, now - lastNow);
    lastNow = now;

    if (active < 0){
      if (!morphing){
        timeUntilMorph -= dt;
        if (timeUntilMorph <= 0){
          morphing = true;
          morphT = 0;
          nextIndex = (stateIndex + 1) % LAYOUTS.length;
        }
      } else {
        morphT += dt / MORPH_DURATION_MS;
        if (morphT >= 1){
          morphT = 1;
          morphing = false;
          stateIndex = nextIndex;
          timeUntilMorph = MORPH_EVERY_MS;
        }
      }
    }

    const introTotal = INTRO_DURATION + (bubbles.length - 1) * INTRO_STAGGER;

    bubbles.forEach((b) => {
      const startTime = introStart + b.i * INTRO_STAGGER;
      const tIntro = (now - startTime) / INTRO_DURATION;

      const baseA = getLayoutItem(stateIndex, b.i);
      const baseB = getLayoutItem(nextIndex, b.i);

      const tm = morphing ? easeInOut(clamp01(morphT)) : 0;

      const target = morphing
        ? {
            cx: lerp(baseA.cx, baseB.cx, tm),
            cy: lerp(baseA.cy, baseB.cy, tm),
            w:  lerp(baseA.w,  baseB.w,  tm),
            h:  lerp(baseA.h,  baseB.h,  tm),
            rx: lerp(baseA.rx, baseB.rx, tm),
            ry: lerp(baseA.ry, baseB.ry, tm),
          }
        : { ...baseA };

      if (tIntro <= 0){
        b.bx = b.sx; b.by = b.sy;
      } else if (tIntro >= 1){
        b.bx = target.cx; b.by = target.cy;
      } else {
        const e = easeInOut(clamp01(tIntro));
        b.bx = lerp(b.sx, target.cx, e);
        b.by = lerp(b.sy, target.cy, e);
      }

      b.w  = target.w;
      b.h  = target.h;
      b.rx = target.rx;
      b.ry = target.ry;

      const isActive = (b.i === active);
      if (active >= 0 && isActive){
        b.ox = 0; b.oy = 0;
      } else {
        const globalIntro = clamp01((now - introStart) / introTotal);
        const bobStrength = easeInOut(clamp01((globalIntro - 0.55) / 0.45));

        const tt = now * b.bobSpeed + b.bobPhase;
        const amp = b.bobAmp * bobStrength;

        b.ox = Math.cos(tt) * amp;
        b.oy = Math.sin(tt * 1.12) * (amp * 0.75);
      }

      if (active >= 0 && b.i === active){
        b.pushToX = 0; b.pushToY = 0;
        b.px = 0; b.py = 0;
      } else {
        updatePush(b);
      }

      renderBubble(b);
    });

    requestAnimationFrame(tick);
  }

  bubbles.forEach((b) => {
    b.label.style.fill = b.textColor;
    b.label.style.stroke = b.textColor === "#fff" ? "#000" : "#fff";
  });

  requestAnimationFrame(tick);
});
