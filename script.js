let itemDatabase = [];
let selectedTier = "all";
let selectedEnchant = "all";

const searchInput = document.querySelector(".search-input");
const resultsContainer = document.getElementById("search-results");
const iconContainer = document.getElementById("selected-icon-container");

const cityStats = {
  "Fort Sterling": ["HAMMER", "SPEAR", "HOLYSTAFF", "PLATE_HELMET", "CLOTH_ARMOR", "WOOD"],
  Lymhurst: ["SWORD", "BOW", "ARCANESTAFF", "LEATHER_HELMET", "LEATHER_SHOES", "FIBER"],
  Bridgewatch: ["CROSSBOW", "DAGGER", "CURSEDSTAFF", "PLATE_ARMOR", "CLOTH_SHOES", "STONE"],
  Martlock: ["AXE", "QUARTERSTAFF", "FROSTSTAFF", "PLATE_SHOES", "OFFHAND", "HIDE"],
  Thetford: ["MACE", "NATURESTAFF", "FIRESTAFF", "LEATHER_ARMOR", "CLOTH_HELMET", "ORE"],
  Caerleon: ["GATHERINGGEAR", "TOOL", "FOOD", "WARGLOVES", "SHAPESHIFTERSTAFF"],
  Brecilien: ["CAPE", "BAG", "POTION"]
};

fetch("https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json")
  .then((res) => res.json())
  .then((data) => {
    itemDatabase = data.map((i) => ({
      id: i.UniqueName,
      name: i.LocalizedNames ? i.LocalizedNames["EN-US"] : i.UniqueName
    }));
  });

function getItemPower(id) {
  const t = id.match(/T(\d)/) ? parseInt(id.match(/T(\d)/)[1]) : 0;
  const e = id.match(/@(\d)/) ? parseInt(id.match(/@(\d)/)[1]) : 0;
  return t * 10 + e;
}

function performSearch() {
  const query = searchInput.value.toLowerCase();
  if (query.length < 3) {
    resultsContainer.style.display = "none";
    return;
  }

  let results = itemDatabase.filter((i) => {
    const nameMatch = i.name.toLowerCase().includes(query);
    const noSilver = !i.id.includes("SILVERBAG") && !i.id.includes("MONEY");
    const tierMatch = selectedTier === "all" ? true : i.id.startsWith(`T${selectedTier}`);
    const enchantMatch =
      selectedEnchant === "all"
        ? true
        : selectedEnchant === "0"
        ? !i.id.includes("@")
        : i.id.endsWith(`@${selectedEnchant}`);
    return nameMatch && noSilver && tierMatch && enchantMatch;
  });

  results.sort((a, b) => getItemPower(a.id) - getItemPower(b.id));

  resultsContainer.innerHTML = results
    .slice(0, 20)
    .map(
      (i) => `
        <div class="search-result-item" data-id="${i.id}">
            <img src="https://render.albiononline.com/v1/item/${i.id}.png?size=32" style="width:32px;height:32px;">
            <span>${i.name}</span>
        </div>
    `
    )
    .join("");
  resultsContainer.style.display = "block";
}

function updateCityList(filter = "") {
  const optionsCont = document.getElementById("city-options");
  if (!optionsCont) return;

  const currentId = searchInput.getAttribute("data-selected-id") || "";
  const cities = ["Martlock", "Thetford", "Fort Sterling", "Lymhurst", "Bridgewatch", "Caerleon", "Brecilien"];

  const getListHtml = (f) =>
    cities
      .filter((c) => c.toLowerCase().includes(f.toLowerCase()))
      .map((city) => {
        const hasBonus = cityStats[city] && cityStats[city].some((b) => currentId.toUpperCase().includes(b));
        const rrr = currentId ? `<span class="rrr-tag">${hasBonus ? "24.8%" : "15.2%"}</span>` : "";
        return `<div class="option city-opt" data-value="${city}"><span>${city}</span>${rrr}</div>`;
      })
      .join("");

  if (!optionsCont.querySelector(".city-inner-search")) {
    optionsCont.innerHTML = `
            <div class="city-search-box">
                <textarea class="city-inner-search" placeholder="Search city/HO..." rows="1">${filter}</textarea>
            </div>
            <div class="city-list-items">${getListHtml(filter)}</div>`;

    const area = optionsCont.querySelector(".city-inner-search");
    area.focus();
    area.addEventListener("input", (e) => {
      e.stopPropagation();
      area.style.height = "auto";
      area.style.height = area.scrollHeight + "px";
      optionsCont.querySelector(".city-list-items").innerHTML = getListHtml(e.target.value);
    });
    area.addEventListener("click", (e) => e.stopPropagation());
  }
}

// ДОДАНО: Функція вибору салатів (тільки MEAL_SALAD)
function updateFoodList(filter = "") {
  const optionsCont = document.getElementById("food-options");
  if (!optionsCont) return;

  const salads = itemDatabase.filter(i => 
    i.id.includes("MEAL_SALAD") && i.name.toLowerCase().includes(filter.toLowerCase())
  );
  salads.sort((a, b) => getItemPower(a.id) - getItemPower(b.id));

  const getFoodHtml = (f) => salads.map(s => `
    <div class="option" data-value="${s.id}">
        <img src="https://render.albiononline.com/v1/item/${s.id}.png?size=32" style="width:32px;height:32px;">
        <span>${s.name}</span>
    </div>`).join("");

  if (!optionsCont.querySelector(".city-inner-search")) {
    optionsCont.innerHTML = `
      <div class="city-search-box">
          <textarea class="city-inner-search" placeholder="Search salad..." rows="1">${filter}</textarea>
      </div>
      <div class="food-list-items">${getFoodHtml(filter)}</div>`;

    const area = optionsCont.querySelector(".city-inner-search");
    area.focus();
    area.addEventListener("input", (e) => {
      e.stopPropagation();
      area.style.height = "auto";
      area.style.height = area.scrollHeight + "px";
      optionsCont.querySelector(".food-list-items").innerHTML = getFoodHtml(e.target.value);
    });
    area.addEventListener("click", (e) => e.stopPropagation());
  }
}

function setupDropdown(id, onChange) {
  const dropdown = document.getElementById(id);
  if (!dropdown) return;
  const trigger = dropdown.querySelector(".select-trigger");

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    document.querySelectorAll(".custom-select").forEach((el) => el !== dropdown && el.classList.remove("active"));
    dropdown.classList.toggle("active");
    
    if (dropdown.classList.contains("active")) {
        if (id === "city-dropdown") updateCityList();
        if (id === "food-dropdown") updateFoodList(); // ДОДАНО
    }
  });

  dropdown.addEventListener("click", (e) => {
    const opt = e.target.closest(".option");
    if (opt && !opt.closest(".city-search-box")) {
      e.stopPropagation();
      dropdown.querySelector("span").innerHTML = opt.innerHTML;
      dropdown.classList.remove("active");
      onChange(opt.getAttribute("data-value"));
      if (searchInput.value.length >= 3) performSearch();
    }
  });
}

searchInput.addEventListener("input", performSearch);

resultsContainer.addEventListener("click", (e) => {
  const row = e.target.closest(".search-result-item");
  if (row) {
    const id = row.getAttribute("data-id");
    searchInput.value = row.querySelector("span").innerText;
    searchInput.setAttribute("data-selected-id", id);
    resultsContainer.style.display = "none";
    iconContainer.innerHTML = `<img src="https://render.albiononline.com/v1/item/${id}.png">`;
    iconContainer.style.display = "flex";
    searchInput.classList.add("has-icon");
  }
});

setupDropdown("tier-dropdown", (val) => { selectedTier = val; updateEnchantOptions(val); performSearch(); });
setupDropdown("enchant-dropdown", (val) => { selectedEnchant = val; performSearch(); });
setupDropdown("city-dropdown", () => {});
setupDropdown("food-dropdown", () => {});
setupDropdown("daily-dropdown", () => {});

function updateEnchantOptions(tier) {
  const cont = document.getElementById("enchant-options");
  if (!cont) return;
  const opts = ["all", "0", "1", "2", "3", "4"];
  cont.innerHTML = opts
    .map((o) => `<div class="option" data-value="${o}">${o === "all" ? "ALL" : tier === "all" ? o : tier + "." + o}</div>`)
    .join("");
}

window.addEventListener("click", () => {
  document.querySelectorAll(".custom-select").forEach((el) => el.classList.remove("active"));
  resultsContainer.style.display = "none";
});

updateEnchantOptions(selectedTier);