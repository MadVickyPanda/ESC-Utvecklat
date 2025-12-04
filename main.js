import { fetchChallenges } from "./API.js";

const hamburger = document.getElementById("hamburger");
const popupMenu = document.getElementById("popupMenu");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");
const cardsContainer = document.getElementById("cards-container");
const topThreeContainer = document.getElementById("top-three");
const onlineCheckbox = document.getElementById("online");
const onsiteCheckbox = document.getElementById("onsite");
const searchinput = document.getElementById("typing");
const infoText = document.getElementById("info");
const infomessage = document.getElementById("infomessage");
const filterButton = document.querySelector(".filterbutton");
const containerFilter = document.querySelector(".containerfilter");

let allChallenges = []; // sparar alla för framtida filter/sortering om det behövs

let activeTags = [];
let searchKeyword = "";
let includeOnline = false;
let includeOnsite = false;

// Rating-värden kommer från stars.js
let currentRatingMin = 0;
let currentRatingMax = 5;

// Filtrering med tags
const tagIds = [
  "web",
  "linux",
  "cryptography",
  "coding",
  "javascript",
  "bash",
  "hacking",
  "phreaking",
  "ssh",
  "ctf",
  "electronics",
];

//Startar ''applikationen'' vid webbsidans laddning
function startApp() {
  loadChallenges();
}

//laddar challenges från funktionen 'fetchChallenges' se "import"
function loadChallenges() {
  fetchChallenges()
    .then((challenges) => {
      allChallenges = challenges; // spara allt i en array

      cardsContainer.classList.remove("error");
      filterButton.classList.remove("hidden");
      containerFilter.classList.remove("hidden");
      infomessage.classList.remove("hidden");

      if (topThreeContainer) {
        displayTopThree(allChallenges);
      }
      if (cardsContainer) {
        displayCards(allChallenges); //skickar data till display funtionen
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
      cardsContainer.innerHTML = "";
      cardsContainer.classList.add("error");
      filterButton.classList.add("hidden");
      containerFilter.classList.add("hidden");
      infomessage.classList.add("hidden");

      const errorDiv = document.createElement("div");
      const errorMessage = document.createElement("h3");
      errorMessage.textContent = "Sorry, " + error.message;
      const errorImg = document.createElement("img");
      errorImg.src = "img/images/error.png";
      errorImg.alt = "Error icon";
      errorDiv.appendChild(errorMessage);
      errorDiv.appendChild(errorImg);

      errorDiv.classList.add("errorDiv");
      cardsContainer.appendChild(errorDiv);
    });
}

function displayTopThree(challengesArray) {
  const topThreeContainer = document.getElementById("top-three");

  const topThreeChallenges = challengesArray
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  topThreeContainer.innerHTML = "";

  topThreeChallenges.forEach((challenge) => {
    const card = createCard(challenge);
    topThreeContainer.appendChild(card);
  });
}

//DISPLAY FUNKTION
function displayCards(challengesArray) {
  cardsContainer.innerHTML = ""; // tömmer container innan det visas allt

  challengesArray.forEach((challenge) => {
    const card = createCard(challenge); //skapa varje kort
    cardsContainer.appendChild(card);
  });
}

//SKAPA KORT FUNKTION
function createCard(data) {
  const card = document.createElement("div");
  card.classList.add("card");

  const cardImage = document.createElement("img");
  cardImage.src = data.image || "/img/images/hacker.png";
  cardImage.alt = `Image for ${data.title}`;
  cardImage.classList.add("imageCard");

  const container = document.createElement("div");
  container.classList.add("container");

  const cardTitle = document.createElement("h3");
  cardTitle.classList.add("roomTitle");
  cardTitle.textContent = `${data.title} (${data.type})`;

  //funktion specifikt för rating (kanske kan underlätta)
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

// FUNKTION specifikt för rating-stars
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

document.addEventListener("DOMContentLoaded", function () {
  startApp();
});

// Click events för tag buttons
tagIds.forEach((tagId) => {
  const btn = document.getElementById(tagId);
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      btn.classList.toggle("active");

      // Uppdatera lista av aktiva taggar
      activeTags = tagIds
        .filter((id) => {
          const b = document.getElementById(id);
          return b && b.classList.contains("active");
        })
        .map((tag) => tag.toLowerCase());

      applyAllFilters();
    });
  }
});

// Function för att filtrera challenges baserad på keyword
infoText.textContent = "";
if (searchinput) {
  searchinput.addEventListener("keyup", (e) => {
    searchKeyword = e.target.value.trim().toLowerCase();
    applyAllFilters();
  });
}

function filterChallengesByType() {
  includeOnline = !!(onlineCheckbox && onlineCheckbox.checked);
  includeOnsite = !!(onsiteCheckbox && onsiteCheckbox.checked);
  applyAllFilters();
}

if (onlineCheckbox) {
  onlineCheckbox.addEventListener("change", filterChallengesByType);
}
if (onsiteCheckbox) {
  onsiteCheckbox.addEventListener("change", filterChallengesByType);
}

// gemensam filtrering
function applyAllFilters() {
  let filtered = [...allChallenges];

  // 1 by eyword
  if (searchKeyword) {
    filtered = filtered.filter((challenge) => {
      const title = String(challenge.title || "").toLowerCase();
      return title.includes(searchKeyword);
    });
  }

  // 2 Tags
  if (activeTags.length > 0) {
    filtered = filtered.filter((challenge) => {
      const labels = (challenge.labels || []).map((l) =>
        String(l).toLowerCase()
      );
      return activeTags.every((tag) => labels.includes(tag));
    });
  }

  // 3 Online / On-site
  if (includeOnline || includeOnsite) {
    filtered = filtered.filter((challenge) => {
      const type = String(challenge.type || "").toLowerCase();
      const isOnline = type.includes("online");
      const isOnsite = type.includes("on-site") || type.includes("onsite");

      if (includeOnline && includeOnsite) return isOnline || isOnsite;
      if (includeOnline) return isOnline;
      if (includeOnsite) return isOnsite;
      return true;
    });
  }

  // 4 Rating (värden kommer från stars.js)
  const min = Math.min(currentRatingMin, currentRatingMax);
  const max = Math.max(currentRatingMin, currentRatingMax);

  filtered = filtered.filter((challenge) => {
    const rating = Number(challenge.rating || 0);
    return rating >= min && rating <= max;
  });

  displayCards(filtered);

  // GLOBAL "No match found" – använd samma som i keyword-sök
  if (filtered.length === 0) {
    if (infomessage && infoText) {
      infomessage.style.display = "block";
      infoText.textContent = "No match found";
    }

    if (noMatchMessage) noMatchMessage.style.display = "block";
  } else {
    if (infomessage) infomessage.style.display = "none";
    if (noMatchMessage) noMatchMessage.style.display = "none";
  }
}

export function updateRatingFilter(min, max) {
  currentRatingMin = min;
  currentRatingMax = max;
  applyAllFilters();
}
