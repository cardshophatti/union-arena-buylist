const API_URL = "https://opensheet.elk.sh/1y_LfZ_8dXOX93DRojuD-1OnRKxG1gOsSLQ9MEZQ874o/%E3%82%B7%E3%83%BC%E3%83%881";

const CACHE_KEY = "unionArenaCache";
const CACHE_TIME_KEY = "unionArenaCacheTime";

const CACHE_DURATION = 5 * 60 * 1000;


// =========================
// URLフィルター
// =========================

const urlParams = new URLSearchParams(window.location.search);
const filterCode = urlParams.get("filter");


// =========================
// 基本設定
// =========================

let allCards = [];

let currentTitle = "ALL";

let currentView = "card";

let currentPage = 1;

let currentSort = "title";

const CARDS_PER_PAGE = 100;


// =========================
// HTML要素
// =========================

const tableViewButton =
  document.getElementById("table-view-button");

const cardViewButton =
  document.getElementById("card-view-button");

const tableWrapper =
  document.querySelector(".table-wrapper");

const cardView =
  document.getElementById("card-view");

const searchInput =
  document.getElementById("search-input");

const sortSelect =
  document.getElementById("sort-select");

const titleSelect =
  document.getElementById("title-select");

const modal =
  document.getElementById("image-modal");

const modalImage =
  document.getElementById("modal-image");

const noticeToggle =
  document.getElementById("notice-toggle");

const noticeMore =
  document.getElementById("notice-more");


// =========================
// 初期表示
// =========================

cardViewButton.classList.add("active");
tableViewButton.classList.remove("active");

sortSelect.value = "title";


// =========================
// キャッシュ確認
// =========================

const cachedData =
  localStorage.getItem(CACHE_KEY);

const cachedTime =
  localStorage.getItem(CACHE_TIME_KEY);


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

  currentPage = 1;

  filterCards();

  updateFetchTime(Number(cachedTime));

} else {

  fetchCards();

}


// =========================
// カード表示
// =========================

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


// =========================
// リスト表示
// =========================

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


// =========================
// 画像表示
// =========================

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


// =========================
// ページネーション
// =========================

function renderPagination(cards) {

  const totalPages =
    Math.ceil(cards.length / CARDS_PER_PAGE);

  const pagination =
    document.getElementById("pagination");

  pagination.innerHTML = "";


  if (totalPages <= 1) {
    return;
  }


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


// =========================
// タイトル選択
// =========================

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


  // =========================
  // URLフィルター
  // =========================

  if (filterCode) {

    const normalizedFilter =
      normalizeFilter(filterCode);


    const matchedTitle =
      titles.find(title =>
        normalizeFilter(title)
          .includes(normalizedFilter)
      );


    if (matchedTitle) {

      currentTitle = matchedTitle;

    }

  }


  // =========================
  // プルダウン作成
  // =========================

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


  // URLフィルターで決まったタイトルを選択
  select.value = currentTitle;

}


// =========================
// カード絞り込み
// =========================

function filterCards() {

  const keyword =
    normalizeSearch(
      searchInput?.value || ""
    );


  const sortType =
    sortSelect
      ? sortSelect.value
      : currentSort;


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


  // =========================
  // 価格が高い順
  // =========================

  if (sortType === "price-desc") {

    filteredCards.sort((a, b) => {

      return (
        Number(b["買取価格"]) -
        Number(a["買取価格"])
      );

    });

  }


  // =========================
  // 価格が安い順
  // =========================

  else if (sortType === "price-asc") {

    filteredCards.sort((a, b) => {

      return (
        Number(a["買取価格"]) -
        Number(b["買取価格"])
      );

    });

  }


  // タイトル順の場合は
  // スプレッドシートの順番を維持


  renderCards(filteredCards);

}


// =========================
// 検索
// =========================

searchInput.addEventListener("input", () => {

  currentPage = 1;

  filterCards();

});


// =========================
// 並び替え
// =========================

sortSelect.addEventListener("change", () => {

  currentPage = 1;

  filterCards();

});


// =========================
// 画像拡大
// =========================

document.addEventListener("click", (event) => {

  const trigger =
    event.target.closest(
      ".image-popup-trigger"
    );


  if (trigger) {

    const imageUrl =
      trigger.dataset.image;

    modalImage.src = imageUrl;

    modal.classList.remove("hidden");

    return;

  }


  if (event.target === modal) {

    modal.classList.add("hidden");

  }

});


// =========================
// 最終取得時間
// =========================

function updateFetchTime(timestamp) {

  const date =
    new Date(timestamp);


  const formatted =
    `${date.getFullYear()}/` +
    `${String(date.getMonth() + 1).padStart(2, "0")}/` +
    `${String(date.getDate()).padStart(2, "0")} ` +
    `${String(date.getHours()).padStart(2, "0")}:` +
    `${String(date.getMinutes()).padStart(2, "0")}`;


  document.getElementById("update-time")
    .textContent =
      `最終更新：${formatted}`;

}


// =========================
// データ取得
// =========================

function fetchCards() {

  fetch(API_URL)

    .then(response => response.json())

    .then(data => {

      document
        .getElementById("loading")
        .classList.add("hidden");


      allCards = data;


      const fetchTime =
        Date.now();


      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify(data)
      );


      localStorage.setItem(
        CACHE_TIME_KEY,
        fetchTime
      );


      renderTitleSelect(allCards);


      currentPage = 1;

      filterCards();


      updateFetchTime(fetchTime);

    })

    .catch(error => {

      console.error("エラー:", error);

    });

}


// =========================
// 注意事項
// =========================

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


// =========================
// リスト表示ボタン
// =========================

tableViewButton.addEventListener("click", () => {

  currentView = "table";

  tableViewButton.classList.add("active");

  cardViewButton.classList.remove("active");

  filterCards();

});


// =========================
// 画像表示ボタン
// =========================

cardViewButton.addEventListener("click", () => {

  currentView = "card";

  cardViewButton.classList.add("active");

  tableViewButton.classList.remove("active");

  filterCards();

});


// =========================
// タイトル変更
// =========================

titleSelect.addEventListener("change", () => {

  currentTitle =
    titleSelect.value;

  currentPage = 1;

  filterCards();

});


// =========================
// 検索文字の正規化
// =========================

function normalizeSearch(text) {

  return String(text || "")
    .toLowerCase()
    .replace(/[-－ー‐-‒–—―／/＿_\s]/g, "");

}


// =========================
// URLフィルターの正規化
// =========================

function normalizeFilter(text) {

  return String(text || "")
    .toUpperCase()
    .replace(/[\[\]【】（）(){}「」『』\s_\-－ー‐-‒–—―／/]/g, "");

}