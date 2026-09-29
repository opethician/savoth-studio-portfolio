document.addEventListener("DOMContentLoaded", () => {
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  const track = document.querySelector(".showcase-track");
  const cards = [...document.querySelectorAll(".book-card")];
  const filters = [...document.querySelectorAll("[data-category-filter]")];
  const status = document.querySelector(".catalog-filter-status");
  const previous = document.querySelector(".prev-btn");
  const next = document.querySelector(".next-btn");

  cards.forEach(card => {
    const heading = card.querySelector(".book-title");
    const link = document.createElement("a");
    link.href = `#${card.id}`;
    link.textContent = heading.textContent;
    link.setAttribute("aria-label", `Link to ${heading.textContent.trim()} in the book catalog`);
    heading.replaceChildren(link);
  });

  function showLinkedBook() {
    const target = cards.find(card => `#${card.id}` === window.location.hash);
    if (!target) return;
    if (target.hidden) filters.find(button => button.dataset.categoryFilter === "all")?.click();
    requestAnimationFrame(() => target.scrollIntoView({ block: "nearest", inline: "start" }));
  }

  window.addEventListener("hashchange", showLinkedBook);
  showLinkedBook();

  function step() {
    const first = cards.find(card => !card.hidden);
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    return first ? first.getBoundingClientRect().width + gap : track.clientWidth;
  }
  function move(direction) {
    track.scrollBy({ left: direction * step(), behavior: "smooth" });
  }

  filters.forEach(button => {
    button.addEventListener("click", () => {
      const category = button.dataset.categoryFilter;
      filters.forEach(filter => filter.setAttribute("aria-pressed", String(filter === button)));
      let count = 0;
      cards.forEach(card => {
        card.hidden = category !== "all" && card.dataset.category !== category;
        if (!card.hidden) count += 1;
      });
      if (cards.some(card => `#${card.id}` === window.location.hash && card.hidden)) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      track.scrollLeft = 0;
      const subject = category === "all" ? "" : ` in ${button.textContent.trim().toLowerCase()}`;
      status.textContent = `Showing ${count} ${count === 1 ? "title" : "titles"}${subject}.`;
    });
  });

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  track.addEventListener("keydown", event => {
    if (event.target !== track) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      track.scrollTo({ left: event.key === "Home" ? 0 : track.scrollWidth, behavior: "smooth" });
    }
  });
});
