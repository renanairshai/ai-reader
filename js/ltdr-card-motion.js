/**
 * Highlights (TL;DR) cards: smooth hover depth animation via Motion library.
 * Uses spring physics so the "forward / back" motion feels natural.
 */
import { animate } from "https://cdn.jsdelivr.net/npm/motion@latest/+esm";

const CARD_Z_FORWARD = "22px";
const CARD_Z_BACK = "-10px";
const CARD_Z_REST = "0px";

const SPRING_OPTIONS = {
  type: "spring",
  duration: 0.55,
  bounce: 0.12,
};

function initLtdrCardMotion() {
  const stack = document.querySelector("#ltdr .ltdr-cards-stack");
  if (!stack) return;

  const cards = Array.from(stack.querySelectorAll(".ltdr-card"));
  const activeAnimations = new Map();

  function runCardZ(card, value) {
    const existing = activeAnimations.get(card);
    if (existing) existing.stop();
    const a = animate(card, { "--card-z": value }, SPRING_OPTIONS);
    activeAnimations.set(card, a);
    a.finished.then(() => activeAnimations.delete(card)).catch(() => {});
  }

  function onMouseEnter(enteredCard) {
    runCardZ(enteredCard, CARD_Z_FORWARD);
    cards.forEach(function (c) {
      if (c !== enteredCard) runCardZ(c, CARD_Z_BACK);
    });
  }

  function onMouseLeave() {
    cards.forEach(function (c) {
      runCardZ(c, CARD_Z_REST);
    });
  }

  cards.forEach(function (card) {
    card.addEventListener("mouseenter", function () {
      onMouseEnter(card);
    });
    card.addEventListener("mouseleave", onMouseLeave);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLtdrCardMotion);
} else {
  initLtdrCardMotion();
}
