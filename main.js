import { fetchChallenges } from "./API.js";

const hamburger = document.getElementById("hamburger");
const popupMenu = document.getElementById("popupMenu");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");

const cardsContainer = document.getElementById("cards-container");
const topThreeContainer = document.getElementById("top-three");

let allChallenges = [];
let activeTags = [];

initHamburger();
initTags();
startApp();

function initHamburger() {
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
}

async function startApp() {
  try {
    const data = await fetchChallenges();
    allChallenges = Array.isArray(data.challenges) ? data.challenges : data;

    if (topThreeContainer) {
      const topThree = [...allChallenges]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3);
      displayCards(topThree, topThreeContainer);
    }

    if (cardsContainer) {
      displayCards(allChallenges, cardsContainer);
    }
  } catch {
    if (cardsContainer) {
      cardsContainer.innerHTML = "<p>Could not load challenges.</p>";
    }
  }
}

function displayCards(challengesArray, container) {
  if (!container) return;
  container.innerHTML = "";
  challengesArray.forEach((challenge) => {
    const card = createCard(challenge);
    container.appendChild(card);
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
  bookButton.classList.add("cardBtn", "book-button");
  bookButton.textContent = "Book this room";
  bookButton.dataset.challengeId = data.id;
  bookButton.dataset.challengeTitle = data.title;
  bookButton.dataset.minParticipants = data.minParticipants;
  bookButton.dataset.maxParticipants = data.maxParticipants;

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

function initTags() {
  const tagButtons = document.querySelectorAll(".tags button");
  activeTags = [];

  if (!tagButtons.length) return;

  tagButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      btn.classList.toggle("active");

      activeTags = Array.from(tagButtons)
        .filter((b) => b.classList.contains("active"))
        .map((b) => b.id.toLowerCase());

      filterChallengesByTags();
    });
  });
}

function filterChallengesByTags() {
  if (!cardsContainer) return;

  let result = allChallenges;

  if (activeTags.length > 0) {
    result = allChallenges.filter((challenge) => {
      const labels = challenge.labels || [];
      const labelsLower = labels.map((l) => l.toLowerCase());
      return activeTags.every((tag) => labelsLower.includes(tag));
    });
  }

  displayCards(result, cardsContainer);
}
