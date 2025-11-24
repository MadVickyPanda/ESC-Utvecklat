import { fetchChallenges } from "./API.js";

const hamburger = document.getElementById("hamburger");
const popupMenu = document.getElementById("popupMenu");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");
const cardsContainer = document.getElementById("cards-container"); // may be null on index.html
const topThreeContainer = document.getElementById("top-three");   // present on index.html

let allChallenges = []; // store all for filtering/sorting

// Start the app once DOM is ready (only once)
function startApp() {
  loadChallenges();
}

// Load challenges from API
function loadChallenges() {
  fetchChallenges()
    .then((challenges) => {
      allChallenges = challenges || [];

      // populate top-3 on index page if container exists
      if (topThreeContainer) {
        displayTopThree(allChallenges);
      }

      // populate full list (features.html) if container exists
      if (cardsContainer) {
        displayCards(allChallenges);
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);

      // Safely show error message in whichever container exists on the page
      const msg = "<p>Could not load challenges.</p>";
      if (topThreeContainer) topThreeContainer.innerHTML = msg;
      if (cardsContainer) cardsContainer.innerHTML = msg;
    });
}

function displayTopThree(challengesArray) {
  // make a shallow copy before sort to avoid mutating original array
  const topThreeChallenges = (challengesArray || [])
    .slice()
    .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
    .slice(0, 3);

  if (!topThreeContainer) return;

  topThreeContainer.innerHTML = "";

  topThreeChallenges.forEach((challenge) => {
    const card = createCard(challenge);
    topThreeContainer.appendChild(card);
  });
}

// DISPLAY function for full list (features.html)
function displayCards(challengesArray) {
  if (!cardsContainer) return;
  cardsContainer.innerHTML = "";

  (challengesArray || []).forEach((challenge) => {
    const card = createCard(challenge);
    cardsContainer.appendChild(card);
  });
}

// CREATE single card DOM node
function createCard(data) {
  const card = document.createElement("div");
  card.classList.add("card");

  // store metadata on dataset for future usage (booking, filters etc)
  if (data && data.id !== undefined) card.dataset.id = data.id;
  if (data && data.type !== undefined) card.dataset.type = data.type;
  if (data && data.title !== undefined) card.dataset.title = data.title;
  if (data && data.description !== undefined) card.dataset.description = data.description;
  if (data && data.minParticipants !== undefined) card.dataset.minParticipants = data.minParticipants;
  if (data && data.maxParticipants !== undefined) card.dataset.maxParticipants = data.maxParticipants;
  if (data && data.rating !== undefined) card.dataset.rating = data.rating;
  if (data && data.labels !== undefined) card.dataset.labels = data.labels;

  const cardImage = document.createElement("img");
  cardImage.src = data?.image || "img/images/hacker.png";
  cardImage.alt = `Image for ${data?.title || "challenge"}`;
  cardImage.classList.add("imageCard");

  const container = document.createElement("div");
  container.classList.add("container");

  const cardTitle = document.createElement("h3");
  cardTitle.classList.add("roomTitle");
  cardTitle.textContent = `${data?.title || "Untitled"} (${data?.type || ""})`;

  // rating display from API (read-only)
  const starContainer = createStarContainer(Number(data?.rating) || 0);

  const participants = document.createElement("p");
  participants.classList.add("participants");
  participants.textContent =
    data && data.minParticipants === data.maxParticipants
      ? `${data.maxParticipants} participants`
      : `${data?.minParticipants || "?"}-${data?.maxParticipants || "?"} participants`;

  const roomInfo = document.createElement("p");
  roomInfo.classList.add("roomInfo");
  roomInfo.innerHTML = data?.description || "";

  const btnDiv = document.createElement("div");
  btnDiv.classList.add("btnDiv");

  const bookButton = document.createElement("button");
  bookButton.classList.add("cardBtn");
  bookButton.textContent = "Book this room";

  // (optional) add data-id to button for booking logic later
  if (data && data.id !== undefined) bookButton.dataset.challengeId = data.id;

  btnDiv.appendChild(bookButton);
  container.appendChild(cardTitle);
  container.appendChild(starContainer);
  container.appendChild(participants);
  container.appendChild(roomInfo);
  container.appendChild(btnDiv);

  card.appendChild(cardImage);
  card.appendChild(container);

  return card;
}

// create static stars (read-only) — uses small svg / images you already have
function createStarContainer(rating) {
  const starContainer = document.createElement("div");
  starContainer.classList.add("star");

  for (let i = 0; i < 5; i++) {
    const starImage = document.createElement("img");
    // choose the correct star image depending on rating
    starImage.src = i < rating ? "img/images/Star 4.svg" : "img/images/Star 5.svg";
    starImage.width = 23;
    starImage.height = 26;
    starImage.alt = i < rating ? "filled star" : "empty star";
    starContainer.appendChild(starImage);
  }

  return starContainer;
}

// hamburger / popup menu handlers (unchanged)
if (hamburger && popupMenu && overlay && closeBtn) {
  hamburger.addEventListener("click", () => {
    popupMenu.classList.add("active");
    overlay.classList.add("active");
    popupMenu.setAttribute("aria-hidden", "false");
  });

  closeBtn.addEventListener("click", () => {
    popupMenu.classList.remove("active");
    overlay.classList.remove("active");
    popupMenu.setAttribute("aria-hidden", "true");
  });

  overlay.addEventListener("click", () => {
    popupMenu.classList.remove("active");
    overlay.classList.remove("active");
    popupMenu.setAttribute("aria-hidden", "true");
  });
}

// Start when DOM is ready (only once)
document.addEventListener("DOMContentLoaded", function () {
  startApp();
});

// Filtering by tags (features.html)
const tagIds = ["web", "linux", "cryptography", "coding", "someother", "finaltag"];
let activeTags = [];

tagIds.forEach((tagId) => {
  const btn = document.getElementById(tagId);
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      btn.classList.toggle("active");

      activeTags = tagIds
        .filter((id) => {
          const b = document.getElementById(id);
          return b && b.classList.contains("active");
        })
        .map((tag) => tag.toLowerCase());

      filterChallengesByTags();
    });
  }
});

function filterChallengesByTags() {
  if (!allChallenges || allChallenges.length === 0) {
    if (cardsContainer) cardsContainer.innerHTML = "<p>No matching challenges</p>";
    return;
  }

  if (activeTags.length === 0) {
    // show all
    if (cardsContainer) displayCards(allChallenges);
    return;
  }

  const filtered = allChallenges.filter((challenge) => {
    const labels = challenge.labels || [];
    const labelsLower = labels.map((l) => (typeof l === "string" ? l.toLowerCase() : l));
    return activeTags.every((tag) => labelsLower.includes(tag));
  });

  if (filtered.length === 0) {
    if (cardsContainer) cardsContainer.innerHTML = "<p>No matching challenges</p>";
  } else {
    if (cardsContainer) displayCards(filtered);
  }
}
