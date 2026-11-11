const listings = [
  { id: 1, title: "Casio fx-991EX Calculator", price: 4500, category: "Electronics", condition: "Good" },
  { id: 2, title: "Introduction to Algorithms (CLRS)", price: 3500, category: "Books", condition: "Like new" },
  { id: 3, title: "Logitech Wireless Mouse", price: 1800, category: "Electronics", condition: "Good" },
  { id: 4, title: "Discrete Mathematics by Rosen", price: 2200, category: "Books", condition: "Fair" },
  { id: 5, title: "Study Table with Drawer", price: 6000, category: "Furniture", condition: "Good" },
  { id: 6, title: "Geometry Box Set", price: 600, category: "Stationery", condition: "Like new" },
];

const favorites = new Set();

const grid = document.querySelector("#listing-grid");
const searchInput = document.querySelector("#search");
const categorySelect = document.querySelector("#category");
const sortSelect = document.querySelector("#sort");
const resultCount = document.querySelector("#result-count");
const favCount = document.querySelector("#fav-count");
const savedTotal = document.querySelector("#saved-total");
const toggle = document.querySelector("#theme-toggle");

const formatPrice = (n) => `Rs ${n.toLocaleString("en-PK")}`;

function createCard(listing) {
  const article = document.createElement("article");
  article.className = "card";
  article.dataset.id = listing.id;

  const img = document.createElement("img");
  img.src = `https://placehold.co/400x300?text=${encodeURIComponent(listing.category)}`;
  img.alt = listing.title;
  img.width = 400;
  img.height = 300;

  const body = document.createElement("div");
  body.className = "card-body";

  const h3 = document.createElement("h3");
  h3.textContent = listing.title;

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = formatPrice(listing.price);

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `${listing.category} · ${listing.condition}`;

  const favBtn = document.createElement("button");
  favBtn.className = "fav-btn";
  favBtn.type = "button";
  favBtn.setAttribute("aria-pressed", favorites.has(listing.id));
  favBtn.textContent = favorites.has(listing.id) ? "❤️ Saved" : "🤍 Save";

  body.append(h3, price, meta, favBtn);
  article.append(img, body);

  return article;
}

function updateSavedTotal() {
  if (!savedTotal) return;
  const total = listings
    .filter((l) => favorites.has(l.id))
    .reduce((sum, l) => sum + l.price, 0);

  savedTotal.textContent = `Total value of saved items: ${formatPrice(total)}`;
}

function render(items) {
  if (!grid) return;

  if (items.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.id = "empty-message";
    emptyMsg.className = "empty-message";
    emptyMsg.textContent = "No listings match your search";
    grid.replaceChildren(emptyMsg);
  } else {
    grid.replaceChildren(...items.map(createCard));
  }

  if (resultCount) {
    resultCount.textContent = `${items.length} item(s) found`;
  }
  if (favCount) {
    favCount.textContent = favorites.size;
  }
  updateSavedTotal();
}

// Helper to sort using toSorted() if available, or [...arr].sort() (both from slide 6)
function sortListings(items, compareFn) {
  if (typeof items.toSorted === "function") {
    return items.toSorted(compareFn);
  }
  return [...items].sort(compareFn);
}

function applyFilters() {
  if (!searchInput) return;

  const query = searchInput.value.trim().toLowerCase();
  const selectedCategory = categorySelect ? categorySelect.value : "All";
  const selectedSort = sortSelect ? sortSelect.value : "Newest";

  let filtered = listings.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(query) ||
      l.category.toLowerCase().includes(query);
    const matchesCategory =
      selectedCategory === "All" || l.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedSort.includes("low") && selectedSort.includes("high")) {
    if (selectedSort.indexOf("low") < selectedSort.indexOf("high")) {
      filtered = sortListings(filtered, (a, b) => a.price - b.price);
    } else {
      filtered = sortListings(filtered, (a, b) => b.price - a.price);
    }
  } else if (selectedSort === "Price: low → high" || selectedSort === "Price: low -> high") {
    filtered = sortListings(filtered, (a, b) => a.price - b.price);
  } else if (selectedSort === "Price: high → low" || selectedSort === "Price: high -> low") {
    filtered = sortListings(filtered, (a, b) => b.price - a.price);
  } else if (selectedSort === "Newest") {
    filtered = sortListings(filtered, (a, b) => a.id - b.id);
  }

  render(filtered);
}

// Only run browse page logic if the grid and search input exist on current page
if (grid && searchInput) {
  // Initial render
  applyFilters();

  searchInput.addEventListener("input", applyFilters);

  if (categorySelect) {
    categorySelect.addEventListener("change", applyFilters);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", applyFilters);
  }

  // Favourites with event delegation
  grid.addEventListener("click", (event) => {
    const button = event.target.closest(".fav-btn");
    if (!button) return;

    const id = Number(button.closest(".card").dataset.id);
    if (favorites.has(id)) {
      favorites.delete(id);
    } else {
      favorites.add(id);
    }

    applyFilters();
  });
}

// Dark mode toggle (runs on any page with #theme-toggle)
if (toggle) {
  toggle.addEventListener("click", () => {
    const root = document.documentElement;
    const isDark = root.dataset.theme === "dark";
    root.dataset.theme = isDark ? "light" : "dark";
    toggle.textContent = isDark ? "🌙" : "☀️";
  });
}
