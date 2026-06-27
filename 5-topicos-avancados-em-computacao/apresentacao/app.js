const TOTAL_PLANNED = 18;

const slides = [...document.querySelectorAll(".slide")];
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const progressBar = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-label");
const dotsContainer = document.getElementById("dots");

let current = 0;

function buildDots() {
  dotsContainer.innerHTML = slides
    .map(
      (_, i) =>
        `<button class="dot ${i === 0 ? "active" : ""}" data-idx="${i}" aria-label="Ir para slide ${i + 1}"></button>`
    )
    .join("");
}

function updateUI() {
  slides.forEach((slide, i) => {
    slide.classList.remove("active", "prev");
    if (i === current) slide.classList.add("active");
    else if (i < current) slide.classList.add("prev");
  });

  btnPrev.disabled = current === 0;
  btnNext.disabled = current === slides.length - 1;

  const pct = ((current + 1) / slides.length) * 100;
  progressBar.style.width = `${pct}%`;
  progressLabel.textContent = `${current + 1} / ${slides.length}`;

  document.querySelectorAll(".dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === current);
  });

  document.querySelectorAll(".slide-num").forEach((el) => {
    const n = String(current + 1).padStart(2, "0");
    el.textContent = `${n} / ${TOTAL_PLANNED}`;
  });
}

function goTo(index) {
  if (index < 0 || index >= slides.length) return;
  current = index;
  updateUI();
}

function next() {
  goTo(current + 1);
}

function prev() {
  goTo(current - 1);
}

btnPrev.addEventListener("click", prev);
btnNext.addEventListener("click", next);

dotsContainer.addEventListener("click", (e) => {
  const dot = e.target.closest(".dot");
  if (!dot) return;
  goTo(Number(dot.dataset.idx));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
    e.preventDefault();
    next();
  } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    prev();
  } else if (e.key === "Home") {
    goTo(0);
  } else if (e.key === "End") {
    goTo(slides.length - 1);
  } else if (e.key === "f" || e.key === "F") {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }
});

buildDots();
updateUI();
