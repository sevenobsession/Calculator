let itemDatabase = [];
let selectedTier = "all";
let selectedEnchant = "all";

const searchInput = document.querySelector(".search-input");
const resultsContainer = document.getElementById("search-results");
const iconContainer = document.getElementById("selected-icon-container");

fetch("https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json")
  .then((res) => res.json())
  .then((data) => {
    itemDatabase = data.map((i) => ({
      id: i.UniqueName,
      name: i.LocalizedNames ? i.LocalizedNames["EN-US"] : i.UniqueName
    }));
  });

function updateFoodList(filter = "") {
  const optionsCont = document.getElementById("food-options");
  if (!optionsCont) return;

  const salads = itemDatabase.filter(i => 
    i.id.includes("MEAL_SALAD") && i.name.toLowerCase().includes(filter.toLowerCase())
  );

  optionsCont.innerHTML = salads.map(s => `
    <div class="option" data-value="${s.id}">
        <img src="https://render.albiononline.com/v1/item/${s.id}.png?size=32">
        <span>${s.name}</span>
    </div>`).join("");
}

function setupDropdown(id, onChange) {
  const dropdown = document.getElementById(id);
  if (!dropdown) return;
  const trigger = dropdown.querySelector(".select-trigger");

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".custom-select").forEach((el) => el !== dropdown && el.classList.remove("active"));
    dropdown.classList.toggle("active");
    if (id === "food-dropdown") updateFoodList();
  });

  dropdown.addEventListener("click", (e) => {
    const opt = e.target.closest(".option");
    if (opt) {
      e.stopPropagation();
      // Копіюємо іконку та текст в тригер
      dropdown.querySelector(".select-trigger span").innerHTML = opt.innerHTML;
      dropdown.classList.remove("active");
      onChange(opt.getAttribute("data-value"));
    }
  });
}

setupDropdown("tier-dropdown", (val) => { selectedTier = val; });
setupDropdown("enchant-dropdown", (val) => { selectedEnchant = val; });
setupDropdown("city-dropdown", () => {});
setupDropdown("food-dropdown", () => {});
setupDropdown("daily-dropdown", () => {});

window.addEventListener("click", () => {
  document.querySelectorAll(".custom-select").forEach((el) => el.classList.remove("active"));
});