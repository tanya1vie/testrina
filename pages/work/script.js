// Dropdown functionality
const sortDropdown = document.querySelector(".sort-dropdown");
const sortButton = document.querySelector(".sort-button");
const dropdownContent = document.querySelector(".dropdown-content");

function setDropdownOpen(isOpen) {
  dropdownContent.style.display = isOpen ? "block" : "none";
  sortButton.setAttribute("aria-expanded", String(isOpen));
}

sortButton.addEventListener("click", () => {
  setDropdownOpen(sortButton.getAttribute("aria-expanded") !== "true");
});

// Sorting functionality
const filterButtons = document.querySelectorAll(".dropdown-content a");
const projects = document.querySelectorAll(".project-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault();
    const category = button.getAttribute("data-category");
    filterProjects(category);
    setDropdownOpen(false);
  });
});

// Close dropdown when clicking outside
window.addEventListener("click", (e) => {
  if (!sortDropdown.contains(e.target)) {
    setDropdownOpen(false);
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setDropdownOpen(false);
    sortButton.focus();
  }
});

function filterProjects(category) {
  const cards = document.querySelectorAll(".project-card");

  cards.forEach((card) => {
    const categories = card
      .getAttribute("data-category")
      .split(",")
      .map((c) => c.trim());

    if (category === "all" || categories.includes(category)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}
