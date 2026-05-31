let toastTimeoutId;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.opacity = "1";

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }
  toastTimeoutId = setTimeout(() => {
    toast.style.opacity = "0";
  }, 1000);
}

let songs = [];

const listEl = document.getElementById("song-list");
const emptyMessage = document.getElementById("empty-message");
const loadingMessage = document.getElementById("loading-message");
const tagListEl = document.getElementById("tag-list");
const searchInput = document.getElementById("search-input");

async function loadSongs() {
  try {
    const res = await fetch("songs.json");
    songs = await res.json();
    loadingMessage.style.display = "none";
    renderTags();
    renderSongs();
  } catch (err) {
    console.error("載入 songs.json 失敗", err);
    loadingMessage.textContent = "載入失敗，請稍後再試。";
  }
}

function renderTags() {
  const genresSet = new Set();
  songs.forEach(song => {
    if (song.genres) {
      song.genres.forEach(g => genresSet.add(g));
    }
  });

  const uniqueGenres = Array.from(genresSet);
  tagListEl.innerHTML = `<button class="tag-btn active" data-genre="all">全部</button>`;
  
  uniqueGenres.forEach(genre => {
    const btn = document.createElement("button");
    btn.className = "tag-btn";
    btn.dataset.genre = genre;
    btn.textContent = genre;
    tagListEl.appendChild(btn);
  });
}

let activeGenre = "all";
let searchKeyword = "";

function renderSongs() {
  listEl.innerHTML = "";

  const filtered = songs.filter(song => {
    const matchGenre =
      activeGenre === "all" ||
      song.genres.includes(activeGenre);

    const kw = searchKeyword.toLowerCase();
    const matchKeyword =
      !kw ||
      song.title.toLowerCase().includes(kw) ||
      song.artist.toLowerCase().includes(kw);

    return matchGenre && matchKeyword;
  });

  if (filtered.length === 0) {
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";

  const fragment = document.createDocumentFragment();

  filtered.forEach(song => {
    const item = document.createElement("li");
    item.className = "song-item";
    item.dataset.title = song.title;

    const genresHTML = song.genres
      .map(g => `<span class="song-genre">${g}</span>`)
      .join("");

    item.innerHTML = `
      <div class="song-title">${song.title}</div>
      <div class="song-artist">${song.artist}</div>
      <div class="song-genres">${genresHTML}</div>
    `;

    fragment.appendChild(item);
  });

  listEl.appendChild(fragment);
}

tagListEl.addEventListener("click", (e) => {
  if (e.target.classList.contains("tag-btn")) {
    activeGenre = e.target.dataset.genre;

    const buttons = tagListEl.querySelectorAll(".tag-btn");
    buttons.forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");

    renderSongs();
  }
});

let searchTimeoutId;
searchInput.addEventListener("input", () => {
  if (searchTimeoutId) {
    clearTimeout(searchTimeoutId);
  }
  searchTimeoutId = setTimeout(() => {
    searchKeyword = searchInput.value;
    renderSongs();
  }, 300);
});

listEl.addEventListener("click", (e) => {
  const item = e.target.closest(".song-item");
  if (item && item.dataset.title) {
    const title = item.dataset.title;
    navigator.clipboard.writeText(title);
    showToast(`已複製：${title}`);
  }
});

loadSongs();
