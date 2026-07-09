/* Saptarshi · portfolio scripts
   Graph nav on index, scroll reveals and footer year everywhere. */

(function () {
  document.documentElement.classList.add("js");

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ================= Scroll reveals ================= */
  var sections = document.querySelectorAll(".reveal");
  if (!reduced && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    sections.forEach(function (s) { io.observe(s); });
  } else {
    sections.forEach(function (s) { s.classList.add("visible"); });
  }

  /* ================= Graph navigation (index only) ================= */
  var svg = document.getElementById("graph");
  if (!svg) return;

  var SVG_NS = "http://www.w3.org/2000/svg";

  var NODES = [
    { id: "root",       label: "saptarshi",   href: null, root: true },
    { id: "projects",   label: "projects",    href: "projects.html" },
    { id: "experience", label: "experience",  href: "experience.html" },
    { id: "opensource", label: "open_source", href: "opensource.html" },
    { id: "skills",     label: "skills",      href: "skills.html" },
    { id: "education",  label: "education",   href: "education.html" },
    { id: "contact",    label: "contact",     href: "contact.html" }
  ];

  var LAYOUTS = {
    wide: {
      viewBox: [0, 0, 1000, 520],
      pos: {
        root:       [500, 260],
        projects:   [160, 120],
        experience: [845, 110],
        opensource: [150, 415],
        skills:     [860, 400],
        education:  [455, 62],
        contact:    [540, 465]
      }
    },
    narrow: {
      viewBox: [0, 0, 620, 700],
      pos: {
        root:       [310, 350],
        projects:   [140, 130],
        experience: [480, 140],
        opensource: [120, 360],
        skills:     [500, 370],
        education:  [300, 90],
        contact:    [310, 610]
      }
    }
  };

  var mode = window.innerWidth < 700 ? "narrow" : "wide";
  var positions = {};
  var nodeEls = {};
  var edges = [];
  var edgesLayer, nodesLayer;

  function copyPositions() {
    var src = LAYOUTS[mode].pos;
    positions = {};
    for (var k in src) positions[k] = [src[k][0], src[k][1]];
  }

  function edgePath(from, to) {
    var x1 = positions[from][0], y1 = positions[from][1];
    var x2 = positions[to][0],   y2 = positions[to][1];
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var ox = (-dy / len) * 26, oy = (dx / len) * 26;
    return "M " + x1 + " " + y1 + " Q " + (mx + ox) + " " + (my + oy) + " " + x2 + " " + y2;
  }

  function nodeSize(n) {
    var w = n.label.length * 9 + 40;
    var h = n.root ? 56 : 44;
    if (n.root) w += 24;
    return [w, h];
  }

  function buildGraph() {
    svg.innerHTML = "";
    svg.setAttribute("viewBox", LAYOUTS[mode].viewBox.join(" "));

    var defs = document.createElementNS(SVG_NS, "defs");
    defs.innerHTML =
      '<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M 0 0 L 10 5 L 0 10 z" fill="#171614"></path></marker>';
    svg.appendChild(defs);

    edgesLayer = document.createElementNS(SVG_NS, "g");
    nodesLayer = document.createElementNS(SVG_NS, "g");
    svg.appendChild(edgesLayer);
    svg.appendChild(nodesLayer);

    edges = [];
    nodeEls = {};

    NODES.forEach(function (n, idx) {
      if (n.root) return;
      var d = edgePath("root", n.id);

      var path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("class", "edge");
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#171614");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("marker-end", "url(#arrow)");
      edgesLayer.appendChild(path);

      var pulse = document.createElementNS(SVG_NS, "circle");
      pulse.setAttribute("class", "pulse");
      pulse.setAttribute("r", "4.5");
      var motion = document.createElementNS(SVG_NS, "animateMotion");
      motion.setAttribute("dur", (3.6 + idx * 0.55).toFixed(2) + "s");
      motion.setAttribute("repeatCount", "indefinite");
      motion.setAttribute("path", d);
      pulse.appendChild(motion);
      if (!reduced) edgesLayer.appendChild(pulse);

      edges.push({ path: path, pulse: pulse, motion: motion, to: n.id });
    });

    NODES.forEach(function (n) {
      var size = nodeSize(n);
      var w = size[0], h = size[1];

      var g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("class", "node");
      g.setAttribute("data-id", n.id);
      if (n.href) {
        g.setAttribute("role", "link");
        g.setAttribute("tabindex", "0");
        g.setAttribute("aria-label", "Open " + n.label + " page");
      } else {
        g.setAttribute("aria-label", n.label);
      }

      var shadow = document.createElementNS(SVG_NS, "rect");
      shadow.setAttribute("class", "nshadow");
      shadow.setAttribute("x", -w / 2 + 4);
      shadow.setAttribute("y", -h / 2 + 4);
      shadow.setAttribute("width", w);
      shadow.setAttribute("height", h);
      shadow.setAttribute("rx", n.root ? h / 2 : 8);
      shadow.setAttribute("fill", "#171614");

      var box = document.createElementNS(SVG_NS, "rect");
      box.setAttribute("class", "box");
      box.setAttribute("x", -w / 2);
      box.setAttribute("y", -h / 2);
      box.setAttribute("width", w);
      box.setAttribute("height", h);
      box.setAttribute("rx", n.root ? h / 2 : 8);
      box.setAttribute("fill", n.root ? "#171614" : "#FFFFFF");
      box.setAttribute("stroke", "#171614");
      box.setAttribute("stroke-width", "2");

      var text = document.createElementNS(SVG_NS, "text");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "central");
      text.setAttribute("font-family", "IBM Plex Mono, monospace");
      text.setAttribute("font-size", n.root ? "17" : "14");
      text.setAttribute("font-weight", "600");
      text.setAttribute("fill", n.root ? "#F1F1EB" : "#171614");
      text.textContent = n.label;

      g.appendChild(shadow);
      g.appendChild(box);
      g.appendChild(text);
      nodesLayer.appendChild(g);
      nodeEls[n.id] = g;
      setNodeTransform(n.id);

      attachNodeBehavior(g, n);
    });
  }

  function setNodeTransform(id) {
    nodeEls[id].setAttribute("transform", "translate(" + positions[id][0] + " " + positions[id][1] + ")");
  }

  function refreshEdges(nodeId) {
    edges.forEach(function (e) {
      if (nodeId && e.to !== nodeId && nodeId !== "root") return;
      var d = edgePath("root", e.to);
      e.path.setAttribute("d", d);
      e.motion.setAttribute("path", d);
    });
  }

  function svgPoint(evt) {
    var pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function attachNodeBehavior(g, n) {
    var dragging = false, moved = false, offX = 0, offY = 0;

    g.style.touchAction = "none";

    g.addEventListener("pointerdown", function (evt) {
      dragging = true; moved = false;
      var p = svgPoint(evt);
      offX = p.x - positions[n.id][0];
      offY = p.y - positions[n.id][1];
      g.setPointerCapture(evt.pointerId);
      evt.preventDefault();
    });

    g.addEventListener("pointermove", function (evt) {
      if (!dragging) return;
      var p = svgPoint(evt);
      var nx = p.x - offX, ny = p.y - offY;
      if (Math.abs(nx - positions[n.id][0]) > 3 || Math.abs(ny - positions[n.id][1]) > 3) moved = true;
      positions[n.id] = [nx, ny];
      setNodeTransform(n.id);
      refreshEdges(n.id);
    });

    g.addEventListener("pointerup", function (evt) {
      dragging = false;
      g.releasePointerCapture(evt.pointerId);
      if (!moved && n.href) window.location.href = n.href;
    });

    g.addEventListener("keydown", function (evt) {
      if ((evt.key === "Enter" || evt.key === " ") && n.href) {
        evt.preventDefault();
        window.location.href = n.href;
      }
    });
  }

  svg.addEventListener("dblclick", function () {
    copyPositions();
    NODES.forEach(function (n) { setNodeTransform(n.id); });
    refreshEdges();
  });

  window.addEventListener("resize", function () {
    var next = window.innerWidth < 700 ? "narrow" : "wide";
    if (next !== mode) {
      mode = next;
      copyPositions();
      buildGraph();
    }
  });

  copyPositions();
  buildGraph();
})();
