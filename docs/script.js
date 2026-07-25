const filterButtons = [...document.querySelectorAll("[data-filter]")];
const projects = [...document.querySelectorAll("[data-category]")];
const status = document.querySelector(".filter-status");
const year = document.querySelector("[data-year]");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

for (const button of filterButtons) {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    let visible = 0;

    for (const candidate of filterButtons) {
      candidate.setAttribute("aria-pressed", String(candidate === button));
    }

    for (const project of projects) {
      const shouldShow =
        filter === "all" || project.dataset.category === filter;
      project.hidden = !shouldShow;
      if (shouldShow) visible += 1;
    }

    if (status) {
      const label = filter === "all" ? "all" : filter;
      status.textContent = `Showing ${visible} ${label} ${
        visible === 1 ? "project" : "projects"
      }.`;
    }
  });
}
