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
     Gallery: circular carousel – cards on a circle, one step per wheel, smooth rotation
     -------------------------------------------------------------------------- */
  function initGalleryScroll() {
    var galleryPage = document.getElementById("gallery");
    var orbit = document.getElementById("gallery-orbit");
    var lightbox = document.getElementById("gallery-lightbox");
    var lightboxImg = lightbox ? lightbox.querySelector(".gallery-lightbox-img") : null;
    var lightboxBackdrop = lightbox ? lightbox.querySelector(".gallery-lightbox-backdrop") : null;
    if (!galleryPage || !orbit) return;

    var cards = Array.from(orbit.querySelectorAll(".gallery-card"));
    var N = cards.length;
    if (N === 0) return;

    var maxCardSize = 308;

    function sizeCardToImage(card) {
      var img = card.querySelector("img");
      if (!img) return;
      function apply() {
        var w = img.naturalWidth;
        var h = img.naturalHeight;
        if (!w || !h) return;
        var scale = Math.min(maxCardSize / w, maxCardSize / h, 1);
        var cw = Math.round(w * scale);
        var ch = Math.round(h * scale);
        card.style.width = cw + "px";
        card.style.height = ch + "px";
        card.style.marginLeft = -cw / 2 + "px";
        card.style.marginTop = -ch / 2 + "px";
        drawCards(rotation);
      }
      if (img.complete && img.naturalWidth) apply();
      else img.addEventListener("load", apply);
    }
    cards.forEach(sizeCardToImage);

    var radius = 280;
    var stepAngle = (Math.PI * 2) / N;
    var rotation = 0;
    var targetRotation = 0;
    var animating = false;
    var duration = 520;
    var startTime = 0;
    var startRotation = 0;
    var onRotateComplete = null;
    var hoveredCard = null;
    var selectedCard = null;
    var galleryHovered = false;
    var autoScrollPauseMs = 1000;

    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    function getRadii() {
      var w = orbit.offsetWidth;
      var h = orbit.offsetHeight;
      return {
        rx: w * 0.42,
        ry: h * 0.32
      };
    }

    function drawCards(currentRotation) {
      var r = getRadii();
      var rx = r.rx;
      var ry = r.ry;
      for (var i = 0; i < N; i++) {
        var angle = (i * stepAngle) + currentRotation - Math.PI / 2;
        var x = Math.cos(angle) * rx;
        var y = Math.sin(angle) * ry;
        var z = (y + ry) / (ry * 2);
        if (z < 0) z = 0;
        if (z > 1) z = 1;
        var scale = 0.5 + 0.6 * z;
        var isHighlight = cards[i] === hoveredCard || cards[i] === selectedCard;
        if (isHighlight) scale *= 1.35;
        var darken = isHighlight ? 0 : (1 - z) * 0.65;
        if (darken < 0) darken = 0;
        if (darken > 1) darken = 1;
        var tilt = " rotateX(var(--card-tilt-x)) rotateY(var(--card-tilt-y))";
        cards[i].style.transform = "translate(" + x + "px, " + y + "px) scale(" + scale + ")" + tilt;
        cards[i].style.opacity = "";
        cards[i].style.setProperty("--card-darken", String(darken));
        cards[i].style.zIndex = isHighlight ? 10000 : Math.round(z * 100);
      }
    }

    var maxTiltDeg = 8;
    var tiltRaf = null;
    function setCardTilt(card, clientX, clientY) {
      var r = card.getBoundingClientRect();
      var relX = (clientX - r.left) / Math.max(r.width, 1);
      var relY = (clientY - r.top) / Math.max(r.height, 1);
      var tiltY = (relX - 0.5) * 2 * maxTiltDeg;
      var tiltX = (0.5 - relY) * 2 * maxTiltDeg;
      card.style.setProperty("--card-tilt-x", tiltX + "deg");
      card.style.setProperty("--card-tilt-y", tiltY + "deg");
    }
    function clearCardTilt(card) {
      card.style.setProperty("--card-tilt-x", "0deg");
      card.style.setProperty("--card-tilt-y", "0deg");
    }

    function tick(t) {
      if (!animating) return;
      if (!startTime) startTime = t;
      var elapsed = t - startTime;
      var progress = elapsed >= duration ? 1 : easeInOutQuad(elapsed / duration);
      var current = startRotation + (targetRotation - startRotation) * progress;
      rotation = current;
      drawCards(rotation);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        animating = false;
        if (onRotateComplete) {
          var fn = onRotateComplete;
          onRotateComplete = null;
          fn();
        }
      }
    }

    var wheelCooldownUntil = 0;
    var wheelCooldownMs = 480;

    function rotate(step, onComplete) {
      if (animating) return;
      startRotation = rotation;
      targetRotation = rotation + step * stepAngle;
      onRotateComplete = onComplete || null;
      animating = true;
      startTime = 0;
      requestAnimationFrame(tick);
    }

    function onWheel(e) {
      if (!galleryPage.classList.contains("active")) return;
      e.preventDefault();
      e.stopPropagation();
      if (Date.now() < wheelCooldownUntil) return;
      wheelCooldownUntil = Date.now() + wheelCooldownMs;
      rotate(e.deltaY > 0 ? 1 : -1);
    }

    document.addEventListener("wheel", onWheel, { passive: false, capture: true });

    window.addEventListener("resize", function () {
      if (galleryPage.classList.contains("active")) drawCards(rotation);
    });

    cards.forEach(function (card) {
      card.addEventListener("mouseenter", function () {
        hoveredCard = card;
        drawCards(rotation);
      });
      card.addEventListener("mouseleave", function () {
        clearCardTilt(card);
        hoveredCard = null;
        drawCards(rotation);
      });
      card.addEventListener("mousemove", function (e) {
        setCardTilt(card, e.clientX, e.clientY);
        if (!tiltRaf) {
          tiltRaf = requestAnimationFrame(function () {
            tiltRaf = null;
            drawCards(rotation);
          });
        }
      });
      card.addEventListener("click", function (e) {
        e.preventDefault();
        var img = card.querySelector("img");
        if (img && lightbox && lightboxImg) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt || "";
          lightbox.setAttribute("aria-hidden", "false");
          lightbox.classList.add("is-open");
          selectedCard = null;
          drawCards(rotation);
        } else {
          selectedCard = selectedCard === card ? null : card;
          drawCards(rotation);
        }
      });
    });

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
    }

    if (lightboxBackdrop) lightboxBackdrop.addEventListener("click", closeLightbox);
    if (lightboxImg) lightboxImg.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox && lightbox.classList.contains("is-open")) closeLightbox();
    });

    galleryPage.addEventListener("mouseenter", function () {
      galleryHovered = true;
    });
    galleryPage.addEventListener("mouseleave", function () {
      galleryHovered = false;
    });

    function scheduleNextAutoScroll() {
      setTimeout(function () {
        if (!galleryPage.classList.contains("active")) {
          scheduleNextAutoScroll();
          return;
        }
        if (galleryHovered) {
          scheduleNextAutoScroll();
          return;
        }
        rotate(1, function () {
          scheduleNextAutoScroll();
        });
      }, autoScrollPauseMs);
    }
    scheduleNextAutoScroll();

    var galleryWasActive = false;
    var checkGalleryVisible = setInterval(function () {
      var isActive = galleryPage.classList.contains("active");
      if (isActive && !galleryWasActive) {
        galleryWasActive = true;
        drawCards(rotation);
      }
      if (!isActive) galleryWasActive = false;
    }, 150);

    drawCards(rotation);
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
    initGalleryScroll();
    showPage(getPageFromHash());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
