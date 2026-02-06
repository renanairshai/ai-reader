/**
 * Design for AI - A Reader
 * Main JavaScript: rainbow trail effect and page navigation
 */

(function () {
  "use strict";

  /* --------------------------------------------------------------------------
     Rainbow trail effect
     Draws a fading rainbow trail that follows the mouse cursor.
     -------------------------------------------------------------------------- */
  let trailPoints = [];
  let animationId = null;

  function initRainbowTrail() {
    const canvas = document.getElementById("rainbow-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function handleMouseMove(event) {
      trailPoints.push({
        x: event.clientX,
        y: event.clientY,
        age: 0,
      });
    }

    function animate() {
      const isTensionView = document.body.classList.contains("tension-view");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      trailPoints = trailPoints.filter(function (point) {
        point.age += 1;
        if (point.age > 60) return false;

        const progress = point.age / 60;
        const alpha = (1 - progress) * 0.6;
        const size = 20 * (1 - progress);

        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, size
        );
        if (isTensionView) {
          gradient.addColorStop(0, "rgba(0, 0, 0, " + alpha + ")");
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        } else {
          const hue = (point.age * 6) % 360;
          gradient.addColorStop(0, "hsla(" + hue + ", 70%, 65%, " + alpha + ")");
          gradient.addColorStop(1, "hsla(" + hue + ", 70%, 65%, 0)");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      animationId = requestAnimationFrame(animate);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    animate();
  }

  /* --------------------------------------------------------------------------
     Page navigation
     Shows one .page by adding .active; hides others. Updates URL hash.
     -------------------------------------------------------------------------- */
  function showPage(pageId) {
    const pages = document.querySelectorAll(".page");
    pages.forEach(function (page) {
      page.classList.remove("active");
    });

    const target = document.getElementById(pageId);
    if (target) {
      target.classList.add("active");
    }

    window.history.pushState({}, "", "#" + pageId);
  }

  function getPageFromHash() {
    const hash = window.location.hash.slice(1);
    return hash || "home";
  }

  function initNavigation() {
    // One handler for both logo and nav links (data-page on any element)
    const nav = document.querySelector(".nav");
    if (nav) {
      nav.addEventListener("click", function (event) {
        const el = event.target.closest("[data-page]");
        if (el) {
          event.preventDefault();
          showPage(el.getAttribute("data-page"));
        }
      });
    }

    // Browser back/forward
    window.addEventListener("popstate", function () {
      showPage(getPageFromHash());
    });
  }

  /* --------------------------------------------------------------------------
     3D theme cube: click+drag to rotate, subtle hover in space when idle
     -------------------------------------------------------------------------- */
  function initThemesCube() {
    const cube = document.getElementById("themes-cube");
    const scene = document.getElementById("themes-scene");
    const themesPage = document.getElementById("themes");
    const wrap = document.getElementById("themes-cube-wrap");
    if (!cube || !scene || !themesPage || !wrap) return;

    /* Store original tension titles so we can restore them when leaving tension view (all 6 faces) */
    var cubeFaceNames = ["front", "back", "left", "right", "top", "bottom"];
    var originalCubeTitles = {};
    cubeFaceNames.forEach(function (f) {
      var el = cube.querySelector(".face-" + f + " .cube-tension-title");
      if (el) originalCubeTitles[f] = el.innerHTML;
    });

    /* When the cursor is over the cube, clear any text selection so the cube doesn't "relate" to the text */
    wrap.addEventListener("mouseenter", function () {
      var sel = window.getSelection();
      if (sel) sel.removeAllRanges();
    });

    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseDownX = 0;
    let mouseDownY = 0;
    let potentialClick = false;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let rotX = -28;
    let rotY = 45;
    let animId = null;
    let cursorHasMoved = false;

    function applyCubeTransform() {
      if (!themesPage.classList.contains("active")) return;
      let x = rotX;
      let y = rotY;
      if (cursorHasMoved) {
        const t = Date.now() / 1000;
        const bobY = Math.sin(t * 0.6) * 32;
        const floatRotX = Math.sin(t * 0.35) * 9;
        const floatRotY = Math.cos(t * 0.45) * 9;
        let cursorRotX = 0;
        let cursorRotY = 0;
        if (!isDragging) {
          const cx = window.innerWidth / 2;
          const cy = window.innerHeight / 2;
          const nx = (mouseX - cx) / cx;
          const ny = (mouseY - cy) / cy;
          const dist = Math.min(1, Math.sqrt(nx * nx + ny * ny));
          const edgeFactor = 1 + dist * 2.2;
          cursorRotY = nx * 38 * edgeFactor;
          cursorRotX = -ny * 38 * edgeFactor;
        }
        x += floatRotX + cursorRotX;
        y += floatRotY + cursorRotY;
        cube.style.transform = "translateY(" + bobY + "px) rotateX(" + x + "deg) rotateY(" + y + "deg)";
      } else {
        cube.style.transform = "translateY(0) rotateX(" + x + "deg) rotateY(" + y + "deg)";
      }
    }

    function tick() {
      applyCubeTransform();
      animId = requestAnimationFrame(tick);
    }

    function startDrag(clientX, clientY) {
      isDragging = true;
      document.body.classList.add("cube-dragging");
      lastMouseX = clientX;
      lastMouseY = clientY;
    }

    function endDrag() {
      isDragging = false;
      document.body.classList.remove("cube-dragging");
    }

    function onMouseDown(event) {
      if (!themesPage.classList.contains("active")) return;
      event.preventDefault();
      mouseDownX = event.clientX;
      mouseDownY = event.clientY;
      potentialClick = true;
      startDrag(event.clientX, event.clientY);
    }

    function onMouseMove(event) {
      if (themesPage.classList.contains("active")) {
        cursorHasMoved = true;
      }
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (isDragging) {
        potentialClick = false;
        const dx = event.clientX - lastMouseX;
        const dy = event.clientY - lastMouseY;
        const strength = Math.sqrt(dx * dx + dy * dy);
        const sensitivity = 0.85 + Math.min(strength / 35, 1.0);
        rotY += dx * sensitivity;
        rotX -= dy * sensitivity;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
      }
    }

    function onMouseUp(event) {
      if (potentialClick && themesPage.classList.contains("active")) {
        const dist = Math.sqrt(
          Math.pow(event.clientX - mouseDownX, 2) + Math.pow(event.clientY - mouseDownY, 2)
        );
        if (dist < 12) {
          var angle = ((rotY % 360) + 360) % 360;
          /* Map rotY to which face is facing the user. With CSS rotateY: 0°=front, 90°=left, 180°=back, 270°=right */
          var face = angle <= 45 || angle >= 315 ? "front" : angle < 135 ? "left" : angle <= 225 ? "back" : "right";
          document.body.classList.add("tension-view");
          var wrap = document.getElementById("themes-cube-wrap");
          if (wrap && wrap.parentNode !== document.body) {
            document.body.appendChild(wrap);
          }
          /* Show only the clicked tension’s text on all four faces of the small cube */
          var clickedTitleEl = cube.querySelector(".face-" + face + " .cube-tension-title");
          var clickedTitleHtml = clickedTitleEl ? clickedTitleEl.innerHTML : "";
          cubeFaceNames.forEach(function (f) {
            var titleEl = cube.querySelector(".face-" + f + " .cube-tension-title");
            if (titleEl) titleEl.innerHTML = clickedTitleHtml;
          });
          var panel = document.getElementById("tension-content-panel");
          if (panel) {
            var contents = panel.querySelectorAll(".tension-content");
            contents.forEach(function (el) {
              el.hidden = el.getAttribute("data-tension") !== face;
            });
          }
        }
      }
      endDrag();
    }

    scene.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseleave", endDrag);

    const origShowPage = showPage;
    function exitTensionView() {
      document.body.classList.remove("tension-view");
      /* Restore original tension title on each face so the big cube shows all four again */
      cubeFaceNames.forEach(function (f) {
        var titleEl = cube.querySelector(".face-" + f + " .cube-tension-title");
        if (titleEl && originalCubeTitles[f] !== undefined) titleEl.innerHTML = originalCubeTitles[f];
      });
      var wrap = document.getElementById("themes-cube-wrap");
      var scene = document.getElementById("themes-scene");
      if (wrap && scene && wrap.parentNode === document.body) {
        scene.insertBefore(wrap, scene.firstChild);
      }
    }

    showPage = function (pageId) {
      origShowPage(pageId);
      if (pageId === "themes") {
        exitTensionView();
        rotX = -28;
        rotY = 45;
        cursorHasMoved = false;
        animId = requestAnimationFrame(tick);
      } else {
        exitTensionView();
        if (animId != null) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      }
    };

    /* Back link at bottom of each tension: exit tension view and return to cube */
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest(".tension-back-link")) {
        e.preventDefault();
        showPage("themes");
      }
    });

    if (themesPage.classList.contains("active")) {
      animId = requestAnimationFrame(tick);
    }
  }

  /* --------------------------------------------------------------------------
     TL;DR cards: cursor-follow tilt (subtle 3D as mouse moves)
     -------------------------------------------------------------------------- */
  function initLtdrCardsTilt() {
    var ltdrPage = document.getElementById("ltdr");
    var stack = ltdrPage && ltdrPage.querySelector(".ltdr-cards-stack");
    if (!stack) return;

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;

    window.addEventListener("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function tick() {
      if (!ltdrPage || !ltdrPage.classList.contains("active")) {
        requestAnimationFrame(tick);
        return;
      }
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight / 2;
      var nx = (mouseX - cx) / Math.max(cx, 1);
      var ny = (mouseY - cy) / Math.max(cy, 1);
      var tiltY = nx * 16;
      var tiltX = -ny * 16;
      stack.style.setProperty("--cursor-tilt-x", tiltX + "deg");
      stack.style.setProperty("--cursor-tilt-y", tiltY + "deg");
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* --------------------------------------------------------------------------
     TL;DR cards: drag and drop to reposition
     -------------------------------------------------------------------------- */
  function initLtdrCardsDrag() {
    var stack = document.querySelector("#ltdr .ltdr-cards-stack");
    var cards = document.querySelectorAll("#ltdr .ltdr-card");
    if (!stack || !cards.length) return;

    /* So CSS positions (e.g. nth-child) always apply on load; drag can leave inline left/top */
    cards.forEach(function (card) {
      card.style.left = "";
      card.style.top = "";
    });

    var dragging = null;
    var startX = 0;
    var startY = 0;
    var startLeft = 0;
    var startTop = 0;

    function onMouseDown(e) {
      if (e.button !== 0 || dragging) return;
      var card = e.target.closest(".ltdr-card");
      if (!card) return;
      e.preventDefault();
      var cr = card.getBoundingClientRect();
      var sr = stack.getBoundingClientRect();
      dragging = card;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = cr.left - sr.left + stack.scrollLeft;
      startTop = cr.top - sr.top + stack.scrollTop;
      card.classList.add("is-dragging");
      card.style.left = startLeft + "px";
      card.style.top = startTop + "px";
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }

    function onMouseMove(e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      dragging.style.left = (startLeft + dx) + "px";
      dragging.style.top = (startTop + dy) + "px";
    }

    function onMouseUp() {
      if (!dragging) return;
      dragging.classList.remove("is-dragging");
      dragging = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    cards.forEach(function (card) {
      card.addEventListener("mousedown", onMouseDown);
    });
  }

  /* --------------------------------------------------------------------------
     Initialize when the DOM is ready
     -------------------------------------------------------------------------- */
  function init() {
    initRainbowTrail();
    initNavigation();
    initLtdrCardsTilt();
    initLtdrCardsDrag();
    initThemesCube();
    showPage(getPageFromHash());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
