function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
  }, 1000);
}

let songs = [];

async function loadSongs() {
  try {
    const res = await fetch("songs.json");
    songs = await res.json();
    renderSongs();
  } catch (err) {
    console.error("載入 songs.json 失敗", err);
  }
}

const listEl = document.getElementById("song-list");
const emptyMessage = document.getElementById("empty-message");
const tagButtons = document.querySelectorAll(".tag-btn");
const searchInput = document.getElementById("search-input");

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

  filtered.forEach(song => {
    const item = document.createElement("li");
    item.className = "song-item";

    const genresHTML = song.genres
      .map(g => `<span class="song-genre">${g}</span>`)
      .join("");

    item.innerHTML = `
      <div class="song-title">${song.title}</div>
      <div class="song-artist">${song.artist}</div>
      <div class="song-genres">${genresHTML}</div>
    `;

    item.addEventListener("click", () => {
      navigator.clipboard.writeText(song.title);
      showToast(`已複製：${song.title}`);
    });

    listEl.appendChild(item);
  });
}

tagButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    activeGenre = btn.dataset.genre;

    tagButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    renderSongs();
  });
});

searchInput.addEventListener("input", () => {
  searchKeyword = searchInput.value;
  renderSongs();
});

loadSongs();
