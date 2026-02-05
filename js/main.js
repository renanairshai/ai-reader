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
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      trailPoints = trailPoints.filter(function (point) {
        point.age += 1;
        if (point.age > 60) return false;

        const progress = point.age / 60;
        const hue = (point.age * 6) % 360;
        const alpha = (1 - progress) * 0.6;
        const size = 20 * (1 - progress);

        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, size
        );
        gradient.addColorStop(0, "hsla(" + hue + ", 70%, 65%, " + alpha + ")");
        gradient.addColorStop(1, "hsla(" + hue + ", 70%, 65%, 0)");

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
     Initialize when the DOM is ready
     -------------------------------------------------------------------------- */
  function init() {
    initRainbowTrail();
    initNavigation();
    showPage(getPageFromHash());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
