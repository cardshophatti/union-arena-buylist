const API_URL = "https://opensheet.elk.sh/1y_LfZ_8dXOX93DRojuD-1OnRKxG1gOsSLQ9MEZQ874o/%E3%82%B7%E3%83%BC%E3%83%881";
const CACHE_KEY = "unionArenaCache";
const CACHE_TIME_KEY = "unionArenaCacheTime";

const CACHE_DURATION = 5 * 60 * 1000;

let allCards = [];

let currentTitle = "ALL";

let currentView = "table";

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

if (
  cachedData &&
  cachedTime &&
  Date.now() - Number(cachedTime) < CACHE_DURATION
) {

  allCards = JSON.parse(cachedData);
renderTitleTabs(allCards);
  renderCards(allCards);

 updateFetchTime(Number(cachedTime));

} else  {
fetchCards();

}

function renderCards(cards) {

  if (currentView === "table") {

    renderTable(cards);

  } else {

    renderCardView(cards);

  }

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
        ¥${Number(card["買取価格"]).toLocaleString()}
      </div>
    `;

    cardView.appendChild(item);

  });

}

function renderTitleTabs(cards) {

  const tabsContainer =
    document.getElementById("title-tabs");

  tabsContainer.innerHTML = "";

  const titles = [
    "ALL",
    ...new Set(
      cards.map(card => card["タイトル"])
    )
  ];

  titles.forEach(title => {

    const button =
      document.createElement("button");

    button.textContent = title;

    button.className = "title-tab";

    if (title === currentTitle) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {

      currentTitle = title;

      renderTitleTabs(allCards);

      filterCards();

    });

    tabsContainer.appendChild(button);

  });

}

function filterCards() {

  const keyword =
    searchInput.value.toLowerCase();

  const filteredCards =
    allCards.filter(card => {

      const matchKeyword =

        card["タイトル"]?.toLowerCase().includes(keyword) ||
        card["名前"]?.toLowerCase().includes(keyword) ||
        card["型番"]?.toLowerCase().includes(keyword);

      const matchTitle =
        currentTitle === "ALL" ||
        card["タイトル"] === currentTitle;

      return matchKeyword && matchTitle;

    });

  renderCards(filteredCards);

}



const searchInput =
  document.getElementById("search-input");

searchInput.addEventListener("input", () => {

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

      allCards = data;

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify(data)
      );

      localStorage.setItem(
        CACHE_TIME_KEY,
        Date.now()
      );

      renderTitleTabs(allCards);

      renderCards(allCards);

      updateFetchTime(Date.now());

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