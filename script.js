const API_URL = "https://opensheet.elk.sh/1y_LfZ_8dXOX93DRojuD-1OnRKxG1gOsSLQ9MEZQ874o/%E3%82%B7%E3%83%BC%E3%83%881";
const CACHE_KEY = "unionArenaCache";
const CACHE_TIME_KEY = "unionArenaCacheTime";

const CACHE_DURATION = 5 * 60 * 1000;

let allCards = [];

let currentTitle = "ALL";

let currentView = "card";

let currentPage = 1;

let currentSort = "title";

const CARDS_PER_PAGE = 100;

const cachedData = localStorage.getItem(CACHE_KEY);
const cachedTime = localStorage.getItem(CACHE_TIME_KEY);


  const tableViewButton =
  document.getElementById("table-view-button");

const cardViewButton =
  document.getElementById("card-view-button");

const tableWrapper =
  document.querySelector(".table-wrapper");

const cardView =
  document.getElementById("card-view");

  cardViewButton.classList.add("active");
tableViewButton.classList.remove("active");

if (
  cachedData &&
  cachedTime &&
  Date.now() - Number(cachedTime) < CACHE_DURATION
) {

  document
    .getElementById("loading")
    .classList.add("hidden");
allCards = JSON.parse(cachedData);

renderTitleSelect(allCards);

renderCards(allCards);
  updateFetchTime(Number(cachedTime));

} else  {
fetchCards();

}

function renderCards(cards) {

  const start =
    (currentPage - 1) * CARDS_PER_PAGE;

  const end =
    start + CARDS_PER_PAGE;

  const pagedCards =
    cards.slice(start, end);

  if (currentView === "table") {

    renderTable(pagedCards);

  } else {

    renderCardView(pagedCards);

  }

  renderPagination(cards);

}

function renderTable(cards) {

  tableWrapper.classList.remove("hidden");

  cardView.classList.add("hidden");

  const cardList =
    document.getElementById("card-list");

  cardList.innerHTML = "";

  cards.forEach(card => {

    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td>${card["タイトル"]}</td>

      <td class="card-name">
        <span
          class="image-popup-trigger"
          data-image="${card["画像URL"]}"
        >
          ${card["名前"]}
        </span>
      </td>

      <td>${card["型番"]}</td>

      <td>${card["レアリティ"]}</td>

      <td class="price">
        ¥${Number(card["買取価格"]).toLocaleString()}
      </td>
    `;

    cardList.appendChild(row);

  });

}

function renderCardView(cards) {

  tableWrapper.classList.add("hidden");

  cardView.classList.remove("hidden");

  cardView.innerHTML = "";

  cards.forEach(card => {

    const item =
      document.createElement("div");

    item.className = "card-item";

    item.innerHTML = `
      <img
        src="${card["画像URL"]}"
        class="card-item-image"
      >

      <div class="card-item-name">
        ${card["名前"]}
      </div>

      <div class="card-item-number">
        ${card["型番"]}
      </div>

   <div class="card-item-price">
  <span class="buy-label">買取</span>
  ¥${Number(card["買取価格"]).toLocaleString()}
</div>
    `;

    cardView.appendChild(item);

  });

}

function renderPagination(cards) {

  const totalPages =
    Math.ceil(cards.length / CARDS_PER_PAGE);

  let pagination =
    document.getElementById("pagination");

  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {

    const button =
      document.createElement("button");

    button.textContent = i;

    button.className = "page-button";

    if (i === currentPage) {

      button.classList.add("active");

    }

 button.addEventListener("click", () => {

  currentPage = i;

  filterCards();

});

    pagination.appendChild(button);

  }

}
function renderTitleSelect(cards) {

  const select =
    document.getElementById("title-select");

  select.innerHTML = "";

  const titles = [
    "ALL",
    ...new Set(
      cards.map(card => card["タイトル"])
    )
  ];

  titles.forEach(title => {

    const option =
      document.createElement("option");

    option.value = title;

    option.textContent =
      title === "ALL"
        ? "すべてのタイトル"
        : title;

    select.appendChild(option);

  });

  select.value = currentTitle;

}
function filterCards() {

   const keyword =
  normalizeSearch(searchInput.value);

  const sortSelect =
    document.getElementById("sort-select");

  const sortType =
    sortSelect ? sortSelect.value : currentSort;

  currentSort = sortType;

  let filteredCards =
    allCards.filter(card => {

const title =
  normalizeSearch(card["タイトル"]);

const name =
  normalizeSearch(card["名前"]);

const cardNo =
  normalizeSearch(card["型番"]);

const matchKeyword =

  title.includes(keyword) ||
  name.includes(keyword) ||
  cardNo.includes(keyword);

      const matchTitle =
        currentTitle === "ALL" ||
        card["タイトル"] === currentTitle;

      return matchKeyword && matchTitle;

    });

  // 価格が高い順
  if (sortType === "price-desc") {

    filteredCards.sort((a, b) => {

      return Number(b["買取価格"]) -
             Number(a["買取価格"]);

    });

  }

  // 価格が安い順
  else if (sortType === "price-asc") {

    filteredCards.sort((a, b) => {

      return Number(a["買取価格"]) -
             Number(b["買取価格"]);

    });

  }

  // タイトル順
  // 何もしない
  // スプレッドシートの元の順番を維持

  renderCards(filteredCards);

}


const searchInput =
  document.getElementById("search-input");

searchInput.addEventListener("input", () => {

  currentPage = 1;

  filterCards();

});

const sortSelect =
  document.getElementById("sort-select");

sortSelect.value = "title";

sortSelect.addEventListener("change", () => {

  currentPage = 1;

  filterCards();

});

const modal = document.getElementById("image-modal");
const modalImage = document.getElementById("modal-image");

document.addEventListener("click", (event) => {

  const trigger = event.target.closest(".image-popup-trigger");

  if (trigger) {

    const imageUrl = trigger.dataset.image;

    modalImage.src = imageUrl;

    modal.classList.remove("hidden");

    return;
  }

  if (event.target === modal) {

    modal.classList.add("hidden");

  }

});

function updateFetchTime(timestamp) {

  const date = new Date(timestamp);

  const formatted =
    `${date.getFullYear()}/` +
    `${String(date.getMonth() + 1).padStart(2, "0")}/` +
    `${String(date.getDate()).padStart(2, "0")} ` +
    `${String(date.getHours()).padStart(2, "0")}:` +
    `${String(date.getMinutes()).padStart(2, "0")}`;

  document.getElementById("update-time").textContent =
    `最終更新：${formatted}`;

}

function fetchCards() {

  fetch(API_URL)
    .then(response => response.json())
   .then(data => {

  document
    .getElementById("loading")
    .classList.add("hidden");

  allCards = data;

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify(data)
      );

      localStorage.setItem(
        CACHE_TIME_KEY,
        Date.now()
      );


renderTitleSelect(allCards);

filterCards();

updateFetchTime(Number(cachedTime));

    })
    .catch(error => {
      console.error("エラー:", error);
    });

}

const refreshButton =
  document.getElementById("refresh-button");
refreshButton.addEventListener("click", () => {

  localStorage.removeItem(CACHE_KEY);

  localStorage.removeItem(CACHE_TIME_KEY);

  currentTitle = "ALL";

  currentPage = 1;

let currentSort = "title";

  searchInput.value = "";

  sortSelect.value = "title";

  fetchCards();

});

const noticeToggle =
  document.getElementById("notice-toggle");

const noticeMore =
  document.getElementById("notice-more");


let noticeOpen = false;

noticeToggle.addEventListener("click", () => {

  noticeOpen = !noticeOpen;

  if (noticeOpen) {

    noticeMore.classList.remove("hidden");

    noticeToggle.textContent =
      "▲ 閉じる";

  } else {

    noticeMore.classList.add("hidden");

    noticeToggle.textContent =
      "▼ 続きを見る";

  }

});

tableViewButton.addEventListener("click", () => {

  currentView = "table";

  tableViewButton.classList.add("active");

  cardViewButton.classList.remove("active");

  filterCards();

});

cardViewButton.addEventListener("click", () => {

  currentView = "card";

  cardViewButton.classList.add("active");

  tableViewButton.classList.remove("active");

  filterCards();

});

const titleSelect =
  document.getElementById("title-select");

titleSelect.addEventListener("change", () => {

  currentTitle =
    titleSelect.value;

  currentPage = 1;

  filterCards();

});

function normalizeSearch(text) {

  return String(text || "")
    .toLowerCase()
    .replace(/[-／/＿_\s]/g, "");

}