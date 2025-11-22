import { fetchChallenges } from "./API.js";

const hamburger = document.getElementById("hamburger");
const popupMenu = document.getElementById("popupMenu");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");
const cardsContainer = document.getElementById("cards-container");

let allChallenges = [];

function startApp() {
  loadChallenges();
}

function loadChallenges() {
  fetchChallenges()
    .then((challenges) => {
      allChallenges = challenges;
      displayCards(allChallenges);
    })
    .catch((error) => {
      if (cardsContainer) {
        cardsContainer.innerHTML = "<p>Could not load challenges.</p>";
      }
    });
}

function displayCards(challengesArray) {
  if (!cardsContainer) return;
  cardsContainer.innerHTML = "";
  challengesArray.forEach((challenge) => {
    const card = createCard(challenge);
    cardsContainer.appendChild(card);
  });
}

function createCard(data) {
  const card = document.createElement("div");
  card.classList.add("card");

  card.dataset.id = data.id;
  card.dataset.type = data.type;
  card.dataset.title = data.title;
  card.dataset.description = data.description;
  card.dataset.minParticipants = data.minParticipants;
  card.dataset.maxParticipants = data.maxParticipants;
  card.dataset.rating = data.rating;
  card.dataset.labels = data.labels;

  const cardImage = document.createElement("img");
  cardImage.src = data.image || "img/images/hacker.png";
  cardImage.alt = `Image for ${data.title}`;
  cardImage.classList.add("imageCard");

  const container = document.createElement("div");
  container.classList.add("container");

  const cardTitle = document.createElement("h3");
  cardTitle.classList.add("roomTitle");
  cardTitle.textContent = `${data.title} (${data.type})`;

  const starContainer = createStarContainer(Number(data.rating) || 0);

  const participants = document.createElement("p");
  participants.classList.add("participants");
  participants.textContent =
    data.minParticipants === data.maxParticipants
      ? `${data.maxParticipants} participants`
      : `${data.minParticipants}-${data.maxParticipants} participants`;

  const roomInfo = document.createElement("p");
  roomInfo.classList.add("roomInfo");
  roomInfo.innerHTML = data.description;

  const btnDiv = document.createElement("div");
  btnDiv.classList.add("btnDiv");

  const bookButton = document.createElement("button");
  bookButton.classList.add("cardBtn");
  bookButton.textContent = "Book this room";
  bookButton.addEventListener("click", () => {
    window.location.href = "index.html#booking";
  });

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

function createStarContainer(rating) {
  const starContainer = document.createElement("div");
  starContainer.classList.add("star");

  for (let i = 0; i < 5; i++) {
    const starImage = document.createElement("img");
    starImage.src =
      i < rating ? "img/images/Star 4.svg" : "img/images/Star 5.svg";
    starImage.width = 23;
    starImage.height = 26;
    starContainer.appendChild(starImage);
  }

  return starContainer;
}

if (hamburger && popupMenu && overlay && closeBtn) {
  hamburger.addEventListener("click", () => {
    popupMenu.classList.add("active");
    overlay.classList.add("active");
  });

  closeBtn.addEventListener("click", () => {
    popupMenu.classList.remove("active");
    overlay.classList.remove("active");
  });

  overlay.addEventListener("click", () => {
    popupMenu.classList.remove("active");
    overlay.classList.remove("active");
  });
}

if (cardsContainer) {
  startApp();
}

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
  if (!cardsContainer) return;

  if (activeTags.length === 0) {
    displayCards(allChallenges);
    return;
  }

  const filtered = allChallenges.filter((challenge) => {
    const labels = challenge.labels || [];
    const labelsLower = labels.map((l) => l.toLowerCase());
    return activeTags.every((tag) => labelsLower.includes(tag));
  });

  displayCards(filtered);
}

const staticBookButtons = document.querySelectorAll(".cardBtn");
staticBookButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    window.location.href = "index.html#booking";
  });
});
